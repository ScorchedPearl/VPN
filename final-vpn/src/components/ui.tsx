import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** Shared building blocks for the warm, low-chrome research UI. */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</section>;
}

/**
 * Collapsed-by-default section built on <details>, so it works without
 * JavaScript and is keyboard and screen-reader friendly.
 */
export function Disclosure({ title, hint, icon, badge, defaultOpen = false, children }: {
  title: string;
  hint?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-line bg-surface">
      <summary className="flex cursor-pointer select-none items-center gap-3 rounded-2xl px-5 py-4 transition hover:bg-surface-2/60">
        {icon && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">{icon}</span>}
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-ink">{title}</span>
          {hint && <span className="mt-0.5 block text-sm text-muted">{hint}</span>}
        </span>
        {badge}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-line px-5 py-4">{children}</div>
    </details>
  );
}

export type Tone = "neutral" | "accent" | "good" | "warn" | "bad";

const pillTones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  accent: "bg-accent-soft text-accent-strong",
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${pillTones[tone]}`}>{children}</span>;
}

export const toneText: Record<Tone, string> = {
  neutral: "text-ink",
  accent: "text-accent-strong",
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
};

export function Row({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-2 text-sm last:border-0">
      <span className="shrink-0 text-muted">{label}</span>
      <span className={`min-w-0 break-words text-right text-ink-2 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass = "w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20";

export function Toggle({ checked, onChange, title, detail }: { checked: boolean; onChange: (checked: boolean) => void; title: string; detail: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition hover:bg-surface-2/60">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]" />
      <span>
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted">{detail}</span>
      </span>
    </label>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-2 text-sm text-muted">{children}</p>;
}

/** Horizontal diverging bar for log-likelihood contributions. */
export function DivergingBar({ value, max }: { value: number; max: number }) {
  const width = `${Math.min(50, (Math.abs(value) / Math.max(max, 0.01)) * 50)}%`;
  return (
    <div className="relative h-2 rounded-full bg-surface-2">
      <div className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
      <div className={`absolute inset-y-0 rounded-full ${value >= 0 ? "bg-good" : "bg-bad"}`} style={value >= 0 ? { left: "50%", width } : { right: "50%", width }} />
    </div>
  );
}
