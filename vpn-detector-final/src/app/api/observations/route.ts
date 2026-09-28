import {
  CONSENT_VERSION,
  FINGERPRINT_SCHEMA_VERSION,
  type ObservationSubmission,
  type ResearchObservation,
} from "@/utils/fingerprint";
import { deriveHistoryFeatures } from "@/utils/history";
import type { ClientConsistency } from "@/utils/network";
import { legacyObservationCount, observationCount, recentObservations, saveObservation } from "@/utils/research-store";
import { protectFingerprintComponents } from "@/utils/protected-fingerprint";
import { assessVpnRisk } from "@/utils/risk";
import { observeServerNetwork, verifyAndEnrichProbe, verifyScanChallenge } from "@/utils/server-network";
import { compareObservations } from "@/utils/similarity";
import { trainNdssCrossBrowserMask } from "@/utils/ndss-mask";

export const dynamic = "force-dynamic";

const GROUND_TRUTH_VALUES = [
  "none", "consumer-vpn", "corporate-vpn", "split-tunnel", "tor", "public-proxy",
  "residential-proxy", "private-relay", "unknown", "off", "on",
];

type RateGlobal = typeof globalThis & { __vpnResearchRate?: Map<string, { count: number; resetsAt: number }> };

export async function GET() {
  try {
    const [ndssCount, legacyCount] = await Promise.all([observationCount(), legacyObservationCount()]);
    return Response.json({ count: ndssCount, ndssCount, legacyCount, backend: "postgresql", schemaVersion: FINGERPRINT_SCHEMA_VERSION });
  } catch (error) {
    logDatabaseError("count", error);
    return Response.json({ error: publicDatabaseError(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > 300_000) return Response.json({ error: "Observation payload is too large" }, { status: 413 });
    const payload: unknown = await request.json();
    if (!isSubmission(payload)) return Response.json({ error: "Invalid or unconsented research observation" }, { status: 400 });

    const serverNetwork = await observeServerNetwork(request);
    if (!verifyScanChallenge(payload.scanChallenge, serverNetwork, request.headers)) return Response.json({ error: "Expired or invalid scan challenge" }, { status: 400 });
    if (!allowObservation(serverNetwork)) return Response.json({ error: "Research capture rate limit exceeded" }, { status: 429 });
    serverNetwork.clientConsistency = compareClientClaims(payload, serverNetwork.headers);
    const pathProbes = await Promise.all(payload.pathProbes.slice(0, 2).map((probe) => verifyAndEnrichProbe(probe)));
    const serverReceivedAt = new Date().toISOString();
    const observation: ResearchObservation = {
      observationId: crypto.randomUUID(),
      deviceLabel: payload.deviceLabel.trim(),
      browserMode: payload.browserMode,
      vpnGroundTruth: payload.vpnGroundTruth,
      fingerprint: payload.fingerprint,
      serverSeenIp: serverNetwork.ip,
      effectivePublicIp: serverNetwork.isPublicIp ? serverNetwork.ip : "Unknown",
      serverReceivedAt,
      studyId: cleanShortText(payload.studyId, 60) || "vpn-fingerprint-pilot",
      consentVersion: CONSENT_VERSION,
      serverNetwork,
      pathProbes,
      deviceLocation: payload.deviceLocation,
      groundTruthDetails: {
        providerCode: cleanShortText(payload.groundTruthDetails.providerCode, 60),
        protocol: cleanShortText(payload.groundTruthDetails.protocol, 40),
        exitCountry: cleanShortText(payload.groundTruthDetails.exitCountry, 3).toUpperCase(),
      },
      protectedComponents: protectFingerprintComponents(payload.fingerprint),
    };

    const previousObservations = await recentObservations(1000);
    const maskByBrowser = new Map<string, ReturnType<typeof trainNdssCrossBrowserMask>>();
    const matchingMask = (previous: ResearchObservation) => {
      if (previous.fingerprint.browserFamily === observation.fingerprint.browserFamily) return [];
      const key = [previous.fingerprint.browserFamily, observation.fingerprint.browserFamily].sort().join("|");
      if (!maskByBrowser.has(key)) {
        maskByBrowser.set(key, trainNdssCrossBrowserMask(
          [...previousObservations, observation].map(({ deviceLabel, fingerprint }) => ({ deviceLabel, fingerprint })),
          observation.fingerprint.browserFamily,
          previous.fingerprint.browserFamily,
        ));
      }
      return maskByBrowser.get(key)?.taskIds || [];
    };
    const matches = previousObservations
      .map((previous) => compareObservations(observation, previous, matchingMask(previous)))
      .sort((a, b) => b.deviceSimilarity.score - a.deviceSimilarity.score)
      .slice(0, 5);
    const history = deriveHistoryFeatures(observation, previousObservations);
    observation.riskAssessment = assessVpnRisk({
      fingerprint: observation.fingerprint,
      server: serverNetwork,
      bestMatch: matches[0] || null,
      pathProbes,
      deviceLocation: observation.deviceLocation || null,
      history,
    });

    await saveObservation(observation);
    return Response.json({
      observation,
      matches,
      history,
      risk: observation.riskAssessment,
      count: await observationCount(),
      legacyCount: await legacyObservationCount(),
      backend: "postgresql",
      ndssMasks: Array.from(maskByBrowser.values()),
    });
  } catch (error) {
    logDatabaseError("save", error);
    return Response.json({ error: publicDatabaseError(error) }, { status: 503 });
  }
}

function isSubmission(value: unknown): value is ObservationSubmission {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ObservationSubmission>;
  const location = candidate.deviceLocation;
  const locationValid = location === null || location === undefined || (
    Number.isFinite(location.latitude) && location.latitude >= -90 && location.latitude <= 90 &&
    Number.isFinite(location.longitude) && location.longitude >= -180 && location.longitude <= 180 &&
    Number.isFinite(location.accuracyMeters) && location.accuracyMeters >= 0 && location.accuracyMeters <= 100_000
  );
  return Boolean(
    candidate.consentAcknowledged === true &&
    typeof candidate.deviceLabel === "string" && candidate.deviceLabel.trim().length > 0 && candidate.deviceLabel.length <= 60 &&
    ["normal", "private", "unknown"].includes(candidate.browserMode || "") &&
    GROUND_TRUTH_VALUES.includes(candidate.vpnGroundTruth || "") &&
    candidate.fingerprint?.schemaVersion === FINGERPRINT_SCHEMA_VERSION &&
    typeof candidate.fingerprint.userAgent === "string" && candidate.fingerprint.userAgent.length <= 1_000 &&
    Array.isArray(candidate.pathProbes) && candidate.pathProbes.length <= 2 &&
    locationValid && candidate.groundTruthDetails && typeof candidate.groundTruthDetails === "object" && typeof candidate.scanChallenge === "string"
  );
}

function compareClientClaims(payload: ObservationSubmission, headers: Record<string, string>): ClientConsistency {
  const notes: string[] = [];
  const serverUserAgent = headers["user-agent"];
  if (serverUserAgent && serverUserAgent !== "Unknown" && serverUserAgent !== payload.fingerprint.userAgent) {
    notes.push("JavaScript User-Agent differs from the first-party HTTP User-Agent header.");
  }
  const platformHint = (headers["sec-ch-ua-platform"] || "").replaceAll('"', "").toLowerCase();
  const os = payload.fingerprint.osFamily.toLowerCase();
  if (platformHint && platformHint !== "unknown") {
    const compatible = (platformHint.includes("windows") && os.includes("windows")) ||
      (platformHint.includes("mac") && os.includes("mac")) ||
      (platformHint.includes("android") && os.includes("android")) ||
      (platformHint.includes("linux") && os.includes("linux")) ||
      (platformHint.includes("chrome") && os.includes("chrome"));
    if (!compatible) notes.push(`Client Hint platform ${platformHint} conflicts with parsed OS ${payload.fingerprint.osFamily}.`);
  }
  return { status: notes.length ? "suspicious" : serverUserAgent && serverUserAgent !== "Unknown" ? "consistent" : "indeterminate", notes };
}

function cleanShortText(value: string, maximum: number): string {
  return typeof value === "string" ? value.trim().replace(/[\r\n\t]/g, " ").slice(0, maximum) : "";
}

function logDatabaseError(operation: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[research-db] ${operation}: ${error.message}`, { name: error.name, code: "code" in error ? error.code : undefined });
    return;
  }
  console.error(`[research-db] ${operation}:`, error);
}

function publicDatabaseError(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
  const connectionMode = process.env.DATABASE_URL_POOLER ? "pooler" : "direct PostgreSQL";
  if (["ENOTFOUND", "ETIMEDOUT", "ECONNREFUSED", "ECONNRESET"].includes(code)) {
    return `Research ${connectionMode} connection failed. Configure DATABASE_URL_POOLER with the Supabase pooler connection string if this network restricts direct PostgreSQL traffic.`;
  }
  if (code === "28P01") return "Research database authentication failed. Check the server-side PostgreSQL connection string.";
  if (code === "42P01") return "Research database schema is unavailable. Reload once to initialize the NDSS observation table.";
  const message = error instanceof Error ? error.message.replace(/[\r\n]/g, " ").slice(0, 180) : "unknown error";
  return `Research database request failed (${code}): ${message}`;
}

function allowObservation(network: { trusted: boolean; isPublicIp: boolean; ip: string }): boolean {
  if (!network.trusted || !network.isPublicIp) return true;
  const shared = globalThis as RateGlobal;
  shared.__vpnResearchRate ??= new Map();
  const now = Date.now();
  const existing = shared.__vpnResearchRate.get(network.ip);
  if (!existing || existing.resetsAt <= now) {
    shared.__vpnResearchRate.set(network.ip, { count: 1, resetsAt: now + 10 * 60_000 });
    return true;
  }
  existing.count += 1;
  return existing.count <= 30;
}
