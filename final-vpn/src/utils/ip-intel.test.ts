import { test } from "node:test";
import assert from "node:assert/strict";
import { ipIntelEvidence, scoreIpIntel, type IpIntel } from "./ip-intel.ts";
import { parseIpinfo } from "./ipinfo.ts";
import { evaluateGeolocation, KM_PER_RTT_MS, readMeasurement, startPingMeasurement, type AtlasProbe, type AtlasSample } from "./ripe-atlas.ts";

const FRANKFURT = { latitude: 50.11, longitude: 8.68 };
const probe = (id: number, country: string, latitude: number, longitude: number, minRttMs: number | null, role: AtlasProbe["role"] = "far"): AtlasSample => ({ id, country, latitude, longitude, role, minRttMs });

const NO_LISTS = { vpn: false, datacenter: false, privateRelay: false, tor: false, checked: ["vpn", "datacenter", "private-relay", "tor"] as never[], loadedAt: null };
function intel(overrides: Partial<IpIntel>): IpIntel {
  return { ip: "203.0.113.9", checkedAt: "2026-11-04T00:00:00Z", fromCache: false, isPublic: true, lists: NO_LISTS, ipinfo: { status: "unavailable", message: "x" }, atlas: { status: "not-run", message: "" }, ...overrides };
}
const base = { ip: "203.0.113.9", city: "Frankfurt", region: "Hesse", country: "DE", loc: "50.11,8.68", org: "AS24940 Hetzner Online GmbH", timezone: "Europe/Berlin" };

test("RTT bound uses light in fibre", () => {
  assert.equal(KM_PER_RTT_MS, 100);
});

test("a genuinely nearby target is consistent", () => {
  const check = evaluateGeolocation(FRANKFURT, [
    probe(1, "DE", 50.0, 8.5, 3, "near"),
    probe(2, "US", 40.7, -74, 85),
    probe(3, "SG", 1.35, 103.8, 160),
    probe(4, "BR", -23.5, -46.6, 200),
  ]);
  assert.equal(check.verdict, "consistent");
  assert.equal(check.violations.length, 0);
});

test("a VPN claiming Frankfurt but sitting in New York is inconsistent", () => {
  const check = evaluateGeolocation(FRANKFURT, [
    probe(1, "DE", 50.0, 8.5, 80, "near"),
    probe(2, "US", 40.7, -74, 2), // New York probe sees the target at 2 ms
    probe(3, "GB", 51.5, -0.1, 70),
    probe(4, "SG", 1.35, 103.8, 230),
  ]);
  assert.equal(check.verdict, "inconsistent");
  assert.equal(check.violations[0].country, "US");
  assert.ok(check.violations[0].distanceKm > 6_000);
});

test("too few replies is inconclusive, and no replies are ignored", () => {
  const check = evaluateGeolocation(FRANKFURT, [probe(1, "DE", 50, 8.5, 3), probe(2, "US", 40.7, -74, null), probe(3, "SG", 1.35, 103.8, null)]);
  assert.equal(check.verdict, "inconclusive");
  assert.equal(check.usableProbes, 1);
});

test("no contradiction but no close probe stays inconclusive", () => {
  const check = evaluateGeolocation(FRANKFURT, [probe(1, "US", 40.7, -74, 90), probe(2, "SG", 1.35, 103.8, 170), probe(3, "BR", -23.5, -46.6, 210)]);
  assert.equal(check.verdict, "inconclusive");
});

test("parseIpinfo handles the free plan (no privacy module)", () => {
  const result = parseIpinfo(base.ip, base, null);
  assert.equal(result.latitude, 50.11);
  assert.equal(result.longitude, 8.68);
  assert.equal(result.asn, "AS24940");
  assert.equal(result.asnName, "Hetzner Online GmbH");
  assert.equal(result.privacy, null);
  assert.equal(result.privacyAvailable, false);
});

test("parseIpinfo reads privacy flags when present", () => {
  const result = parseIpinfo(base.ip, base, { vpn: true, proxy: false, tor: false, relay: false, hosting: true, service: "Nord" });
  assert.equal(result.privacy?.vpn, true);
  assert.equal(result.privacy?.service, "Nord");
});

test("IPinfo VPN flag and a contradicting Atlas result push the verdict high", () => {
  const info = parseIpinfo(base.ip, base, { vpn: true, proxy: false, tor: false, relay: false, hosting: false, service: "" });
  const geo = evaluateGeolocation(FRANKFURT, [probe(1, "US", 40.7, -74, 2), probe(2, "DE", 50, 8.5, 80), probe(3, "SG", 1.35, 103.8, 230)]);
  const verdict = scoreIpIntel(intel({ ipinfo: { status: "ok", result: info }, atlas: { status: "done", measurementId: 1, finishedAt: "", samples: [], geo } }));
  assert.equal(verdict.band, "high");
  assert.equal(verdict.kind, "vpn");
  assert.ok(verdict.evidence.some((item) => item.id === "atlas-geo-impossible"));
});

test("a clean ISP address with confirmed location scores low", () => {
  const info = parseIpinfo(base.ip, { ...base, org: "AS3320 Deutsche Telekom AG" }, null);
  const geo = evaluateGeolocation(FRANKFURT, [probe(1, "DE", 50, 8.5, 3), probe(2, "US", 40.7, -74, 85), probe(3, "SG", 1.35, 103.8, 160)]);
  const verdict = scoreIpIntel(intel({ ipinfo: { status: "ok", result: info }, atlas: { status: "done", measurementId: 1, finishedAt: "", samples: [], geo } }));
  assert.equal(verdict.band, "low");
  assert.equal(verdict.kind, "none");
});

test("name-based hints are weak, and a private address is undecided", () => {
  const hosting = ipIntelEvidence({ ipinfo: { status: "ok", result: parseIpinfo(base.ip, base, null) }, atlas: { status: "not-run", message: "" } });
  assert.equal(hosting[0].id, "asn-hosting-name");
  assert.equal(hosting[0].strength, "weak");
  assert.equal(scoreIpIntel(intel({ isPublic: false, lists: null })).band, "unknown");
});

test("Atlas: measurement request never leaks the key and surfaces credit errors", async () => {
  let seen: { url: string; init: RequestInit } | null = null;
  const fetcher = (async (url: string, init: RequestInit) => {
    seen = { url, init };
    return new Response(JSON.stringify({ error: { detail: "There was a problem", errors: [{ detail: "You do not have enough credit" }] } }), { status: 400 });
  }) as unknown as typeof fetch;
  const outcome = await startPingMeasurement("203.0.113.9", [{ id: 1, country: "DE", latitude: 50, longitude: 8, role: "near" }], fetcher, "secret-key");
  assert.equal(outcome.ok, false);
  if (!outcome.ok) assert.match(outcome.message, /enough credit/);
  assert.ok(!seen!.url.includes("secret-key"));
  assert.ok(!JSON.stringify(seen!.init.body).includes("secret-key"));
  assert.equal((seen!.init.headers as Record<string, string>).authorization, "Key secret-key");
});

test("Atlas: results are mapped to probes, no-reply probes stay null", async () => {
  const fetcher = (async (url: string) => new Response(JSON.stringify(url.endsWith("/results/")
    ? [{ prb_id: 1, min: 3.2, rcvd: 2 }, { prb_id: 2, min: -1, rcvd: 0 }]
    : { status: { name: "Ongoing" } }))) as unknown as typeof fetch;
  const progress = await readMeasurement(9, [
    { id: 1, country: "DE", latitude: 0, longitude: 0, role: "near" },
    { id: 2, country: "US", latitude: 0, longitude: 0, role: "far" },
    { id: 3, country: "SG", latitude: 0, longitude: 0, role: "far" },
  ], fetcher, "k");
  assert.deepEqual(progress?.samples.map((sample) => sample.minRttMs), [3.2, null, null]);
  assert.equal(progress?.finished, false);
});
