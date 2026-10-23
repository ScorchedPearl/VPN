import type { FingerprintData, ResearchObservation } from "./fingerprint";

/**
 * Probabilistic device linkage: "were these two observations produced by the
 * same physical device?"
 *
 * Design, following the 2018-2026 literature (FP-STALKER, Andriamilanto et
 * al., ThresholdFP 2025, DrawnApart 2022, Cao et al. 2017):
 *
 * 1. Each feature is compared with a type-appropriate similarity and the
 *    result is put in one of four agreement bins (exact / close / partial /
 *    different), so evolving values degrade gracefully instead of breaking an
 *    exact hash.
 * 2. Every bin has a likelihood under "same device" and "different device".
 *    Expert priors (stability, collision rate) are blended with counts from
 *    the labelled study data (Dirichlet smoothing), so the model is usable
 *    from the first capture and becomes data-driven as labels accumulate.
 * 3. Features have a scope: device features are compared across any browsers,
 *    engine features only within one rendering engine, browser features only
 *    within one browser family. Randomized (farbled) features are excluded
 *    rather than counted as a mismatch.
 * 4. Log-likelihood ratios are summed per family and capped, which limits
 *    double counting of correlated features (fonts, emoji and voices all
 *    follow the OS image).
 * 5. The posterior uses an open-world prior (1 / number of known devices) and
 *    optional Platt calibration with a prior-shift correction.
 */

export const LINKAGE_MODEL_VERSION = "linkage-nb-2026.10";

export type LinkScope = "device" | "engine" | "browser";
export type ComparisonContext = "same-browser" | "same-engine" | "cross-browser";
export type LinkFamily =
  | "platform" | "hardware" | "display" | "gpu" | "gpu-timing" | "os-assets"
  | "locale" | "audio-hw" | "engine-render" | "browser-config" | "network";

type Value = string | number | boolean | string[] | number[];
const CONTEXTS: ComparisonContext[] = ["same-browser", "same-engine", "cross-browser"];
const BIN_EDGES = [0.97, 0.85, 0.5];
const BIN_NAMES = ["exact", "close", "partial", "different"] as const;
const PRIOR_STRENGTH = 12;
const LLR_LIMIT = 6;

export const FAMILY_CAPS: Record<LinkFamily, { positive: number; negative: number }> = {
  platform: { positive: 2.5, negative: -6 },
  hardware: { positive: 2.5, negative: -5 },
  display: { positive: 3, negative: -4.5 },
  gpu: { positive: 3.5, negative: -5 },
  "gpu-timing": { positive: 2, negative: -1.5 },
  "os-assets": { positive: 4, negative: -3.5 },
  locale: { positive: 1.2, negative: -2 },
  "audio-hw": { positive: 1.2, negative: -2 },
  "engine-render": { positive: 5, negative: -4 },
  "browser-config": { positive: 1.5, negative: -2.5 },
  network: { positive: 0.7, negative: -0.3 },
};

export const FAMILY_LABELS: Record<LinkFamily, string> = {
  platform: "OS & platform",
  hardware: "CPU, memory, input",
  display: "Display",
  gpu: "GPU identity",
  "gpu-timing": "GPU timing (DrawnApart/WebGPU)",
  "os-assets": "Fonts, emoji, voices",
  locale: "Locale & timezone",
  "audio-hw": "Audio hardware",
  "engine-render": "Engine rendering",
  "browser-config": "Browser configuration",
  network: "Network context",
};

interface FeatureSpec {
  id: string;
  label: string;
  family: LinkFamily;
  scope: LinkScope;
  /** Exact-equality features only ever produce the exact or different bin. */
  binary: boolean;
  /** P(exact | same device) within one browser, one engine, and across engines. */
  stability: [number, number, number];
  /** P(exact | different devices). */
  collision: number;
  value: (observation: ResearchObservation) => Value | null;
  compare?: (a: Value, b: Value) => number | null;
  /** True when a randomizing defence makes this observation's value unreliable. */
  protectedBy?: (fingerprint: FingerprintData) => boolean;
}

/* ----------------------------------------------------------------------- */
/* Comparators                                                              */
/* ----------------------------------------------------------------------- */

function exact(a: Value, b: Value): number {
  return stringify(a) === stringify(b) ? 1 : 0;
}

function jaccard(a: Value, b: Value): number | null {
  const first = new Set(a as string[]);
  const second = new Set(b as string[]);
  const union = new Set([...first, ...second]);
  if (!union.size) return null;
  let shared = 0;
  for (const item of first) if (second.has(item)) shared += 1;
  return shared / union.size;
}

function closeness(tolerance: number) {
  return (a: Value, b: Value): number => Math.max(0, 1 - Math.abs(Number(a) - Number(b)) / tolerance);
}

/** Fraction of positions that agree within a tolerance (rounded metrics). */
function vectorAgreement(tolerance: number) {
  return (a: Value, b: Value): number | null => {
    const first = a as number[];
    const second = b as number[];
    if (!first.length || first.length !== second.length) return null;
    return first.filter((value, index) => Math.abs(value - second[index]) <= tolerance).length / first.length;
  };
}

/** Pearson correlation for timing profiles; uninformative flat profiles abstain. */
export function profileCorrelation(a: Value, b: Value): number | null {
  const first = a as number[];
  const second = b as number[];
  if (first.length < 8 || first.length !== second.length) return null;
  const meanA = first.reduce((sum, value) => sum + value, 0) / first.length;
  const meanB = second.reduce((sum, value) => sum + value, 0) / second.length;
  let covariance = 0, varianceA = 0, varianceB = 0;
  for (let index = 0; index < first.length; index += 1) {
    covariance += (first[index] - meanA) * (second[index] - meanB);
    varianceA += (first[index] - meanA) ** 2;
    varianceB += (second[index] - meanB) ** 2;
  }
  const spreadA = Math.sqrt(varianceA / first.length);
  const spreadB = Math.sqrt(varianceB / second.length);
  if (spreadA < 0.01 || spreadB < 0.01) return null;
  return Math.max(0, covariance / Math.sqrt(varianceA * varianceB));
}

function stringify(value: Value): string {
  return Array.isArray(value) ? value.join("|") : String(value);
}

function known(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "string") return !["unknown", "Unknown", "unavailable", "unsupported", "disabled", "failed", "n/a"].includes(value);
  if (typeof value === "number") return Number.isFinite(value) && value >= 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function orNull<T extends Value>(value: T | null | undefined): T | null {
  return known(value) ? (value as T) : null;
}

/* ----------------------------------------------------------------------- */
/* Feature catalogue                                                        */
/* ----------------------------------------------------------------------- */

const fp = (observation: ResearchObservation) => observation.fingerprint;
const modern = (observation: ResearchObservation) => observation.fingerprint.modern;

export const FEATURES: FeatureSpec[] = [
  // Platform
  { id: "os", label: "Operating system", family: "platform", scope: "device", binary: true, stability: [0.995, 0.99, 0.99], collision: 0.35,
    value: (o) => orNull(fp(o).osFamily) },
  { id: "os-version", label: "OS version (client hints)", family: "platform", scope: "device", binary: false, stability: [0.93, 0.9, 0.9], collision: 0.12,
    value: (o) => { const version = modern(o)?.clientHints?.platformVersion; return version ? version.split(".").slice(0, 2).map(Number) : null; },
    compare: (a, b) => { const [x, y] = [a as number[], b as number[]]; return x[0] !== y[0] ? 0 : x[1] === y[1] ? 1 : 0.9; } },
  { id: "architecture", label: "CPU architecture / bitness", family: "platform", scope: "device", binary: true, stability: [0.99, 0.98, 0.98], collision: 0.5,
    value: (o) => known(fp(o).architecture) ? `${fp(o).architecture}/${fp(o).bitness}` : null },
  { id: "device-model", label: "Device model (client hints)", family: "platform", scope: "device", binary: true, stability: [0.99, 0.97, 0.97], collision: 0.05,
    value: (o) => orNull(modern(o)?.clientHints?.model) },

  // Hardware
  { id: "cpu-cores", label: "Logical CPU cores", family: "hardware", scope: "device", binary: true, stability: [0.99, 0.95, 0.85], collision: 0.25,
    value: (o) => orNull(fp(o).hardwareConcurrency ?? null) },
  { id: "memory", label: "Device memory bucket", family: "hardware", scope: "device", binary: true, stability: [0.99, 0.97, 0.95], collision: 0.45,
    value: (o) => orNull(fp(o).deviceMemory ?? null) },
  { id: "refresh-rate", label: "Display refresh rate", family: "hardware", scope: "device", binary: true, stability: [0.9, 0.85, 0.82], collision: 0.6,
    value: (o) => orNull(modern(o)?.refreshRate.hz ?? null) },
  { id: "pointer-polling", label: "Pointer polling rate", family: "hardware", scope: "device", binary: true, stability: [0.8, 0.75, 0.7], collision: 0.35,
    value: (o) => orNull(modern(o)?.pointer.pollingHz ?? null) },

  // Display
  { id: "screen", label: "Screen resolution", family: "display", scope: "device", binary: false, stability: [0.95, 0.94, 0.92], collision: 0.12,
    value: (o) => [Math.max(fp(o).screen.width, fp(o).screen.height), Math.min(fp(o).screen.width, fp(o).screen.height)],
    compare: (a, b) => { const [x, y] = [a as number[], b as number[]]; return x[0] === y[0] && x[1] === y[1] ? 1 : Math.max(0, 1 - (Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1])) / 800); } },
  { id: "pixel-ratio", label: "Device pixel ratio", family: "display", scope: "device", binary: false, stability: [0.9, 0.85, 0.82], collision: 0.4,
    value: (o) => fp(o).screen.pixelRatioBucket, compare: closeness(1) },
  { id: "screen-insets", label: "Taskbar / dock insets", family: "display", scope: "device", binary: true, stability: [0.9, 0.88, 0.85], collision: 0.25,
    value: (o) => { const insets = modern(o)?.screenInsets; return insets ? [insets.horizontal, insets.vertical, insets.left, insets.top] : null; } },
  { id: "display-profile", label: "Colour depth, gamut, HDR, pointer", family: "display", scope: "device", binary: true, stability: [0.97, 0.93, 0.9], collision: 0.3,
    value: (o) => fp(o).display ? [String(fp(o).colorDepth), fp(o).display!.colorGamut, fp(o).display!.dynamicRange, fp(o).display!.pointer, String(fp(o).touchPoints > 0)] : null },

  // GPU identity
  { id: "gpu-family", label: "GPU vendor family", family: "gpu", scope: "device", binary: true, stability: [0.99, 0.95, 0.9], collision: 0.3,
    value: (o) => orNull(fp(o).webgl.rendererFamily) },
  { id: "gpu-renderer", label: "GPU model tokens", family: "gpu", scope: "device", binary: false, stability: [0.97, 0.85, 0.7], collision: 0.08,
    value: (o) => orNull(modern(o)?.gpu.rendererTokens ?? null), compare: jaccard,
    protectedBy: (f) => Boolean(f.modern?.protections.brave || f.modern?.gpu.masked) },
  { id: "webgpu-adapter", label: "WebGPU vendor / architecture", family: "gpu", scope: "device", binary: true, stability: [0.97, 0.9, 0.8], collision: 0.2,
    value: (o) => { const gpu = modern(o)?.webgpu; return gpu?.status === "collected" && (gpu.vendor || gpu.architecture) ? `${gpu.vendor}/${gpu.architecture}` : null; },
    protectedBy: (f) => Boolean(f.modern?.protections.brave) },
  { id: "webgpu-subgroups", label: "WebGPU subgroup sizes", family: "gpu", scope: "device", binary: true, stability: [0.98, 0.9, 0.85], collision: 0.4,
    value: (o) => { const gpu = modern(o)?.webgpu; return gpu?.subgroupMinSize ? [gpu.subgroupMinSize, gpu.subgroupMaxSize ?? 0] : null; } },

  // GPU timing (non-deterministic, weak per comparison)
  { id: "gpu-timing", label: "DrawnApart EU timing profile", family: "gpu-timing", scope: "device", binary: false, stability: [0.35, 0.3, 0.25], collision: 0.06,
    value: (o) => { const timing = modern(o)?.gpuTiming; return timing?.status === "collected" ? timing.profile : null; }, compare: profileCorrelation },
  { id: "webgpu-scheduling", label: "WebGPU atomic scheduling profile", family: "gpu-timing", scope: "device", binary: false, stability: [0.35, 0.3, 0.25], collision: 0.06,
    value: (o) => { const scheduling = modern(o)?.webgpu.scheduling; return scheduling?.status === "collected" ? scheduling.profile : null; }, compare: profileCorrelation },

  // OS assets
  { id: "fonts", label: "Installed font inventory", family: "os-assets", scope: "device", binary: false, stability: [0.85, 0.7, 0.6], collision: 0.08,
    value: (o) => modern(o)?.fonts.detected.length ? modern(o)!.fonts.detected : null, compare: jaccard },
  { id: "legacy-fonts", label: "Core font probe (schema 4)", family: "os-assets", scope: "device", binary: false, stability: [0.9, 0.75, 0.65], collision: 0.25,
    value: (o) => orNull(fp(o).fonts), compare: jaccard },
  { id: "emoji-version", label: "Emoji font release", family: "os-assets", scope: "device", binary: true, stability: [0.97, 0.92, 0.85], collision: 0.4,
    value: (o) => orNull(modern(o)?.emoji.maxVersion ?? null) },
  { id: "emoji-metrics", label: "Emoji glyph metrics", family: "os-assets", scope: "device", binary: false, stability: [0.95, 0.8, 0.55], collision: 0.25,
    value: (o) => orNull(modern(o)?.emoji.widths ?? null), compare: vectorAgreement(0.5) },
  { id: "writing-systems", label: "Writing-system glyph support", family: "os-assets", scope: "device", binary: false, stability: [0.95, 0.85, 0.75], collision: 0.4,
    value: (o) => orNull(fp(o).ndss2017?.writingSystems.supported ?? null), compare: jaccard },
  { id: "local-voices", label: "Local speech voices", family: "os-assets", scope: "device", binary: false, stability: [0.95, 0.75, 0.6], collision: 0.2,
    value: (o) => orNull(modern(o)?.voices.local ?? null), compare: jaccard },
  { id: "generic-fonts", label: "Default generic font metrics", family: "os-assets", scope: "engine", binary: false, stability: [0.95, 0.75, 0.5], collision: 0.3,
    value: (o) => { const widths = modern(o)?.systemStyle.genericWidths; return widths && Object.keys(widths).length ? Object.keys(widths).sort().map((key) => widths[key]) : null; },
    compare: vectorAgreement(0.5) },

  // Locale
  { id: "timezone", label: "Timezone", family: "locale", scope: "device", binary: true, stability: [0.97, 0.96, 0.95], collision: 0.3,
    value: (o) => known(fp(o).timezone.name) ? canonicalTimeZone(fp(o).timezone.name) : null },
  { id: "language", label: "Primary language", family: "locale", scope: "device", binary: true, stability: [0.97, 0.85, 0.75], collision: 0.4,
    value: (o) => orNull(fp(o).languages[0]?.toLowerCase().split("-")[0] ?? null) },
  { id: "intl-format", label: "Locale formatting (calendar, hour cycle)", family: "locale", scope: "device", binary: true, stability: [0.97, 0.85, 0.75], collision: 0.4,
    value: (o) => { const intl = modern(o)?.intl; return intl ? [intl.locale, intl.calendar, intl.numberingSystem, intl.hourCycle] : null; } },

  // Audio hardware
  { id: "audio-destination", label: "Audio output sample rate / channels", family: "audio-hw", scope: "device", binary: true, stability: [0.97, 0.85, 0.8], collision: 0.5,
    value: (o) => { const destination = fp(o).ndss2017?.audioDestination; return destination?.sampleRate ? [destination.sampleRate, destination.maxChannelCount ?? -1] : null; } },
  { id: "media-devices", label: "Media device counts", family: "audio-hw", scope: "device", binary: true, stability: [0.9, 0.7, 0.6], collision: 0.5,
    value: (o) => { const devices = modern(o)?.mediaDevices; return devices ? [devices.audioinput, devices.videoinput, devices.audiooutput] : null; } },

  // Engine rendering (same engine only)
  { id: "canvas-hash", label: "Canvas rendering hash", family: "engine-render", scope: "engine", binary: true, stability: [0.92, 0.7, 0], collision: 0.03,
    value: (o) => orNull(fp(o).canvas.hash), protectedBy: (f) => Boolean(f.modern?.protections.canvasNoise) || f.canvas.repeatable === false },
  { id: "canvas-grid", label: "Noise-tolerant canvas grid", family: "engine-render", scope: "engine", binary: false, stability: [0.95, 0.75, 0], collision: 0.15,
    value: (o) => orNull(modern(o)?.canvasRobust.grid ?? null), compare: vectorAgreement(1.5) },
  { id: "webgl-params", label: "WebGL parameters", family: "engine-render", scope: "engine", binary: true, stability: [0.95, 0.8, 0], collision: 0.08,
    value: (o) => orNull(fp(o).webgl.parameterHash), protectedBy: (f) => Boolean(f.modern?.protections.brave) },
  { id: "webgl-render", label: "WebGL clear-colour render", family: "engine-render", scope: "engine", binary: true, stability: [0.97, 0.9, 0], collision: 0.4,
    value: (o) => orNull(fp(o).webgl.renderHash ?? null) },
  { id: "audio-hash", label: "Audio DSP hash", family: "engine-render", scope: "engine", binary: true, stability: [0.92, 0.6, 0], collision: 0.05,
    value: (o) => fp(o).audio?.status === "collected" ? fp(o).audio!.hash : null, protectedBy: (f) => Boolean(f.modern?.protections.audioNoise) },
  { id: "audio-summary", label: "Audio DSP summary (rounded)", family: "engine-render", scope: "engine", binary: true, stability: [0.95, 0.6, 0], collision: 0.08,
    value: (o) => orNull(modern(o)?.audioRobust.summary ?? null), protectedBy: (f) => Boolean(f.modern?.protections.audioNoise) },
  { id: "math", label: "JS math library", family: "engine-render", scope: "engine", binary: true, stability: [0.99, 0.9, 0], collision: 0.6,
    value: (o) => orNull(modern(o)?.math.hash ?? null) },
  { id: "ndss-tasks", label: "NDSS 2017 task hashes", family: "engine-render", scope: "engine", binary: false, stability: [0.9, 0.6, 0], collision: 0.1,
    value: (o) => { const tasks = fp(o).ndss2017?.tasks.filter((task) => task.status === "collected"); return tasks?.length ? tasks.map((task) => `${task.id}:${task.hash.slice(0, 16)}`) : null; },
    compare: jaccard },

  // Browser configuration (same browser family only)
  { id: "browser-version", label: "Browser major version", family: "browser-config", scope: "browser", binary: false, stability: [0.85, 0, 0], collision: 0.25,
    value: (o) => Number(fp(o).browserMajor) || null, compare: (a, b) => Number(a) === Number(b) ? 1 : Math.abs(Number(a) - Number(b)) <= 2 ? 0.9 : 0.3 },
  { id: "capabilities", label: "API capability set", family: "browser-config", scope: "browser", binary: false, stability: [0.95, 0, 0], collision: 0.4,
    value: (o) => orNull(fp(o).capabilities), compare: jaccard },
  { id: "codecs", label: "Media codec set", family: "browser-config", scope: "browser", binary: false, stability: [0.97, 0, 0], collision: 0.5,
    value: (o) => orNull(fp(o).mediaCapabilities ?? null), compare: jaccard },
  { id: "system-colors", label: "CSS system colours", family: "browser-config", scope: "browser", binary: true, stability: [0.9, 0, 0], collision: 0.4,
    value: (o) => { const colors = modern(o)?.systemStyle.colors; return colors && Object.keys(colors).length ? Object.keys(colors).sort().map((key) => colors[key]) : null; } },

  // Network context (weak: households, offices, and labs share egress)
  { id: "ip-prefix", label: "Same egress network prefix", family: "network", scope: "device", binary: true, stability: [0.5, 0.5, 0.5], collision: 0.25,
    value: (o) => ipPrefix(o.serverNetwork?.ip || o.effectivePublicIp) },
];

const FEATURE_BY_ID = new Map(FEATURES.map((spec) => [spec.id, spec]));

/**
 * Engines disagree on IANA aliases: Chromium reports "Asia/Calcutta" where
 * Firefox and Safari report "Asia/Kolkata" for the same device and setting.
 */
const TIME_ZONE_ALIASES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata", "Asia/Saigon": "Asia/Ho_Chi_Minh", "Asia/Katmandu": "Asia/Kathmandu", "Asia/Rangoon": "Asia/Yangon",
  "Asia/Dacca": "Asia/Dhaka", "Asia/Thimbu": "Asia/Thimphu", "Asia/Ulan_Bator": "Asia/Ulaanbaatar", "Asia/Macao": "Asia/Macau",
  "Europe/Kiev": "Europe/Kyiv", "America/Buenos_Aires": "America/Argentina/Buenos_Aires", "America/Indianapolis": "America/Indiana/Indianapolis",
  "America/Godthab": "America/Nuuk", "Atlantic/Faeroe": "Atlantic/Faroe", "Pacific/Ponape": "Pacific/Pohnpei", "Pacific/Truk": "Pacific/Chuuk",
  "Africa/Asmera": "Africa/Asmara", "US/Eastern": "America/New_York", "US/Central": "America/Chicago", "US/Mountain": "America/Denver",
  "US/Pacific": "America/Los_Angeles", "Etc/UTC": "UTC", "Etc/GMT": "UTC", "GMT": "UTC", "Etc/Universal": "UTC",
};

export function canonicalTimeZone(name: string): string {
  return TIME_ZONE_ALIASES[name] || name;
}

function ipPrefix(ip: string | undefined): string | null {
  if (!ip || ip === "Unknown") return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip.split(".").slice(0, 3).join(".");
  if (ip.includes(":")) return ip.toLowerCase().split(":").slice(0, 3).join(":");
  return null;
}

/* ----------------------------------------------------------------------- */
/* Context                                                                  */
/* ----------------------------------------------------------------------- */

const CHROMIUM = new Set(["Chrome", "Edge", "Opera", "Brave", "Samsung", "Vivaldi"]);

export function engineOf(fingerprint: FingerprintData): string {
  if (fingerprint.browserFamily === "Firefox") return "gecko";
  if (fingerprint.browserFamily === "Safari" || fingerprint.osFamily === "iOS/iPadOS") return "webkit";
  if (CHROMIUM.has(fingerprint.browserFamily)) return "blink";
  return fingerprint.browserFamily.toLowerCase();
}

export function comparisonContext(a: FingerprintData, b: FingerprintData): ComparisonContext {
  if (a.browserFamily === b.browserFamily) return "same-browser";
  return engineOf(a) === engineOf(b) ? "same-engine" : "cross-browser";
}

function eligible(spec: FeatureSpec, context: ComparisonContext): boolean {
  if (spec.scope === "device") return true;
  if (spec.scope === "engine") return context !== "cross-browser";
  return context === "same-browser";
}

function contextIndex(context: ComparisonContext): number {
  return CONTEXTS.indexOf(context);
}

/* ----------------------------------------------------------------------- */
/* Model                                                                    */
/* ----------------------------------------------------------------------- */

interface FeatureCounts {
  /** same[contextIndex][bin] */
  same: number[][];
  diff: number[];
}

export interface LinkageModel {
  version: string;
  trainedAt: string;
  observations: number;
  deviceLabels: number;
  samePairs: Record<ComparisonContext, number>;
  differentPairs: number;
  counts: Record<string, FeatureCounts>;
  prior: number;
  calibration: { slope: number; intercept: number; trainingPositiveRate: number; pairs: number } | null;
}

export interface LinkageFeature {
  id: string;
  label: string;
  family: LinkFamily;
  status: "used" | "unavailable" | "protected" | "out-of-scope";
  similarity: number | null;
  bin: (typeof BIN_NAMES)[number] | null;
  logLikelihoodRatio: number;
  current: string;
  previous: string;
}

export interface LinkageResult {
  modelVersion: string;
  context: ComparisonContext;
  posterior: number;
  calibrated: boolean;
  logLikelihoodRatio: number;
  verdict: "same-device" | "probably-same" | "inconclusive" | "different-device" | "insufficient-evidence";
  confidence: "high" | "medium" | "low";
  comparableFamilies: number;
  usedFeatures: number;
  families: Array<{ family: LinkFamily; label: string; raw: number; capped: number }>;
  features: LinkageFeature[];
  notes: string[];
}

function emptyCounts(): FeatureCounts {
  return { same: CONTEXTS.map(() => [0, 0, 0, 0]), diff: [0, 0, 0, 0] };
}

function binOf(similarity: number): number {
  return similarity >= BIN_EDGES[0] ? 0 : similarity >= BIN_EDGES[1] ? 1 : similarity >= BIN_EDGES[2] ? 2 : 3;
}

function priorSame(spec: FeatureSpec, context: ComparisonContext): number[] {
  const stability = Math.min(0.995, Math.max(0.05, spec.stability[contextIndex(context)]));
  if (spec.binary) return [stability, 0, 0, 1 - stability];
  const rest = 1 - stability;
  return [stability, rest * 0.45, rest * 0.33, rest * 0.22];
}

function priorDiff(spec: FeatureSpec): number[] {
  const collision = Math.min(0.95, Math.max(0.005, spec.collision));
  if (spec.binary) return [collision, 0, 0, 1 - collision];
  const rest = 1 - collision;
  return [collision, rest * 0.12, rest * 0.28, rest * 0.6];
}

function featureLlr(spec: FeatureSpec, context: ComparisonContext, bin: number, same: number[], diff: number[]): number {
  const sameTotal = same.reduce((sum, value) => sum + value, 0);
  const diffTotal = diff.reduce((sum, value) => sum + value, 0);
  const sameProbability = (same[bin] + PRIOR_STRENGTH * priorSame(spec, context)[bin]) / (sameTotal + PRIOR_STRENGTH);
  const diffProbability = (diff[bin] + PRIOR_STRENGTH * priorDiff(spec)[bin]) / (diffTotal + PRIOR_STRENGTH);
  const llr = Math.log(Math.max(sameProbability, 1e-4) / Math.max(diffProbability, 1e-4));
  return Math.max(-LLR_LIMIT, Math.min(LLR_LIMIT, llr));
}

/** Per-observation extracted values, computed once and reused for every pair. */
interface Extracted {
  observation: ResearchObservation;
  values: Array<Value | null>;
  protectedFlags: boolean[];
}

function extract(observation: ResearchObservation): Extracted {
  return {
    observation,
    values: FEATURES.map((spec) => {
      try {
        return spec.value(observation);
      } catch {
        return null;
      }
    }),
    protectedFlags: FEATURES.map((spec) => Boolean(spec.protectedBy?.(observation.fingerprint))),
  };
}

interface PairBins {
  context: ComparisonContext;
  /** -1 unavailable, -2 protected, -3 out of scope, otherwise the bin index. */
  bins: Int8Array;
  similarities: Float32Array;
}

function comparePair(a: Extracted, b: Extracted): PairBins {
  const context = comparisonContext(a.observation.fingerprint, b.observation.fingerprint);
  const bins = new Int8Array(FEATURES.length);
  const similarities = new Float32Array(FEATURES.length);
  FEATURES.forEach((spec, index) => {
    similarities[index] = NaN;
    if (!eligible(spec, context)) { bins[index] = -3; return; }
    const first = a.values[index];
    const second = b.values[index];
    if (first === null || second === null) { bins[index] = -1; return; }
    if (a.protectedFlags[index] || b.protectedFlags[index]) { bins[index] = -2; return; }
    const similarity = (spec.compare || exact)(first, second);
    if (similarity === null || !Number.isFinite(similarity)) { bins[index] = -1; return; }
    similarities[index] = similarity;
    bins[index] = binOf(similarity);
  });
  return { context, bins, similarities };
}

/** Deterministic pseudo-random pair sampling so evaluations are reproducible. */
function sampler(total: number, maximum: number): (index: number) => boolean {
  if (total <= maximum) return () => true;
  const keepRate = maximum / total;
  return (index) => ((Math.imul(index + 1, 2654435761) >>> 0) / 0x100000000) < keepRate;
}

export interface TrainingOptions {
  maxObservations?: number;
  maxDifferentPairs?: number;
  prior?: number;
}

export function trainLinkageModel(observations: ResearchObservation[], options: TrainingOptions = {}): LinkageModel {
  const rows = observations.slice(0, options.maxObservations ?? 400).map(extract);
  const counts: Record<string, FeatureCounts> = Object.fromEntries(FEATURES.map((spec) => [spec.id, emptyCounts()]));
  const samePairs: Record<ComparisonContext, number> = { "same-browser": 0, "same-engine": 0, "cross-browser": 0 };
  let differentPairs = 0;
  const totalPairs = (rows.length * (rows.length - 1)) / 2;
  const keep = sampler(totalPairs, options.maxDifferentPairs ?? 30_000);
  const scoredPairs: Array<{ llr: number; label: 0 | 1 }> = [];
  const pairBins: Array<{ pair: PairBins; label: 0 | 1 }> = [];
  let pairIndex = 0;
  for (let left = 0; left < rows.length; left += 1) {
    for (let right = left + 1; right < rows.length; right += 1, pairIndex += 1) {
      const same = rows[left].observation.deviceLabel === rows[right].observation.deviceLabel;
      if (!same && !keep(pairIndex)) continue;
      const pair = comparePair(rows[left], rows[right]);
      pairBins.push({ pair, label: same ? 1 : 0 });
      if (same) samePairs[pair.context] += 1;
      else differentPairs += 1;
      FEATURES.forEach((spec, index) => {
        const bin = pair.bins[index];
        if (bin < 0) return;
        if (same) counts[spec.id].same[contextIndex(pair.context)][bin] += 1;
        else counts[spec.id].diff[bin] += 1;
      });
    }
  }
  const labels = new Set(rows.map((row) => row.observation.deviceLabel)).size;
  const model: LinkageModel = {
    version: LINKAGE_MODEL_VERSION,
    trainedAt: new Date().toISOString(),
    observations: rows.length,
    deviceLabels: labels,
    samePairs,
    differentPairs,
    counts,
    prior: options.prior ?? openWorldPrior(labels),
    calibration: null,
  };
  // Platt scaling needs both classes in reasonable numbers. With fewer pairs
  // the naive-Bayes posterior is reported and explicitly marked uncalibrated.
  const positives = pairBins.filter((item) => item.label === 1).length;
  if (positives >= 25 && pairBins.length - positives >= 25) {
    for (const item of pairBins) scoredPairs.push({ llr: aggregate(item.pair, model.counts).total, label: item.label });
    const fit = plattFit(scoredPairs);
    if (fit) model.calibration = { ...fit, trainingPositiveRate: positives / pairBins.length, pairs: pairBins.length };
  }
  return model;
}

/**
 * Probability that a stored observation belongs to the visiting device before
 * looking at any evidence: one in (known devices + the possibility of a new
 * one), assuming a population of at least ten devices.
 */
export function openWorldPrior(deviceCount: number): number {
  return Math.max(0.002, 1 / Math.max(10, deviceCount + 1));
}

function aggregate(pair: PairBins, counts: Record<string, FeatureCounts>) {
  const raw = new Map<LinkFamily, number>();
  const llrs = new Float64Array(FEATURES.length);
  let used = 0;
  FEATURES.forEach((spec, index) => {
    const bin = pair.bins[index];
    if (bin < 0) return;
    const featureCounts = counts[spec.id] || emptyCounts();
    const llr = featureLlr(spec, pair.context, bin, featureCounts.same[contextIndex(pair.context)], featureCounts.diff);
    llrs[index] = llr;
    raw.set(spec.family, (raw.get(spec.family) || 0) + llr);
    used += 1;
  });
  let total = 0;
  const families = Array.from(raw.entries()).map(([family, value]) => {
    const capped = Math.max(FAMILY_CAPS[family].negative, Math.min(FAMILY_CAPS[family].positive, value));
    total += capped;
    return { family, label: FAMILY_LABELS[family], raw: value, capped };
  });
  return { total, families, llrs, used };
}

function posteriorFrom(total: number, model: Pick<LinkageModel, "prior" | "calibration">): number {
  if (model.calibration) {
    const { slope, intercept, trainingPositiveRate } = model.calibration;
    // Prior-shift correction: the calibration set over-represents same-device
    // pairs, so swap its base rate for the open-world prior.
    return sigmoid(slope * total + intercept - logit(trainingPositiveRate) + logit(model.prior));
  }
  return sigmoid(logit(model.prior) + total);
}

export function linkObservations(current: ResearchObservation, previous: ResearchObservation, model: LinkageModel): LinkageResult {
  const first = extract(current);
  const second = extract(previous);
  const pair = comparePair(first, second);
  const { total, families, llrs, used } = aggregate(pair, model.counts);
  const posterior = posteriorFrom(total, model);
  const comparableFamilies = families.length;
  const notes: string[] = [];
  const protections = [current, previous].flatMap((observation) => observation.fingerprint.modern?.protections.notes || []);
  if (protections.length) notes.push(...Array.from(new Set(protections)));
  if (!model.calibration) notes.push("Posterior is an uncalibrated naive-Bayes estimate until at least 25 same-device and 25 different-device labelled pairs exist.");
  if (pair.context === "cross-browser") notes.push("Cross-engine comparison: only device-scope features (hardware, OS assets, display, locale, GPU identity and timing) are used.");

  const features: LinkageFeature[] = FEATURES.map((spec, index) => {
    const bin = pair.bins[index];
    return {
      id: spec.id,
      label: spec.label,
      family: spec.family,
      status: bin >= 0 ? "used" : bin === -2 ? "protected" : bin === -3 ? "out-of-scope" : "unavailable",
      similarity: bin >= 0 ? Number(pair.similarities[index].toFixed(3)) : null,
      bin: bin >= 0 ? BIN_NAMES[bin] : null,
      logLikelihoodRatio: bin >= 0 ? Number(llrs[index].toFixed(3)) : 0,
      current: display(first.values[index]),
      previous: display(second.values[index]),
    };
  });
  const insufficient = comparableFamilies < 3 || used < 5;
  const verdict: LinkageResult["verdict"] = insufficient
    ? "insufficient-evidence"
    : posterior >= 0.9 ? "same-device" : posterior >= 0.5 ? "probably-same" : posterior >= 0.1 ? "inconclusive" : "different-device";
  const margin = Math.abs(logit(Math.min(0.9999, Math.max(0.0001, posterior))));
  const confidence = !insufficient && comparableFamilies >= 6 && margin >= 3 ? "high" : !insufficient && comparableFamilies >= 4 && margin >= 1.5 ? "medium" : "low";
  return {
    modelVersion: LINKAGE_MODEL_VERSION,
    context: pair.context,
    posterior,
    calibrated: Boolean(model.calibration),
    logLikelihoodRatio: Number(total.toFixed(3)),
    verdict,
    confidence,
    comparableFamilies,
    usedFeatures: used,
    families: families.sort((a, b) => Math.abs(b.capped) - Math.abs(a.capped)),
    features,
    notes,
  };
}

function display(value: Value | null): string {
  if (value === null) return "unavailable";
  const text = Array.isArray(value) ? value.join(", ") : String(value);
  return text.length > 90 ? `${text.slice(0, 87)}…` : text;
}

/* ----------------------------------------------------------------------- */
/* Evaluation: leave-both-devices-out                                       */
/* ----------------------------------------------------------------------- */

export interface LinkageMetrics {
  context: ComparisonContext | "all";
  positives: number;
  negatives: number;
  rocAuc: number | null;
  equalErrorRate: number | null;
  tprAtFpr1: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
}

export interface LinkageEvaluation {
  modelVersion: string;
  observations: number;
  deviceLabels: number;
  pairsScored: number;
  sampled: boolean;
  rank1Accuracy: number | null;
  rank1Queries: number;
  metrics: LinkageMetrics[];
  familyImportance: Array<{ family: LinkFamily; label: string; meanGenuine: number; meanImpostor: number; separation: number }>;
  note: string;
}

/**
 * Every pair is scored with counts that exclude both devices in the pair, so
 * no device ever contributes to its own likelihood estimate. Counts are
 * additive, which makes this exact leave-out cheap.
 */
export function evaluateLinkage(observations: ResearchObservation[], options: TrainingOptions = {}): LinkageEvaluation {
  const rows = observations.slice(0, options.maxObservations ?? 300).map(extract);
  const labels = rows.map((row) => row.observation.deviceLabel);
  const deviceLabels = new Set(labels).size;
  const totalPairs = (rows.length * (rows.length - 1)) / 2;
  const maximum = options.maxDifferentPairs ?? 60_000;
  const sampled = totalPairs > maximum;
  const keep = sampler(totalPairs, maximum);
  const pairs: Array<{ left: number; right: number; pair: PairBins; same: boolean }> = [];
  const totalCounts: Record<string, FeatureCounts> = Object.fromEntries(FEATURES.map((spec) => [spec.id, emptyCounts()]));
  const sameByLabel = new Map<string, Record<string, FeatureCounts>>();
  const diffByLabel = new Map<string, Record<string, FeatureCounts>>();
  const diffByLabelPair = new Map<string, Record<string, FeatureCounts>>();
  const bucket = (map: Map<string, Record<string, FeatureCounts>>, key: string) => {
    if (!map.has(key)) map.set(key, Object.fromEntries(FEATURES.map((spec) => [spec.id, emptyCounts()])));
    return map.get(key)!;
  };
  let pairIndex = 0;
  for (let left = 0; left < rows.length; left += 1) {
    for (let right = left + 1; right < rows.length; right += 1, pairIndex += 1) {
      const same = labels[left] === labels[right];
      if (!same && !keep(pairIndex)) continue;
      const pair = comparePair(rows[left], rows[right]);
      pairs.push({ left, right, pair, same });
      const targets = same
        ? [totalCounts, bucket(sameByLabel, labels[left])]
        : [totalCounts, bucket(diffByLabel, labels[left]), bucket(diffByLabel, labels[right]), bucket(diffByLabelPair, labelPairKey(labels[left], labels[right]))];
      FEATURES.forEach((spec, index) => {
        const bin = pair.bins[index];
        if (bin < 0) return;
        for (const target of targets) {
          if (same) target[spec.id].same[contextIndex(pair.context)][bin] += 1;
          else target[spec.id].diff[bin] += 1;
        }
      });
    }
  }

  const prior = options.prior ?? openWorldPrior(deviceLabels);
  const scored = pairs.map(({ left, right, pair, same }) => {
    const counts = leaveOut(totalCounts, labels[left], labels[right], sameByLabel, diffByLabel, diffByLabelPair);
    const result = aggregate(pair, counts);
    return { left, right, same, context: pair.context, total: result.total, posterior: sigmoid(logit(prior) + result.total), families: result.families };
  });

  const metrics: LinkageMetrics[] = (["all", ...CONTEXTS] as Array<ComparisonContext | "all">).map((context) =>
    metricsFor(context, scored.filter((item) => context === "all" || item.context === context)));

  let rank1Correct = 0;
  let rank1Queries = 0;
  if (!sampled) {
    for (let index = 0; index < rows.length; index += 1) {
      if (!labels.some((label, other) => other !== index && label === labels[index])) continue;
      let best: { score: number; same: boolean } | null = null;
      for (const item of scored) {
        if (item.left !== index && item.right !== index) continue;
        if (!best || item.total > best.score) best = { score: item.total, same: item.same };
      }
      if (best) { rank1Queries += 1; if (best.same) rank1Correct += 1; }
    }
  }

  const familyImportance = (Object.keys(FAMILY_CAPS) as LinkFamily[]).map((family) => {
    const genuine: number[] = [];
    const impostor: number[] = [];
    for (const item of scored) {
      const value = item.families.find((entry) => entry.family === family)?.capped;
      if (value === undefined) continue;
      (item.same ? genuine : impostor).push(value);
    }
    const meanGenuine = mean(genuine);
    const meanImpostor = mean(impostor);
    return { family, label: FAMILY_LABELS[family], meanGenuine, meanImpostor, separation: meanGenuine - meanImpostor };
  }).filter((item) => Number.isFinite(item.separation)).sort((a, b) => b.separation - a.separation);

  return {
    modelVersion: LINKAGE_MODEL_VERSION,
    observations: rows.length,
    deviceLabels,
    pairsScored: scored.length,
    sampled,
    rank1Accuracy: rank1Queries ? rank1Correct / rank1Queries : null,
    rank1Queries,
    metrics,
    familyImportance,
    note: "Leave-both-devices-out: each pair is scored by a model that never saw either device. Labels are the study's manual device labels.",
  };
}

function labelPairKey(a: string, b: string): string {
  return a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`;
}

function leaveOut(
  total: Record<string, FeatureCounts>,
  first: string,
  second: string,
  sameByLabel: Map<string, Record<string, FeatureCounts>>,
  diffByLabel: Map<string, Record<string, FeatureCounts>>,
  diffByLabelPair: Map<string, Record<string, FeatureCounts>>,
): Record<string, FeatureCounts> {
  const labelsOut = first === second ? [first] : [first, second];
  const pairBucket = first === second ? undefined : diffByLabelPair.get(labelPairKey(first, second));
  const output: Record<string, FeatureCounts> = {};
  for (const spec of FEATURES) {
    const base = total[spec.id];
    const counts: FeatureCounts = { same: base.same.map((row) => [...row]), diff: [...base.diff] };
    for (const label of labelsOut) {
      const same = sameByLabel.get(label)?.[spec.id];
      const diff = diffByLabel.get(label)?.[spec.id];
      for (let bin = 0; bin < 4; bin += 1) {
        if (same) for (let context = 0; context < CONTEXTS.length; context += 1) counts.same[context][bin] -= same.same[context][bin];
        if (diff) counts.diff[bin] -= diff.diff[bin];
      }
    }
    // Pairs between the two excluded devices were subtracted twice above.
    if (pairBucket) for (let bin = 0; bin < 4; bin += 1) counts.diff[bin] += pairBucket[spec.id].diff[bin];
    output[spec.id] = counts;
  }
  return output;
}

function metricsFor(context: ComparisonContext | "all", rows: Array<{ same: boolean; total: number; posterior: number }>): LinkageMetrics {
  const positives = rows.filter((row) => row.same).length;
  const negatives = rows.length - positives;
  const base: LinkageMetrics = { context, positives, negatives, rocAuc: null, equalErrorRate: null, tprAtFpr1: null, precision: null, recall: null, f1: null };
  if (!positives || !negatives) return base;
  const sorted = [...rows].sort((a, b) => b.total - a.total);
  // ROC by threshold sweep (ties are grouped so AUC is the Mann-Whitney value).
  let truePositive = 0, falsePositive = 0, area = 0, previousFpr = 0, previousTpr = 0;
  let equalErrorRate: number | null = null;
  let tprAtFpr1 = 0;
  for (let index = 0; index < sorted.length; index += 1) {
    if (sorted[index].same) truePositive += 1; else falsePositive += 1;
    if (index + 1 < sorted.length && sorted[index + 1].total === sorted[index].total) continue;
    const tpr = truePositive / positives;
    const fpr = falsePositive / negatives;
    area += (fpr - previousFpr) * (tpr + previousTpr) / 2;
    if (fpr <= 0.01) tprAtFpr1 = Math.max(tprAtFpr1, tpr);
    if (equalErrorRate === null && 1 - tpr <= fpr) equalErrorRate = (fpr + (1 - tpr)) / 2;
    previousFpr = fpr;
    previousTpr = tpr;
  }
  const predicted = rows.filter((row) => row.posterior >= 0.5);
  const hits = predicted.filter((row) => row.same).length;
  const precision = predicted.length ? hits / predicted.length : null;
  const recall = hits / positives;
  return {
    ...base,
    rocAuc: area,
    equalErrorRate,
    tprAtFpr1,
    precision,
    recall,
    f1: precision !== null && precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : null,
  };
}

/* ----------------------------------------------------------------------- */
/* Clustering: link observations into inferred devices                      */
/* ----------------------------------------------------------------------- */

export interface DeviceCluster {
  clusterId: string;
  observationIds: string[];
  labels: string[];
  browsers: string[];
  networks: string[];
  purity: number;
}

/**
 * FP-STALKER-style linking: each observation joins its strongest neighbour
 * when the posterior clears the threshold. Union-find keeps it transitive.
 */
export function clusterObservations(observations: ResearchObservation[], model: LinkageModel, threshold = 0.9): DeviceCluster[] {
  const rows = observations.slice(0, 300).map(extract);
  const parent = rows.map((_, index) => index);
  const find = (index: number): number => (parent[index] === index ? index : (parent[index] = find(parent[index])));
  for (let left = 0; left < rows.length; left += 1) {
    let best = -1;
    let bestPosterior = threshold;
    for (let right = 0; right < rows.length; right += 1) {
      if (left === right) continue;
      const { total } = aggregate(comparePair(rows[left], rows[right]), model.counts);
      const posterior = posteriorFrom(total, model);
      if (posterior >= bestPosterior) { bestPosterior = posterior; best = right; }
    }
    if (best >= 0) parent[find(left)] = find(best);
  }
  const groups = new Map<number, ResearchObservation[]>();
  rows.forEach((row, index) => {
    const root = find(index);
    groups.set(root, [...(groups.get(root) || []), row.observation]);
  });
  return Array.from(groups.values()).map((items) => {
    const labelCounts = new Map<string, number>();
    for (const item of items) labelCounts.set(item.deviceLabel, (labelCounts.get(item.deviceLabel) || 0) + 1);
    return {
      clusterId: items[items.length - 1].observationId.slice(0, 8),
      observationIds: items.map((item) => item.observationId),
      labels: Array.from(labelCounts.keys()),
      browsers: Array.from(new Set(items.map((item) => `${item.fingerprint.browserFamily}${item.browserMode === "private" ? " (private)" : ""}`))),
      networks: Array.from(new Set(items.map((item) => item.serverNetwork?.geoIp?.asn || item.effectivePublicIp).filter((value) => value && value !== "Unknown"))),
      purity: Math.max(...labelCounts.values()) / items.length,
    };
  }).sort((a, b) => b.observationIds.length - a.observationIds.length);
}

/* ----------------------------------------------------------------------- */
/* Math                                                                     */
/* ----------------------------------------------------------------------- */

function plattFit(rows: Array<{ llr: number; label: 0 | 1 }>): { slope: number; intercept: number } | null {
  // Newton-Raphson on the logistic log-likelihood with light L2 damping.
  let slope = 1;
  let intercept = 0;
  for (let iteration = 0; iteration < 50; iteration += 1) {
    let gradientSlope = -0.01 * (slope - 1), gradientIntercept = 0;
    let hss = 0.01, hsi = 0, hii = 1e-6;
    for (const row of rows) {
      const probability = sigmoid(slope * row.llr + intercept);
      const error = row.label - probability;
      const weight = probability * (1 - probability);
      gradientSlope += error * row.llr;
      gradientIntercept += error;
      hss += weight * row.llr * row.llr;
      hsi += weight * row.llr;
      hii += weight;
    }
    const determinant = hss * hii - hsi * hsi;
    if (Math.abs(determinant) < 1e-12) return null;
    const stepSlope = (hii * gradientSlope - hsi * gradientIntercept) / determinant;
    const stepIntercept = (hss * gradientIntercept - hsi * gradientSlope) / determinant;
    slope += stepSlope;
    intercept += stepIntercept;
    if (Math.abs(stepSlope) + Math.abs(stepIntercept) < 1e-6) break;
  }
  if (!Number.isFinite(slope) || !Number.isFinite(intercept) || slope <= 0) return null;
  return { slope, intercept };
}

function mean(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN;
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function logit(probability: number): number {
  return Math.log(probability / (1 - probability));
}

export function featureSpec(id: string): FeatureSpec | undefined {
  return FEATURE_BY_ID.get(id);
}
