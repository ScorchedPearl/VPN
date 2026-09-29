"use client";

import { useState } from 'react';
import Deck from '@/deck/Deck';
import Slide from '@/deck/Slide';
import { presentationSlides } from '@/data/presentation-store';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  Cpu,
  Database,
  FingerprintPattern,
  LayoutDashboard,
  Monitor,
  Network,
  Radio,
  Server,
  ShieldCheck,
} from 'lucide-react';
import './midsem.css';

function ImageSpace({ index }: { index: number }) {
  return (
    <div
      className={`ms-image-space ms-image-space-${index + 1}`}
      aria-label={`Image space ${index + 1}`}
    />
  );
}

function ProblemStatementVisual() {
  return (
    <div className="ms-problem" aria-label="Problem statement: selecting stable and unique browser fingerprint features">
      <p className="ms-problem-lead">
        Browser fingerprinting is not just about creating a unique hash. It is about
        choosing the <strong>right signals</strong> to compare devices reliably.
      </p>

      <div className="ms-problem-shift">
        <section className="ms-problem-card ms-problem-before">
          <span className="ms-problem-label">Initial question</span>
          <p>“Can a browser fingerprint uniquely identify a device?”</p>
          <span className="ms-problem-status">Too broad</span>
        </section>
        <div className="ms-problem-arrow" aria-hidden="true">→</div>
        <section className="ms-problem-card ms-problem-after">
          <span className="ms-problem-label">Refined problem</span>
          <p>“Which parameters can identify a device uniquely <em>while remaining consistent across different browsers?</em>”</p>
          <span className="ms-problem-status">Research focus</span>
        </section>
      </div>

      <div className="ms-problem-bottom">
        <div className="ms-problem-example">
          <div className="ms-device" aria-hidden="true"><span>▣</span><span>Same device</span></div>
          <div className="ms-browser-row">
            <span>Chrome</span><b>≈</b><span>Firefox</span>
          </div>
          <p>Different browsers should still be recognized as the <strong>same device</strong>.</p>
        </div>
        <div className="ms-problem-criteria">
          <span className="ms-problem-label">Parameter selection rule</span>
          <div className="ms-criteria-grid">
            <div><b>UNIQUE</b><span>Different across devices</span></div>
            <div><b>STABLE</b><span>Consistent across browsers</span></div>
          </div>
          <p>Find the optimal feature set that balances both.</p>
        </div>
      </div>
    </div>
  );
}

function ProposedFrameworkVisual() {
  return (
    <div className="ms-framework" aria-label="Five-stage proposed VPN detection framework">
      <div className="ms-framework-intro">
        <span className="ms-framework-eyebrow">Implemented research pipeline</span>
        <p>Link repeated visits at the <strong>device level</strong>, then assess whether the <strong>network evidence</strong> is VPN-compatible.</p>
      </div>

      <div className="ms-framework-flow">
        <div className="ms-flow-top">
          <section className="ms-flow-step">
            <div className="ms-flow-number">01</div>
            <div><h3>Collect signals</h3><p>Browser, hardware, display, WebRTC and consented server-network observations.</p></div>
          </section>
          <div className="ms-flow-arrow" aria-hidden="true">→</div>
          <section className="ms-flow-step">
            <div className="ms-flow-number">02</div>
            <div><h3>Generate profiles</h3><p>Standardize values into buckets; create fingerprints and NDSS task hashes.</p></div>
          </section>
          <div className="ms-flow-arrow" aria-hidden="true">→</div>
          <section className="ms-flow-step ms-flow-match">
            <div className="ms-flow-number">03</div>
            <div><h3>Compare sessions</h3><p>Use browser traits for same-browser matches and stable device signals across browsers.</p></div>
            <div className="ms-cross-browser">
              <b>Cross-browser fix</b>
              <span>For each browser pair, select an NDSS task mask trained to maximize <em>stability × uniqueness</em>.</span>
            </div>
          </section>
        </div>
        <div className="ms-flow-transition"><span aria-hidden="true">↓</span><p>Validate the linked device against <strong>independent network evidence</strong></p></div>
        <div className="ms-flow-bottom">
          <section className="ms-flow-step">
            <div className="ms-flow-number">04</div>
            <div><h3>Analyze network</h3><p>Server IP, GeoIP/ASN, anonymizer class, path divergence and timezone consistency.</p></div>
          </section>
          <div className="ms-flow-arrow" aria-hidden="true">→</div>
          <section className="ms-flow-step ms-flow-risk">
            <div className="ms-flow-number">05</div>
            <div><h3>Assess risk</h3><p>Fuse history, device continuity and independent network evidence into a capped, explainable action.</p></div>
            <div className="ms-risk-output"><span>LOW / ELEVATED / HIGH</span><b>allow · step-up · review</b></div>
          </section>
        </div>
      </div>

      <div className="ms-framework-note">
        <span>Key principle</span>
        <p>A changed IP alone is not proof. The system looks for <strong>a stable device profile + independent network evidence</strong>.</p>
      </div>
    </div>
  );
}

function SystemArchitectureVisual() {
  const iconProps = { size: 24, strokeWidth: 1.6, 'aria-hidden': true };
  return (
    <div className="ms-architecture" aria-label="High-level system architecture for VPN detection research">
      <div className="ms-architecture-intro">
        <span>High-level architecture</span>
        <p>Client collection and server-authoritative network evidence are combined into an <strong>explainable research decision</strong>.</p>
      </div>

      <div className="ms-architecture-top">
        <section className="ms-arch-node ms-arch-client">
          <div className="ms-arch-icon"><Monitor {...iconProps} /></div>
          <div><h3>Browser client</h3><p>Scanner UI, consent and controlled study inputs.</p></div>
          <ul><li>device + browser context</li><li>optional location / path probes</li></ul>
        </section>
        <div className="ms-arch-arrow"><ArrowRight {...iconProps} /><span>local capture</span></div>
        <section className="ms-arch-node ms-arch-fingerprint">
          <div className="ms-arch-icon"><FingerprintPattern {...iconProps} /></div>
          <div><h3>Fingerprint engine</h3><p>Runs in the browser before submission.</p></div>
          <ul><li>normalized device profile</li><li>NDSS task hashes (opt-in)</li></ul>
        </section>
        <div className="ms-arch-arrow"><ArrowRight {...iconProps} /><span>signed scan</span></div>
        <section className="ms-arch-node ms-arch-server">
          <div className="ms-arch-icon"><Server {...iconProps} /></div>
          <div><h3>Next.js API server</h3><p>Validates the submission and observes the canonical network path.</p></div>
          <ul><li>IP / GeoIP / ASN enrichment</li><li>challenge, rate and integrity checks</li></ul>
        </section>
      </div>

      <div className="ms-architecture-bridge"><span>↓</span><p>Validated observation + trusted network context</p></div>

      <div className="ms-architecture-bottom">
        <section className="ms-arch-node ms-arch-db">
          <div className="ms-arch-icon"><Database {...iconProps} /></div>
          <div><h3>Research store</h3><p>Supabase PostgreSQL keeps versioned observations, history and scores.</p></div>
          <small>read history · write result</small>
        </section>
        <div className="ms-arch-arrow ms-arch-arrow-wide"><ArrowRight {...iconProps} /><span>prior captures</span></div>
        <section className="ms-arch-node ms-arch-analysis">
          <div className="ms-arch-icon"><ShieldCheck {...iconProps} /></div>
          <div><h3>Matching &amp; risk analysis</h3><p>Compares sessions, trains a browser-pair NDSS mask, and scores independent evidence.</p></div>
          <small>similarity · history · risk evidence</small>
        </section>
        <div className="ms-arch-arrow ms-arch-arrow-wide"><ArrowRight {...iconProps} /><span>response</span></div>
        <section className="ms-arch-node ms-arch-dashboard">
          <div className="ms-arch-icon"><LayoutDashboard {...iconProps} /></div>
          <div><h3>Scanner &amp; dashboard</h3><p>Shows match confidence, network evidence, risk band and capture explorer.</p></div>
          <small>explainable output</small>
        </section>
      </div>

      <div className="ms-architecture-foot"><span>Data boundary</span><p>Raw browser values are reduced to research profiles and hashes; the system reports evidence, not proof of identity or VPN use.</p></div>
    </div>
  );
}

function PreliminaryFindingsVisual() {
  return (
    <div className="ms-findings" aria-label="Preliminary findings: passive telemetry inconsistencies">
      <div className="ms-findings-dashboard">
        <div className="ms-findings-grid">
          {/* Left Column */}
          <div className="ms-findings-col">
            {/* Card 1: Inconsistency Engine Readout */}
            <section className="ms-findings-card ms-findings-card-alert">
              <header className="ms-findings-card-header text-alert">
                <AlertTriangle size={15} strokeWidth={2.2} aria-hidden="true" />
                <h3>Inconsistency Engine Readout</h3>
              </header>
              <div className="ms-findings-alert-list">
                <div className="ms-findings-alert-item">
                  <p>
                    <strong>Datacenter ASN:</strong> IP belongs to M247 cloud hosting rather than a residential ISP.
                  </p>
                </div>
                <div className="ms-findings-alert-item">
                  <p>
                    <strong>Timezone Mismatch:</strong> IP location UTC+1 (Berlin) vs browser system clock UTC-5 (New_York).
                  </p>
                </div>
                <div className="ms-findings-alert-item">
                  <p>
                    <strong>WebRTC STUN Discrepancy:</strong> Server-reflexive address bypassed tunnel to expose home ISP.
                  </p>
                </div>
              </div>
            </section>

            {/* Card 2: Geolocation & Network */}
            <section className="ms-findings-card">
              <header className="ms-findings-card-header">
                <span className="ms-card-dot" aria-hidden="true">◉</span>
                <h3>Geolocation &amp; Network</h3>
              </header>
              <dl className="ms-findings-kv-list">
                <div className="ms-findings-kv-row">
                  <dt>Public IP</dt>
                  <dd className="ms-val-mono">152.59.185.242</dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>ASN / Org</dt>
                  <dd className="ms-val-cyan">M247 Ltd (Datacenter)</dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>IP Timezone</dt>
                  <dd className="ms-val-cyan">Europe/Berlin (UTC+1)</dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>Browser Timezone</dt>
                  <dd className="ms-val-cyan">America/New_York (UTC-5)</dd>
                </div>
              </dl>
            </section>

            {/* Card 3: Server-Side Transport */}
            <section className="ms-findings-card">
              <header className="ms-findings-card-header">
                <span className="ms-card-square" aria-hidden="true">▣</span>
                <h3>Server-Side Transport</h3>
              </header>
              <dl className="ms-findings-kv-list">
                <div className="ms-findings-kv-row">
                  <dt>TCP MTU / MSS</dt>
                  <dd className="ms-val-amber">1420 <em>(Clamped)</em></dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>p0f OS Stack</dt>
                  <dd className="ms-val-cyan">Linux 5.x / 6.x</dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>X-Forwarded-For</dt>
                  <dd className="ms-val-mono">152.59.185.242</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Right Column */}
          <div className="ms-findings-col">
            {/* Card 4: Browser Fingerprint Engine */}
            <section className="ms-findings-card">
              <header className="ms-findings-card-header">
                <span className="ms-card-dot" aria-hidden="true">◉</span>
                <h3>Browser Fingerprint Engine</h3>
              </header>
              <dl className="ms-findings-kv-list">
                <div className="ms-findings-kv-row">
                  <dt>Canvas Hash</dt>
                  <dd className="ms-val-cyan">-2d9b4bef</dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>WebGL Vendor</dt>
                  <dd className="ms-val-subtle">Google Inc. (Apple)</dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>WebGL Renderer</dt>
                  <dd className="ms-val-body">Apple M2 · Metal Renderer</dd>
                </div>
              </dl>
            </section>

            {/* Card 5: OS & Environment Signals */}
            <section className="ms-findings-card">
              <header className="ms-findings-card-header">
                <span className="ms-card-square" aria-hidden="true">▣</span>
                <h3>OS &amp; Environment Signals</h3>
              </header>
              <dl className="ms-findings-kv-list">
                <div className="ms-findings-kv-row">
                  <dt>Declared OS</dt>
                  <dd className="ms-val-body">macOS (MacIntel)</dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>Speech Synthesis</dt>
                  <dd className="ms-val-green">Apple voices (Consistent)</dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>CPU / RAM</dt>
                  <dd className="ms-val-mono">8 cores · 16 GB</dd>
                </div>
                <div className="ms-findings-kv-row">
                  <dt>Screen</dt>
                  <dd className="ms-val-mono">1920×1080</dd>
                </div>
              </dl>
            </section>

            {/* Card 6: Installed Fonts & Voices */}
            <section className="ms-findings-card">
              <header className="ms-findings-card-header">
                <span className="ms-card-type" aria-hidden="true">T</span>
                <h3>Installed Fonts &amp; Voices</h3>
              </header>
              <div className="ms-findings-pill-list">
                {['Menlo', 'Monaco', 'Apple Color Emoji', 'Arial', 'Helvetica', 'Times New Roman', 'Samantha (en-US)', 'Alex (en-US)'].map((name) => (
                  <span key={name} className="ms-findings-pill">{name}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCollectionVisual() {
  return (
    <div className="ms-collection" aria-label="Feature collection and preprocessing components">
      {/* Top 2 Cards: Device-like & Browser/profile */}
      <div className="ms-collection-top-grid">
        {/* Panel 1: Device-like components */}
        <section className="ms-collection-panel">
          <header className="ms-panel-header">
            <span className="ms-panel-icon-cyan"><Cpu size={16} /></span>
            <h4>Device-like components</h4>
          </header>
          <dl className="ms-panel-rows">
            <div className="ms-panel-row">
              <dt>OS / platform</dt>
              <dd>macOS · MacIntel</dd>
            </div>
            <div className="ms-panel-row">
              <dt>CPU</dt>
              <dd>8 logical · &lt;=8</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Memory</dt>
              <dd>16 GB · &lt;=16</dd>
            </div>
            <div className="ms-panel-row">
              <dt>GPU family</dt>
              <dd>apple-gpu</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Display profile</dt>
              <dd>p3 · high · fine</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Touch points</dt>
              <dd>0</dd>
            </div>
          </dl>
        </section>

        {/* Panel 2: Browser/profile components */}
        <section className="ms-collection-panel">
          <header className="ms-panel-header">
            <span className="ms-panel-icon-purple"><Monitor size={16} /></span>
            <h4>Browser/profile components</h4>
          </header>
          <dl className="ms-panel-rows">
            <div className="ms-panel-row">
              <dt>Browser</dt>
              <dd>Chrome 154</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Canvas repeatable</dt>
              <dd>Yes, within this scan</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Visible fonts</dt>
              <dd>14 detected</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Speech voices</dt>
              <dd>199 voices (macOS/iOS)</dd>
            </div>
            <div className="ms-panel-row">
              <dt>OS consistency</dt>
              <dd>consistent</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Media codecs</dt>
              <dd style={{ fontSize: '9px' }}>aac, av1, flac, h264, hevc, opus, vp8, vp9</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Audio research</dt>
              <dd>collected</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Screen</dt>
              <dd>1470×956 @ 2x</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Middle Card: Authoritative network observation */}
      <section className="ms-collection-panel">
        <header className="ms-panel-header">
          <div className="ms-panel-icon-box"><Network size={14} /></div>
          <div>
            <h4>Authoritative network observation</h4>
          </div>
        </header>
        <div className="ms-net-grid">
          <dl className="ms-panel-rows">
            <div className="ms-panel-row">
              <dt>Canonical public IP</dt>
              <dd>152.59.186.209 · ipv4 · x-vercel-forwarded-for</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Ingress trust</dt>
              <dd>Trusted configured ingress</dd>
            </div>
            <div className="ms-panel-row">
              <dt>JA4 / HTTP</dt>
              <dd style={{ fontSize: '9px' }}>t13d1516h2_8daaf6152771_b186095e22b6 · unknown</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Browser timezone</dt>
              <dd>Asia/Calcutta · UTC +05:30</dd>
            </div>
          </dl>
          <dl className="ms-panel-rows">
            <div className="ms-panel-row">
              <dt>IP location</dt>
              <dd style={{ color: '#94a3b8' }}>Unavailable</dd>
            </div>
            <div className="ms-panel-row">
              <dt>ASN / organization</dt>
              <dd style={{ color: '#94a3b8' }}>Unavailable</dd>
            </div>
            <div className="ms-panel-row">
              <dt>Anonymizer intelligence</dt>
              <dd style={{ color: '#94a3b8' }}>No positive flag · source unavailable</dd>
            </div>
            <div className="ms-panel-row">
              <dt>IP timezone</dt>
              <dd style={{ color: '#94a3b8' }}>Unavailable</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Bottom Block Diagram: Standardization & Preprocessing (Clear & Precise) */}
      <div className="ms-std-strip">
        <div className="ms-std-box">
          <span className="ms-std-box-title">01 · Coarse Bucketing</span>
          <p>
            Cores &amp; RAM mapped to <code>&lt;=8, &lt;=16</code> via <code>numberBucket()</code>; screen rounded via <code>roundTo(max(w,h), 100)</code>. Prevents minor OS updates from causing false identity resets.
          </p>
        </div>
        <div className="ms-std-box">
          <span className="ms-std-box-title">02 · Feature Normalization</span>
          <p>
            Font fallback delta <code>&gt; 0.01px</code> against monospace/sans/serif; media codecs and capabilities sorted alphabetically into deterministic sets for Jaccard similarity.
          </p>
        </div>
        <div className="ms-std-box">
          <span className="ms-std-box-title">03 · Server-Side Ingress</span>
          <p>
            TLS JA4 hash and canonical IP observed at reverse proxy. Client-side JS cannot tamper with, spoof, or overwrite authoritative transport evidence.
          </p>
        </div>
      </div>
    </div>
  );
}

function BrowserFingerprintGenerationVisual() {
  return (
    <div className="ms-generation-layout" aria-label="Browser fingerprint generation and versioned signatures">
      <figure className="ms-photo-card">
        <Image
          src="/images/versioned-signatures.png"
          width={968}
          height={822}
          alt="Versioned signatures: Browser signature and coarse device signature"
          priority
        />
      </figure>

      <div className="ms-generation-cards">
        <div className="ms-briefing-box ms-generation-briefing">
          <div className="ms-briefing-item">
            <span className="ms-briefing-badge">Component Inputs</span>
            <p>Canvas, WebGL parameters, system fonts, screen geometry, audio context, and hardware traits.</p>
          </div>
          <div className="ms-briefing-item">
            <span className="ms-briefing-badge">Hashing Pipeline</span>
            <p>Subsystem FNV-1a hashes formatted into canonical JSON and signed via SHA-256 digests.</p>
          </div>
          <div className="ms-briefing-item">
            <span className="ms-briefing-badge">Dual Signatures</span>
            <p>Browser Signature (full engine state) vs. Coarse Device Signature (cross-browser hardware core).</p>
          </div>
        </div>

        <section className="ms-math-card">
          <header className="ms-math-card-header">
            <span className="ms-math-card-title">
              <Calculator size={15} />
              <span>Stage 1 · Subsystem Hashing (FNV-1a)</span>
            </span>
            <span className="ms-math-tag">32-bit Hash</span>
          </header>
          <div className="ms-math-formula">
            hash = (hash ⊕ byte) × 16777619 (mod 2³²)
          </div>
          <p className="ms-math-desc">
            Offscreen <strong>Canvas &amp; WebGL</strong> rendering pipelines generate 2D geometry and text; pixel byte streams are hashed into compact, deterministic 32-bit integers.
          </p>
        </section>

        <section className="ms-math-card">
          <header className="ms-math-card-header">
            <span className="ms-math-card-title">
              <Cpu size={15} />
              <span>Stage 2 · Canonical Digest (SHA-256)</span>
            </span>
            <span className="ms-math-tag">Cryptographic</span>
          </header>
          <div className="ms-math-formula">
            Signature = SHA-256(stableStringify(ComponentSchema))
          </div>
          <p className="ms-math-desc">
            Inputs are lexicographically sorted into canonical JSON. <strong>Browser Signature</strong> captures full engine state; <strong>Coarse Device Signature</strong> isolates hardware invariants.
          </p>
        </section>
      </div>
    </div>
  );
}

function IndividualFingerprintComparisonVisual() {
  return (
    <div className="ms-comparison-layout" aria-label="Individual fingerprint comparison and match results">
      <figure className="ms-photo-banner">
        <Image
          src="/images/best-device-matches.png"
          width={1024}
          height={513}
          alt="Best device matches prototype output showing device continuity score across IP changes"
          priority
        />
      </figure>

      <div className="ms-comparison-grid">
        <section className="ms-math-card">
          <header className="ms-math-card-header">
            <span className="ms-math-card-title">
              <Calculator size={15} />
              <span>Weighted Similarity Formulation</span>
            </span>
            <span className="ms-math-tag">Score [0–100%]</span>
          </header>
          <div className="ms-math-formula">
            Score = round(100 × (Σ wᵢ · sᵢ) / Σ wᵢ)
          </div>
          <p className="ms-math-desc">
            Aggregates available signals: <strong>Exact match</strong> for OS (w=18) &amp; GPU (w=14); <strong>Jaccard</strong> J(A,B)=|A∩B|/|A∪B| for fonts &amp; codecs; <strong>Closeness</strong> max(0, 1 - |Δd|/300) for screen geometry.
          </p>
        </section>

        <section className="ms-math-card">
          <header className="ms-math-card-header">
            <span className="ms-math-card-title">
              <ShieldCheck size={15} />
              <span>Cross-Browser Mask (NDSS Technique)</span>
            </span>
            <span className="ms-math-tag">Engine Invariance</span>
          </header>
          <div className="ms-math-formula">
            sᵢ = 0 if component ∈ EngineSpecific ∧ Browser_A ≠ Browser_B
          </div>
          <p className="ms-math-desc">
            When browsers differ (e.g. Chrome vs Firefox), volatile engine hashes are masked out. The device score establishes physical hardware continuity (e.g. high-confidence match) despite IP or browser changes.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Deck>
      <Slide
        nav="Title"
        notes="Introduce the team and the project topic."
        className="ms-slide ms-midsem-cover"
      >
        <div className="ms-midsem-cover-layout">
          <div className="ms-midsem-cover-main">
            <p className="ms-midsem-cover-kicker">Midsem Presentation</p>
            <h1>VPN &amp; <em>Browser Fingerprinting</em></h1>
            <p className="ms-midsem-cover-topic">Finding device uniqueness through browser-observed signals</p>
          </div>

          <dl className="ms-midsem-cover-team">
            <div><dt>IIT2024087</dt><dd>Vishwas Pahwa</dd></div>
            <div><dt>IIT2024018</dt><dd>Saumya Sood</dd></div>
            <div><dt>IIT2024083</dt><dd>Vichanshu Raj</dd></div>
          </dl>
        </div>
      </Slide>
      {presentationSlides.map((item, index) => {
        if (index === 0) {
          return (
            <Slide
              key={`${item.presenter}-${item.title}`}
              nav={item.title}
              notes={item.brief}
              className="ms-slide ms-vpn-intro ms-owner-vishwas"
            >
              <div className="ms-vpn-intro-layout">
                <section className="ms-vpn-copy">
                  <div className="ms-kicker">
                    <span>02</span>
                    <span className="ms-kicker-dot" />
                    <span>{item.presenter}</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p className="ms-vpn-lead">
                    A VPN encrypts a user’s traffic and routes it through a remote server. The website sees the VPN server’s IP address instead of the user’s original public IP.
                  </p>

                  <div className="ms-vpn-reasons">
                    <p>Why detection matters</p>
                    <ul>
                      <li><strong>Location controls</strong><span>A VPN can change the user’s apparent country or network.</span></li>
                      <li><strong>Account protection</strong><span>Unexpected network changes can signal suspicious access.</span></li>
                      <li><strong>Fraud review</strong><span>Proxy-based abuse can trigger additional verification.</span></li>
                    </ul>
                  </div>
                </section>

                <figure className="ms-vpn-diagram">
                  <Image
                    src="/images/vpn-process-diagram.png"
                    width={1672}
                    height={941}
                    priority
                    alt="VPN process from a user device through an encrypted tunnel and VPN server to the internet, with reasons to detect VPN use"
                  />
                </figure>
              </div>
            </Slide>
          );
        }

        if (index === 1) {
          return (
            <Slide
              key={`${item.presenter}-${item.title}`}
              nav={item.title}
              notes={item.brief}
              className="ms-slide ms-ip-problem ms-owner-vishwas"
            >
              <div className="ms-ip-problem-layout">
                <section className="ms-ip-problem-copy">
                  <div className="ms-kicker">
                    <span>03</span>
                    <span className="ms-kicker-dot" />
                    <span>{item.presenter}</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p className="ms-ip-problem-lead">
                    An IP address alone cannot reliably identify VPN usage or confirm that two sessions came from the same device.
                  </p>

                  <div className="ms-ip-problem-points">
                    <p>Why IP-only detection is limited</p>
                    <ul>
                      <li>IP addresses can be dynamic or shared.</li>
                      <li>Travel, mobile networks, corporate gateways, and proxies can change the IP.</li>
                      <li>GeoIP and VPN classifications may be inaccurate.</li>
                    </ul>
                  </div>

                  <p className="ms-ip-problem-approach">
                    <strong>Our approach:</strong> combine browser fingerprinting with IP and network signals, then compare sessions using a device-similarity score.
                  </p>
                </section>

                <figure className="ms-ip-problem-figure">
                  <Image
                    src="/images/ip-only-limitation-diagram.png"
                    width={1536}
                    height={1024}
                    alt="One device can appear through home Wi-Fi, mobile network, corporate gateway, or VPN exit, showing that IP alone cannot confirm device continuity"
                  />
                </figure>
              </div>
            </Slide>
          );
        }

        return (
          <Slide
            key={`${item.presenter}-${item.title}`}
            nav={item.title}
            notes={item.brief}
            className={`ms-slide ms-owner-${item.presenter.toLowerCase()}`}
          >
            <div className="ms-template">
              <header className="ms-template-header">
                <div className="ms-kicker">
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <span className="ms-kicker-dot" />
                  <span>{item.presenter}</span>
                </div>
                <h2>{item.title}</h2>

                {item.presenter === 'Saumya' && item.title === 'Preliminary Findings' && (
                  <div className="ms-briefing-box">
                    <div className="ms-briefing-item">
                      <span className="ms-briefing-badge">IP Shifts</span>
                      <p>Routing through datacenter ASNs rather than residential ISPs.</p>
                    </div>
                    <div className="ms-briefing-item">
                      <span className="ms-briefing-badge">Stable Device</span>
                      <p>Canvas hash, GPU, screen, and voices remain 100% invariant.</p>
                    </div>
                    <div className="ms-briefing-item">
                      <span className="ms-briefing-badge">Inconsistencies</span>
                      <p>Timezone mismatch (UTC-5 vs UTC+1) and clamped TCP MSS (1420).</p>
                    </div>
                  </div>
                )}

                {item.presenter === 'Saumya' && item.title === 'Feature Collection and Preprocessing' && (
                  <div className="ms-briefing-box">
                    <div className="ms-briefing-item">
                      <span className="ms-briefing-badge">Parameters</span>
                      <p>Hardware (CPU, RAM, GPU), browser runtime (Canvas, fonts, codecs), and network (IP, JA4).</p>
                    </div>
                    <div className="ms-briefing-item">
                      <span className="ms-briefing-badge">Standardization</span>
                      <p>Coarse bucketing (CPU &le;8, RAM &le;16 GB, screen to 100px) and quarter-step DPR quantization.</p>
                    </div>
                    <div className="ms-briefing-item">
                      <span className="ms-briefing-badge">Preprocessing</span>
                      <p>32-bit FNV-1a hashing for rendering surfaces; authoritative server ingress IP validation.</p>
                    </div>
                  </div>
                )}

                {item.presenter === 'Saumya' && item.title === 'Individual Fingerprint Comparison' && (
                  <div className="ms-briefing-box">
                    <div className="ms-briefing-item">
                      <span className="ms-briefing-badge">Weighted Similarity</span>
                      <p>Component-level scoring avoids brittle all-or-nothing hash comparisons.</p>
                    </div>
                    <div className="ms-briefing-item">
                      <span className="ms-briefing-badge">Cross-Browser Mask</span>
                      <p>Filters out volatile engine hashes to track same physical device across browsers.</p>
                    </div>
                    <div className="ms-briefing-item">
                      <span className="ms-briefing-badge">Decision Threshold</span>
                      <p>Score &ge; 86% marks likely-same-device; confirmed across dynamic IP shifts.</p>
                    </div>
                  </div>
                )}
              </header>

              {item.presenter === 'Saumya' && item.title === 'Problem Statement' ? (
                <ProblemStatementVisual />
              ) : item.presenter === 'Saumya' && item.title === 'Proposed Framework' ? (
                <ProposedFrameworkVisual />
              ) : item.presenter === 'Saumya' && item.title === 'System Architecture' ? (
                <SystemArchitectureVisual />
              ) : item.presenter === 'Saumya' && item.title === 'Preliminary Findings' ? (
                <PreliminaryFindingsVisual />
              ) : item.presenter === 'Saumya' && item.title === 'Feature Collection and Preprocessing' ? (
                <FeatureCollectionVisual />
              ) : item.presenter === 'Saumya' && item.title === 'Browser Fingerprint Generation' ? (
                <BrowserFingerprintGenerationVisual />
              ) : item.presenter === 'Saumya' && item.title === 'Individual Fingerprint Comparison' ? (
                <IndividualFingerprintComparisonVisual />
              ) : (
                <div className="ms-image-grid">
                  {Array.from({ length: item.imageSlots }, (_, slotIndex) => (
                    <ImageSpace key={slotIndex} index={slotIndex} />
                  ))}
                </div>
              )}
            </div>
          </Slide>
        );
      })}
    </Deck>
  );
}
