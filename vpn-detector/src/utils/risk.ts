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
];

export function assessVpnRisk(
  fingerprint: FingerprintData,
  server: ServerNetworkData,
  bestMatch: ObservationMatch | null,
): RiskAssessment {
  const evidence: RiskEvidence[] = [];
  const publicIp = fingerprint.geoIp?.ip || (server.isPublicIp ? server.ip : "");
  const org = fingerprint.geoIp?.org.toLowerCase() || "";

  if (org && HOSTING_TERMS.some((term) => org.includes(term))) {
    evidence.push({
      id: "hosting-network",
      label: "Hosting or cloud network",
      detail: `${fingerprint.geoIp?.org} resembles infrastructure commonly used by VPN exits and cloud workloads.`,
      points: 18,
      strength: "moderate",
    });
  }

  const geoOffset = fingerprint.geoIp?.utcOffsetMinutes;
  if (geoOffset !== null && geoOffset !== undefined) {
    const difference = Math.abs(geoOffset - fingerprint.timezone.offsetMinutes);
    if (difference >= 90) {
      evidence.push({
        id: "timezone-offset",
        label: "Timezone offset mismatch",
        detail: `Browser offset and IP-location offset differ by ${Math.round(difference / 60)} hour(s). Travel and manual settings can also cause this.`,
        points: 10,
        strength: "weak",
      });
    }
  }

  const discrepantCandidate = fingerprint.webrtcCandidates.find((candidate) =>
    candidate.candidateType === "srflx" && candidate.isPublic && publicIp && candidate.address !== publicIp,
  );
  if (discrepantCandidate) {
    evidence.push({
      id: "webrtc-public-discrepancy",
      label: "Public WebRTC path differs",
      detail: `A server-reflexive WebRTC address differs from the external public IP. This can indicate split routing or a proxy/VPN leak.`,
      points: 30,
      strength: "strong",
    });
  }

  if (server.isPublicIp && fingerprint.geoIp?.ip && server.ip !== fingerprint.geoIp.ip) {
    evidence.push({
      id: "vantage-discrepancy",
      label: "Two network vantage points disagree",
      detail: "The first-party server and external egress lookup observed different public IPs.",
      points: 25,
      strength: "strong",
    });
  }

  if (bestMatch?.ipChanged && bestMatch.deviceSimilarity.score >= 86) {
    evidence.push({
      id: "stable-device-network-change",
      label: "Stable device, changed network",
      detail: `This observation is ${bestMatch.deviceSimilarity.score}% similar to an earlier device observation, while the apparent public IP changed.`,
      points: 18,
      strength: "moderate",
    });
  }

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
  const band = score >= 35 ? "high" : score >= 10 ? "elevated" : "low";
  const headline = band === "high"
    ? "Multiple VPN-compatible signals"
    : band === "elevated"
      ? "Review supporting network evidence"
      : "No strong VPN evidence observed";

  return { score, band, headline, evidence };
}
