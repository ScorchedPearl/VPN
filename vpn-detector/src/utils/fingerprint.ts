export const FINGERPRINT_SCHEMA_VERSION = "2.0.0";

export type BrowserMode = "normal" | "private" | "unknown";
export type VpnGroundTruth = "off" | "on" | "unknown";
export type CandidateType = "host" | "srflx" | "relay" | "prflx" | "unknown";

export interface WebRTCCandidate {
  address: string;
  candidateType: CandidateType;
  protocol: string;
  addressFamily: "ipv4" | "ipv6" | "mdns" | "unknown";
  isPublic: boolean;
}

export interface GeoIpData {
  ip: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  utcOffsetMinutes: number | null;
  org: string;
  asn: string;
}

export interface FingerprintData {
  schemaVersion: string;
  collectedAt: string;
  browserFamily: string;
  browserMajor: string;
  userAgent: string;
  languages: string[];
  platform: string;
  osFamily: string;
  architecture: string;
  bitness: string;
  hardwareConcurrency: number | null;
  hardwareBucket: string;
  deviceMemory: number | null;
  memoryBucket: string;
  touchPoints: number;
  colorDepth: number;
  screen: {
    width: number;
    height: number;
    maxDimensionBucket: number;
    minDimensionBucket: number;
    pixelRatioBucket: number;
  };
  timezone: {
    name: string;
    offsetMinutes: number;
  };
  canvas: {
    hash: string;
    repeatable: boolean;
  };
  webgl: {
    vendor: string;
    renderer: string;
    rendererFamily: string;
    parameterHash: string;
  };
  fonts: string[];
  capabilities: string[];
  connection: {
    effectiveType: string;
    downlink: number | null;
    rtt: number | null;
  } | null;
  webrtcCandidates: WebRTCCandidate[];
  geoIp: GeoIpData | null;
  signatures: {
    browser: string;
    coarseDevice: string;
  };
}

export interface ResearchObservation {
  observationId: string;
  deviceLabel: string;
  browserMode: BrowserMode;
  vpnGroundTruth: VpnGroundTruth;
  fingerprint: FingerprintData;
  serverSeenIp: string;
  effectivePublicIp: string;
}

const FONTS_TO_CHECK = [
  "Arial", "Helvetica", "Times New Roman", "Courier New", "Verdana", "Georgia",
  "Palatino", "Garamond", "Comic Sans MS", "Trebuchet MS", "Arial Black", "Impact",
  "Calibri", "Cambria", "Candara", "Consolas", "Constantia", "Corbel", "Lucida Grande",
  "Menlo", "Monaco", "Apple Color Emoji", "Segoe UI", "Roboto", "Ubuntu",
];

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function numberBucket(value: number | null, boundaries: number[]): string {
  if (value === null || !Number.isFinite(value)) return "unknown";
  for (const boundary of boundaries) {
    if (value <= boundary) return `<=${boundary}`;
  }
  return `>${boundaries[boundaries.length - 1]}`;
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableStringify(child)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

function getInstalledFonts(): string[] {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return [];

    const text = "mmmmmmmmmmlliWW";
    const baseSize = 72;
    const fallbacks = ["monospace", "sans-serif", "serif"] as const;
    const baseline = new Map<string, number>();

    for (const fallback of fallbacks) {
      context.font = `${baseSize}px ${fallback}`;
      baseline.set(fallback, context.measureText(text).width);
    }

    return FONTS_TO_CHECK.filter((font) =>
      fallbacks.some((fallback) => {
        context.font = `${baseSize}px "${font}", ${fallback}`;
        return Math.abs(context.measureText(text).width - (baseline.get(fallback) ?? 0)) > 0.01;
      }),
    );
  } catch {
    return [];
  }
}

function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized.endsWith(".local")) return true;
  if (normalized === "::1" || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  const parts = normalized.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

export function isPublicAddress(address: string): boolean {
  if (!address || address === "Unknown" || address.endsWith(".local")) return false;
  const looksIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(address);
  const looksIpv6 = address.includes(":");
  return (looksIpv4 || looksIpv6) && !isPrivateAddress(address);
}

function candidateFamily(address: string): WebRTCCandidate["addressFamily"] {
  if (address.endsWith(".local")) return "mdns";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address)) return "ipv4";
  if (address.includes(":")) return "ipv6";
  return "unknown";
}

async function getWebRTCCandidates(): Promise<WebRTCCandidate[]> {
  return new Promise((resolve) => {
    const candidates = new Map<string, WebRTCCandidate>();
    const PeerConnection = window.RTCPeerConnection;
    if (!PeerConnection) {
      resolve([]);
      return;
    }

    let settled = false;
    const peer = new PeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    const finish = () => {
      if (settled) return;
      settled = true;
      peer.close();
      resolve(Array.from(candidates.values()));
    };

    peer.createDataChannel("research-probe");
    peer.onicecandidate = (event) => {
      if (!event.candidate) {
        finish();
        return;
      }

      const raw = event.candidate.candidate;
      const parts = raw.split(/\s+/);
      const typeIndex = parts.indexOf("typ");
      const rawType = event.candidate.type || (typeIndex >= 0 ? parts[typeIndex + 1] : "unknown");
      const candidateType: CandidateType = ["host", "srflx", "relay", "prflx"].includes(rawType)
        ? (rawType as CandidateType)
        : "unknown";
      const address = event.candidate.address || parts[4] || "unknown";
      const protocol = event.candidate.protocol || parts[2] || "unknown";
      const candidate: WebRTCCandidate = {
        address,
        candidateType,
        protocol,
        addressFamily: candidateFamily(address),
        isPublic: isPublicAddress(address),
      };
      candidates.set(`${candidateType}:${protocol}:${address}`, candidate);
    };

    peer.createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .catch(finish);

    window.setTimeout(finish, 2200);
  });
}

function renderCanvas(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 80;
  const context = canvas.getContext("2d");
  if (!context) return "unsupported";

  context.textBaseline = "alphabetic";
  context.font = "16px Arial";
  context.fillStyle = "#f97316";
  context.fillRect(10, 8, 110, 31);
  context.fillStyle = "#0891b2";
  context.fillText("VPN research fingerprint 🔐", 7, 58);
  context.fillStyle = "rgba(74, 222, 128, .68)";
  context.fillText("VPN research fingerprint 🔐", 9, 60);
  context.beginPath();
  context.arc(270, 30, 19, 0, Math.PI * 2);
  context.stroke();
  return canvas.toDataURL();
}

async function getCanvasFingerprint(): Promise<{ hash: string; repeatable: boolean }> {
  try {
    const first = renderCanvas();
    const second = renderCanvas();
    return { hash: await sha256(first), repeatable: first === second };
  } catch {
    return { hash: "unavailable", repeatable: false };
  }
}

async function getWebGLFingerprint(): Promise<FingerprintData["webgl"]> {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return { vendor: "unsupported", renderer: "unsupported", rendererFamily: "unknown", parameterHash: "unavailable" };

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)) : String(gl.getParameter(gl.VENDOR));
    const renderer = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
    const rendererFamily = normalizeRendererFamily(`${vendor} ${renderer}`);
    const parameters = {
      vendor,
      renderer,
      version: String(gl.getParameter(gl.VERSION)),
      shadingLanguage: String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION)),
      maxTextureSize: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)),
      maxRenderbufferSize: Number(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)),
      extensions: (gl.getSupportedExtensions() ?? []).sort(),
    };

    return { vendor, renderer, rendererFamily, parameterHash: await sha256(stableStringify(parameters)) };
  } catch {
    return { vendor: "unavailable", renderer: "unavailable", rendererFamily: "unknown", parameterHash: "unavailable" };
  }
}

function normalizeRendererFamily(value: string): string {
  const lower = value.toLowerCase();
  if (lower.includes("apple")) return "apple-gpu";
  if (lower.includes("nvidia")) return "nvidia";
  if (lower.includes("amd") || lower.includes("radeon")) return "amd";
  if (lower.includes("intel")) return "intel";
  if (lower.includes("adreno")) return "adreno";
  if (lower.includes("mali")) return "mali";
  if (lower.includes("swiftshader") || lower.includes("llvmpipe")) return "software-renderer";
  return value && value !== "unsupported" && value !== "unavailable" ? "other-gpu" : "unknown";
}

function parseBrowser(userAgent: string): { family: string; major: string } {
  const patterns: Array<[string, RegExp]> = [
    ["Edge", /Edg\/(\d+)/],
    ["Opera", /OPR\/(\d+)/],
    ["Firefox", /Firefox\/(\d+)/],
    ["Chrome", /(?:Chrome|CriOS)\/(\d+)/],
    ["Safari", /Version\/(\d+).+Safari/],
  ];
  for (const [family, pattern] of patterns) {
    const match = userAgent.match(pattern);
    if (match) return { family, major: match[1] };
  }
  return { family: "Unknown", major: "Unknown" };
}

function parseOs(userAgent: string, platform: string): string {
  const value = `${userAgent} ${platform}`.toLowerCase();
  if (value.includes("windows")) return "Windows";
  if (value.includes("iphone") || value.includes("ipad") || value.includes("ios")) return "iOS/iPadOS";
  if (value.includes("mac")) return "macOS";
  if (value.includes("android")) return "Android";
  if (value.includes("linux")) return "Linux";
  if (value.includes("cros")) return "ChromeOS";
  return "Unknown";
}

function getCapabilities(): string[] {
  const checks: Array<[string, boolean]> = [
    ["webgl2", Boolean(document.createElement("canvas").getContext("webgl2"))],
    ["webgpu", "gpu" in navigator],
    ["webrtc", "RTCPeerConnection" in window],
    ["wasm", "WebAssembly" in window],
    ["touch", navigator.maxTouchPoints > 0],
    ["indexeddb", "indexedDB" in window],
    ["serviceworker", "serviceWorker" in navigator],
    ["bluetooth", "bluetooth" in navigator],
    ["usb", "usb" in navigator],
    ["hid", "hid" in navigator],
    ["serial", "serial" in navigator],
    ["credentials", "credentials" in navigator],
  ];
  return checks.filter(([, supported]) => supported).map(([name]) => name).sort();
}

function parseUtcOffset(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^([+-])(\d{2}):?(\d{2})$/);
  if (!match) return null;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "+" ? minutes : -minutes;
}

async function getGeoIp(): Promise<GeoIpData | null> {
  try {
    const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.ip) return null;
    return {
      ip: String(data.ip),
      city: String(data.city || "Unknown"),
      country: String(data.country_name || "Unknown"),
      countryCode: String(data.country_code || "Unknown"),
      timezone: String(data.timezone || "Unknown"),
      utcOffsetMinutes: parseUtcOffset(data.utc_offset),
      org: String(data.org || "Unknown"),
      asn: String(data.asn || "Unknown"),
    };
  } catch {
    return null;
  }
}

async function getHighEntropyHints(): Promise<{ architecture: string; bitness: string }> {
  try {
    const userAgentData = (navigator as Navigator & {
      userAgentData?: { getHighEntropyValues: (hints: string[]) => Promise<Record<string, string>> };
    }).userAgentData;
    if (!userAgentData) return { architecture: "unknown", bitness: "unknown" };
    const values = await userAgentData.getHighEntropyValues(["architecture", "bitness"]);
    return { architecture: values.architecture || "unknown", bitness: values.bitness || "unknown" };
  } catch {
    return { architecture: "unknown", bitness: "unknown" };
  }
}

export async function generateClientFingerprint(): Promise<FingerprintData> {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string; downlink?: number; rtt?: number };
  };
  const userAgent = navigator.userAgent;
  const browser = parseBrowser(userAgent);
  const platform = navigator.platform || "Unknown";
  const osFamily = parseOs(userAgent, platform);
  const hardwareConcurrency = navigator.hardwareConcurrency || null;
  const deviceMemory = nav.deviceMemory || null;
  const highEntropy = await getHighEntropyHints();
  const canvas = await getCanvasFingerprint();
  const webgl = await getWebGLFingerprint();
  const fonts = getInstalledFonts();
  const capabilities = getCapabilities();
  const timezone = {
    name: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    offsetMinutes: -new Date().getTimezoneOffset(),
  };
  const screen = {
    width: window.screen.width,
    height: window.screen.height,
    maxDimensionBucket: roundTo(Math.max(window.screen.width, window.screen.height), 100),
    minDimensionBucket: roundTo(Math.min(window.screen.width, window.screen.height), 100),
    pixelRatioBucket: Math.round(window.devicePixelRatio * 4) / 4,
  };

  const base = {
    schemaVersion: FINGERPRINT_SCHEMA_VERSION,
    collectedAt: new Date().toISOString(),
    browserFamily: browser.family,
    browserMajor: browser.major,
    userAgent,
    languages: Array.from(navigator.languages || [navigator.language]),
    platform,
    osFamily,
    architecture: highEntropy.architecture,
    bitness: highEntropy.bitness,
    hardwareConcurrency,
    hardwareBucket: numberBucket(hardwareConcurrency, [2, 4, 8, 16]),
    deviceMemory,
    memoryBucket: numberBucket(deviceMemory, [2, 4, 8, 16]),
    touchPoints: navigator.maxTouchPoints || 0,
    colorDepth: window.screen.colorDepth,
    screen,
    timezone,
    canvas,
    webgl,
    fonts,
    capabilities,
    connection: nav.connection ? {
      effectiveType: nav.connection.effectiveType || "unknown",
      downlink: nav.connection.downlink ?? null,
      rtt: nav.connection.rtt ?? null,
    } : null,
    webrtcCandidates: await getWebRTCCandidates(),
    geoIp: await getGeoIp(),
  };

  const browserSignatureInput = {
    schema: base.schemaVersion,
    browser: `${base.browserFamily}:${base.browserMajor}`,
    os: base.osFamily,
    platform: base.platform,
    hardware: base.hardwareBucket,
    memory: base.memoryBucket,
    screen: base.screen,
    touch: base.touchPoints,
    colorDepth: base.colorDepth,
    canvas: base.canvas.hash,
    webgl: base.webgl.parameterHash,
    fonts: base.fonts,
    capabilities: base.capabilities,
  };
  const deviceSignatureInput = {
    schema: base.schemaVersion,
    os: base.osFamily,
    architecture: base.architecture,
    bitness: base.bitness,
    hardware: base.hardwareBucket,
    memory: base.memoryBucket,
    screen: base.screen,
    touch: base.touchPoints > 0,
    colorDepth: base.colorDepth,
    gpuFamily: base.webgl.rendererFamily,
  };

  return {
    ...base,
    signatures: {
      browser: await sha256(stableStringify(browserSignatureInput)),
      coarseDevice: await sha256(stableStringify(deviceSignatureInput)),
    },
  };
}
