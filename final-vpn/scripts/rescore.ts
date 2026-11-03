/**
 * Recomputes the stored VPN assessment of every active scan with the
 * device-anchored VPN model, replaying scans in capture order so each one
 * only sees the scans that existed before it (as the live API does), and
 * prints how each signal behaves on the labelled scans.
 *
 * Usage:
 *   npm run rescore             dry run: evaluation + old vs new scores
 *   npm run rescore -- --apply  backs up vpn_assessment, then updates it
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { ResearchObservation } from "../src/utils/fingerprint.ts";
import { checkReputation, loadIpLists } from "../src/utils/ip-lists.ts";
import { groupSameDevice, linkObservations, scoreAllPairs, trainLinkageModel } from "../src/utils/linkage.ts";
import { assessVpn } from "../src/utils/vpn-detection.ts";

const require = createRequire(import.meta.url);
const { Client } = require("pg") as typeof import("pg");
const TABLE = "public.vpn_ndss2017_research_observations";

function databaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
  if (fromEnv) return fromEnv;
  const file = readFileSync(".env.local", "utf8");
  const match = file.match(/^DATABASE_URL_POOLER=(.+)$/m) || file.match(/^DATABASE_URL=(.+)$/m);
  if (!match) throw new Error("No DATABASE_URL_POOLER or DATABASE_URL configured");
  return match[1].trim();
}

const apply = process.argv.includes("--apply");
const client = new Client({ connectionString: databaseUrl(), ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  // Same additive migration the app runs on startup.
  await client.query(`ALTER TABLE ${TABLE} ADD COLUMN IF NOT EXISTS vpn_assessment jsonb`);
  const { rows } = await client.query(`
    SELECT observation_id, device_label, browser_mode, vpn_ground_truth, fingerprint, server_seen_ip,
           effective_public_ip, server_received_at, server_network, path_probes, device_location,
           risk_assessment, vpn_assessment, client_latency, created_at
      FROM ${TABLE} ORDER BY created_at ASC`);
  const observations: ResearchObservation[] = rows.map((row) => ({
    observationId: row.observation_id,
    deviceLabel: row.device_label,
    browserMode: row.browser_mode,
    vpnGroundTruth: row.vpn_ground_truth,
    fingerprint: row.fingerprint,
    serverSeenIp: row.server_seen_ip,
    effectivePublicIp: row.effective_public_ip,
    serverReceivedAt: row.server_received_at ? new Date(row.server_received_at).toISOString() : undefined,
    serverNetwork: row.server_network || undefined,
    pathProbes: row.path_probes || [],
    deviceLocation: row.device_location,
    riskAssessment: row.vpn_assessment || row.risk_assessment || undefined,
    clientLatency: row.client_latency || null,
  }));

  const lists = await loadIpLists();
  console.log(`Reputation lists loaded: ${Object.keys(lists).join(", ") || "none"}`);
  const prior = Number(process.env.VPN_RISK_PRIOR) > 0 ? Number(process.env.VPN_RISK_PRIOR) : 0.05;
  const updates: Array<{ id: string; risk: NonNullable<ResearchObservation["riskAssessment"]> }> = [];

  observations.forEach((observation, index) => {
    if (!observation.serverNetwork) return;
    // Earlier scans, newest first, as recentObservations() returns them.
    const previous = observations.slice(0, index).reverse();
    const model = trainLinkageModel(previous, { maxObservations: 400, maxDifferentPairs: 30_000 });
    const deviceIds = new Map<string, string>();
    for (const set of groupSameDevice(scoreAllPairs(previous, model), 0.85, 3, true)) for (const id of set.observationIds) deviceIds.set(id, set.clusterId);
    const linked = previous.map((earlier) => ({ previous: earlier, linkage: linkObservations(observation, earlier, model) })).filter((item) => item.linkage.verdict !== "insufficient-evidence");
    const best = [...linked].sort((a, b) => b.linkage.posterior - a.linkage.posterior)[0];
    const deviceId = best && best.linkage.posterior > 0.5 ? deviceIds.get(best.previous.observationId) : undefined;
    const history = linked.filter((item) => item.linkage.posterior >= 0.85 || (deviceId !== undefined && deviceIds.get(item.previous.observationId) === deviceId)).map((item) => item.previous);
    // Stored scans predate the list lookup, so attach it as the live server would have.
    const current = { ...observation, serverNetwork: { ...observation.serverNetwork, anonymizer: { ...observation.serverNetwork.anonymizer, lists: checkReputation(lists, observation.serverNetwork.ip || observation.effectivePublicIp) } } };
    const risk = assessVpn({
      current,
      deviceHistory: history,
      currentDeviceId: deviceId,
      population: previous.map((item) => ({ observation: item, deviceId: deviceIds.get(item.observationId) || item.observationId })),
      reputationOf: (ip) => checkReputation(lists, ip),
      priorProbability: prior,
    });
    updates.push({ id: observation.observationId, risk });
    observation.riskAssessment = risk; // later scans see this verdict, as live
  });

  /* Evaluation on labelled scans ------------------------------------------ */
  const labelled = observations
    .map((observation) => ({ observation, risk: updates.find((item) => item.id === observation.observationId)?.risk }))
    .filter((item) => item.risk && ["none", "off", "consumer-vpn", "corporate-vpn", "split-tunnel", "tor", "public-proxy", "residential-proxy", "private-relay", "on"].includes(item.observation.vpnGroundTruth));
  const positive = (value: string) => !["none", "off"].includes(value);
  const vpnScans = labelled.filter((item) => positive(item.observation.vpnGroundTruth));
  const cleanScans = labelled.filter((item) => !positive(item.observation.vpnGroundTruth));
  console.log(`\nLabelled scans: ${vpnScans.length} with VPN/proxy, ${cleanScans.length} without\n`);
  for (const threshold of [0.35, 0.5, 0.85]) {
    const caught = vpnScans.filter((item) => item.risk!.probability >= threshold).length;
    const falseAlarms = cleanScans.filter((item) => item.risk!.probability >= threshold).length;
    console.log(`at ${Math.round(threshold * 100)}%: caught ${caught}/${vpnScans.length} VPN scans, false alarms ${falseAlarms}/${cleanScans.length}`);
  }
  const ids = Array.from(new Set(labelled.flatMap((item) => item.risk!.evidence.map((evidence) => evidence.id))));
  console.log("\nsignal                      fired on VPN   fired on no-VPN");
  for (const id of ids.sort()) {
    const onVpn = vpnScans.filter((item) => item.risk!.evidence.some((evidence) => evidence.id === id)).length;
    const onClean = cleanScans.filter((item) => item.risk!.evidence.some((evidence) => evidence.id === id)).length;
    console.log(`${id.padEnd(28)}${`${onVpn}/${vpnScans.length}`.padEnd(15)}${onClean}/${cleanScans.length}`);
  }
  console.log("\nVPN scans:");
  for (const item of vpnScans) console.log(`  ${item.observation.deviceLabel.padEnd(24)} ${String(item.risk!.score).padStart(3)}% ${item.risk!.kind?.padEnd(13)} ${item.risk!.evidence.filter((evidence) => evidence.logLikelihoodRatio > 0).map((evidence) => evidence.id).join(", ")}`);
  const unlabelled = observations.filter((item) => !labelled.some((entry) => entry.observation === item) && item.riskAssessment && item.riskAssessment.probability >= 0.5);
  if (unlabelled.length) {
    console.log("\nUnlabelled scans the model thinks used a VPN:");
    for (const item of unlabelled) console.log(`  ${item.deviceLabel.padEnd(24)} ${String(item.riskAssessment!.score).padStart(3)}% ${item.effectivePublicIp}`);
  }

  if (!apply) {
    console.log(`\nDry run: ${updates.length} scans would be updated. Re-run with --apply to write.`);
  } else {
    mkdirSync(".research-data/backups", { recursive: true });
    const backup = `.research-data/backups/risk-before-vpn-model-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    writeFileSync(backup, JSON.stringify(rows.map((row) => ({ observation_id: row.observation_id, vpn_assessment: row.vpn_assessment })), null, 2));
    await client.query("BEGIN");
    for (const update of updates) {
      // Only this app's column: the original app's risk_assessment is left alone.
      await client.query(`UPDATE ${TABLE} SET vpn_assessment = $2::jsonb WHERE observation_id = $1`, [update.id, JSON.stringify(update.risk)]);
    }
    await client.query("COMMIT");
    console.log(`\nUpdated ${updates.length} scans. Previous values backed up to ${backup}`);
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
