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

export interface TcpStackData {
  initialTtl: number;
  dfFlag: boolean;
  mss: number;
  mtu: number;
  windowScale: number;
  tcpOptions: string;
  kernelEstimate: string;
  isTunnelClamped: boolean;
}

export interface TlsFingerprintData {
  ja4Hash: string;
  ja3Hash: string;
  cipherSuiteOrder: string[];
  alpn: string;
  isBrowserRuntime: boolean;
}

export interface BgpRoutingData {
  serverSeenIp: string;
  isDatacenter: boolean;
  handshakeRttMs: number;
  ingressRegion: string;
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
  layer1Tcp?: TcpStackData;
  layer3Tls?: TlsFingerprintData;
  layer4Bgp?: BgpRoutingData;
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

export async function collectConsentedLocation(enabled: boolean): Promise<DeviceLocation | null> {
  if (!enabled || !("geolocation" in navigator)) return null;
  return new Promise((resolve) => {
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
