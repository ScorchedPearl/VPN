import "server-only";

import { Pool } from "pg";
import type { ResearchObservation } from "./fingerprint";

type DatabaseGlobal = typeof globalThis & {
  __vpnResearchPool?: Pool;
  __vpnResearchSchemaReady?: Promise<void>;
};

function databasePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  const shared = globalThis as DatabaseGlobal;
  shared.__vpnResearchPool ??= new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return shared.__vpnResearchPool;
}

async function ensureSchema(): Promise<void> {
  const shared = globalThis as DatabaseGlobal;
  shared.__vpnResearchSchemaReady ??= databasePool().query(`
    CREATE TABLE IF NOT EXISTS public.vpn_research_observations (
      observation_id uuid PRIMARY KEY,
      device_label varchar(60) NOT NULL,
      browser_mode varchar(16) NOT NULL,
      vpn_ground_truth varchar(16) NOT NULL,
      fingerprint jsonb NOT NULL,
      server_seen_ip text NOT NULL,
      effective_public_ip text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS vpn_research_observations_created_at_idx
      ON public.vpn_research_observations (created_at DESC);

    CREATE INDEX IF NOT EXISTS vpn_research_observations_device_label_idx
      ON public.vpn_research_observations (device_label);
  `).then(() => undefined).catch((error) => {
    shared.__vpnResearchSchemaReady = undefined;
    throw error;
  });
  await shared.__vpnResearchSchemaReady;
}

export async function observationCount(): Promise<number> {
  await ensureSchema();
  const result = await databasePool().query<{ count: string }>(
    "SELECT count(*)::text AS count FROM public.vpn_research_observations",
  );
  return Number(result.rows[0]?.count || 0);
}

export async function recentObservations(limit = 200): Promise<ResearchObservation[]> {
  await ensureSchema();
  const safeLimit = Math.max(1, Math.min(1000, Math.floor(limit)));
  const result = await databasePool().query<{
    observation_id: string;
    device_label: string;
    browser_mode: ResearchObservation["browserMode"];
    vpn_ground_truth: ResearchObservation["vpnGroundTruth"];
    fingerprint: ResearchObservation["fingerprint"];
    server_seen_ip: string;
    effective_public_ip: string;
  }>(`
    SELECT observation_id, device_label, browser_mode, vpn_ground_truth,
           fingerprint, server_seen_ip, effective_public_ip
      FROM public.vpn_research_observations
     ORDER BY created_at DESC
     LIMIT $1
  `, [safeLimit]);

  return result.rows.map((row) => ({
    observationId: row.observation_id,
    deviceLabel: row.device_label,
    browserMode: row.browser_mode,
    vpnGroundTruth: row.vpn_ground_truth,
    fingerprint: row.fingerprint,
    serverSeenIp: row.server_seen_ip,
    effectivePublicIp: row.effective_public_ip,
  }));
}

export async function saveObservation(observation: ResearchObservation): Promise<void> {
  await ensureSchema();
  await databasePool().query(`
    INSERT INTO public.vpn_research_observations (
      observation_id, device_label, browser_mode, vpn_ground_truth,
      fingerprint, server_seen_ip, effective_public_ip
    ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
  `, [
    observation.observationId,
    observation.deviceLabel,
    observation.browserMode,
    observation.vpnGroundTruth,
    JSON.stringify(observation.fingerprint),
    observation.serverSeenIp,
    observation.effectivePublicIp,
  ]);
}
