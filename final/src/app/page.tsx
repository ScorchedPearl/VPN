"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Fingerprint,
  Globe2,
  History,
  ListChecks,
  Loader2,
  Network,
  ScanSearch,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import {
  generateClientFingerprint,
  type BrowserMode,
  type FingerprintData,
  type ObservationSubmission,
  type ResearchObservation,
  type VpnGroundTruth,
} from "@/utils/fingerprint";
import { collectConsentedLocation, collectNetworkPathProbes, measureClientLatency, type ServerNetworkData } from "@/utils/network";
import { startPointerObserver } from "@/utils/modern-signals";
import type { ObservationMatch } from "@/utils/similarity";
import type { RiskAssessment } from "@/utils/risk";
import type { LinkageResult } from "@/utils/linkage";
import type { LinkedHistory } from "@/utils/linkage-service";
import { Card, Disclosure, DivergingBar, Empty, Field, Pill, Row, Toggle, inputClass, toneText, type Tone } from "@/components/ui";

interface LinkageModelSummary {
  version: string;
  observations: number;
  deviceLabels: number;
  samePairs: Record<string, number>;
  differentPairs: number;
  prior: number;
  calibrated: boolean;
}

interface ObservationResponse {
  observation: ResearchObservation;
  matches: ObservationMatch[];
  risk: RiskAssessment;
  count: number;
  legacyCount?: number;
  backend: "postgresql" | "local-file";
  linkedHistory: LinkedHistory;
  linkageModel: LinkageModelSummary;
}

const DEVICE_SLOTS = ["Mobile 1", "Mobile 2", "Laptop 1", "Laptop 2", "Desktop 1", "Desktop 2", "iPad 1", "iPad 2"];
const PROFILE_KEY = "linkage-lab-profile";

/** A sensible first guess from the user agent; the user can always change it. */
function guessDeviceSlot(): string {
  const agent = navigator.userAgent;
  if (/iPad/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)) return "iPad 1";
  if (/Android|iPhone|Mobile/.test(agent)) return "Mobile 1";
  return "Laptop 1";
}

interface ScanResult {
  fingerprint: FingerprintData;
  server: ServerNetworkData;
  matches: ObservationMatch[];
  risk: RiskAssessment;
  history: LinkedHistory;
  model: LinkageModelSummary;
  latency: ResearchObservation["clientLatency"];
}

export default function Home() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [storeCount, setStoreCount] = useState(0);
  const [storeBackend, setStoreBackend] = useState<"checking" | "postgresql" | "local-file" | "offline">("checking");
  const [storeNotice, setStoreNotice] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [personName, setPersonName] = useState("");
  const [deviceSlot, setDeviceSlot] = useState("Laptop 1");
  const deviceLabel = personName.trim() ? `${personName.trim()} - ${deviceSlot}` : "";
  const [browserMode, setBrowserMode] = useState<BrowserMode>("normal");
  const [vpnGroundTruth, setVpnGroundTruth] = useState<VpnGroundTruth>("unknown");
  const [providerCode, setProviderCode] = useState("");
  const [vpnProtocol, setVpnProtocol] = useState("");
  const [exitCountry, setExitCountry] = useState("");
  const [highEntropyResearch, setHighEntropyResearch] = useState(true);
  const [hardwareTimingProbes, setHardwareTimingProbes] = useState(true);
  const [collectLocation, setCollectLocation] = useState(true);
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);

  useEffect(() => startPointerObserver(), []);

  // Remember who is scanning and on which device, so repeat scans are one click.
  useEffect(() => {
    let saved: { name?: string; device?: string } = {};
    try {
      saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    } catch {
      // storage unavailable (private mode, blocked site data)
    }
    // Browser storage is only readable after mount; reading it during render
    // would make the server HTML differ from the client.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved.name) setPersonName(saved.name);
    setDeviceSlot(saved.device && DEVICE_SLOTS.includes(saved.device) ? saved.device : guessDeviceSlot());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    fetch("/api/observations", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Database unavailable");
        setStoreCount(Number(data.count) || 0);
        setStoreBackend(data.backend === "postgresql" || data.backend === "local-file" ? data.backend : "offline");
        setStoreNotice("");
      })
      .catch((reason) => {
        setStoreBackend("offline");
        setStoreNotice(reason instanceof Error ? reason.message : "Database unavailable");
      });
  }, []);

  async function runAnalysis() {
    if (!personName.trim()) {
      setError("Please enter your name first.");
      return;
    }
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: personName.trim(), device: deviceSlot }));
    } catch {
      // remembering is a convenience only
    }
    if (!consentAcknowledged) {
      setError("Please tick the consent box before scanning.");
      return;
    }

    setIsScanning(true);
    setError("");
    setResult(null);

    try {
      const networkResponse = await fetch("/api/fingerprint", { cache: "no-store" });
      if (!networkResponse.ok) throw new Error("Could not read the network observation from the server.");
      const networkResult = await networkResponse.json() as ServerNetworkData;
      // Latency first, on an idle page: GPU timing probes would inflate it.
      const latency = await measureClientLatency();
      const [clientResult, pathProbes, deviceLocation] = await Promise.all([
        generateClientFingerprint({ stunUrl: networkResult.probeConfiguration?.stunUrl, highEntropyResearch, hardwareTimingProbes }),
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
        hardwareTimingProbes,
        consentAcknowledged,
        clientLatency: latency,
        studyId: "vpn-fingerprint-pilot",
        groundTruthDetails: { providerCode, protocol: vpnProtocol, exitCountry },
        scanChallenge: networkResult.scanChallenge || "",
      };

      const observationResponse = await fetch("/api/observations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submission),
      });
      const responseBody: unknown = await observationResponse.json().catch(() => null);
      if (!observationResponse.ok) {
        const detail = responseBody && typeof responseBody === "object" && "error" in responseBody && typeof responseBody.error === "string"
          ? responseBody.error
          : "Could not save the observation.";
        throw new Error(detail);
      }
      const saved = responseBody as ObservationResponse;
      setResult({
        fingerprint: clientResult,
        server: saved.observation.serverNetwork || networkResult,
        matches: saved.matches,
        risk: saved.risk,
        history: saved.linkedHistory,
        model: saved.linkageModel,
        latency,
      });
      setStoreCount(saved.count);
      setStoreBackend(saved.backend);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The scan failed.");
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <main className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <span className="font-serif text-lg text-ink">Device Linkage Lab</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:inline" title={storeNotice || undefined}>
              {storeBackend === "checking" ? "Connecting…" : storeBackend === "offline" ? "Storage offline" : `${storeCount} saved scan${storeCount === 1 ? "" : "s"}`}
            </span>
            <Link href="/observations" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-ink transition hover:bg-surface-2">
              Saved data <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
        <section className="mb-8 max-w-2xl">
          <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">Is this the same device?</h1>
          <p className="mt-3 text-base leading-7 text-muted">
            Scan this browser, then scan again later, from another browser, a private window, or with a VPN on.
            The lab tells you whether it is the same physical device, how sure it is, and why.
          </p>
        </section>

        <Card className="p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <Field label="Your name">
              <input value={personName} onChange={(event) => setPersonName(event.target.value)} maxLength={40} className={inputClass} placeholder="e.g. Vishwas" autoComplete="given-name" />
            </Field>
            <Field label="Device">
              <select value={deviceSlot} onChange={(event) => setDeviceSlot(event.target.value)} className={inputClass}>
                {DEVICE_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </Field>
            <Field label="Window">
              <select value={browserMode} onChange={(event) => setBrowserMode(event.target.value as BrowserMode)} className={inputClass}>
                <option value="normal">Normal window</option>
                <option value="private">Private / incognito</option>
                <option value="unknown">Not sure</option>
              </select>
            </Field>
            <Field label="VPN / proxy">
              <select value={vpnGroundTruth} onChange={(event) => setVpnGroundTruth(event.target.value as VpnGroundTruth)} className={inputClass}>
                <option value="unknown">Not sure</option>
                <option value="none">No VPN</option>
                <option value="consumer-vpn">Consumer VPN</option>
                <option value="corporate-vpn">Work VPN</option>
                <option value="split-tunnel">Split-tunnel VPN</option>
                <option value="tor">Tor</option>
                <option value="public-proxy">Public proxy</option>
                <option value="residential-proxy">Residential proxy</option>
                <option value="private-relay">iCloud Private Relay</option>
              </select>
            </Field>
          </div>
          <p className="mt-3 text-xs text-muted">Pick the same device every time you scan from it. {deviceLabel && <>Saved as <span className="text-ink-2">{deviceLabel}</span>.</>}</p>

          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
              <Settings2 className="h-4 w-4" /> More options
              <span className="text-xs group-open:hidden">(research probes, VPN details)</span>
            </summary>
            <div className="mt-3 grid gap-4 rounded-xl bg-surface-2/50 p-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Toggle checked={hardwareTimingProbes} onChange={setHardwareTimingProbes} title="GPU timing probes" detail="About a second of GPU micro-benchmarks (DrawnApart, WebGPU scheduling). Helps tell identical machines apart." />
                <Toggle checked={highEntropyResearch} onChange={setHighEntropyResearch} title="Extended research suite" detail="NDSS 2017 rendering tasks and the local speech-voice list. Stores hashes, never pixels." />
                <Toggle checked={collectLocation} onChange={setCollectLocation} title="Device location" detail="Asks the browser for your location to compare with the IP location." />
              </div>
              <div className="grid gap-3">
                <Field label="VPN provider (optional)"><input value={providerCode} onChange={(event) => setProviderCode(event.target.value)} maxLength={60} className={inputClass} placeholder="provider-a" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Protocol"><input value={vpnProtocol} onChange={(event) => setVpnProtocol(event.target.value)} maxLength={40} className={inputClass} placeholder="WireGuard" /></Field>
                  <Field label="Exit country"><input value={exitCountry} onChange={(event) => setExitCountry(event.target.value.toUpperCase())} maxLength={2} className={`${inputClass} uppercase`} placeholder="IN" /></Field>
                </div>
              </div>
            </div>
          </details>

          <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={consentAcknowledged} onChange={(event) => setConsentAcknowledged(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]" />
              <span className="text-ink-2">I agree to store this browser&apos;s fingerprint, network details and labels for research.</span>
            </label>
            <button
              type="button"
              onClick={runAnalysis}
              disabled={isScanning}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-white shadow-sm transition hover:bg-accent-strong disabled:cursor-wait disabled:opacity-70"
            >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              {isScanning ? "Scanning…" : "Scan this device"}
            </button>
          </div>
          {error && <p className="mt-4 rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
          {isScanning && <p className="mt-4 text-sm text-muted">Measuring latency, rendering tests and GPU timing. This takes about 3–5 seconds.</p>}
        </Card>

        {!result && !isScanning && (
          <div className="mt-6">
            <Disclosure title="How to run a good test" hint="Three scans are enough to see it working." icon={<BookOpen className="h-4 w-4" />}>
              <ol className="space-y-3 text-sm leading-6 text-ink-2">
                <li><span className="font-medium text-ink">1. Baseline.</span> Enter your name, pick the device (for example Laptop 1), and scan in your usual browser with “No VPN”.</li>
                <li><span className="font-medium text-ink">2. Change the network.</span> Turn a VPN on, choose its type, and scan again with the same device picked.</li>
                <li><span className="font-medium text-ink">3. Change the browser.</span> Open this page in Firefox, Safari or a private window and scan with the same device picked. On your phone or a second laptop, pick Mobile 1 or Laptop 2 to check that it is <em>not</em> linked.</li>
              </ol>
            </Disclosure>
          </div>
        )}

        {result && <Results result={result} deviceLabel={deviceLabel.trim()} />}

      </div>
    </main>
  );
}

/* ------------------------------------------------------------------------ */
/* Results                                                                   */
/* ------------------------------------------------------------------------ */

function Results({ result, deviceLabel }: { result: ScanResult; deviceLabel: string }) {
  const { fingerprint, server, matches, risk, history, model, latency } = result;
  const best = matches[0] ?? null;
  const linkage = best?.linkage ?? null;
  const device = deviceAnswer(best, history);
  const network = networkAnswer(best, server);
  const vpn = vpnAnswer(risk);

  return (
    <div className="mt-8 space-y-4">
      <h2 className="font-serif text-2xl text-ink">Results</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <AnswerCard icon={<Fingerprint className="h-4 w-4" />} question="Seen this device before?" {...device} />
        <AnswerCard icon={<Globe2 className="h-4 w-4" />} question="Network" {...network} />
        <AnswerCard icon={<ShieldCheck className="h-4 w-4" />} question="VPN or proxy signs?" {...vpn} />
      </div>

      <p className="pt-2 text-sm text-muted">Open any section below for the details.</p>

      {linkage && (
        <Disclosure title="Why we think so" hint={`${linkage.usedFeatures} signals compared · ${contextLabel(linkage.context)}`} icon={<ListChecks className="h-4 w-4" />} badge={<Pill tone={verdictTone(linkage.verdict)}>{formatPosterior(linkage.posterior)}</Pill>}>
          <LinkageExplanation linkage={linkage} />
        </Disclosure>
      )}

      <Disclosure title="Other possible matches" hint={matches.length ? `${matches.length} earlier scans ranked by likelihood` : "No earlier scans yet"} icon={<History className="h-4 w-4" />}>
        {matches.length === 0 ? <Empty>This is the first scan. Scan again to compare.</Empty> : <MatchList matches={matches} deviceLabel={deviceLabel} />}
        <p className="mt-3 text-xs leading-5 text-muted">
          Model trained on {model.observations} saved scans from {model.deviceLabels} named devices · starting belief {formatPosterior(model.prior)} ·
          {model.calibrated ? " calibrated on your labelled data." : " not yet calibrated (needs 25+ same-device and different-device pairs)."}
        </p>
      </Disclosure>

      <Disclosure title="Where this device was seen before" hint={history.linkedObservations ? `${history.linkedObservations} linked scans` : "No confident links yet"} icon={<Network className="h-4 w-4" />}>
        {history.linkedObservations === 0 ? (
          <Empty>No earlier scan is at least 90% likely to be this device.</Empty>
        ) : (
          <div>
            <Row label="First seen" value={history.firstSeen ? new Date(history.firstSeen).toLocaleString() : "unknown"} />
            <Row label="Browsers" value={history.browsers.join(", ") || "unknown"} />
            <Row label="Public IPs" value={history.publicIps.join(", ") || "unknown"} mono />
            <Row label="Networks (ASN)" value={history.asns.join(", ") || "unknown"} />
            <Row label="Countries" value={history.countries.join(", ") || "unknown"} />
            <Row label="Names used" value={history.labels.join(", ")} />
          </div>
        )}
      </Disclosure>

      <Disclosure title="VPN & network evidence" hint={`${risk.evidence.length} signal${risk.evidence.length === 1 ? "" : "s"} · ${Math.round(risk.completeness * 100)}% of checks available`} icon={<ShieldCheck className="h-4 w-4" />}>
        <RiskDetails risk={risk} server={server} fingerprint={fingerprint} latency={latency} />
      </Disclosure>

      <Disclosure title="What this browser revealed" hint="Hardware, OS, rendering and privacy-protection details" icon={<Cpu className="h-4 w-4" />}>
        <SignalDetails fingerprint={fingerprint} />
      </Disclosure>
    </div>
  );
}

function AnswerCard({ icon, question, headline, detail, tone }: { icon: ReactNode; question: string; headline: string; detail: string; tone: Tone }) {
  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-sm text-muted"><span className="text-accent">{icon}</span>{question}</p>
      <p className={`mt-3 font-serif text-2xl leading-snug ${toneText[tone]}`}>{headline}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </Card>
  );
}

function deviceAnswer(best: ObservationMatch | null, history: LinkedHistory): { headline: string; detail: string; tone: Tone } {
  const linkage = best?.linkage;
  if (!best || !linkage) return { headline: "First visit", detail: "Saved as a baseline. Scan again to compare.", tone: "neutral" };
  const when = new Date(best.collectedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const spread = history.linkedObservations > 1
    ? ` Linked to ${history.linkedObservations} scans across ${history.browsers.length} browser${history.browsers.length === 1 ? "" : "s"} and ${Math.max(1, history.publicIps.length)} IP${history.publicIps.length === 1 ? "" : "s"}.`
    : "";
  switch (linkage.verdict) {
    case "same-device": return { headline: `Yes, ${formatPosterior(linkage.posterior)} sure`, detail: `Matches a ${best.browserFamily} scan from ${when}.${spread}`, tone: "good" };
    case "probably-same": return { headline: `Probably (${formatPosterior(linkage.posterior)})`, detail: `Closest match is a ${best.browserFamily} scan from ${when}.${spread}`, tone: "accent" };
    case "inconclusive": return { headline: "Can't tell yet", detail: `The closest scan (${best.browserFamily}, ${when}) is only ${formatPosterior(linkage.posterior)} likely to be this device.`, tone: "warn" };
    case "different-device": return { headline: "No, looks new", detail: "No earlier scan looks like this device.", tone: "neutral" };
    default: return { headline: "Not enough data", detail: "Too few comparable signals. Privacy protections may be hiding them.", tone: "warn" };
  }
}

function networkAnswer(best: ObservationMatch | null, server: ServerNetworkData): { headline: string; detail: string; tone: Tone } {
  const where = server.geoIp ? `${server.geoIp.city}, ${server.geoIp.country} · ${server.geoIp.org}` : "IP location unavailable";
  if (!server.trusted) return { headline: "Not configured", detail: "Set TRUSTED_PROXY_PROVIDER so the server can read the real client IP.", tone: "neutral" };
  if (!best) return { headline: server.ip, detail: where, tone: "neutral" };
  return best.ipChanged
    ? { headline: "IP changed", detail: `Now ${server.ip} (${where}); last time ${best.previousIp}.`, tone: "accent" }
    : { headline: "Same IP as before", detail: `${server.ip} · ${where}`, tone: "good" };
}

function vpnAnswer(risk: RiskAssessment): { headline: string; detail: string; tone: Tone } {
  if (risk.band === "high") return { headline: "Strong signs", detail: risk.headline, tone: "bad" };
  if (risk.band === "elevated") return { headline: "Some signs", detail: risk.headline, tone: "warn" };
  if (risk.band === "unknown") return { headline: "Not enough evidence", detail: "Network intelligence isn't configured, so this can't be judged reliably.", tone: "neutral" };
  return { headline: "No strong signs", detail: risk.headline, tone: "good" };
}

function LinkageExplanation({ linkage }: { linkage: LinkageResult }) {
  const used = linkage.features.filter((item) => item.status === "used").sort((a, b) => b.logLikelihoodRatio - a.logLikelihoodRatio);
  const supporting = used.filter((item) => item.logLikelihoodRatio > 0.2);
  const against = used.filter((item) => item.logLikelihoodRatio < -0.2);
  const skipped = linkage.features.filter((item) => item.status === "protected");
  const max = Math.max(1, ...linkage.families.map((item) => Math.abs(item.capped)));
  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        {linkage.families.map((item) => (
          <div key={item.family} className="grid grid-cols-[minmax(120px,180px)_1fr_48px] items-center gap-3 text-sm">
            <span className="truncate text-ink-2">{item.label}</span>
            <DivergingBar value={item.capped} max={max} />
            <span className={`text-right font-mono text-xs ${item.capped >= 0 ? "text-good" : "text-bad"}`}>{item.capped >= 0 ? "+" : ""}{item.capped.toFixed(1)}</span>
          </div>
        ))}
        <p className="text-xs text-muted">Green supports “same device”, red points to a different one. Each group is capped so related signals aren&apos;t counted twice.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SignalList title="Pointing to the same device" items={supporting.slice(0, 8)} empty="Nothing strongly matched." />
        <SignalList title="Pointing to a different device" items={[...against].reverse().slice(0, 8)} empty="Nothing contradicts the match." />
      </div>

      {skipped.length > 0 && <p className="text-sm text-muted">Skipped because the browser randomizes them: {skipped.map((item) => item.label).join(", ")}.</p>}

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-accent-strong">Show every signal ({linkage.features.length})</summary>
        <div className="mt-3 max-h-96 overflow-y-auto rounded-xl border border-line">
          {linkage.features.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-line px-3 py-2 text-xs last:border-0">
              <div className="min-w-0">
                <p className="text-ink">{item.label} <span className="text-muted">· {item.status === "used" ? `${item.bin} match` : item.status}</span></p>
                <p className="truncate font-mono text-[11px] text-muted" title={`${item.current} ↔ ${item.previous}`}>{item.current} ↔ {item.previous}</p>
              </div>
              <span className={`font-mono ${item.status !== "used" ? "text-muted" : item.logLikelihoodRatio >= 0 ? "text-good" : "text-bad"}`}>{item.status === "used" ? `${item.logLikelihoodRatio >= 0 ? "+" : ""}${item.logLikelihoodRatio.toFixed(2)}` : "—"}</span>
            </div>
          ))}
        </div>
        {linkage.notes.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-muted">{linkage.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
      </details>
    </div>
  );
}

function SignalList({ title, items, empty }: { title: string; items: LinkageResult["features"]; empty: string }) {
  return (
    <div className="rounded-xl bg-surface-2/50 p-4">
      <p className="mb-2 text-sm font-medium text-ink">{title}</p>
      {items.length === 0 ? <p className="text-sm text-muted">{empty}</p> : (
        <ul className="space-y-1.5 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="truncate text-ink-2" title={`${item.current} ↔ ${item.previous}`}>{item.label}</span>
              <span className={`shrink-0 font-mono text-xs ${item.logLikelihoodRatio >= 0 ? "text-good" : "text-bad"}`}>{item.logLikelihoodRatio >= 0 ? "+" : ""}{item.logLikelihoodRatio.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MatchList({ matches, deviceLabel }: { matches: ObservationMatch[]; deviceLabel: string }) {
  return (
    <div className="divide-y divide-line">
      {matches.map((match) => (
        <div key={match.observationId} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{match.browserFamily}{match.browserMode === "private" ? " · private" : ""} <span className="font-normal text-muted">· {new Date(match.collectedAt).toLocaleString()}</span></p>
            <p className="mt-0.5 text-xs text-muted">
              Named “{match.deviceLabel}”{match.deviceLabel === deviceLabel ? " (same name)" : ""} · {match.ipChanged ? "different IP" : "same IP"}
              {match.linkage ? ` · ${contextLabel(match.linkage.context)}` : ""}
            </p>
          </div>
          {match.linkage ? <Pill tone={verdictTone(match.linkage.verdict)}>{formatPosterior(match.linkage.posterior)} · {verdictLabel(match.linkage.verdict)}</Pill> : <Pill>legacy {match.deviceSimilarity.score}%</Pill>}
        </div>
      ))}
    </div>
  );
}

function RiskDetails({ risk, server, fingerprint, latency }: { risk: RiskAssessment; server: ServerNetworkData; fingerprint: FingerprintData; latency: ResearchObservation["clientLatency"] }) {
  return (
    <div className="space-y-5">
      {risk.evidence.length === 0 ? (
        <p className="rounded-xl bg-good-soft px-4 py-3 text-sm text-good">No check produced VPN- or proxy-like evidence for this scan.</p>
      ) : (
        <div className="space-y-2">
          {risk.evidence.map((item) => (
            <div key={item.id} className="rounded-xl bg-surface-2/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-ink">{item.label}</p>
                <Pill tone={item.strength === "strong" ? "bad" : item.strength === "moderate" ? "warn" : "neutral"}>{item.strength}</Pill>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      )}
      <div>
        <Row label="Public IP" value={`${server.ip} (${server.ipFamily})`} mono />
        <Row label="IP location" value={server.geoIp ? `${server.geoIp.city}, ${server.geoIp.country}` : "unavailable"} />
        <Row label="Network owner" value={server.geoIp ? `${server.geoIp.asn} · ${server.geoIp.org}` : "unavailable"} />
        <Row label="Browser timezone" value={`${fingerprint.timezone.name} (UTC ${formatOffset(fingerprint.timezone.offsetMinutes)})`} />
        <Row label="IP timezone" value={server.geoIp ? `${server.geoIp.timezone} (UTC ${formatOffset(server.geoIp.utcOffsetMinutes)})` : "unavailable"} />
        <Row label="Round trip from browser" value={latency ? `${latency.minMs} ms fastest · ${latency.medianMs} ms typical` : "unavailable"} />
        <Row label="Round trip seen by server (TCP)" value={server.tcpRttMs ? `${server.tcpRttMs} ms` : "not configured"} />
        <Row label="WebRTC addresses" value={fingerprint.webrtcCandidates.length ? fingerprint.webrtcCandidates.map((item) => `${item.candidateType} ${item.address}`).join(", ") : `none exposed (${fingerprint.webrtcStatus || "unknown"})`} mono />
        <Row label="Anonymizer database" value={server.anonymizer.source} />
      </div>
      <p className="text-xs leading-5 text-muted">Model {risk.modelVersion} · starting belief {Math.round(risk.priorProbability * 100)}% · likelihood ratios are research estimates until calibrated on labelled traffic.</p>
    </div>
  );
}

function SignalDetails({ fingerprint }: { fingerprint: FingerprintData }) {
  const modern = fingerprint.modern;
  const status = (value: string) => (value === "collected" ? "collected" : value);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="mb-1 text-sm font-medium text-ink">Device</p>
        <Row label="System" value={`${fingerprint.osFamily}${modern?.clientHints?.platformVersion ? ` ${modern.clientHints.platformVersion}` : ""}`} />
        <Row label="CPU / memory" value={`${fingerprint.hardwareConcurrency ?? "?"} cores · ${fingerprint.deviceMemory ?? "?"} GB`} />
        <Row label="Screen" value={`${fingerprint.screen.width}×${fingerprint.screen.height} @ ${fingerprint.screen.pixelRatioBucket}x${modern?.refreshRate.hz ? ` · ${modern.refreshRate.hz} Hz` : ""}`} />
        <Row label="GPU" value={modern?.gpu.rendererTokens.join(" ") || fingerprint.webgl.rendererFamily} />
        {modern && <Row label="WebGPU" value={modern.webgpu.status === "collected" ? `${modern.webgpu.vendor || "?"} / ${modern.webgpu.architecture || "?"}` : modern.webgpu.status} />}
        {modern && <Row label="GPU timing trace" value={modern.gpuTiming.status === "collected" ? `${modern.gpuTiming.points} points · ${modern.gpuTiming.medianMs} ms per draw` : status(modern.gpuTiming.status)} />}
        {modern && <Row label="WebGPU scheduling" value={status(modern.webgpu.scheduling.status)} />}
        {modern && <Row label="Fonts found" value={`${modern.fonts.detected.length} of ${modern.fonts.probed} checked`} />}
        {modern && <Row label="Emoji version" value={modern.emoji.maxVersion} />}
        {modern && <Row label="Microphones / cameras" value={modern.mediaDevices ? `${modern.mediaDevices.audioinput} / ${modern.mediaDevices.videoinput}` : "unavailable"} />}
      </div>
      <div>
        <p className="mb-1 text-sm font-medium text-ink">Browser & privacy protections</p>
        <Row label="Browser" value={`${fingerprint.browserFamily} ${fingerprint.browserMajor}`} />
        <Row label="Language" value={fingerprint.languages.join(", ")} />
        {modern && <Row label="Canvas" value={modern.canvasRobust.noiseDetected ? "randomized by the browser" : "stable"} />}
        {modern && <Row label="Audio" value={modern.audioRobust.noiseDetected ? "randomized by the browser" : status(modern.audioRobust.status)} />}
        {modern && <Row label="Brave / Firefox RFP" value={`${modern.protections.brave ? "Brave detected" : "not Brave"} · ${modern.protections.possibleFirefoxRfp ? "RFP likely" : "no RFP"}`} />}
        {modern && <Row label="GPU name" value={modern.protections.webglMasked ? "hidden by browser" : "visible"} />}
        <Row label="Research suite" value={fingerprint.ndss2017 ? `${fingerprint.ndss2017.supportedTaskIds.length}/${fingerprint.ndss2017.tasks.length} tasks` : "off"} />
        {modern && <Row label="Collection time" value={`${modern.durationMs} ms`} />}
        {modern && modern.protections.notes.length > 0 && <p className="mt-3 text-xs leading-5 text-muted">{modern.protections.notes.join(" ")}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Formatting                                                                */
/* ------------------------------------------------------------------------ */

function verdictTone(verdict: LinkageResult["verdict"]): Tone {
  if (verdict === "same-device") return "good";
  if (verdict === "probably-same") return "accent";
  if (verdict === "different-device") return "neutral";
  return "warn";
}

function verdictLabel(verdict: LinkageResult["verdict"]): string {
  if (verdict === "same-device") return "same device";
  if (verdict === "probably-same") return "probably same";
  if (verdict === "inconclusive") return "unsure";
  if (verdict === "different-device") return "different";
  return "not enough data";
}

function contextLabel(context: LinkageResult["context"]): string {
  if (context === "same-browser") return "same browser";
  if (context === "same-engine") return "same browser engine";
  return "different browsers";
}

function formatPosterior(probability: number): string {
  if (probability >= 0.999) return ">99.9%";
  if (probability < 0.001) return "<0.1%";
  return `${(probability * 100).toFixed(probability >= 0.1 && probability <= 0.9 ? 0 : 1)}%`;
}

function formatOffset(minutes: number | null): string {
  if (minutes === null) return "unknown";
  const sign = minutes >= 0 ? "+" : "−";
  const absolute = Math.abs(minutes);
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
}
