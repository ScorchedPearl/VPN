import { test } from "node:test";
import assert from "node:assert/strict";
import type { FingerprintData, ResearchObservation } from "./fingerprint.ts";
import { buildRangeSet, checkReputation, inRangeSet, parseIpv6 } from "./ip-lists.ts";
import { assessVpn, haversineKm, minimumRttMs, VPN_MODEL_VERSION, type ReputationLookup } from "./vpn-detection.ts";

const CLEAN: ReputationLookup = { vpn: false, datacenter: false, privateRelay: false, tor: false, checked: ["vpn", "datacenter", "tor", "private-relay"] };

function scan(options: {
  id: string;
  ip: string;
  rtt?: number;
  timezone?: string;
  offset?: number;
  geo?: { lat: number; lon: number; tz: string; offset: number; country: string; city: string };
  landmarks?: Array<{ city: string; lat: number; lon: number; ms: number }>;
  lists?: Partial<ReputationLookup>;
  srflx?: string;
}): ResearchObservation {
  const fingerprint = {
    timezone: { name: options.timezone || "Asia/Kolkata", offsetMinutes: options.offset ?? 330 },
    webrtcCandidates: options.srflx ? [{ address: options.srflx, candidateType: "srflx", protocol: "udp", addressFamily: "ipv4", isPublic: true }] : [],
    webrtcStatus: options.srflx ? "configured" : "not-configured",
    landmarks: options.landmarks ? {
      status: "collected",
      durationMs: 1000,
      measurements: options.landmarks.map((item) => ({ id: item.city, city: item.city, latitude: item.lat, longitude: item.lon, minMs: item.ms, samples: 3 })),
    } : undefined,
  } as unknown as FingerprintData;
  return {
    observationId: options.id,
    deviceLabel: "x",
    browserMode: "normal",
    vpnGroundTruth: "unknown",
    fingerprint,
    serverSeenIp: options.ip,
    effectivePublicIp: options.ip,
    clientLatency: options.rtt ? { samples: 7, minMs: options.rtt, medianMs: options.rtt + 10 } : null,
    serverNetwork: {
      ip: options.ip, ipFamily: "ipv4", isPublicIp: true, source: "test", trusted: true, trustNotice: "", receivedAt: "",
      headers: {}, ja4: "", httpProtocol: "",
      geoIp: options.geo ? {
        ip: options.ip, city: options.geo.city, country: options.geo.country, countryCode: options.geo.country,
        latitude: options.geo.lat, longitude: options.geo.lon, timezone: options.geo.tz, utcOffsetMinutes: options.geo.offset,
        org: "", asn: "", network: "", accuracyRadiusKm: null, countryConfidence: null, cityConfidence: null, databaseDate: "", source: "vercel-edge",
      } : null,
      anonymizer: {
        isAnonymousVpn: null, isHostingProvider: null, isPublicProxy: null, isResidentialProxy: null, isTorExitNode: null,
        providerName: "", confidence: null, networkLastSeen: "", source: "public-lists",
        lists: { ...CLEAN, ...(options.lists || {}) },
      },
    },
  };
}

const ids = (risk: ReturnType<typeof assessVpn>) => risk.evidence.map((item) => item.id);
const MUMBAI = { lat: 19.08, lon: 72.88, tz: "Asia/Kolkata", offset: 330, country: "IN", city: "Mumbai" };
const FRANKFURT = { lat: 50.11, lon: 8.68, tz: "Europe/Berlin", offset: 60, country: "DE", city: "Frankfurt" };
const LANDMARKS_FROM_INDIA = [
  { city: "Mumbai", lat: 19.08, lon: 72.88, ms: 32 },
  { city: "Singapore", lat: 1.35, lon: 103.82, ms: 70 },
  { city: "Frankfurt", lat: 50.11, lon: 8.68, ms: 135 },
  { city: "N. Virginia", lat: 38.95, lon: -77.45, ms: 230 },
];
// Through a Frankfurt VPN: every path first travels India → Frankfurt (~130 ms).
const LANDMARKS_VIA_FRANKFURT = [
  { city: "Mumbai", lat: 19.08, lon: 72.88, ms: 250 },
  { city: "Singapore", lat: 1.35, lon: 103.82, ms: 290 },
  { city: "Frankfurt", lat: 50.11, lon: 8.68, ms: 133 },
  { city: "N. Virginia", lat: 38.95, lon: -77.45, ms: 215 },
];

test("CIDR lists match IPv4, IPv6 and IPv4-mapped addresses", () => {
  const set = buildRangeSet("10.0.0.0/8\n192.168.1.7\n2001:db8::/32\n# comment\nnot-an-ip\n172.224.226.0/27,GB,GB-EN,London,");
  assert.ok(inRangeSet(set, "10.200.3.4"));
  assert.ok(!inRangeSet(set, "11.0.0.1"));
  assert.ok(inRangeSet(set, "192.168.1.7") && !inRangeSet(set, "192.168.1.8"));
  assert.ok(inRangeSet(set, "2001:db8:ffff::1"));
  assert.ok(!inRangeSet(set, "2001:db9::1"));
  assert.ok(inRangeSet(set, "::ffff:10.1.2.3"), "IPv4-mapped IPv6 uses the IPv4 ranges");
  assert.ok(inRangeSet(set, "172.224.226.31") && !inRangeSet(set, "172.224.226.32"), "first CSV column is the CIDR");
  assert.equal(parseIpv6("2001:db8::1"), (BigInt("0x20010db8") << BigInt(96)) + BigInt(1));
  const result = checkReputation({ datacenter: set }, "10.9.9.9");
  assert.ok(result.datacenter && !result.vpn);
  assert.deepEqual(result.checked, ["datacenter"]);
});

test("light-in-fibre bound: 100 km of distance per millisecond of round trip", () => {
  const distance = haversineKm(MUMBAI.lat, MUMBAI.lon, FRANKFURT.lat, FRANKFURT.lon);
  assert.ok(distance > 6_000 && distance < 6_700, `distance ${distance}`);
  assert.ok(Math.abs(minimumRttMs(distance) - distance / 100) < 1e-9);
});

test("an ordinary scan on the device's usual network is judged clean", () => {
  const history = [scan({ id: "h1", ip: "152.59.187.10", rtt: 300 }), scan({ id: "h2", ip: "152.59.186.4", rtt: 290 })];
  const current = scan({ id: "c", ip: "152.59.187.77", rtt: 295, geo: MUMBAI, landmarks: LANDMARKS_FROM_INDIA });
  const risk = assessVpn({ current, deviceHistory: history, population: [] });
  assert.equal(risk.band, "low");
  assert.ok(ids(risk).includes("home-network") && ids(risk).includes("latency-consistent") && ids(risk).includes("timezone-consistent"));
  assert.equal(risk.modelVersion, VPN_MODEL_VERSION);
});

test("a VPN to Frankfurt fires reputation, timezone, latency geometry and device history", () => {
  const history = [scan({ id: "h1", ip: "152.59.187.10", rtt: 300 })];
  const current = scan({ id: "c", ip: "195.242.214.38", rtt: 420, geo: FRANKFURT, landmarks: LANDMARKS_VIA_FRANKFURT, lists: { vpn: true, datacenter: true } });
  const risk = assessVpn({ current, deviceHistory: history, population: [] });
  for (const id of ["vpn-list", "timezone-mismatch", "excess-latency", "home-departure", "rtt-jump"]) assert.ok(ids(risk).includes(id), `${id} should fire: ${ids(risk).join(", ")}`);
  assert.equal(risk.band, "high");
  assert.equal(risk.kind, "vpn");
  assert.ok((risk.details?.excessLatencyMs ?? 0) > 100);
});

test("latency faster than light from the claimed location exposes a fake IP location", () => {
  const newYork = { lat: 40.71, lon: -74.0, tz: "America/New_York", offset: -240, country: "US", city: "New York" };
  const current = scan({ id: "c", ip: "5.6.7.8", geo: newYork, timezone: "America/New_York", offset: -240, landmarks: LANDMARKS_FROM_INDIA });
  const risk = assessVpn({ current, deviceHistory: [], population: [] });
  assert.ok(ids(risk).includes("geo-impossible"), ids(risk).join(", "));
});

test("an earlier VPN exit is never learned as the device's home network", () => {
  const history = [
    scan({ id: "h1", ip: "152.59.187.10", rtt: 300 }),
    scan({ id: "h2", ip: "91.221.190.53", rtt: 380, lists: { datacenter: true } }),
  ];
  const current = scan({ id: "c", ip: "91.221.190.53", rtt: 380, lists: { datacenter: true } });
  const risk = assessVpn({ current, deviceHistory: history, population: [] });
  assert.ok(ids(risk).includes("home-departure"), ids(risk).join(", "));
  assert.deepEqual(risk.details?.homeNetworks, ["152.59.0.0/16"]);
});

test("an exit shared by several devices that live elsewhere is recognised", () => {
  const population = [
    { observation: scan({ id: "a-home", ip: "152.59.187.1" }), deviceId: "A" },
    { observation: scan({ id: "a-home2", ip: "152.59.187.2" }), deviceId: "A" },
    { observation: scan({ id: "a-exit", ip: "91.221.190.53" }), deviceId: "A" },
    { observation: scan({ id: "b-home", ip: "223.189.250.1" }), deviceId: "B" },
    { observation: scan({ id: "b-home2", ip: "223.189.250.9" }), deviceId: "B" },
    { observation: scan({ id: "b-exit", ip: "91.221.190.77" }), deviceId: "B" },
    // A campus network that is home to C is not an exit.
    { observation: scan({ id: "c-home", ip: "152.59.187.5" }), deviceId: "C" },
  ];
  const exitScan = assessVpn({ current: scan({ id: "x", ip: "91.221.190.20" }), deviceHistory: [], population, currentDeviceId: "D" });
  assert.ok(ids(exitScan).includes("shared-exit"));
  assert.equal(exitScan.details?.sharedExitDevices, 2);
  const campus = assessVpn({ current: scan({ id: "y", ip: "152.59.187.9" }), deviceHistory: [], population, currentDeviceId: "D" });
  assert.ok(!ids(campus).includes("shared-exit"));
});

test("a WebRTC address that differs from the HTTP address reveals a proxy path", () => {
  const risk = assessVpn({ current: scan({ id: "c", ip: "203.0.113.5", srflx: "152.59.187.10" }), deviceHistory: [], population: [] });
  assert.ok(ids(risk).includes("webrtc-mismatch"));
});

test("iCloud Private Relay is labelled as a relay, not a VPN", () => {
  const risk = assessVpn({ current: scan({ id: "c", ip: "172.224.226.5", lists: { privateRelay: true } }), deviceHistory: [], population: [] });
  assert.equal(risk.kind, "private-relay");
});

test("with almost no signals the model abstains instead of guessing", () => {
  const current = scan({ id: "c", ip: "152.59.187.77" });
  current.serverNetwork!.anonymizer.lists = undefined;
  const risk = assessVpn({ current, deviceHistory: [], population: [] });
  assert.equal(risk.band, "unknown");
});

test("no reputation verdict without a trusted public address", () => {
  const current = scan({ id: "c", ip: "Unknown" });
  current.serverNetwork!.isPublicIp = false;
  const risk = assessVpn({ current, deviceHistory: [], population: [], reputationOf: () => CLEAN });
  assert.ok(!ids(risk).includes("clean-reputation"));
});

test("bracketed IPv6 STUN candidates compare equal to the HTTP address", () => {
  const current = scan({ id: "c", ip: "2409:40e3:20d9:2bba::5922" });
  current.fingerprint.webrtcCandidates = [{ address: "[2409:40e3:20d9:2bba::5922]", candidateType: "srflx", protocol: "udp", addressFamily: "ipv6", isPublic: true }];
  const risk = assessVpn({ current, deviceHistory: [], population: [] });
  assert.ok(!ids(risk).includes("webrtc-mismatch") && ids(risk).includes("webrtc-consistent"), ids(risk).join(", "));
});
