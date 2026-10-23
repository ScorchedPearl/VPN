import "server-only";

import type { ResearchObservation } from "./fingerprint";
import { linkObservations, trainLinkageModel, type LinkageModel, type LinkageResult } from "./linkage";

type LinkageGlobal = typeof globalThis & { __linkageModel?: { key: string; model: LinkageModel; expiresAt: number } };

/**
 * Training compares every labelled pair (bounded), so the model is cached
 * until the dataset changes or five minutes pass.
 */
export function cachedLinkageModel(observations: ResearchObservation[]): LinkageModel {
  const shared = globalThis as LinkageGlobal;
  const key = `${observations.length}:${observations[0]?.observationId || "empty"}:${process.env.LINKAGE_PRIOR || ""}`;
  const cached = shared.__linkageModel;
  if (cached && cached.key === key && cached.expiresAt > Date.now()) return cached.model;
  const configuredPrior = Number(process.env.LINKAGE_PRIOR);
  const model = trainLinkageModel(observations, {
    maxObservations: 400,
    maxDifferentPairs: 30_000,
    prior: Number.isFinite(configuredPrior) && configuredPrior > 0 && configuredPrior < 1 ? configuredPrior : undefined,
  });
  shared.__linkageModel = { key, model, expiresAt: Date.now() + 5 * 60_000 };
  return model;
}

export interface LinkedHistory {
  linkedObservations: number;
  firstSeen: string | null;
  browsers: string[];
  publicIps: string[];
  asns: string[];
  countries: string[];
  labels: string[];
}

/** Summarises where the same physical device appears to have been seen before. */
export function linkedHistory(matches: Array<{ previous: ResearchObservation; linkage: LinkageResult }>, threshold = 0.9): LinkedHistory {
  const linked = matches.filter((item) => item.linkage.posterior >= threshold && item.linkage.verdict !== "insufficient-evidence").map((item) => item.previous);
  const times = linked.map((item) => item.serverReceivedAt || item.fingerprint.collectedAt).sort();
  const distinct = (values: Array<string | undefined>) => Array.from(new Set(values.filter((value): value is string => Boolean(value && value !== "Unknown"))));
  return {
    linkedObservations: linked.length,
    firstSeen: times[0] || null,
    browsers: distinct(linked.map((item) => `${item.fingerprint.browserFamily}${item.browserMode === "private" ? " (private)" : ""}`)),
    publicIps: distinct(linked.map((item) => item.serverNetwork?.ip || item.effectivePublicIp)),
    asns: distinct(linked.map((item) => item.serverNetwork?.geoIp?.asn)),
    countries: distinct(linked.map((item) => item.serverNetwork?.geoIp?.countryCode)),
    labels: distinct(linked.map((item) => item.deviceLabel)),
  };
}

export { linkObservations };
