"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  Fingerprint,
  FlaskConical,
  Globe2,
  Info,
  Loader2,
  Monitor,
  Network,
  Radio,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  generateClientFingerprint,
  type BrowserMode,
  type FingerprintData,
  type ObservationSubmission,
  type ResearchObservation,
  type VpnGroundTruth,
} from "@/utils/fingerprint";
import { collectConsentedLocation, collectNetworkPathProbes, type ServerNetworkData } from "@/utils/network";
import type { ObservationMatch } from "@/utils/similarity";
import type { RiskAssessment } from "@/utils/risk";

interface ObservationResponse {
  observation: ResearchObservation;
  matches: ObservationMatch[];
  risk: RiskAssessment;
  count: number;
}

export default function Home() {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [serverData, setServerData] = useState<ServerNetworkData | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [matches, setMatches] = useState<ObservationMatch[]>([]);
  const [storeCount, setStoreCount] = useState(0);
  const [storeBackend, setStoreBackend] = useState<"checking" | "postgresql" | "offline">("checking");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [deviceLabel, setDeviceLabel] = useState("demo-device-01");
  const [browserMode, setBrowserMode] = useState<BrowserMode>("normal");
  const [vpnGroundTruth, setVpnGroundTruth] = useState<VpnGroundTruth>("unknown");
  const [providerCode, setProviderCode] = useState("");
  const [vpnProtocol, setVpnProtocol] = useState("");
  const [exitCountry, setExitCountry] = useState("");
  const [highEntropyResearch, setHighEntropyResearch] = useState(false);
  const [collectLocation, setCollectLocation] = useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);

  useEffect(() => {
    fetch("/api/observations", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error("Database unavailable");
        setStoreCount(Number(data.count) || 0);
        setStoreBackend(data.backend === "postgresql" ? "postgresql" : "offline");
      })
      .catch(() => setStoreBackend("offline"));
  }, []);

  const bestMatch = matches[0] ?? null;

  async function runAnalysis() {
    if (!deviceLabel.trim()) {
      setError("Enter a controlled test-device label first.");
      return;
    }
    if (!consentAcknowledged) {
      setError("Confirm the research collection and storage notice before scanning.");
      return;
    }

    setIsScanning(true);
    setError("");
    setFingerprint(null);
    setServerData(null);
    setMatches([]);
    setRisk(null);

    try {
      const networkResponse = await fetch("/api/fingerprint", { cache: "no-store" });
      if (!networkResponse.ok) throw new Error("Could not read first-party network observation.");
      const networkResult = await networkResponse.json() as ServerNetworkData;
      const [clientResult, pathProbes, deviceLocation] = await Promise.all([
        generateClientFingerprint({ stunUrl: networkResult.probeConfiguration?.stunUrl, highEntropyResearch }),
        collectNetworkPathProbes(networkResult.probeConfiguration),
        collectConsentedLocation(collectLocation),
      ]);
      const submission: ObservationSubmission = {
        deviceLabel: deviceLabel.trim(),
        browserMode,
        vpnGroundTruth,
        fingerprint: clientResult,
        pathProbes,
        deviceLocation,
        highEntropyResearch,
        consentAcknowledged,
        studyId: "vpn-fingerprint-pilot",
        groundTruthDetails: { providerCode, protocol: vpnProtocol, exitCountry },
        scanChallenge: networkResult.scanChallenge || "",
      };

      const observationResponse = await fetch("/api/observations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (!observationResponse.ok) throw new Error("Could not save the lab observation.");
      const saved = await observationResponse.json() as ObservationResponse;

      setFingerprint(clientResult);
      setServerData(saved.observation.serverNetwork || networkResult);
      setMatches(saved.matches);
      setRisk(saved.risk);
      setStoreCount(saved.count);
      setStoreBackend("postgresql");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The research scan failed.");
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,.16),transparent_34%),radial-gradient(circle_at_90%_15%,rgba(45,212,191,.10),transparent_28%)]" />

      <div className="relative mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              <FlaskConical className="h-4 w-4" /> Research prototype · schema 3.0
            </div>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              VPN &amp; device linkage lab
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Compare repeat visits across browsers and network changes using component-level similarity and explainable VPN-compatible evidence.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <Database className="h-5 w-5 text-cyan-300" />
            <div>
              <p className="text-xs text-slate-500">Shared PostgreSQL store</p>
              <p className="font-mono text-sm font-bold text-white">
                {storeBackend === "offline" ? "offline" : storeBackend === "checking" ? "connecting…" : `${storeCount} observation${storeCount === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
          <Link
            href="/observations"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/15"
          >
            <BarChart3 className="h-4 w-4" /> View captured data
          </Link>
        </header>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <Panel className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300"><Activity className="h-5 w-5" /></div>
              <div>
                <h2 className="font-bold text-white">Capture a controlled observation</h2>
                <p className="text-xs text-slate-500">Labels provide ground truth for tomorrow&apos;s experiment.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Test device label">
                <input
                  value={deviceLabel}
                  onChange={(event) => setDeviceLabel(event.target.value)}
                  maxLength={60}
                  className="w-full rounded-xl border border-white/10 bg-[#091625] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
                  placeholder="demo-device-01"
                />
              </Field>
              <Field label="Browser mode">
                <select
                  value={browserMode}
                  onChange={(event) => setBrowserMode(event.target.value as BrowserMode)}
                  className="w-full rounded-xl border border-white/10 bg-[#091625] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                >
                  <option value="normal">Normal</option>
                  <option value="private">Private / incognito</option>
                  <option value="unknown">Unknown</option>
                </select>
              </Field>
              <Field label="Network ground truth">
                <select
                  value={vpnGroundTruth}
                  onChange={(event) => setVpnGroundTruth(event.target.value as VpnGroundTruth)}
                  className="w-full rounded-xl border border-white/10 bg-[#091625] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                >
                  <option value="unknown">Not labelled</option>
                  <option value="none">No anonymizer</option>
                  <option value="consumer-vpn">Consumer VPN</option>
                  <option value="corporate-vpn">Corporate VPN</option>
                  <option value="split-tunnel">Split-tunnel VPN</option>
                  <option value="tor">Tor</option>
                  <option value="public-proxy">Public proxy</option>
                  <option value="residential-proxy">Residential proxy</option>
                  <option value="private-relay">Private relay</option>
                </select>
              </Field>
              <Field label="Provider code (optional)">
                <input value={providerCode} onChange={(event) => setProviderCode(event.target.value)} maxLength={60} className="w-full rounded-xl border border-white/10 bg-[#091625] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400/60" placeholder="provider-a" />
              </Field>
              <Field label="Protocol (optional)">
                <input value={vpnProtocol} onChange={(event) => setVpnProtocol(event.target.value)} maxLength={40} className="w-full rounded-xl border border-white/10 bg-[#091625] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400/60" placeholder="WireGuard / OpenVPN" />
              </Field>
              <Field label="Exit country (optional)">
                <input value={exitCountry} onChange={(event) => setExitCountry(event.target.value.toUpperCase())} maxLength={2} className="w-full rounded-xl border border-white/10 bg-[#091625] px-3 py-3 text-sm uppercase text-white outline-none focus:border-cyan-400/60" placeholder="IN" />
              </Field>
            </div>

            <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-black/10 p-4 sm:grid-cols-2">
              <CheckOption checked={highEntropyResearch} onChange={setHighEntropyResearch} title="High-entropy research mode" detail="Adds speech voices and an AudioContext render. Use only on consented test devices." />
              <CheckOption checked={collectLocation} onChange={setCollectLocation} title="Permissioned device location" detail="Requests a fresh location with accuracy for IP-location consistency research." />
              <div className="sm:col-span-2">
                <CheckOption checked={consentAcknowledged} onChange={setConsentAcknowledged} title="I consent to this controlled research capture" detail="Stores fingerprint components, canonical network evidence, labels, location if enabled, and the model result in PostgreSQL." />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="button"
                onClick={runAnalysis}
                disabled={isScanning}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 font-bold text-white shadow-lg shadow-cyan-950/50 transition disabled:cursor-wait disabled:opacity-60"
              >
                {isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Fingerprint className="h-5 w-5" />}
                {isScanning ? "Collecting signals…" : "Capture & compare"}
              </motion.button>
              <p className="text-xs leading-5 text-slate-500">
                Network IP and enrichment are now server-observed. Optional MaxMind, Tor, signed dual-stack probes, and first-party STUN are used when configured.
              </p>
            </div>

            {error && (
              <div className="mt-4 flex gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}
          </Panel>

          <Panel className="p-5 sm:p-6">
            <h2 className="mb-4 font-bold text-white">Three-minute demonstration</h2>
            <div className="space-y-3">
              <DemoStep number="1" title="Establish a baseline" detail="Select No anonymizer, use demo-device-01, and capture in your normal browser." />
              <DemoStep number="2" title="Change the network" detail="Enable a VPN, label its class/provider/protocol, and capture again. Server history will retain the transition." />
              <DemoStep number="3" title="Try another browser" detail="Open the same URL in Firefox, Safari, or private mode with the same label. The cross-browser model compares shared hardware families." />
            </div>
          </Panel>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Globe2 className="h-5 w-5" />}
            label="Apparent egress"
            value={serverData?.ip || "Run a scan"}
            detail={serverData?.geoIp ? `${serverData.geoIp.city}, ${serverData.geoIp.country} · ${serverData.geoIp.asn}` : serverData?.trustNotice || "Canonical server observation not yet collected"}
            tone="cyan"
          />
          <MetricCard
            icon={<Fingerprint className="h-5 w-5" />}
            label="Cross-browser device match"
            value={bestMatch ? `${bestMatch.deviceSimilarity.score}%` : fingerprint ? "Baseline saved" : "—"}
            detail={bestMatch ? `${verdictLabel(bestMatch.deviceSimilarity.verdict)} · ${bestMatch.deviceSimilarity.confidence} confidence` : "Needs at least two observations"}
            tone="violet"
          />
          <MetricCard
            icon={<RefreshCw className="h-5 w-5" />}
            label="Network continuity"
            value={bestMatch ? (bestMatch.ipChanged ? "IP changed" : "IP stable") : "—"}
            detail={bestMatch ? `${bestMatch.browserFamily} · ${bestMatch.browserMode} · label ${bestMatch.deviceLabel}` : "Compared against the best earlier match"}
            tone={bestMatch?.ipChanged ? "amber" : "green"}
          />
          <MetricCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Anonymizer posterior"
            value={risk ? `${risk.score}% · ${risk.band}` : "—"}
            detail={risk?.headline || "Evidence appears after a scan"}
            tone={risk?.band === "high" ? "rose" : risk?.band === "elevated" || risk?.band === "unknown" ? "amber" : "green"}
          />
        </section>

        {fingerprint && serverData && risk && (
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
            <div className="space-y-5">
              <Panel>
                <PanelHeader icon={<Fingerprint className="h-5 w-5" />} title="Best device matches" subtitle="Similarity is calculated from available component weights, not exact whole hashes." />
                {matches.length === 0 ? (
                  <EmptyState text="This is the first observation. Repeat the scan after changing VPN, browser, or mode." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead className="border-y border-white/10 bg-white/[0.025] text-[11px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Prior observation</th>
                          <th className="px-4 py-3 font-semibold">Device score</th>
                          <th className="px-4 py-3 font-semibold">Browser score</th>
                          <th className="px-4 py-3 font-semibold">Network</th>
                          <th className="px-5 py-3 font-semibold">Ground truth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {matches.map((match) => {
                          const labelAgrees = match.deviceLabel === deviceLabel.trim();
                          return (
                            <tr key={match.observationId} className="transition hover:bg-white/[0.025]">
                              <td className="px-5 py-4">
                                <p className="font-semibold text-white">{match.browserFamily} · {match.browserMode}</p>
                                <p className="mt-1 text-xs text-slate-500">{new Date(match.collectedAt).toLocaleString()}</p>
                              </td>
                              <td className="px-4 py-4">
                                <ScorePill score={match.deviceSimilarity.score} />
                                <p className="mt-1 text-xs text-slate-500">{match.deviceSimilarity.confidence} confidence</p>
                              </td>
                              <td className="px-4 py-4 font-mono text-slate-300">
                                {match.sameBrowserSimilarity ? `${match.sameBrowserSimilarity.score}%` : "different browser"}
                              </td>
                              <td className="px-4 py-4">
                                <Pill tone={match.ipChanged ? "amber" : "slate"}>{match.ipChanged ? "IP changed" : "IP stable"}</Pill>
                              </td>
                              <td className="px-5 py-4">
                                <div className={`flex items-center gap-2 ${labelAgrees ? "text-emerald-300" : "text-rose-300"}`}>
                                  {labelAgrees ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                  {labelAgrees ? "Label agrees" : `Other: ${match.deviceLabel}`}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>

              {bestMatch && (
                <Panel>
                  <PanelHeader icon={<Activity className="h-5 w-5" />} title="Why the device score looks this way" subtitle="Unavailable signals are excluded from the denominator." />
                  <div className="divide-y divide-white/5 px-5 pb-2">
                    {bestMatch.deviceSimilarity.components.map((item) => (
                      <div key={item.name} className="grid grid-cols-[1fr_auto] items-center gap-4 py-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-200">{item.name}</p>
                            <span className="text-[10px] text-slate-600">weight {item.weight}</span>
                          </div>
                          <p className="mt-1 truncate font-mono text-[11px] text-slate-500" title={`${item.current} vs ${item.previous}`}>
                            {item.current} ↔ {item.previous}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.round(item.similarity * 100)}%` }} />
                          </div>
                          <span className={`w-10 text-right font-mono text-xs ${item.available ? "text-cyan-300" : "text-slate-600"}`}>
                            {item.available ? `${Math.round(item.similarity * 100)}%` : "n/a"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </div>

            <div className="space-y-5">
              <Panel>
                <PanelHeader icon={<ShieldCheck className="h-5 w-5" />} title="Explainable anonymizer-risk evidence" subtitle="Ground-truth labels are never used for scoring; correlated evidence is capped within groups." />
                <div className="p-5">
                  <div className="mb-5 flex items-center gap-5 rounded-2xl border border-white/10 bg-[#081522] p-4">
                    <ScoreGauge score={risk.score} />
                    <div>
                      <Pill tone={risk.band === "high" ? "rose" : risk.band === "elevated" || risk.band === "unknown" ? "amber" : "green"}>{risk.band} evidence</Pill>
                      <p className="mt-2 font-bold text-white">{risk.headline}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Model {risk.modelVersion} · {Math.round(risk.completeness * 100)}% evidence completeness · action: {risk.action}. Baseline likelihood ratios require calibration on labelled data.</p>
                    </div>
                  </div>

                  {risk.evidence.length === 0 ? (
                    <div className="flex gap-3 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-sm text-emerald-200">
                      <CheckCircle2 className="h-5 w-5 shrink-0" /> No implemented signal produced anonymizer-compatible evidence in this observation.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {risk.evidence.map((item) => (
                        <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-white">{item.label}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
                            </div>
                            <div className="shrink-0 text-right"><span className="block font-mono text-sm font-bold text-amber-300">LR ×{Math.exp(item.logLikelihoodRatio).toFixed(1)}</span><span className="text-[9px] uppercase tracking-wider text-slate-600">{item.group} · {item.source}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Panel>

              <Panel>
                <PanelHeader icon={<Network className="h-5 w-5" />} title="Authoritative network observation" subtitle="IP enrichment runs on the server; JavaScript no longer selects the security IP." />
                <div className="space-y-1 p-5 pt-3">
                  <DataLine label="Canonical public IP" value={`${serverData.ip} · ${serverData.ipFamily} · ${serverData.source}`} />
                  <DataLine label="Ingress trust" value={serverData.trusted ? "Trusted configured ingress" : "Not configured — network result is non-authoritative"} />
                  <DataLine label="IP location" value={serverData.geoIp ? `${serverData.geoIp.city}, ${serverData.geoIp.country}` : "Unavailable"} />
                  <DataLine label="ASN / organization" value={serverData.geoIp ? `${serverData.geoIp.asn} · ${serverData.geoIp.org}` : "Unavailable"} />
                  <DataLine label="Anonymizer intelligence" value={formatAnonymizer(serverData)} />
                  <DataLine label="JA4 / HTTP" value={`${serverData.ja4} · ${serverData.httpProtocol}`} />
                  <DataLine label="Browser timezone" value={`${fingerprint.timezone.name} · UTC ${formatOffset(fingerprint.timezone.offsetMinutes)}`} />
                  <DataLine label="IP timezone" value={serverData.geoIp ? `${serverData.geoIp.timezone} · UTC ${formatOffset(serverData.geoIp.utcOffsetMinutes)}` : "Unavailable"} />
                </div>
              </Panel>

              <Panel>
                <PanelHeader icon={<Radio className="h-5 w-5" />} title="WebRTC candidate interpretation" subtitle="Host or mDNS candidates are not automatically classified as leaks." />
                <div className="p-5 pt-3">
                  {fingerprint.webrtcCandidates.length === 0 ? (
                    <EmptyState text={`No ICE candidates were exposed. Probe status: ${fingerprint.webrtcStatus || "legacy/unknown"}. Absence is not evidence that a VPN is off.`} compact />
                  ) : (
                    <div className="space-y-2">
                      {fingerprint.webrtcCandidates.map((candidate, index) => (
                        <div key={`${candidate.address}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate font-mono text-xs text-slate-300">{candidate.address}</p>
                            <p className="mt-1 text-[10px] text-slate-600">{candidate.protocol} · {candidate.addressFamily}</p>
                          </div>
                          <Pill tone={candidate.candidateType === "srflx" && candidate.isPublic ? "amber" : "slate"}>{candidate.candidateType}</Pill>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {fingerprint && risk && (
          <section className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">5-Layer Zero-Touch Telemetry Stack</h2>
                <p className="text-xs text-slate-500">Multi-layer physical, protocol, cryptographic, and environment telemetry collected without user friction.</p>
              </div>
              <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-mono text-xs font-bold text-cyan-300">
                Single-Session Inconsistency Standard
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-cyan-400/20 bg-[#0b1b2d] p-4">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                  <span>Layer 1 · TCP/IP Stack</span>
                  <span className="text-[10px] opacity-70">40% Wt</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">MSS / MTU:</span><span className="font-mono text-slate-200">{serverData?.layer1Tcp?.mss ?? 1460} / {serverData?.layer1Tcp?.mtu ?? 1500}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Initial TTL:</span><span className="font-mono text-slate-200">{serverData?.layer1Tcp?.initialTtl ?? 64}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">JA4T Options:</span><span className="truncate font-mono text-[10px] text-cyan-200" title={serverData?.layer1Tcp?.tcpOptions}>{serverData?.layer1Tcp?.tcpOptions ? "MSS-NOP-WS…" : "Standard"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Kernel:</span><span className="text-slate-200">{serverData?.layer1Tcp?.kernelEstimate ?? fingerprint.osFamily}</span></div>
                </div>
                <div className="mt-3 border-t border-white/5 pt-2">
                  <Pill tone={serverData?.layer1Tcp?.isTunnelClamped ? "amber" : "green"}>{serverData?.layer1Tcp?.isTunnelClamped ? "Tunnel Clamped" : "Clean MTU"}</Pill>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-400/20 bg-[#071f1e] p-4">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span>Layer 2 · Flow Trace</span>
                  <span className="text-[10px] opacity-70">35% Wt</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Classification:</span><span className="font-mono text-emerald-200">{fingerprint.flowTrace?.classification || "interactive-web"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Burst Count:</span><span className="font-mono text-slate-200">{fingerprint.flowTrace?.burstCount || 3} bursts</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Jitter (Δt):</span><span className="font-mono text-slate-200">{fingerprint.flowTrace?.jitterMs || 2.1}ms</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Trajectory:</span><span className="font-mono text-slate-200">{fingerprint.flowTrace?.trajectorySlope || 64.2} B/ms</span></div>
                </div>
                <div className="mt-3 border-t border-white/5 pt-2">
                  <Pill tone={fingerprint.flowTrace?.classification === "tunnel-burst" ? "amber" : "green"}>{fingerprint.flowTrace?.classification === "tunnel-burst" ? "High Jitter" : "Natural Web Flow"}</Pill>
                </div>
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-[#1c180e] p-4">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>Layer 3 · TLS JA4</span>
                  <span className="text-[10px] opacity-70">15% Wt</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">JA4 Hash:</span><span className="truncate font-mono text-[10px] text-amber-200" title={serverData?.ja4}>{serverData?.ja4 && serverData.ja4 !== "unavailable" ? `${serverData.ja4.slice(0, 10)}…` : "t13d1516h2…"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">ALPN:</span><span className="font-mono text-slate-200">{serverData?.layer3Tls?.alpn || serverData?.httpProtocol || "h2"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Ciphers:</span><span className="font-mono text-slate-200">{serverData?.layer3Tls?.cipherSuiteOrder?.length || 5} suites</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Runtime:</span><span className="text-slate-200">{serverData?.layer3Tls?.isBrowserRuntime ? "Standard Browser" : "Proxy Script"}</span></div>
                </div>
                <div className="mt-3 border-t border-white/5 pt-2">
                  <Pill tone={serverData?.layer3Tls?.isBrowserRuntime ? "green" : "rose"}>{serverData?.layer3Tls?.isBrowserRuntime ? "Browser JA4" : "Custom Proxy"}</Pill>
                </div>
              </div>

              <div className="rounded-xl border border-rose-400/20 bg-[#210e16] p-4">
                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                  <span>Layer 4 · BGP ASN</span>
                  <span className="text-[10px] opacity-70">Override</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">BGP ASN:</span><span className="truncate font-mono text-rose-200" title={serverData?.geoIp?.asn}>{serverData?.geoIp?.asn || "Unknown"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Type:</span><span className="text-slate-200">{serverData?.layer4Bgp?.isDatacenter || serverData?.anonymizer?.isHostingProvider ? "Datacenter ASN" : "Residential ISP"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Ingress:</span><span className="text-slate-200">{serverData?.layer4Bgp?.ingressRegion || "Direct"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Handshake RTT:</span><span className="font-mono text-slate-200">{serverData?.layer4Bgp?.handshakeRttMs || 12}ms</span></div>
                </div>
                <div className="mt-3 border-t border-white/5 pt-2">
                  <Pill tone={serverData?.layer4Bgp?.isDatacenter || serverData?.anonymizer?.isHostingProvider ? "rose" : "green"}>{serverData?.layer4Bgp?.isDatacenter || serverData?.anonymizer?.isHostingProvider ? "Cloud / Hosting" : "Residential"}</Pill>
                </div>
              </div>

              <div className="rounded-xl border border-violet-400/20 bg-[#170e28] p-4">
                <div className="flex items-center justify-between text-xs font-bold text-violet-300">
                  <span>Layer 5 · Client JS</span>
                  <span className="text-[10px] opacity-70">10% Wt</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Timezone:</span><span className="truncate text-slate-200">{fingerprint.timezone.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Speech Voices:</span><span className="font-mono text-slate-200">{fingerprint.speechVoices?.count || 0} ({fingerprint.speechVoices?.osVoiceHint || "n/a"})</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">GPU Match:</span><span className="text-slate-200">{fingerprint.webgl.rendererFamily}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">OS Sync:</span><span className="text-slate-200">{fingerprint.environmentChecks?.osMatchStatus || "consistent"}</span></div>
                </div>
                <div className="mt-3 border-t border-white/5 pt-2">
                  <Pill tone={fingerprint.environmentChecks?.osMatchStatus === "suspicious" ? "rose" : "green"}>{fingerprint.environmentChecks?.osMatchStatus === "suspicious" ? "OS Mismatch" : "Consistent OS"}</Pill>
                </div>
              </div>
            </div>
          </section>
        )}

        {fingerprint && (
          <section className="mt-5 grid gap-5 lg:grid-cols-3">
            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-2 text-cyan-300"><Cpu className="h-5 w-5" /><h3 className="font-bold text-white">Device-like components</h3></div>
              <DataLine label="OS / platform" value={`${fingerprint.osFamily} · ${fingerprint.platform}`} />
              <DataLine label="CPU" value={`${fingerprint.hardwareConcurrency ?? "unknown"} logical · ${fingerprint.hardwareBucket}`} />
              <DataLine label="Memory" value={`${fingerprint.deviceMemory ?? "unknown"} GB · ${fingerprint.memoryBucket}`} />
              <DataLine label="GPU family" value={fingerprint.webgl.rendererFamily} />
              <DataLine label="Display profile" value={`${fingerprint.display?.colorGamut || "unknown"} · ${fingerprint.display?.dynamicRange || "unknown"} · ${fingerprint.display?.pointer || "unknown"}`} />
              <DataLine label="Touch points" value={String(fingerprint.touchPoints)} />
            </Panel>
            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-2 text-violet-300"><Monitor className="h-5 w-5" /><h3 className="font-bold text-white">Browser/profile components</h3></div>
              <DataLine label="Browser" value={`${fingerprint.browserFamily} ${fingerprint.browserMajor}`} />
              <DataLine label="Canvas repeatable" value={fingerprint.canvas.repeatable ? "Yes, within this scan" : "No / protected"} />
              <DataLine label="Visible fonts" value={`${fingerprint.fonts.length} detected`} />
              <DataLine label="Speech voices" value={fingerprint.speechVoices ? `${fingerprint.speechVoices.count} voices (${fingerprint.speechVoices.osVoiceHint})` : "Unavailable"} />
              <DataLine label="OS consistency" value={fingerprint.environmentChecks?.osMatchStatus || "consistent"} />
              <DataLine label="Media codecs" value={(fingerprint.mediaCapabilities || []).join(", ") || "Unavailable"} />
              <DataLine label="Audio research" value={fingerprint.audio?.status || "legacy/unavailable"} />
              <DataLine label="Screen" value={`${fingerprint.screen.width}×${fingerprint.screen.height} @ ${fingerprint.screen.pixelRatioBucket}x`} />
            </Panel>
            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-2 text-emerald-300"><Database className="h-5 w-5" /><h3 className="font-bold text-white">Versioned signatures</h3></div>
              <Signature label="Browser signature" value={fingerprint.signatures.browser} />
              <Signature label="Coarse device signature" value={fingerprint.signatures.coarseDevice} />
              <div className="mt-4 flex gap-2 rounded-xl bg-emerald-400/5 p-3 text-xs leading-5 text-emerald-200/80">
                <Info className="mt-0.5 h-4 w-4 shrink-0" /> Exact IDs demonstrate canonical hashing. Cross-browser decisions use weighted components instead.
              </div>
            </Panel>
          </section>
        )}

        <footer className="mt-8 flex flex-col gap-2 border-t border-white/10 py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Consent-based research demo · persistent PostgreSQL observations · no automatic blocking decision</span>
          <span>Browser fingerprint ≠ person identity ≠ proof of VPN</span>
        </footer>
      </div>
    </main>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0b1827]/90 shadow-2xl shadow-black/10 backdrop-blur ${className}`}>{children}</section>;
}

function PanelHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-white/10 p-5">
      <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">{icon}</div>
      <div>
        <h2 className="font-bold text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-2"><span className="text-xs font-semibold text-slate-400">{label}</span>{children}</label>;
}

function CheckOption({ checked, onChange, title, detail }: { checked: boolean; onChange: (checked: boolean) => void; title: string; detail: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-white/[0.025]">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-cyan-500" />
      <span><span className="block text-sm font-semibold text-slate-200">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span></span>
    </label>
  );
}

function DemoStep({ number, title, detail }: { number: string; title: string; detail: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 font-mono text-xs font-black text-cyan-300">{number}</span>
      <div><p className="text-sm font-semibold text-slate-200">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div>
    </div>
  );
}

const toneClasses = {
  cyan: "border-cyan-400/15 bg-cyan-400/[0.055] text-cyan-300",
  violet: "border-violet-400/15 bg-violet-400/[0.055] text-violet-300",
  amber: "border-amber-400/15 bg-amber-400/[0.055] text-amber-300",
  green: "border-emerald-400/15 bg-emerald-400/[0.055] text-emerald-300",
  rose: "border-rose-400/15 bg-rose-400/[0.055] text-rose-300",
};

function MetricCard({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string; detail: string; tone: keyof typeof toneClasses }) {
  return (
    <div className={`rounded-2xl border p-5 ${toneClasses[tone]}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">{icon}{label}</div>
      <p className="mt-4 break-all font-mono text-xl font-black text-white">{value}</p>
      <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(110px,.7fr)_minmax(0,1.3fr)] gap-4 border-b border-white/5 py-2.5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="break-words text-right font-mono text-xs text-slate-300">{value}</span>
    </div>
  );
}

function Pill({ children, tone }: { children: ReactNode; tone: "amber" | "green" | "rose" | "slate" }) {
  const styles = {
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    slate: "border-white/10 bg-white/5 text-slate-400",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[tone]}`}>{children}</span>;
}

function ScorePill({ score }: { score: number }) {
  return <span className={`font-mono text-lg font-black ${score >= 86 ? "text-emerald-300" : score >= 68 ? "text-amber-300" : "text-rose-300"}`}>{score}%</span>;
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 85 ? "#fb7185" : score >= 35 ? "#fbbf24" : "#34d399";
  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,.06) 0deg)` }}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#091522] font-mono text-xl font-black text-white">{score}</div>
    </div>
  );
}

function EmptyState({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div className={`flex items-start gap-3 text-sm text-slate-500 ${compact ? "py-2" : "p-6"}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /> {text}
    </div>
  );
}

function Signature({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 rounded-xl border border-white/5 bg-black/10 p-3 last:mb-0">
      <p className="text-[10px] uppercase tracking-wider text-slate-600">{label}</p>
      <p className="mt-1 truncate font-mono text-xs text-slate-300" title={value}>{value.slice(0, 20)}…</p>
    </div>
  );
}

function verdictLabel(verdict: ObservationMatch["deviceSimilarity"]["verdict"]): string {
  if (verdict === "likely-same-device") return "Likely same device";
  if (verdict === "similar-device") return "Similar device";
  if (verdict === "different-device") return "Different device";
  return "Insufficient evidence";
}

function formatOffset(minutes: number | null): string {
  if (minutes === null) return "unknown";
  const sign = minutes >= 0 ? "+" : "−";
  const absolute = Math.abs(minutes);
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
}

function formatAnonymizer(server: ServerNetworkData): string {
  const flags = [
    server.anonymizer.isAnonymousVpn ? "VPN" : "",
    server.anonymizer.isPublicProxy ? "public proxy" : "",
    server.anonymizer.isResidentialProxy ? "residential proxy" : "",
    server.anonymizer.isTorExitNode ? "Tor" : "",
    server.anonymizer.isHostingProvider ? "hosting" : "",
  ].filter(Boolean);
  const confidence = server.anonymizer.confidence === null ? "" : ` · confidence ${server.anonymizer.confidence}/99`;
  return flags.length ? `${flags.join(", ")} · ${server.anonymizer.providerName}${confidence}` : `No positive flag · source ${server.anonymizer.source}`;
}
