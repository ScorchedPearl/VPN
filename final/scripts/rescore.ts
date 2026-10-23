/**
 * Recomputes the stored VPN-risk result of every active scan with the current
 * models, replaying scans in capture order so each one is scored only against
 * the scans that existed before it (as the live API would have done).
 *
 * Usage:
 *   npm run rescore             dry run: prints old vs new scores
 *   npm run rescore -- --apply  backs up risk_assessment, then updates it
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { ResearchObservation } from "../src/utils/fingerprint.ts";
import { deriveHistoryFeatures } from "../src/utils/history.ts";
import { linkObservations, trainLinkageModel } from "../src/utils/linkage.ts";
import { assessVpnRisk } from "../src/utils/risk.ts";
import { compareObservations } from "../src/utils/similarity.ts";

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
  const { rows } = await client.query(`
    SELECT observation_id, device_label, browser_mode, vpn_ground_truth, fingerprint, server_seen_ip,
           effective_public_ip, server_received_at, server_network, path_probes, device_location,
           risk_assessment, client_latency, created_at
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
    riskAssessment: row.risk_assessment || undefined,
    clientLatency: row.client_latency || null,
  }));

  const configuredPrior = Number(process.env.LINKAGE_PRIOR);
  const updates: Array<{ id: string; label: string; risk: NonNullable<ResearchObservation["riskAssessment"]> }> = [];
  observations.forEach((observation, index) => {
    // Earlier scans, newest first, exactly as recentObservations() returns them.
    const previous = observations.slice(0, index).reverse();
    if (!observation.serverNetwork) return;
    const model = trainLinkageModel(previous, {
      maxObservations: 400,
      maxDifferentPairs: 30_000,
      prior: Number.isFinite(configuredPrior) && configuredPrior > 0 && configuredPrior < 1 ? configuredPrior : undefined,
    });
    const matches = previous
      .map((earlier) => ({ ...compareObservations(observation, earlier), linkage: linkObservations(observation, earlier, model) }))
      .sort((a, b) => b.linkage.logLikelihoodRatio - a.linkage.logLikelihoodRatio);
    const risk = assessVpnRisk({
      fingerprint: observation.fingerprint,
      server: observation.serverNetwork,
      bestMatch: matches[0] || null,
      pathProbes: observation.pathProbes || [],
      deviceLocation: observation.deviceLocation || null,
      history: deriveHistoryFeatures(observation, previous),
      clientLatency: observation.clientLatency,
    });
    const before = observation.riskAssessment;
    const best = matches[0]?.linkage;
    console.log(
      `${observation.deviceLabel.padEnd(32)} ${observation.fingerprint.browserFamily.padEnd(8)}`
      + ` risk ${String(before?.score ?? "-").padStart(3)}% ${before?.band ?? "-"} -> ${String(risk.score).padStart(3)}% ${risk.band}`
      + ` | best match: ${best ? `${matches[0].deviceLabel} ${(best.posterior * 100).toFixed(1)}% ${best.verdict}` : "none (first scan)"}`,
    );
    updates.push({ id: observation.observationId, label: observation.deviceLabel, risk });
  });

  if (!apply) {
    console.log(`\nDry run: ${updates.length} scans would be updated. Re-run with --apply to write.`);
  } else {
    mkdirSync(".research-data/backups", { recursive: true });
    const backup = `.research-data/backups/risk-before-rescore-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    writeFileSync(backup, JSON.stringify(rows.map((row) => ({ observation_id: row.observation_id, risk_assessment: row.risk_assessment })), null, 2));
    await client.query("BEGIN");
    for (const update of updates) {
      await client.query(`UPDATE ${TABLE} SET risk_assessment = $2::jsonb WHERE observation_id = $1`, [update.id, JSON.stringify(update.risk)]);
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
