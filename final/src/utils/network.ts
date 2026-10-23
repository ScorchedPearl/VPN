export type IpFamily = "ipv4" | "ipv6" | "unknown";
export type PathProbeKind = "ipv4" | "ipv6";

export interface GeoIpData {
  ip: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  utcOffsetMinutes: number | null;
  org: string;
  asn: string;
  network: string;
  accuracyRadiusKm: number | null;
  countryConfidence: number | null;
  cityConfidence: number | null;
  databaseDate: string;
}

export interface AnonymizerData {
  isAnonymousVpn: boolean | null;
  isHostingProvider: boolean | null;
  isPublicProxy: boolean | null;
  isResidentialProxy: boolean | null;
  isTorExitNode: boolean | null;
  providerName: string;
  confidence: number | null;
  networkLastSeen: string;
  source: "maxmind" | "tor-project" | "heuristic" | "unavailable";
}

export interface ClientConsistency {
  status: "consistent" | "suspicious" | "indeterminate";
  notes: string[];
}

export interface ProbeConfiguration {
  ipv4Url: string;
  ipv6Url: string;
  stunUrl: string;
  configured: boolean;
}

export interface ServerNetworkData {
  ip: string;
  ipFamily: IpFamily;
  isPublicIp: boolean;
  source: string;
  trusted: boolean;
  trustNotice: string;
  receivedAt: string;
  headers: Record<string, string>;
  geoIp: GeoIpData | null;
  anonymizer: AnonymizerData;
  ja4: string;
  httpProtocol: string;
  /** Kernel TCP round trip to the proxy/client, from a trusted ingress header. */
  tcpRttMs?: number | null;
  clientConsistency?: ClientConsistency;
  probeConfiguration?: ProbeConfiguration;
  scanChallenge?: string;
}

export interface NetworkPathProbe {
  kind: PathProbeKind;
  status: "observed" | "unavailable" | "failed";
  ip: string;
  ipFamily: IpFamily;
  observedAt: string;
  token: string;
  trusted: boolean;
  network?: ServerNetworkData;
}

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  observedAt: string;
}

export async function collectNetworkPathProbes(configuration?: ProbeConfiguration): Promise<NetworkPathProbe[]> {
  if (!configuration?.configured) return [];
  const targets: Array<[PathProbeKind, string]> = [
    ["ipv4", configuration.ipv4Url],
    ["ipv6", configuration.ipv6Url],
  ];

  return Promise.all(targets.map(async ([kind, url]) => {
    if (!url) return emptyProbe(kind, "unavailable");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4_500);
    try {
      const response = await fetch(url, { cache: "no-store", credentials: "omit", signal: controller.signal });
      if (!response.ok) return emptyProbe(kind, "failed");
      const data = await response.json() as Partial<NetworkPathProbe>;
      return {
        kind,
        status: data.status === "observed" ? "observed" : "failed",
        ip: typeof data.ip === "string" ? data.ip : "Unknown",
        ipFamily: data.ipFamily === "ipv4" || data.ipFamily === "ipv6" ? data.ipFamily : "unknown",
        observedAt: typeof data.observedAt === "string" ? data.observedAt : new Date().toISOString(),
        token: typeof data.token === "string" ? data.token : "",
        trusted: false,
      };
    } catch {
      return emptyProbe(kind, "failed");
    } finally {
      window.clearTimeout(timeout);
    }
  }));
}

/**
 * Application-layer round trips to this origin (CalcuLatency, USENIX Security
 * 2024). With a VPN the HTTPS request travels client -> tunnel -> exit ->
 * server, while the server's TCP handshake only reaches the exit, so the
 * application RTT exceeds the TCP RTT. The minimum filters scheduling noise.
 */
export async function measureClientLatency(samples = 8): Promise<{ samples: number; minMs: number; medianMs: number } | null> {
  const timings: number[] = [];
  for (let index = 0; index < samples; index += 1) {
    const started = performance.now();
    try {
      const response = await fetch(`/api/rtt?n=${index}`, { cache: "no-store", credentials: "omit" });
      await response.arrayBuffer();
      if (response.ok && index > 0) timings.push(performance.now() - started);
    } catch {
      // ignore a lost sample
    }
  }
  if (timings.length < 3) return null;
  const sorted = [...timings].sort((a, b) => a - b);
  return { samples: sorted.length, minMs: Number(sorted[0].toFixed(1)), medianMs: Number(sorted[Math.floor(sorted.length / 2)].toFixed(1)) };
}

export async function collectConsentedLocation(enabled: boolean): Promise<DeviceLocation | null> {
  if (!enabled || !("geolocation" in navigator)) return null;
  return new Promise((resolve) => {
    // The API's own timeout starts only after permission is granted, so an
    // ignored prompt would otherwise stall the whole scan.
    window.setTimeout(() => resolve(null), 10_000);
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        observedAt: new Date(position.timestamp).toISOString(),
      }),
      () => resolve(null),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 8_000 },
    );
  });
}

function emptyProbe(kind: PathProbeKind, status: NetworkPathProbe["status"]): NetworkPathProbe {
  return { kind, status, ip: "Unknown", ipFamily: "unknown", observedAt: new Date().toISOString(), token: "", trusted: false };
}
