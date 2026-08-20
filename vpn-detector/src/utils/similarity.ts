import type { FingerprintData, ResearchObservation } from "./fingerprint";

export interface SimilarityComponent {
  name: string;
  weight: number;
  similarity: number;
  available: boolean;
  current: string;
  previous: string;
}

export interface SimilarityResult {
  score: number;
  confidence: "high" | "medium" | "low" | "insufficient";
  verdict: "likely-same-device" | "similar-device" | "different-device" | "insufficient-evidence";
  comparableWeight: number;
  components: SimilarityComponent[];
}

export interface ObservationMatch {
  observationId: string;
  deviceLabel: string;
  browserFamily: string;
  browserMode: string;
  vpnGroundTruth: string;
  collectedAt: string;
  deviceSimilarity: SimilarityResult;
  sameBrowserSimilarity: SimilarityResult | null;
  ipChanged: boolean;
  previousIp: string;
}

function available(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "" && value !== "unknown" && value !== "Unknown" && value !== "unavailable";
}

function exact(a: unknown, b: unknown): number {
  return a === b ? 1 : 0;
}

function jaccard(a: string[], b: string[]): number {
  const first = new Set(a);
  const second = new Set(b);
  const union = new Set([...first, ...second]);
  if (union.size === 0) return 1;
  let intersection = 0;
  for (const item of first) if (second.has(item)) intersection += 1;
  return intersection / union.size;
}

function numericCloseness(a: number, b: number, tolerance: number): number {
  const distance = Math.abs(a - b);
  return Math.max(0, 1 - distance / tolerance);
}

function component(name: string, weight: number, a: unknown, b: unknown, similarity: number): SimilarityComponent {
  return {
    name,
    weight,
    similarity,
    available: available(a) && available(b),
    current: Array.isArray(a) ? a.join(", ") : String(a ?? "unavailable"),
    previous: Array.isArray(b) ? b.join(", ") : String(b ?? "unavailable"),
  };
}

function summarize(components: SimilarityComponent[]): SimilarityResult {
  const comparable = components.filter((item) => item.available);
  const comparableWeight = comparable.reduce((sum, item) => sum + item.weight, 0);
  if (comparableWeight < 35) {
    return { score: 0, confidence: "insufficient", verdict: "insufficient-evidence", comparableWeight, components };
  }

  const score = Math.round(
    100 * comparable.reduce((sum, item) => sum + item.weight * item.similarity, 0) / comparableWeight,
  );
  const confidence = comparableWeight >= 75 ? "high" : comparableWeight >= 55 ? "medium" : "low";
  const verdict = score >= 86
    ? "likely-same-device"
    : score >= 68
      ? "similar-device"
      : "different-device";
  return { score, confidence, verdict, comparableWeight, components };
}

export function compareDevices(current: FingerprintData, previous: FingerprintData): SimilarityResult {
  const components = [
    component("Operating system", 18, current.osFamily, previous.osFamily, exact(current.osFamily, previous.osFamily)),
    component("CPU architecture", 10, current.architecture, previous.architecture, exact(current.architecture, previous.architecture)),
    component("Bitness", 5, current.bitness, previous.bitness, exact(current.bitness, previous.bitness)),
    component("CPU core bucket", 10, current.hardwareBucket, previous.hardwareBucket, exact(current.hardwareBucket, previous.hardwareBucket)),
    component("Memory bucket", 8, current.memoryBucket, previous.memoryBucket, exact(current.memoryBucket, previous.memoryBucket)),
    component("Long screen edge", 8, current.screen.maxDimensionBucket, previous.screen.maxDimensionBucket, numericCloseness(current.screen.maxDimensionBucket, previous.screen.maxDimensionBucket, 300)),
    component("Short screen edge", 8, current.screen.minDimensionBucket, previous.screen.minDimensionBucket, numericCloseness(current.screen.minDimensionBucket, previous.screen.minDimensionBucket, 300)),
    component("Pixel ratio", 5, current.screen.pixelRatioBucket, previous.screen.pixelRatioBucket, numericCloseness(current.screen.pixelRatioBucket, previous.screen.pixelRatioBucket, 1)),
    component("Color depth", 5, current.colorDepth, previous.colorDepth, exact(current.colorDepth, previous.colorDepth)),
    component("Touch capability", 5, current.touchPoints > 0, previous.touchPoints > 0, exact(current.touchPoints > 0, previous.touchPoints > 0)),
    component("GPU family", 14, current.webgl.rendererFamily, previous.webgl.rendererFamily, exact(current.webgl.rendererFamily, previous.webgl.rendererFamily)),
    component("Timezone offset", 4, current.timezone.offsetMinutes, previous.timezone.offsetMinutes, numericCloseness(current.timezone.offsetMinutes, previous.timezone.offsetMinutes, 120)),
  ];
  return summarize(components);
}

export function compareSameBrowser(current: FingerprintData, previous: FingerprintData): SimilarityResult {
  const components = [
    ...compareDevices(current, previous).components,
    component("Browser family", 15, current.browserFamily, previous.browserFamily, exact(current.browserFamily, previous.browserFamily)),
    component("Browser major", 4, current.browserMajor, previous.browserMajor, exact(current.browserMajor, previous.browserMajor)),
    component("Canvas rendering", 12, current.canvas.hash, previous.canvas.hash, exact(current.canvas.hash, previous.canvas.hash)),
    component("WebGL parameters", 10, current.webgl.parameterHash, previous.webgl.parameterHash, exact(current.webgl.parameterHash, previous.webgl.parameterHash)),
    component("Font set", 8, current.fonts, previous.fonts, jaccard(current.fonts, previous.fonts)),
    component("Capability set", 6, current.capabilities, previous.capabilities, jaccard(current.capabilities, previous.capabilities)),
  ];
  return summarize(components);
}

export function compareObservations(current: ResearchObservation, previous: ResearchObservation): ObservationMatch {
  const sameBrowser = current.fingerprint.browserFamily === previous.fingerprint.browserFamily;
  return {
    observationId: previous.observationId,
    deviceLabel: previous.deviceLabel,
    browserFamily: previous.fingerprint.browserFamily,
    browserMode: previous.browserMode,
    vpnGroundTruth: previous.vpnGroundTruth,
    collectedAt: previous.fingerprint.collectedAt,
    deviceSimilarity: compareDevices(current.fingerprint, previous.fingerprint),
    sameBrowserSimilarity: sameBrowser ? compareSameBrowser(current.fingerprint, previous.fingerprint) : null,
    ipChanged: Boolean(current.effectivePublicIp && previous.effectivePublicIp && current.effectivePublicIp !== previous.effectivePublicIp),
    previousIp: previous.effectivePublicIp,
  };
}
