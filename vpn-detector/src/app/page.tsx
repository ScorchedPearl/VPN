"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  type ResearchObservation,
  type VpnGroundTruth,
} from "@/utils/fingerprint";
import type { ObservationMatch } from "@/utils/similarity";
import { assessVpnRisk, type RiskAssessment, type ServerNetworkData } from "@/utils/risk";

interface ObservationResponse {
  observation: ResearchObservation;
  matches: ObservationMatch[];
  count: number;
}

export default function Home() {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [serverData, setServerData] = useState<ServerNetworkData | null>(null);
  const [matches, setMatches] = useState<ObservationMatch[]>([]);
  const [storeCount, setStoreCount] = useState(0);
  const [storeBackend, setStoreBackend] = useState<"checking" | "postgresql" | "offline">("checking");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [deviceLabel, setDeviceLabel] = useState("demo-device-01");
  const [browserMode, setBrowserMode] = useState<BrowserMode>("normal");
  const [vpnGroundTruth, setVpnGroundTruth] = useState<VpnGroundTruth>("unknown");

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
  const risk: RiskAssessment | null = useMemo(() => {
    if (!fingerprint || !serverData) return null;
    return assessVpnRisk(fingerprint, serverData, bestMatch);
  }, [fingerprint, serverData, bestMatch]);

  async function runAnalysis() {
    if (!deviceLabel.trim()) {
      setError("Enter a controlled test-device label first.");
      return;
    }

    setIsScanning(true);
    setError("");
    setFingerprint(null);
    setServerData(null);
    setMatches([]);

    try {
      const [clientResult, networkResponse] = await Promise.all([
        generateClientFingerprint(),
        fetch("/api/fingerprint", { cache: "no-store" }),
      ]);
      if (!networkResponse.ok) throw new Error("Could not read first-party network observation.");
      const networkResult = await networkResponse.json() as ServerNetworkData;
      const effectivePublicIp = clientResult.geoIp?.ip || (networkResult.isPublicIp ? networkResult.ip : "Unknown");
      const observation: ResearchObservation = {
        observationId: "pending-server-id",
        deviceLabel: deviceLabel.trim(),
        browserMode,
        vpnGroundTruth,
        fingerprint: clientResult,
        serverSeenIp: networkResult.ip,
        effectivePublicIp,
      };

      const observationResponse = await fetch("/api/observations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(observation),
      });
      if (!observationResponse.ok) throw new Error("Could not save the lab observation.");
      const saved = await observationResponse.json() as ObservationResponse;

      setFingerprint(clientResult);
      setServerData(networkResult);
      setMatches(saved.matches);
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
              <FlaskConical className="h-4 w-4" /> Research prototype · schema 2.0
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

            <div className="grid gap-4 sm:grid-cols-3">
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
              <Field label="VPN ground truth">
                <select
                  value={vpnGroundTruth}
                  onChange={(event) => setVpnGroundTruth(event.target.value as VpnGroundTruth)}
                  className="w-full rounded-xl border border-white/10 bg-[#091625] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                >
                  <option value="unknown">Not labelled</option>
                  <option value="off">VPN off</option>
                  <option value="on">VPN on</option>
                </select>
              </Field>
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
                Initiating a scan consents to storing this observation in the project&apos;s Supabase PostgreSQL database. Public-IP enrichment is requested from ipapi.co.
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
              <DemoStep number="1" title="Establish a baseline" detail="Set VPN off, use demo-device-01, and capture in your normal browser." />
              <DemoStep number="2" title="Change the network" detail="Enable a VPN, select VPN on, and capture again. Device similarity should remain high while IP evidence changes." />
              <DemoStep number="3" title="Try another browser" detail="Open the same URL in Firefox, Safari, or private mode with the same label. The cross-browser model compares shared hardware families." />
            </div>
          </Panel>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Globe2 className="h-5 w-5" />}
            label="Apparent egress"
            value={fingerprint?.geoIp?.ip || serverData?.ip || "Run a scan"}
            detail={fingerprint?.geoIp ? `${fingerprint.geoIp.city}, ${fingerprint.geoIp.country} · ${fingerprint.geoIp.asn}` : "External lookup not yet collected"}
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
            label="VPN-compatible risk"
            value={risk ? `${risk.score}/100 · ${risk.band}` : "—"}
            detail={risk?.headline || "Evidence appears after a scan"}
            tone={risk?.band === "high" ? "rose" : risk?.band === "elevated" ? "amber" : "green"}
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
                <PanelHeader icon={<ShieldCheck className="h-5 w-5" />} title="Explainable VPN-risk evidence" subtitle="Ground-truth labels are never used to calculate this score." />
                <div className="p-5">
                  <div className="mb-5 flex items-center gap-5 rounded-2xl border border-white/10 bg-[#081522] p-4">
                    <ScoreGauge score={risk.score} />
                    <div>
                      <Pill tone={risk.band === "high" ? "rose" : risk.band === "elevated" ? "amber" : "green"}>{risk.band} evidence</Pill>
                      <p className="mt-2 font-bold text-white">{risk.headline}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">A score supports review or step-up verification. It does not prove VPN use.</p>
                    </div>
                  </div>

                  {risk.evidence.length === 0 ? (
                    <div className="flex gap-3 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-sm text-emerald-200">
                      <CheckCircle2 className="h-5 w-5 shrink-0" /> No implemented heuristic produced VPN-compatible evidence in this observation.
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
                            <span className="shrink-0 font-mono text-sm font-bold text-amber-300">+{item.points}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Panel>

              <Panel>
                <PanelHeader icon={<Network className="h-5 w-5" />} title="Network observations" subtitle="External egress and first-party ingress are kept as separate vantage points." />
                <div className="space-y-1 p-5 pt-3">
                  <DataLine label="External public IP" value={fingerprint.geoIp?.ip || "Unavailable"} />
                  <DataLine label="IP location" value={fingerprint.geoIp ? `${fingerprint.geoIp.city}, ${fingerprint.geoIp.country}` : "Unavailable"} />
                  <DataLine label="ASN / organization" value={fingerprint.geoIp ? `${fingerprint.geoIp.asn} · ${fingerprint.geoIp.org}` : "Unavailable"} />
                  <DataLine label="First-party server IP" value={`${serverData.ip} · ${serverData.source}`} />
                  <DataLine label="Browser timezone" value={`${fingerprint.timezone.name} · UTC ${formatOffset(fingerprint.timezone.offsetMinutes)}`} />
                  <DataLine label="IP timezone" value={fingerprint.geoIp ? `${fingerprint.geoIp.timezone} · UTC ${formatOffset(fingerprint.geoIp.utcOffsetMinutes)}` : "Unavailable"} />
                </div>
              </Panel>

              <Panel>
                <PanelHeader icon={<Radio className="h-5 w-5" />} title="WebRTC candidate interpretation" subtitle="Host or mDNS candidates are not automatically classified as leaks." />
                <div className="p-5 pt-3">
                  {fingerprint.webrtcCandidates.length === 0 ? (
                    <EmptyState text="No ICE candidates were exposed. This may be a browser privacy policy, network condition, or unsupported API." compact />
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

        {fingerprint && (
          <section className="mt-5 grid gap-5 lg:grid-cols-3">
            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-2 text-cyan-300"><Cpu className="h-5 w-5" /><h3 className="font-bold text-white">Device-like components</h3></div>
              <DataLine label="OS / platform" value={`${fingerprint.osFamily} · ${fingerprint.platform}`} />
              <DataLine label="CPU" value={`${fingerprint.hardwareConcurrency ?? "unknown"} logical · ${fingerprint.hardwareBucket}`} />
              <DataLine label="Memory" value={`${fingerprint.deviceMemory ?? "unknown"} GB · ${fingerprint.memoryBucket}`} />
              <DataLine label="GPU family" value={fingerprint.webgl.rendererFamily} />
              <DataLine label="Touch points" value={String(fingerprint.touchPoints)} />
            </Panel>
            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-2 text-violet-300"><Monitor className="h-5 w-5" /><h3 className="font-bold text-white">Browser/profile components</h3></div>
              <DataLine label="Browser" value={`${fingerprint.browserFamily} ${fingerprint.browserMajor}`} />
              <DataLine label="Canvas repeatable" value={fingerprint.canvas.repeatable ? "Yes, within this scan" : "No / protected"} />
              <DataLine label="Visible fonts" value={String(fingerprint.fonts.length)} />
              <DataLine label="Capabilities" value={String(fingerprint.capabilities.length)} />
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
  const color = score >= 35 ? "#fb7185" : score >= 10 ? "#fbbf24" : "#34d399";
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
