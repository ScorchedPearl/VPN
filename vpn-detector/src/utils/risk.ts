import { isPublicAddress, type FingerprintData } from "./fingerprint";
import type { ObservationMatch } from "./similarity";

export interface ServerNetworkData {
  ip: string;
  isPublicIp: boolean;
  source: string;
  trustNotice: string;
  headers: Record<string, string>;
}

export interface RiskEvidence {
  id: string;
  label: string;
  detail: string;
  points: number;
  strength: "strong" | "moderate" | "weak" | "context";
}

export interface RiskAssessment {
  score: number;
  band: "low" | "elevated" | "high";
  headline: string;
  evidence: RiskEvidence[];
}

const HOSTING_TERMS = [
  "amazon", "aws", "azure", "cloud", "digitalocean", "google cloud", "hetzner",
  "hosting", "linode", "m247", "oracle", "ovh", "server", "vultr",
  "datacamp", "leaseweb", "choopa", "quadranet", "hostinger", "cogent",
  "packetexchange", "tzulo", "ipvolume", "mullvad", "nord", "expressvpn", "surfshark",
];

export function assessVpnRisk(
  fingerprint: FingerprintData,
  server: ServerNetworkData,
  bestMatch: ObservationMatch | null,
): RiskAssessment {
  const evidence: RiskEvidence[] = [];
  const publicIp = fingerprint.geoIp?.ip || (server.isPublicIp ? server.ip : "");
  const org = fingerprint.geoIp?.org.toLowerCase() || "";
  const asn = fingerprint.geoIp?.asn.toLowerCase() || "";

  // 1. Datacenter / Cloud / VPN Exit ASN classification
  if ((org && HOSTING_TERMS.some((term) => org.includes(term))) || (asn && HOSTING_TERMS.some((term) => asn.includes(term)))) {
    evidence.push({
      id: "hosting-network",
      label: "Datacenter or VPN exit ASN",
      detail: `${fingerprint.geoIp?.org} (${fingerprint.geoIp?.asn}) is a datacenter or hosting network commonly used by VPN exit nodes and cloud proxies.`,
      points: 28,
      strength: "strong",
    });
  }

  // 2. WebRTC STUN multi-homing / bypass leak
  const discrepantCandidate = fingerprint.webrtcCandidates.find((candidate) =>
    candidate.candidateType === "srflx" && candidate.isPublic && publicIp && candidate.address !== publicIp,
  );
  if (discrepantCandidate) {
    evidence.push({
      id: "webrtc-public-discrepancy",
      label: "WebRTC STUN path differs",
      detail: `A server-reflexive WebRTC STUN address (${discrepantCandidate.address}) differs from the public HTTP egress IP (${publicIp}), indicating split-routing or non-tunneled interface leakage.`,
      points: 30,
      strength: "strong",
    });
  }

  // 3. Network vantage point disagreement
  if (server.isPublicIp && fingerprint.geoIp?.ip && server.ip !== fingerprint.geoIp.ip) {
    evidence.push({
      id: "vantage-discrepancy",
      label: "Two network vantage points disagree",
      detail: `The first-party server (${server.ip}) and external egress lookup (${fingerprint.geoIp.ip}) observed different public IPs.`,
      points: 25,
      strength: "strong",
    });
  }

  // 4. OS & Environment internal inconsistency (Voices / Fonts vs User-Agent)
  if (fingerprint.environmentChecks?.osMatchStatus === "suspicious") {
    evidence.push({
      id: "os-environment-mismatch",
      label: "OS environment inconsistency",
      detail: fingerprint.environmentChecks.notes.join(" "),
      points: 24,
      strength: "strong",
    });
  }

  // 5. Software / Headless WebGL Renderer
  if (fingerprint.webgl.rendererFamily === "software-renderer") {
    evidence.push({
      id: "software-renderer",
      label: "Virtual / software WebGL renderer",
      detail: "Graphics rendering is performed in software (SwiftShader/llvmpipe), typical of virtual machines, headless browsers, or automated cloud nodes.",
      points: 18,
      strength: "moderate",
    });
  }

  // 6. Timezone offset mismatch (System clock vs GeoIP timezone)
  const geoOffset = fingerprint.geoIp?.utcOffsetMinutes;
  if (geoOffset !== null && geoOffset !== undefined) {
    const difference = Math.abs(geoOffset - fingerprint.timezone.offsetMinutes);
    if (difference >= 90) {
      evidence.push({
        id: "timezone-offset",
        label: "Timezone offset mismatch",
        detail: `Browser system offset (UTC ${fingerprint.timezone.offsetMinutes >= 0 ? "+" : ""}${Math.round(fingerprint.timezone.offsetMinutes / 60)}h) and IP-location offset (UTC ${geoOffset >= 0 ? "+" : ""}${Math.round(geoOffset / 60)}h) differ by ${Math.round(difference / 60)} hour(s).`,
        points: 15,
        strength: "moderate",
      });
    }
  }

  // 7. Device similarity on changed network (De-weighted as background context to prevent commodity device false positives)
  if (bestMatch?.ipChanged && bestMatch.deviceSimilarity.score >= 86) {
    evidence.push({
      id: "stable-device-network-change",
      label: "Cross-session device similarity (Context)",
      detail: `Observed ${bestMatch.deviceSimilarity.score}% device similarity to an earlier session on another IP. Low-weighted because identical commodity hardware or legitimate mobility (Wi-Fi/cellular handoff) can produce identical fingerprints.`,
      points: 4,
      strength: "context",
    });
  }

  // 8. Invalid non-public external IP check
  if (fingerprint.geoIp?.ip && !isPublicAddress(fingerprint.geoIp.ip)) {
    evidence.push({
      id: "invalid-external-ip",
      label: "External IP lookup was not public",
      detail: "The external lookup returned a non-public address, so network conclusions are limited.",
      points: 0,
      strength: "context",
    });
  }

  const score = Math.min(100, evidence.reduce((sum, item) => sum + item.points, 0));
  const band = score >= 35 ? "high" : score >= 12 ? "elevated" : "low";
  const headline = band === "high"
    ? "Multiple VPN-compatible signals detected"
    : band === "elevated"
      ? "Review supporting network & environment inconsistencies"
      : "No strong VPN evidence observed";

  return { score, band, headline, evidence };
}
