import { test } from "node:test";
import assert from "node:assert/strict";
import type { FingerprintData, ResearchObservation } from "./fingerprint.ts";
import { clusterObservations, evaluateLinkage, linkObservations, profileCorrelation, trainLinkageModel } from "./linkage.ts";

/* Synthetic study: each device has stable hardware/OS traits; each browser
   contributes engine-specific rendering; some runs are randomized (Brave). */

let seed = 7;
function random(): number {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
}
function pick<T>(values: T[]): T {
  return values[Math.floor(random() * values.length)];
}
const FONTS = Array.from({ length: 80 }, (_, index) => `Font${index}`);

interface Device {
  label: string;
  os: string;
  cores: number;
  screen: [number, number];
  gpu: string[];
  fonts: string[];
  timezone: string;
  timing: number[];
  ip: string;
}

function makeDevice(index: number): Device {
  return {
    label: `device-${index}`,
    os: pick(["Windows", "macOS", "Linux"]),
    cores: pick([4, 8, 8, 12, 16]),
    screen: pick([[1920, 1080], [2560, 1440], [1440, 900], [1512, 982]]) as [number, number],
    gpu: pick([["intel", "uhd", "620"], ["nvidia", "rtx", "3060"], ["apple", "m2"], ["amd", "radeon", "780m"]]),
    fonts: FONTS.filter(() => random() < 0.4),
    timezone: pick(["Asia/Kolkata", "Europe/Berlin", "America/New_York"]),
    timing: Array.from({ length: 16 }, () => 1 + (random() - 0.5) * 0.2),
    ip: `203.0.${index % 3}.${10 + index}`,
  };
}

function observe(device: Device, browser: "Chrome" | "Firefox" | "Edge", run: number, options: { brave?: boolean; vpn?: boolean } = {}): ResearchObservation {
  const engineSalt = browser === "Firefox" ? "gecko" : "blink";
  const canvasNoise = Boolean(options.brave);
  const fingerprint = {
    schemaVersion: "5.0.0",
    collectedAt: new Date(Date.UTC(2026, 9, 1, run)).toISOString(),
    browserFamily: browser,
    browserMajor: browser === "Firefox" ? "142" : "141",
    userAgent: `${browser} test`,
    languages: ["en-IN"],
    platform: device.os,
    osFamily: device.os,
    architecture: browser === "Firefox" ? "unknown" : "x86",
    bitness: "64",
    hardwareConcurrency: device.cores,
    hardwareBucket: "",
    deviceMemory: browser === "Firefox" ? null : 8,
    memoryBucket: "",
    touchPoints: 0,
    colorDepth: 24,
    screen: { width: device.screen[0], height: device.screen[1], maxDimensionBucket: 0, minDimensionBucket: 0, pixelRatioBucket: 1 },
    timezone: { name: device.timezone, offsetMinutes: 330 },
    canvas: { hash: canvasNoise ? `noise-${random()}` : `canvas-${device.label}-${engineSalt}`, repeatable: !canvasNoise },
    webgl: { vendor: "", renderer: "", rendererFamily: device.gpu[0], parameterHash: `wgl-${device.label}-${engineSalt}`, renderHash: `render-${engineSalt}` },
    fonts: device.fonts.slice(0, 20),
    capabilities: ["webgl2", "wasm"],
    mediaCapabilities: ["h264", "opus"],
    display: { availableWidthBucket: 0, availableHeightBucket: 0, orientation: "landscape", colorGamut: "srgb", dynamicRange: "standard", pointer: "fine", hover: "hover", reducedMotion: false },
    audio: { status: "collected", hash: `audio-${device.label}-${engineSalt}`, sampleRate: 44100 },
    connection: null,
    webrtcCandidates: [],
    geoIp: null,
    signatures: { browser: "", coarseDevice: "" },
    modern: {
      version: "test",
      durationMs: 1,
      clientHints: null,
      screenInsets: { horizontal: 0, vertical: 40, left: 0, top: 0 },
      refreshRate: { hz: 60, samples: 30 },
      pointer: { pollingHz: null, samples: 0 },
      gpu: { rendererTokens: browser === "Firefox" ? device.gpu.slice(0, 2) : device.gpu, masked: false },
      webgpu: { status: "unsupported", vendor: "", architecture: "", device: "", description: "", features: [], limitsHash: "", subgroupMinSize: null, subgroupMaxSize: null, isFallbackAdapter: null, scheduling: { status: "disabled", profile: [], dispatches: 0 } },
      gpuTiming: { status: "collected", method: "readpixels-sync", points: 16, rounds: 7, workload: 1, medianMs: 4, profile: device.timing.map((value) => value + (random() - 0.5) * 0.03) },
      fonts: { listVersion: "test", probed: 80, detected: device.fonts.filter(() => random() > 0.03) },
      emoji: { widths: [32, 32, 40], maxVersion: device.os === "macOS" ? "16.0" : "15.0", hash: "x" },
      systemStyle: { genericWidths: {}, colors: {}, colorScheme: "light", contrast: "no-preference", forcedColors: false },
      intl: { locale: "en-IN", calendar: "gregory", numberingSystem: "latn", hourCycle: "h12", timeZone: device.timezone },
      math: { hash: `math-${engineSalt}` },
      voices: { status: "disabled", local: [], remoteCount: 0 },
      mediaDevices: null,
      canvasRobust: { status: "collected", grid: Array.from({ length: 64 }, (_, index) => (index * 3 + device.label.length) % 255), noiseDetected: canvasNoise, solidFillDeviation: canvasNoise ? 3 : 0 },
      audioRobust: { status: "collected", summary: 12.3456, noiseDetected: false },
      protections: { brave: Boolean(options.brave), canvasNoise, audioNoise: false, possibleFirefoxRfp: false, webglMasked: false, notes: [] },
    },
  } as unknown as FingerprintData;
  const ip = options.vpn ? `185.65.${run}.${run}` : device.ip;
  return {
    observationId: `${device.label}-${browser}-${run}`,
    deviceLabel: device.label,
    browserMode: "normal",
    vpnGroundTruth: options.vpn ? "consumer-vpn" : "none",
    fingerprint,
    serverSeenIp: ip,
    effectivePublicIp: ip,
  };
}

function study(devices = 14): ResearchObservation[] {
  seed = 7;
  const output: ResearchObservation[] = [];
  for (let index = 0; index < devices; index += 1) {
    const device = makeDevice(index);
    output.push(observe(device, "Chrome", 1), observe(device, "Chrome", 2, { vpn: true }), observe(device, "Firefox", 3), observe(device, "Edge", 4, { brave: index % 4 === 0 }));
  }
  return output;
}

test("profile correlation abstains on flat traces and rewards matching shapes", () => {
  assert.equal(profileCorrelation(new Array(16).fill(1), new Array(16).fill(1)), null);
  const shape = Array.from({ length: 16 }, (_, index) => 1 + Math.sin(index) * 0.1);
  assert.ok((profileCorrelation(shape, shape.map((value) => value * 1.01)) ?? 0) > 0.99);
});

test("same device across browsers and a VPN change outranks a different device", () => {
  const observations = study();
  const model = trainLinkageModel(observations);
  const chrome = observations.find((item) => item.observationId === "device-1-Chrome-1")!;
  const firefoxSame = observations.find((item) => item.observationId === "device-1-Firefox-3")!;
  const chromeVpn = observations.find((item) => item.observationId === "device-1-Chrome-2")!;
  const other = observations.find((item) => item.observationId === "device-2-Firefox-3")!;
  const crossSame = linkObservations(chrome, firefoxSame, model);
  const vpnSame = linkObservations(chrome, chromeVpn, model);
  const crossOther = linkObservations(chrome, other, model);
  assert.equal(crossSame.context, "cross-browser");
  assert.ok(crossSame.posterior > crossOther.posterior, `${crossSame.posterior} <= ${crossOther.posterior}`);
  assert.ok(vpnSame.posterior > 0.9, `VPN change should not break same-browser linkage (${vpnSame.posterior})`);
  assert.ok(crossOther.posterior < 0.5);
  // Engine-scope features never leak into cross-engine comparisons.
  assert.equal(crossSame.features.find((item) => item.id === "canvas-hash")?.status, "out-of-scope");
});

test("randomized canvas is excluded rather than counted as a mismatch", () => {
  const observations = study();
  const model = trainLinkageModel(observations);
  const brave = observations.find((item) => item.observationId === "device-0-Edge-4")!;
  const chrome = observations.find((item) => item.observationId === "device-0-Chrome-1")!;
  const result = linkObservations(brave, chrome, model);
  assert.equal(result.context, "same-engine");
  assert.equal(result.features.find((item) => item.id === "canvas-hash")?.status, "protected");
});

test("leave-both-devices-out evaluation separates genuine and impostor pairs", () => {
  const evaluation = evaluateLinkage(study(16));
  const all = evaluation.metrics.find((item) => item.context === "all")!;
  assert.ok(all.positives > 0 && all.negatives > 0);
  assert.ok((all.rocAuc ?? 0) > 0.95, `AUC ${all.rocAuc}`);
  assert.ok((evaluation.rank1Accuracy ?? 0) > 0.9, `rank-1 ${evaluation.rank1Accuracy}`);
  const cross = evaluation.metrics.find((item) => item.context === "cross-browser")!;
  assert.ok((cross.rocAuc ?? 0) > 0.9, `cross-browser AUC ${cross.rocAuc}`);
});

test("calibration engages with enough labelled pairs and clusters stay pure", () => {
  const observations = study(16);
  const model = trainLinkageModel(observations);
  assert.ok(model.calibration, "expected Platt calibration with 96 same-device pairs");
  assert.ok(model.calibration!.slope > 0);
  const clusters = clusterObservations(observations, model);
  const impure = clusters.filter((cluster) => cluster.purity < 1);
  assert.ok(impure.length <= 1, `impure clusters: ${impure.map((cluster) => cluster.labels.join("+")).join(", ")}`);
});

test("identical lab machines are separated only by weak evidence and never outrank the true device", () => {
  const observations = study(12);
  const base = makeDevice(100);
  // Same model, OS image, fonts, timezone and network: only the GPU timing
  // profile differs, as with a lab of identically imaged machines.
  const twin: Device = { ...base, label: "twin-b", timing: base.timing.map((value, index) => value + (index % 2 ? 0.06 : -0.06)) };
  const original: Device = { ...base, label: "twin-a" };
  const a1 = observe(original, "Chrome", 1);
  const a2 = observe(original, "Firefox", 2);
  const b1 = observe(twin, "Firefox", 3);
  const model = trainLinkageModel([...observations, a1, a2, b1]);
  const genuine = linkObservations(a1, a2, model);
  const twinPair = linkObservations(a1, b1, model);
  assert.ok(genuine.logLikelihoodRatio > twinPair.logLikelihoodRatio, `genuine ${genuine.logLikelihoodRatio} vs twin ${twinPair.logLikelihoodRatio}`);
  const timing = twinPair.features.find((item) => item.id === "gpu-timing");
  assert.ok(timing && timing.logLikelihoodRatio < genuine.features.find((item) => item.id === "gpu-timing")!.logLikelihoodRatio);
});

test("a first observation with an empty store yields an uncalibrated but usable model", () => {
  const observations = study(1);
  const model = trainLinkageModel([]);
  const result = linkObservations(observations[0], observations[1], model);
  assert.equal(result.calibrated, false);
  assert.ok(result.posterior > 0.5, `expert priors alone should link an obvious pair (${result.posterior})`);
});

test("timezone aliases from different engines compare equal", async () => {
  const { canonicalTimeZone } = await import("./linkage.ts");
  assert.equal(canonicalTimeZone("Asia/Calcutta"), canonicalTimeZone("Asia/Kolkata"));
  assert.equal(canonicalTimeZone("Europe/Berlin"), "Europe/Berlin");
});

/* iOS homogeneity: every iPhone on one iOS release shares fonts, emoji,
   canvas, WebGL and GPU name. Only screen, settings and timing differ. */
function iphone(label: string, browser: "Safari" | "Chrome", screen: [number, number], person: { voices: string[]; locale: string; timing: number[] }): ResearchObservation {
  const base = observe({ ...makeDevice(500), label, os: "iOS/iPadOS", cores: 4, screen, gpu: ["apple", "gpu"], fonts: FONTS.slice(0, 30), timezone: "Asia/Kolkata", timing: person.timing, ip: "152.59.187.1" }, browser === "Safari" ? "Chrome" : "Chrome", 1);
  const fingerprint = structuredClone(base.fingerprint);
  fingerprint.browserFamily = browser;
  fingerprint.screen.pixelRatioBucket = 3;
  fingerprint.canvas.hash = "ios-18-canvas";
  fingerprint.webgl.parameterHash = "ios-18-webgl";
  fingerprint.webgl.rendererFamily = "apple-gpu";
  fingerprint.audio = { status: "collected", hash: "ios-18-audio", sampleRate: 48000 };
  fingerprint.modern!.math.hash = "ios-18-math";
  fingerprint.modern!.fonts.detected = FONTS.slice(0, 30);
  fingerprint.modern!.canvasRobust.grid = new Array(64).fill(100);
  fingerprint.modern!.voices = { status: "collected", local: person.voices, remoteCount: 0 };
  fingerprint.modern!.intl.locale = person.locale;
  fingerprint.modern!.gpu.rendererTokens = ["apple", "gpu"];
  return { ...base, observationId: `${label}-${browser}`, deviceLabel: label, fingerprint };
}

test("different iPhone models are not linked despite identical iOS software", () => {
  const vishwas = { voices: ["Albert|en-US", "Rishi|en-IN"], locale: "en-IN", timing: Array.from({ length: 16 }, (_, i) => 1 + (i % 3) * 0.1) };
  const hrishav = { voices: ["Albert|en-US", "Samantha|en-US"], locale: "en-US", timing: Array.from({ length: 16 }, (_, i) => 1 + (i % 5) * 0.08) };
  const plus = iphone("vishwas-mobile", "Chrome", [430, 932], vishwas);
  const fifteen = iphone("hrishav-mobile", "Safari", [393, 852], hrishav);
  for (const model of [trainLinkageModel([]), trainLinkageModel(study(10))]) {
    const result = linkObservations(plus, fifteen, model);
    assert.ok(result.posterior < 0.05, `posterior ${result.posterior}`);
    assert.equal(result.features.find((item) => item.id === "screen")?.bin, "different");
  }
});

test("the same iPhone across Safari and Chrome outranks an identical-model twin", () => {
  const owner = { voices: ["Albert|en-US", "Rishi|en-IN"], locale: "en-IN", timing: Array.from({ length: 16 }, (_, i) => 1 + (i % 3) * 0.1) };
  const twinOwner = { voices: ["Albert|en-US", "Samantha|en-US"], locale: "en-US", timing: Array.from({ length: 16 }, (_, i) => 1 + (i % 5) * 0.08) };
  const safari = iphone("phone-a", "Safari", [393, 852], owner);
  const chrome = iphone("phone-a", "Chrome", [393, 852], owner);
  const twin = iphone("phone-b", "Safari", [393, 852], twinOwner);
  const model = trainLinkageModel([]);
  const genuine = linkObservations(safari, chrome, model);
  const impostor = linkObservations(safari, twin, model);
  assert.equal(genuine.context, "same-engine", "every iOS browser is WebKit");
  assert.ok(genuine.logLikelihoodRatio > impostor.logLikelihoodRatio + 2, `${genuine.logLikelihoodRatio} vs ${impostor.logLikelihoodRatio}`);
  assert.notEqual(impostor.verdict, "same-device");
});

test("Brave is its own browser and its randomized hardware values are skipped", () => {
  const device = makeDevice(42);
  const chrome = observe(device, "Chrome", 1);
  const brave = observe({ ...device, cores: 6 }, "Chrome", 2, { brave: true });
  const result = linkObservations(chrome, brave, trainLinkageModel([]));
  assert.equal(result.context, "same-engine");
  assert.equal(result.features.find((item) => item.id === "cpu-cores")?.status, "protected");
});
