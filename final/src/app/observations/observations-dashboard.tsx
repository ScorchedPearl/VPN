"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ArrowLeft, BarChart3, Database, GitCompare, Laptop, Loader2, Lock, RefreshCw, Search, Table2 } from "lucide-react";
import type { ResearchObservation } from "@/utils/fingerprint";
import type { ModelEvaluation } from "@/utils/evaluation";
import type { ArchivedObservation } from "@/utils/research-store";
import { linkObservations, type DeviceCluster, type LinkageEvaluation, type LinkageModel, type LinkageResult } from "@/utils/linkage";
import { Card, Disclosure, DivergingBar, Empty, Pill, Row, inputClass, toneText, type Tone } from "@/components/ui";

export default function ObservationsDashboard({ initialObservations, legacyObservations, evaluation, linkageModel, linkageEvaluation, clusters, archivedObservations, archiveEnabled }: {
  initialObservations: ResearchObservation[];
  legacyObservations: ResearchObservation[];
  evaluation: ModelEvaluation;
  linkageModel: LinkageModel;
  linkageEvaluation: LinkageEvaluation;
  clusters: DeviceCluster[];
  archivedObservations: ArchivedObservation[];
  archiveEnabled: boolean;
}) {
  const [search, setSearch] = useState("");
  const [firstId, setFirstId] = useState(initialObservations[0]?.observationId || "");
  const [secondId, setSecondId] = useState(initialObservations[1]?.observationId || initialObservations[0]?.observationId || "");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return initialObservations;
    return initialObservations.filter((item) => [
      item.deviceLabel, item.fingerprint.browserFamily, item.fingerprint.osFamily, item.effectivePublicIp,
      item.serverNetwork?.geoIp?.country, item.serverNetwork?.geoIp?.org, item.vpnGroundTruth,
    ].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [initialObservations, search]);

  const labels = new Set(initialObservations.map((item) => item.deviceLabel)).size;
  const browsers = new Set(initialObservations.map((item) => item.fingerprint.browserFamily)).size;
  const ips = new Set(initialObservations.map((item) => item.effectivePublicIp).filter((value) => value && value !== "Unknown")).size;
  const overall = linkageEvaluation.metrics.find((item) => item.context === "all");
  const first = initialObservations.find((item) => item.observationId === firstId) || null;
  const second = initialObservations.find((item) => item.observationId === secondId) || null;
  const comparison = first && second && first !== second ? linkObservations(first, second, linkageModel) : null;

  return (
    <main className="min-h-screen bg-canvas">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="font-serif text-lg text-ink">Device Linkage Lab</Link>
          <div className="flex items-center gap-1 text-sm">
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-ink hover:bg-surface-2"><ArrowLeft className="h-3.5 w-3.5" /> Scanner</Link>
            <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-ink hover:bg-surface-2"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-4 px-4 pb-16 pt-10 sm:px-6">
        <section className="mb-4">
          <h1 className="font-serif text-4xl text-ink">Saved data</h1>
          <p className="mt-2 text-muted">Every scan, how well the model links them, and the devices it infers on its own.</p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Scans" value={initialObservations.length} />
          <Stat label="Named devices" value={labels} />
          <Stat label="Browsers" value={browsers} />
          <Stat label="Public IPs" value={ips} />
        </div>

        <Card className="p-5">
          <p className="text-sm text-muted">How well does linking work on your data?</p>
          {overall && overall.positives > 0 && overall.negatives > 0 ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Headline value={formatRate(overall.rocAuc)} label="Ranking quality (ROC AUC)" tone={toneFor(overall.rocAuc, 0.95, 0.8)} />
              <Headline value={formatRate(linkageEvaluation.rank1Accuracy)} label={`Top match correct (${linkageEvaluation.rank1Queries} scans)`} tone={toneFor(linkageEvaluation.rank1Accuracy, 0.9, 0.7)} />
              <Headline value={formatRate(overall.equalErrorRate)} label="Equal error rate (lower is better)" tone={overall.equalErrorRate === null ? "neutral" : overall.equalErrorRate <= 0.05 ? "good" : overall.equalErrorRate <= 0.15 ? "warn" : "bad"} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-2">Not enough labelled data yet. Scan at least two devices, each twice, using their names consistently.</p>
          )}
        </Card>

        <p className="px-1 text-xs leading-5 text-muted">
          These scores trust the device names you typed. If one device was saved under two names, its correct links count as mistakes,
          and two devices sharing a name count as missed links. “Devices the model found on its own” shows where the names disagree with the model.
        </p>

        <Disclosure title="Accuracy by situation" hint="Same browser, same engine, different browsers" icon={<BarChart3 className="h-4 w-4" />}>
          <EvaluationDetails evaluation={linkageEvaluation} model={linkageModel} />
        </Disclosure>

        <Disclosure title="Devices the model found on its own" hint={`${clusters.length} inferred device${clusters.length === 1 ? "" : "s"} vs ${labels} names you gave`} icon={<Laptop className="h-4 w-4" />}>
          {clusters.length === 0 ? <Empty>No scans yet.</Empty> : (
            <div className="divide-y divide-line">
              {clusters.slice(0, 40).map((cluster) => (
                <div key={cluster.clusterId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{cluster.labels.join(" + ")} <span className="font-normal text-muted">· {cluster.observationIds.length} scan{cluster.observationIds.length === 1 ? "" : "s"}</span></p>
                    <p className="mt-0.5 text-xs text-muted">{cluster.browsers.join(", ")} · {cluster.networks.length || 0} network{cluster.networks.length === 1 ? "" : "s"}</p>
                  </div>
                  <Pill tone={cluster.purity === 1 ? "good" : "warn"}>{cluster.purity === 1 ? "matches your names" : `${Math.round(cluster.purity * 100)}% pure`}</Pill>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-muted">Scans are joined when the model is at least 90% sure they share a device. Mixed names mean the model merged different devices, or one device was given two names.</p>
        </Disclosure>

        <Disclosure title="Compare two scans" hint="Pick any pair to see the reasoning" icon={<GitCompare className="h-4 w-4" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ScanSelect value={firstId} onChange={setFirstId} observations={initialObservations} />
            <ScanSelect value={secondId} onChange={setSecondId} observations={initialObservations} />
          </div>
          {comparison && first && second ? <ComparisonView result={comparison} sameName={first.deviceLabel === second.deviceLabel} /> : <Empty>Choose two different scans.</Empty>}
        </Disclosure>

        <Disclosure title="All scans" hint={`${initialObservations.length} rows`} icon={<Table2 className="h-4 w-4" />}>
          <label className="relative mb-3 block">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, browser, IP, country…" className={`${inputClass} pl-9`} />
          </label>
          {filtered.length === 0 ? <Empty>Nothing matches.</Empty> : (
            <div className="divide-y divide-line">
              {filtered.map((item) => <ScanRow key={item.observationId} item={item} />)}
            </div>
          )}
        </Disclosure>

        <Disclosure title="VPN model accuracy" hint="From scans where you recorded whether a VPN was on" icon={<BarChart3 className="h-4 w-4" />}>
          <Row label="Labelled scans" value={evaluation.labelled} />
          <Row label="Precision at 50%" value={formatRate(evaluation.precision)} />
          <Row label="Recall at 50%" value={formatRate(evaluation.recall)} />
          <Row label="Specificity" value={formatRate(evaluation.specificity)} />
          <Row label="PR-AUC" value={formatRate(evaluation.prAuc)} />
          <Row label="Brier score (lower is better)" value={evaluation.brierScore === null ? "n/a" : evaluation.brierScore.toFixed(3)} />
        </Disclosure>

        <ArchivedBatches rows={archivedObservations} />

        <FreshStart enabled={archiveEnabled} activeCount={initialObservations.length} />

        {legacyObservations.length > 0 && (
          <Disclosure title="Original prototype data" hint={`${legacyObservations.length} read-only rows`} icon={<Database className="h-4 w-4" />}>
            <div className="divide-y divide-line">
              {legacyObservations.map((item) => (
                <p key={item.observationId} className="py-2 text-sm text-ink-2"><span className="font-medium text-ink">{item.deviceLabel}</span> · {item.fingerprint.browserFamily} · {item.browserMode} · {item.vpnGroundTruth} · <span className="font-mono text-xs">{item.effectivePublicIp}</span></p>
              ))}
            </div>
          </Disclosure>
        )}

      </div>
    </main>
  );
}

function ScanRow({ item }: { item: ResearchObservation }) {
  return (
    <details className="group py-2.5">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-ink"><span className="font-medium">{item.deviceLabel}</span> <span className="text-muted">· {item.fingerprint.browserFamily}{item.browserMode === "private" ? " (private)" : ""} · {formatTimestamp(item.serverReceivedAt || item.fingerprint.collectedAt)}</span></span>
        <span className="flex gap-1.5">
          {item.vpnGroundTruth !== "unknown" && <Pill tone={["none", "off"].includes(item.vpnGroundTruth) ? "neutral" : "accent"}>{item.vpnGroundTruth}</Pill>}
          {item.riskAssessment && <Pill tone={item.riskAssessment.band === "high" ? "bad" : item.riskAssessment.band === "elevated" ? "warn" : "neutral"}>risk {item.riskAssessment.score}%</Pill>}
        </span>
      </summary>
      <div className="mt-2 grid gap-x-8 rounded-xl bg-surface-2/50 px-4 py-2 sm:grid-cols-2">
        <Row label="System" value={`${item.fingerprint.osFamily} · ${item.fingerprint.browserFamily} ${item.fingerprint.browserMajor}`} />
        <Row label="IP" value={item.effectivePublicIp} mono />
        <Row label="Location" value={item.serverNetwork?.geoIp ? `${item.serverNetwork.geoIp.city}, ${item.serverNetwork.geoIp.country}` : "unavailable"} />
        <Row label="Network" value={item.serverNetwork?.geoIp?.org || "unavailable"} />
        <Row label="Screen / GPU" value={`${item.fingerprint.screen.width}×${item.fingerprint.screen.height} · ${item.fingerprint.modern?.gpu.rendererTokens.join(" ") || item.fingerprint.webgl.rendererFamily}`} />
        <Row label="Schema" value={item.fingerprint.schemaVersion} />
      </div>
    </details>
  );
}

function ArchivedBatches({ rows }: { rows: ArchivedObservation[] }) {
  const batches = useMemo(() => {
    const groups = new Map<string, ArchivedObservation[]>();
    for (const row of rows) groups.set(row.archiveBatchId, [...(groups.get(row.archiveBatchId) || []), row]);
    return Array.from(groups.entries()).map(([id, items]) => ({ id, archivedAt: items[0].archivedAt, items }));
  }, [rows]);
  return (
    <Disclosure title="Archived scans" hint={rows.length ? `${rows.length} scans in ${batches.length} archived set${batches.length === 1 ? "" : "s"} · view only, never compared` : "Nothing archived yet"} icon={<Archive className="h-4 w-4" />}>
      {batches.length === 0 ? <Empty>When you start a fresh comparison set, earlier scans appear here.</Empty> : (
        <div className="space-y-3">
          {batches.map((batch) => (
            <details key={batch.id} className="rounded-xl border border-line px-4 py-2">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 py-1 text-sm">
                <span className="text-ink">Archived {formatTimestamp(batch.archivedAt)}</span>
                <Pill>{batch.items.length} scans · {new Set(batch.items.map((item) => item.deviceLabel)).size} devices</Pill>
              </summary>
              <div className="divide-y divide-line">{batch.items.map((item) => <ScanRow key={item.observationId} item={item} />)}</div>
            </details>
          ))}
        </div>
      )}
    </Disclosure>
  );
}

function FreshStart({ enabled, activeCount }: { enabled: boolean; activeCount: number }) {
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: Tone; text: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!password || !confirmed) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/archive", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, confirm: true }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string; archived?: number; retryAfterSeconds?: number };
      if (response.ok) {
        setMessage({ tone: "good", text: `Archived ${body.archived ?? 0} scans. New scans now start a fresh comparison set.` });
        setPassword("");
        window.setTimeout(() => window.location.reload(), 1_500);
      } else if (response.status === 429) {
        setMessage({ tone: "bad", text: `Too many attempts. Try again in about ${formatWait(body.retryAfterSeconds ?? 900)}.` });
      } else {
        setMessage({ tone: "bad", text: body.error || "Request refused." });
      }
    } catch {
      setMessage({ tone: "bad", text: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Disclosure title="Start a fresh comparison set" hint="Password protected · moves current scans to the archive" icon={<Lock className="h-4 w-4" />}>
      {!enabled ? <Empty>Disabled: set ARCHIVE_PASSWORD_HASH in the server environment (run npm run hash-password).</Empty> : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm leading-6 text-ink-2">
            All {activeCount} current scans move to <span className="text-ink">Archived scans</span>. They stay visible there, but new scans will no longer be compared with them.
            Nothing is deleted.
          </p>
          <label className="block space-y-1.5">
            <span className="block text-sm font-medium text-ink">Admin password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" maxLength={200} className={inputClass} />
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
            <span className="text-ink-2">I understand that current scans will stop being used for matching.</span>
          </label>
          <button type="submit" disabled={busy || !password || !confirmed} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />} Archive and start fresh
          </button>
          {message && <p className={`rounded-xl px-4 py-3 text-sm ${message.tone === "good" ? "bg-good-soft text-good" : "bg-bad-soft text-bad"}`}>{message.text}</p>}
          <p className="text-xs leading-5 text-muted">Five wrong passwords lock this action for 15 minutes, doubling each time up to 24 hours.</p>
        </form>
      )}
    </Disclosure>
  );
}

function formatWait(seconds: number): string {
  if (seconds < 90) return `${seconds} seconds`;
  if (seconds < 5_400) return `${Math.ceil(seconds / 60)} minutes`;
  return `${Math.ceil(seconds / 3_600)} hours`;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="px-4 py-3">
      <p className="font-serif text-3xl text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </Card>
  );
}

function Headline({ value, label, tone }: { value: string; label: string; tone: Tone }) {
  return (
    <div>
      <p className={`font-serif text-3xl ${toneText[tone]}`}>{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

function ScanSelect({ value, onChange, observations }: { value: string; onChange: (value: string) => void; observations: ResearchObservation[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
      {observations.map((item) => <option key={item.observationId} value={item.observationId}>{item.deviceLabel} · {item.fingerprint.browserFamily} · {formatTimestamp(item.serverReceivedAt || item.fingerprint.collectedAt)}</option>)}
    </select>
  );
}

function ComparisonView({ result, sameName }: { result: LinkageResult; sameName: boolean }) {
  const used = result.features.filter((item) => item.status === "used").sort((a, b) => Math.abs(b.logLikelihoodRatio) - Math.abs(a.logLikelihoodRatio));
  const max = Math.max(1, ...result.families.map((item) => Math.abs(item.capped)));
  const tone: Tone = result.verdict === "same-device" ? "good" : result.verdict === "probably-same" ? "accent" : result.verdict === "different-device" ? "neutral" : "warn";
  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className={`font-serif text-3xl ${toneText[tone]}`}>{formatProbability(result.posterior)}</p>
        <p className="text-sm text-muted">same-device likelihood · {result.context.replace("-", " ")} · you named them {sameName ? "the same" : "differently"}</p>
      </div>
      <div className="space-y-2">
        {result.families.map((item) => (
          <div key={item.family} className="grid grid-cols-[minmax(120px,180px)_1fr_48px] items-center gap-3 text-sm">
            <span className="truncate text-ink-2">{item.label}</span>
            <DivergingBar value={item.capped} max={max} />
            <span className={`text-right font-mono text-xs ${item.capped >= 0 ? "text-good" : "text-bad"}`}>{item.capped >= 0 ? "+" : ""}{item.capped.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <details>
        <summary className="cursor-pointer text-sm font-medium text-accent-strong">Show the {used.length} signals compared</summary>
        <div className="mt-2 max-h-80 overflow-y-auto rounded-xl border border-line">
          {used.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-line px-3 py-2 text-xs last:border-0">
              <div className="min-w-0"><p className="text-ink">{item.label} <span className="text-muted">· {item.bin}</span></p><p className="truncate font-mono text-[11px] text-muted">{item.current} ↔ {item.previous}</p></div>
              <span className={`font-mono ${item.logLikelihoodRatio >= 0 ? "text-good" : "text-bad"}`}>{item.logLikelihoodRatio >= 0 ? "+" : ""}{item.logLikelihoodRatio.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function EvaluationDetails({ evaluation, model }: { evaluation: LinkageEvaluation; model: LinkageModel }) {
  const totalSame = Object.values(model.samePairs).reduce((sum, value) => sum + value, 0);
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-xs text-muted"><tr className="border-b border-line"><th className="py-2 pr-3 font-medium">Situation</th><th className="px-3 py-2 font-medium">Pairs (same / different)</th><th className="px-3 py-2 font-medium">ROC AUC</th><th className="px-3 py-2 font-medium">Equal error</th><th className="px-3 py-2 font-medium">Found at 1% false alarms</th></tr></thead>
          <tbody>
            {evaluation.metrics.map((item) => (
              <tr key={item.context} className="border-b border-line last:border-0">
                <td className="py-2 pr-3 text-ink">{item.context === "all" ? "All pairs" : item.context.replace("-", " ")}</td>
                <td className="px-3 py-2 font-mono text-xs">{item.positives} / {item.negatives}</td>
                <td className="px-3 py-2 font-mono text-xs">{formatRate(item.rocAuc)}</td>
                <td className="px-3 py-2 font-mono text-xs">{formatRate(item.equalErrorRate)}</td>
                <td className="px-3 py-2 font-mono text-xs">{formatRate(item.tprAtFpr1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {evaluation.familyImportance.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Which signal groups separate devices best</p>
          {evaluation.familyImportance.map((item) => (
            <Row key={item.family} label={item.label} value={`${item.separation.toFixed(2)} (same ${item.meanGenuine.toFixed(1)} vs different ${item.meanImpostor.toFixed(1)})`} />
          ))}
        </div>
      )}
      <p className="text-xs leading-5 text-muted">
        {evaluation.note} {evaluation.pairsScored} pairs from {evaluation.observations} scans{evaluation.sampled ? " (different-device pairs sampled)" : ""}.
        Training data: {totalSame} same-device and {model.differentPairs} different-device pairs; {model.calibration ? "calibrated" : "not yet calibrated"}.
      </p>
    </div>
  );
}

function toneFor(value: number | null, good: number, ok: number): Tone {
  if (value === null) return "neutral";
  return value >= good ? "good" : value >= ok ? "warn" : "bad";
}

function formatRate(value: number | null): string { return value === null ? "n/a" : `${(value * 100).toFixed(1)}%`; }
function formatProbability(value: number): string { return value >= 0.999 ? ">99.9%" : value < 0.001 ? "<0.1%" : `${(value * 100).toFixed(1)}%`; }
// Fixed locale and time zone so server-rendered HTML matches the browser.
const TIMESTAMP_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
function formatTimestamp(value: string): string {
  return `${TIMESTAMP_FORMAT.format(new Date(value))} UTC`;
}
