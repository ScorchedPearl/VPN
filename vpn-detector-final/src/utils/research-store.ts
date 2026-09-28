import "server-only";

import { Pool } from "pg";
import type { ResearchObservation } from "./fingerprint";

const NDSS_TABLE = "public.vpn_ndss2017_research_observations";
const LEGACY_TABLE = "public.vpn_research_observations";

type DatabaseGlobal = typeof globalThis & {
  __vpnResearchPool?: Pool;
  __vpnResearchSchemaReady?: Promise<void>;
};

function databasePool(): Pool {
  // Supabase's pooler is useful when a direct Postgres port is restricted by a
  // corporate network or VPN. Prefer it when explicitly configured.
  const connectionString = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL or DATABASE_URL_POOLER is not configured");

  const shared = globalThis as DatabaseGlobal;
  shared.__vpnResearchPool ??= new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    // VPN DNS/TLS handshakes to a managed pooler can exceed the usual local
    // direct-Postgres timeout. Bound the wait, but allow a cold connection.
    connectionTimeoutMillis: 30_000,
  });
  return shared.__vpnResearchPool;
}

async function ensureSchema(): Promise<void> {
  const shared = globalThis as DatabaseGlobal;
  shared.__vpnResearchSchemaReady ??= databasePool().query(`
    CREATE TABLE IF NOT EXISTS ${NDSS_TABLE} (
      observation_id uuid PRIMARY KEY,
      device_label varchar(60) NOT NULL,
      browser_mode varchar(16) NOT NULL,
      vpn_ground_truth varchar(16) NOT NULL,
      fingerprint jsonb NOT NULL,
      server_seen_ip text NOT NULL,
      effective_public_ip text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE ${NDSS_TABLE}
      ALTER COLUMN vpn_ground_truth TYPE varchar(32),
      ADD COLUMN IF NOT EXISTS study_id varchar(60),
      ADD COLUMN IF NOT EXISTS consent_version varchar(40),
      ADD COLUMN IF NOT EXISTS server_received_at timestamptz,
      ADD COLUMN IF NOT EXISTS server_network jsonb,
      ADD COLUMN IF NOT EXISTS path_probes jsonb,
      ADD COLUMN IF NOT EXISTS device_location jsonb,
      ADD COLUMN IF NOT EXISTS ground_truth_details jsonb,
      ADD COLUMN IF NOT EXISTS risk_assessment jsonb,
      ADD COLUMN IF NOT EXISTS protected_components jsonb;

    CREATE INDEX IF NOT EXISTS vpn_ndss2017_research_observations_created_at_idx
      ON ${NDSS_TABLE} (created_at DESC);

    CREATE INDEX IF NOT EXISTS vpn_ndss2017_research_observations_device_label_idx
      ON ${NDSS_TABLE} (device_label);
  `).then(() => undefined).catch((error) => {
    shared.__vpnResearchSchemaReady = undefined;
    throw error;
  });
  await shared.__vpnResearchSchemaReady;
}

export async function observationCount(): Promise<number> {
  await ensureSchema();
  const result = await databasePool().query<{ count: string }>(
    `SELECT count(*)::text AS count FROM ${NDSS_TABLE}`,
  );
  return Number(result.rows[0]?.count || 0);
}

/** The original prototype table is read-only from the NDSS final app. */
export async function legacyObservationCount(): Promise<number> {
  await ensureSchema();
  try {
    const result = await databasePool().query<{ count: string }>(`SELECT count(*)::text AS count FROM ${LEGACY_TABLE}`);
    return Number(result.rows[0]?.count || 0);
  } catch (error) {
    if (isMissingTable(error)) return 0;
    throw error;
  }
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
    study_id: string | null;
    consent_version: string | null;
    server_received_at: string | null;
    server_network: ResearchObservation["serverNetwork"] | null;
    path_probes: ResearchObservation["pathProbes"] | null;
    device_location: ResearchObservation["deviceLocation"] | null;
    ground_truth_details: ResearchObservation["groundTruthDetails"] | null;
    risk_assessment: ResearchObservation["riskAssessment"] | null;
    protected_components: ResearchObservation["protectedComponents"] | null;
  }>(`
    SELECT observation_id, device_label, browser_mode, vpn_ground_truth,
           fingerprint, server_seen_ip, effective_public_ip, study_id,
           consent_version, server_received_at, server_network, path_probes,
           device_location, ground_truth_details, risk_assessment, protected_components
      FROM ${NDSS_TABLE}
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
    studyId: row.study_id || undefined,
    consentVersion: row.consent_version || undefined,
    serverReceivedAt: row.server_received_at || undefined,
    serverNetwork: row.server_network || undefined,
    pathProbes: row.path_probes || undefined,
    deviceLocation: row.device_location,
    groundTruthDetails: row.ground_truth_details || undefined,
    riskAssessment: row.risk_assessment || undefined,
    protectedComponents: row.protected_components || undefined,
  }));
}

export async function recentLegacyObservations(limit = 200): Promise<ResearchObservation[]> {
  await ensureSchema();
  const safeLimit = Math.max(1, Math.min(1000, Math.floor(limit)));
  try {
    const result = await databasePool().query<{
      observation_id: string;
      device_label: string;
      browser_mode: ResearchObservation["browserMode"];
      vpn_ground_truth: ResearchObservation["vpnGroundTruth"];
      fingerprint: ResearchObservation["fingerprint"];
      server_seen_ip: string;
      effective_public_ip: string;
      study_id: string | null;
      consent_version: string | null;
      server_received_at: string | null;
      server_network: ResearchObservation["serverNetwork"] | null;
      path_probes: ResearchObservation["pathProbes"] | null;
      device_location: ResearchObservation["deviceLocation"] | null;
      ground_truth_details: ResearchObservation["groundTruthDetails"] | null;
      risk_assessment: ResearchObservation["riskAssessment"] | null;
      protected_components: ResearchObservation["protectedComponents"] | null;
    }>(`
      SELECT observation_id, device_label, browser_mode, vpn_ground_truth,
             fingerprint, server_seen_ip, effective_public_ip, study_id,
             consent_version, server_received_at, server_network, path_probes,
             device_location, ground_truth_details, risk_assessment, protected_components
        FROM ${LEGACY_TABLE}
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
      studyId: row.study_id || undefined,
      consentVersion: row.consent_version || undefined,
      serverReceivedAt: row.server_received_at || undefined,
      serverNetwork: row.server_network || undefined,
      pathProbes: row.path_probes || undefined,
      deviceLocation: row.device_location,
      groundTruthDetails: row.ground_truth_details || undefined,
      riskAssessment: row.risk_assessment || undefined,
      protectedComponents: row.protected_components || undefined,
    }));
  } catch (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
}

export async function saveObservation(observation: ResearchObservation): Promise<void> {
  await ensureSchema();
  await databasePool().query(`
    INSERT INTO ${NDSS_TABLE} (
      observation_id, device_label, browser_mode, vpn_ground_truth,
      fingerprint, server_seen_ip, effective_public_ip, study_id,
      consent_version, server_received_at, server_network, path_probes,
      device_location, ground_truth_details, risk_assessment, protected_components
    ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb)
  `, [
    observation.observationId,
    observation.deviceLabel,
    observation.browserMode,
    observation.vpnGroundTruth,
    JSON.stringify(observation.fingerprint),
    observation.serverSeenIp,
    observation.effectivePublicIp,
    observation.studyId || null,
    observation.consentVersion || null,
    observation.serverReceivedAt || null,
    JSON.stringify(observation.serverNetwork || null),
    JSON.stringify(observation.pathProbes || []),
    JSON.stringify(observation.deviceLocation || null),
    JSON.stringify(observation.groundTruthDetails || null),
    JSON.stringify(observation.riskAssessment || null),
    JSON.stringify(observation.protectedComponents || null),
  ]);
}

export async function deleteObservationsOlderThan(days: number): Promise<number> {
  await ensureSchema();
  const safeDays = Math.max(1, Math.min(3650, Math.floor(days)));
  const result = await databasePool().query(
    `DELETE FROM ${NDSS_TABLE} WHERE created_at < now() - ($1::text || ' days')::interval`,
    [safeDays],
  );
  return result.rowCount || 0;
}

function isMissingTable(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "42P01");
}
