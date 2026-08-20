"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Filter,
  Fingerprint,
  GitCompare,
  Globe2,
  Laptop,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { ResearchObservation } from "@/utils/fingerprint";
import { compareDevices, compareSameBrowser, type SimilarityResult } from "@/utils/similarity";

export default function ObservationsDashboard({ initialObservations }: { initialObservations: ResearchObservation[] }) {
  const [search, setSearch] = useState("");
  const [browserFilter, setBrowserFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [firstId, setFirstId] = useState(initialObservations[0]?.observationId || "");
  const [secondId, setSecondId] = useState(initialObservations[1]?.observationId || initialObservations[0]?.observationId || "");

  const browsers = useMemo(() => Array.from(new Set(initialObservations.map((item) => item.fingerprint.browserFamily))).sort(), [initialObservations]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return initialObservations.filter((item) => {
      const matchesSearch = !term || [
        item.deviceLabel,
        item.fingerprint.browserFamily,
        item.fingerprint.osFamily,
        item.effectivePublicIp,
        item.fingerprint.geoIp?.country,
        item.fingerprint.geoIp?.org,
      ].some((value) => String(value || "").toLowerCase().includes(term));
      return matchesSearch && (browserFilter === "all" || item.fingerprint.browserFamily === browserFilter) && (modeFilter === "all" || item.browserMode === modeFilter);
    });
  }, [initialObservations, search, browserFilter, modeFilter]);

  const deviceGroups = useMemo(() => {
    const groups = new Map<string, ResearchObservation[]>();
    for (const observation of initialObservations) {
      const group = groups.get(observation.deviceLabel) || [];
      group.push(observation);
      groups.set(observation.deviceLabel, group);
    }
    return Array.from(groups.entries())
      .map(([label, items]) => ({ label, items }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [initialObservations]);

  const first = initialObservations.find((item) => item.observationId === firstId) || null;
  const second = initialObservations.find((item) => item.observationId === secondId) || null;
  const deviceComparison = first && second ? compareDevices(first.fingerprint, second.fingerprint) : null;
  const browserComparison = first && second && first.fingerprint.browserFamily === second.fingerprint.browserFamily
    ? compareSameBrowser(first.fingerprint, second.fingerprint)
    : null;
  const uniqueIps = new Set(initialObservations.map((item) => item.effectivePublicIp).filter((value) => value && value !== "Unknown")).size;
  const privateRuns = initialObservations.filter((item) => item.browserMode === "private").length;
  const vpnRuns = initialObservations.filter((item) => item.vpnGroundTruth === "on").length;

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(14,165,233,.14),transparent_31%),radial-gradient(circle_at_90%_5%,rgba(139,92,246,.10),transparent_26%)]" />
      <div className="relative mx-auto max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:text-cyan-200"><ArrowLeft className="h-4 w-4" /> Scanner</Link>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Captured observation explorer</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Persistent Supabase data grouped by controlled device label, with side-by-side fingerprint comparison.</p>
          </div>
          <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10">
            <RefreshCw className="h-4 w-4" /> Refresh from database
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Stat icon={<Database className="h-5 w-5" />} label="Observations" value={initialObservations.length} tone="cyan" />
          <Stat icon={<Laptop className="h-5 w-5" />} label="Device labels" value={deviceGroups.length} tone="violet" />
          <Stat icon={<Fingerprint className="h-5 w-5" />} label="Browsers" value={browsers.length} tone="blue" />
          <Stat icon={<Globe2 className="h-5 w-5" />} label="Public IPs" value={uniqueIps} tone="amber" />
          <Stat icon={<ShieldCheck className="h-5 w-5" />} label="Private / VPN runs" value={`${privateRuns} / ${vpnRuns}`} tone="green" />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[.82fr_1.18fr]">
          <Panel>
            <PanelHeader icon={<Laptop className="h-5 w-5" />} title="Devices at a glance" subtitle="Groups use the manual research label, not an inferred identity." />
            {deviceGroups.length === 0 ? <Empty text="No observations have been captured yet." /> : (
              <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {deviceGroups.map(({ label, items }) => {
                  const groupBrowsers = Array.from(new Set(items.map((item) => item.fingerprint.browserFamily)));
                  const groupIps = new Set(items.map((item) => item.effectivePublicIp).filter((value) => value && value !== "Unknown"));
                  return (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                      <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-white">{label}</p><p className="mt-1 text-xs text-slate-500">Last seen {formatTimestamp(items[0].fingerprint.collectedAt)}</p></div><span className="rounded-full bg-cyan-400/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan-300">{items.length}</span></div>
                      <div className="mt-4 flex flex-wrap gap-1.5">{groupBrowsers.map((browser) => <Pill key={browser}>{browser}</Pill>)}</div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center"><MiniStat label="IPs" value={groupIps.size} /><MiniStat label="Private" value={items.filter((item) => item.browserMode === "private").length} /><MiniStat label="VPN on" value={items.filter((item) => item.vpnGroundTruth === "on").length} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHeader icon={<GitCompare className="h-5 w-5" />} title="Compare any two captures" subtitle="Cross-browser uses coarse device components; same-browser also evaluates canvas, WebGL, fonts, and capabilities." />
            <div className="p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <ObservationSelect label="Observation A" value={firstId} onChange={setFirstId} observations={initialObservations} />
                <ObservationSelect label="Observation B" value={secondId} onChange={setSecondId} observations={initialObservations} />
              </div>
              {deviceComparison && first && second ? (
                <div className="mt-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <ComparisonMetric label="Device similarity" value={`${deviceComparison.score}%`} detail={`${deviceComparison.confidence} confidence`} good={deviceComparison.score >= 86} />
                    <ComparisonMetric label="Same-browser score" value={browserComparison ? `${browserComparison.score}%` : "Cross-browser"} detail={browserComparison ? "Profile-aware model" : `${first.fingerprint.browserFamily} ↔ ${second.fingerprint.browserFamily}`} good={Boolean(browserComparison && browserComparison.score >= 86)} />
                    <ComparisonMetric label="Ground-truth labels" value={first.deviceLabel === second.deviceLabel ? "Same label" : "Different labels"} detail={`${first.deviceLabel} ↔ ${second.deviceLabel}`} good={first.deviceLabel === second.deviceLabel} />
                  </div>
                  <ComparisonBreakdown result={deviceComparison} />
                </div>
              ) : <Empty text="Capture at least one observation to compare." />}
            </div>
          </Panel>
        </section>

        <Panel className="mt-5">
          <PanelHeader icon={<Database className="h-5 w-5" />} title="All captured observations" subtitle={`Showing ${filtered.length} of ${initialObservations.length} database rows. Raw high-entropy values remain inside this controlled research interface.`} />
          <div className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-[1fr_190px_190px]">
            <label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search label, IP, browser, country, organization…" className="w-full rounded-xl border border-white/10 bg-[#081522] py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400/50" /></label>
            <FilterSelect value={browserFilter} onChange={setBrowserFilter} label="All browsers" options={browsers} />
            <FilterSelect value={modeFilter} onChange={setModeFilter} label="All modes" options={["normal", "private", "unknown"]} />
          </div>
          {filtered.length === 0 ? <Empty text="No observations match the selected filters." /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Device / time</th><th className="px-4 py-3">Browser</th><th className="px-4 py-3">Mode / VPN</th><th className="px-4 py-3">Network</th><th className="px-4 py-3">Device components</th><th className="px-5 py-3">Signatures</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((item) => (
                    <tr key={item.observationId} className="align-top hover:bg-white/[0.02]">
                      <td className="px-5 py-4"><p className="font-bold text-white">{item.deviceLabel}</p><p className="mt-1 text-xs text-slate-500">{formatTimestamp(item.fingerprint.collectedAt)}</p><p className="mt-1 font-mono text-[10px] text-slate-700">{item.observationId.slice(0, 12)}…</p></td>
                      <td className="px-4 py-4"><p className="font-semibold text-slate-200">{item.fingerprint.browserFamily} {item.fingerprint.browserMajor}</p><p className="mt-1 text-xs text-slate-500">{item.fingerprint.osFamily} · {item.fingerprint.platform}</p></td>
                      <td className="px-4 py-4"><div className="flex gap-1.5"><Pill>{item.browserMode}</Pill><Pill>{`VPN ${item.vpnGroundTruth}`}</Pill></div></td>
                      <td className="px-4 py-4"><p className="font-mono text-xs text-cyan-300">{item.effectivePublicIp}</p><p className="mt-1 max-w-[240px] text-xs text-slate-500">{item.fingerprint.geoIp ? `${item.fingerprint.geoIp.city}, ${item.fingerprint.geoIp.country} · ${item.fingerprint.geoIp.org}` : "GeoIP unavailable"}</p></td>
                      <td className="px-4 py-4 text-xs text-slate-400"><p>{item.fingerprint.hardwareBucket} CPU · {item.fingerprint.memoryBucket} RAM</p><p className="mt-1">{item.fingerprint.screen.width}×{item.fingerprint.screen.height} · {item.fingerprint.webgl.rendererFamily}</p><p className="mt-1">{item.fingerprint.fonts.length} fonts · {item.fingerprint.capabilities.length} capabilities</p></td>
                      <td className="px-5 py-4 font-mono text-[10px] text-slate-500"><p title={item.fingerprint.signatures.coarseDevice}>device {item.fingerprint.signatures.coarseDevice.slice(0, 14)}…</p><p className="mt-1" title={item.fingerprint.signatures.browser}>browser {item.fingerprint.signatures.browser.slice(0, 14)}…</p></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <footer className="mt-6 border-t border-white/10 py-5 text-xs text-slate-600">Protect this page with authentication before any public deployment. It exposes research telemetry by design.</footer>
      </div>
    </main>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0b1827]/90 shadow-2xl shadow-black/10 ${className}`}>{children}</section>; }
function PanelHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) { return <div className="flex items-start gap-3 border-b border-white/10 p-5"><div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">{icon}</div><div><h2 className="font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p></div></div>; }

const statTones = { cyan: "text-cyan-300 bg-cyan-400/10", violet: "text-violet-300 bg-violet-400/10", blue: "text-blue-300 bg-blue-400/10", amber: "text-amber-300 bg-amber-400/10", green: "text-emerald-300 bg-emerald-400/10" };
function Stat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string | number; tone: keyof typeof statTones }) { return <div className="rounded-2xl border border-white/10 bg-[#0b1827] p-4"><div className={`inline-flex rounded-xl p-2 ${statTones[tone]}`}>{icon}</div><p className="mt-4 text-2xl font-black text-white">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>; }
function MiniStat({ label, value }: { label: string; value: number }) { return <div className="rounded-lg bg-black/10 p-2"><p className="font-mono text-sm font-bold text-slate-200">{value}</p><p className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-600">{label}</p></div>; }
function Pill({ children }: { children: ReactNode }) { return <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{children}</span>; }
function Empty({ text }: { text: string }) { return <div className="p-8 text-center text-sm text-slate-500">{text}</div>; }

function ObservationSelect({ label, value, onChange, observations }: { label: string; value: string; onChange: (value: string) => void; observations: ResearchObservation[] }) {
  return <label className="space-y-2"><span className="text-xs font-semibold text-slate-400">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#081522] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400/50">{observations.map((item) => <option key={item.observationId} value={item.observationId}>{item.deviceLabel} · {item.fingerprint.browserFamily} · {item.browserMode} · {formatTimestamp(item.fingerprint.collectedAt)}</option>)}</select></label>;
}

function formatTimestamp(value: string) {
  return `${new Date(value).toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

function FilterSelect({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: string[] }) {
  return <label className="relative"><Filter className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-600" /><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-[#081522] py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400/50"><option value="all">{label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function ComparisonMetric({ label, value, detail, good }: { label: string; value: string; detail: string; good: boolean }) { return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[10px] uppercase tracking-wider text-slate-600">{label}</p><p className={`mt-2 font-mono text-xl font-black ${good ? "text-emerald-300" : "text-amber-300"}`}>{value}</p><p className="mt-1 truncate text-xs text-slate-500" title={detail}>{detail}</p></div>; }

function ComparisonBreakdown({ result }: { result: SimilarityResult }) {
  return <div className="mt-5 overflow-hidden rounded-xl border border-white/10"><div className="grid grid-cols-[1fr_72px_80px] bg-white/[0.03] px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-600"><span>Component</span><span>Weight</span><span className="text-right">Match</span></div><div className="divide-y divide-white/5">{result.components.map((item) => <div key={item.name} className="grid grid-cols-[1fr_72px_80px] items-center px-4 py-2.5 text-xs"><div className="min-w-0"><p className="text-slate-300">{item.name}</p><p className="mt-0.5 truncate font-mono text-[9px] text-slate-700">{item.current} ↔ {item.previous}</p></div><span className="font-mono text-slate-600">{item.weight}</span><span className={`text-right font-mono font-bold ${item.available && item.similarity >= .8 ? "text-emerald-300" : item.available ? "text-amber-300" : "text-slate-700"}`}>{item.available ? `${Math.round(item.similarity * 100)}%` : "n/a"}</span></div>)}</div></div>;
}
