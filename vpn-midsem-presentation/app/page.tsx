"use client";

import { useState } from 'react';
import Deck from '@/deck/Deck';
import Slide from '@/deck/Slide';
import { presentationSlides } from '@/data/presentation-store';
import Image from 'next/image';
import {
  AlertTriangle,
  Calculator,
  Cpu,
  Database,
  FingerprintPattern,
  Monitor,
  Network,
  ShieldCheck,
} from 'lucide-react';
import {
  SystemFlawsVisual,
  FutureImprovementsVisual,
  ParameterImportanceVisual,
  RedundancySelectionVisual,
  ConclusionVisual,
} from '@/components/VishwasSlides';
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
          <div className="ms-device" aria-hidden="true">
            <Image className="ms-device-chrome" src="/images/chrome-icon.png" width={52} height={52} alt="" />
          </div>
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
            <div><h3>Collect signals</h3><ul><li>Browser and device signals</li><li>Server-side network evidence</li></ul></div>
          </section>
          <div className="ms-flow-arrow" aria-hidden="true">→</div>
          <section className="ms-flow-step">
            <div className="ms-flow-number">02</div>
            <div><h3>Generate profiles</h3><ul><li>Normalize stable values</li><li>Create fingerprint and task hashes</li></ul></div>
          </section>
          <div className="ms-flow-arrow" aria-hidden="true">→</div>
          <section className="ms-flow-step ms-flow-match">
            <div className="ms-flow-number">03</div>
            <div><h3>Compare sessions</h3></div>
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
            <div><h3>Analyze network</h3><ul><li>IP, GeoIP and ASN</li><li>Path and timezone consistency</li></ul></div>
          </section>
          <div className="ms-flow-arrow" aria-hidden="true">→</div>
          <section className="ms-flow-step ms-flow-risk">
            <div className="ms-flow-number">05</div>
            <div><h3>Assess risk</h3><ul><li>Device continuity</li><li>Network evidence and history</li></ul></div>
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
  return (
    <div className="ms-architecture ms-architecture-diagram" aria-label="High-level system architecture for VPN detection research">
      <div className="ms-architecture-intro">
        <span>High-level architecture</span>
        <p>Client collection and server-authoritative network evidence are combined into an <strong>explainable research decision</strong>.</p>
      </div>
      <figure className="ms-architecture-figure">
        <Image
          src="/images/system-architecture-flow-gold.png"
          width={2056}
          height={765}
          priority
          alt="Full system architecture showing browser client, fingerprint engine, API server, research store, matching and risk analysis, and dashboard"
        />
      </figure>
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
              <dd style={{ fontSize: '11.5px' }}>aac, av1, flac, h264, hevc, opus, vp8, vp9</dd>
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
              <dd style={{ fontSize: '11.5px' }}>t13d1516h2_8daaf6152771_b186095e22b6 · unknown</dd>
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

    </div>
  );
}

function BrowserFingerprintGenerationVisual() {
  return (
    <div className="ms-generation-layout" aria-label="Browser fingerprint generation and versioned signatures">
      <section className="ms-signature-panel" aria-label="Versioned signatures">
        <div className="ms-signature-heading"><Database size={25} /><span>Versioned signatures</span></div>
        <div className="ms-signature-value">
          <span>Browser signature</span>
          <code>a7eea793f7fae953db15…</code>
        </div>
        <div className="ms-signature-value">
          <span>Coarse device signature</span>
          <code>66595026defb528b4a02…</code>
        </div>
        <p className="ms-signature-note"><strong>Exact IDs</strong> demonstrate canonical hashing. Cross-browser decisions use weighted components instead.</p>
      </section>

      <div className="ms-generation-cards">
        <div className="ms-generation-notes">
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

        <section className="ms-math-card ms-generation-stage">
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
          <a className="ms-formula-reference" href="https://datatracker.ietf.org/doc/draft-eastlake-fnv/" target="_blank" rel="noreferrer">Formula source: IETF FNV-1a specification</a>
        </section>

        <section className="ms-math-card ms-generation-stage">
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
          <a className="ms-formula-reference" href="https://csrc.nist.gov/pubs/fips/180-4/upd1/final" target="_blank" rel="noreferrer">Formula source: NIST SHA-256 standard</a>
        </section>
      </div>
    </div>
  );
}

function IndividualFingerprintComparisonVisual() {
  return (
    <div className="ms-comparison-layout" aria-label="Individual fingerprint comparison and match results">
      <section className="ms-match-panel" aria-label="Best device matches">
        <div className="ms-match-heading"><FingerprintPattern size={24} /><div><strong>Best device matches</strong><span>Similarity uses available component weights, not one exact whole hash.</span></div></div>
        <div className="ms-match-table" role="table" aria-label="Sample device match scores">
          <div className="ms-match-row ms-match-labels" role="row"><span>Prior observation</span><span>Device score</span><span>Browser</span><span>Network</span></div>
          <div className="ms-match-row" role="row"><span>Chrome · normal</span><b>93<small>%</small></b><span>same browser</span><i>IP changed</i></div>
          <div className="ms-match-row" role="row"><span>Chrome · normal</span><b>80<small>%</small></b><span>different browser</span><i>IP changed</i></div>
          <div className="ms-match-row" role="row"><span>Chrome · private</span><b>72<small>%</small></b><span>different browser</span><i>VPN-like path</i></div>
        </div>
      </section>

      <div className="ms-comparison-grid">
        <section className="ms-math-card ms-comparison-stage">
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
          <div className="ms-math-methods">
            <p><strong>Exact match</strong><span>OS (w=18) and GPU (w=14)</span></p>
            <p><strong>Jaccard</strong><span>J(A,B) = |A ∩ B| / |A ∪ B| for fonts and codecs</span></p>
            <p><strong>Closeness</strong><span>max(0, 1 − |Δd| / 300) for screen geometry</span></p>
          </div>
          <a className="ms-formula-reference" href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.jaccard_score.html" target="_blank" rel="noreferrer">Formula source: Jaccard similarity coefficient</a>
        </section>

        <section className="ms-math-card ms-comparison-stage">
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
          <a className="ms-formula-reference" href="/papers/ndss2017_02B-3_Cao_paper.pdf" target="_blank" rel="noreferrer">Research source: Cross-Browser Fingerprinting, NDSS 2017</a>
        </section>
      </div>
    </div>
  );
}

function LiteratureReviewVisual() {
  return (
    <div className="ms-vichanshu-layout ms-literature-review" aria-label="Literature review of browser fingerprinting research">
      <header className="ms-vichanshu-heading">
        <div className="ms-kicker"><span>04</span><span className="ms-kicker-dot" /><span>Vichanshu</span></div>
        <h2>Literature Review</h2>
        <p>Two foundational studies establish why browser signals can identify devices and how the same physical device can be linked across browsers.</p>
      </header>
      <div className="ms-literature-papers">
        <article className="ms-literature-paper">
          <figure><Image src="/evidence/literature-beauty-paper.png" width={241} height={290} alt="First page of Beauty and the Beast browser fingerprinting paper" /></figure>
          <div>
            <span className="ms-vichanshu-number">01</span>
            <h3>Beauty and the Beast</h3>
            <p className="ms-paper-authors">Laperdrix et al. · IEEE S&amp;P · 2016</p>
            <p>Shows that ordinary web-browser attributes can form highly unique fingerprints. It reports <strong>89.4% uniqueness</strong> on desktop devices, while mobile fingerprints are less distinctive.</p>
          </div>
        </article>
        <article className="ms-literature-paper">
          <figure><Image src="/evidence/literature-cross-browser-paper.png" width={244} height={315} alt="First page of Cross-Browser Fingerprinting via OS and Hardware Level Features paper" /></figure>
          <div>
            <span className="ms-vichanshu-number">02</span>
            <h3>Cross-Browser Fingerprinting</h3>
            <p className="ms-paper-authors">Cao, Li &amp; Wijmans · NDSS · 2017</p>
            <p>Uses operating-system and hardware features to link the same physical device across browsers, reaching <strong>99.24% identification accuracy</strong> in its reported evaluation.</p>
          </div>
        </article>
      </div>
    </div>
  );
}

function BrowserParametersVisual() {
  const parameters = [
    ['User agent', 'HTTP header'],
    ['Accept', 'HTTP header'],
    ['Content encoding', 'HTTP header'],
    ['Content language', 'HTTP header'],
    ['List of plugins', 'JavaScript'],
    ['Cookies enabled', 'JavaScript'],
    ['Use of local/session storage', 'JavaScript'],
    ['Timezone', 'JavaScript'],
    ['Screen resolution and color depth', 'JavaScript'],
    ['List of fonts', 'Flash plugin'],
    ['List of HTTP headers', 'HTTP headers'],
    ['Platform', 'JavaScript'],
    ['Do Not Track', 'JavaScript'],
    ['Canvas', 'JavaScript'],
    ['WebGL vendor', 'JavaScript'],
    ['WebGL renderer', 'JavaScript'],
    ['Use of an ad blocker', 'JavaScript'],
  ];

  return (
    <div className="ms-vichanshu-layout ms-parameters-layout" aria-label="Browser fingerprint parameters">
      <header className="ms-vichanshu-heading">
        <div className="ms-kicker"><span>05</span><span className="ms-kicker-dot" /><span>Vichanshu</span></div>
        <h2>Browser Fingerprinting Parameters</h2>
        <p>Signals available to a website span request headers, browser state, display configuration, and rendering behavior.</p>
      </header>
      <div className="ms-parameters-content">
        <figure className="ms-parameters-figure">
          <Image src="/evidence/browser-fingerprint-parameters.png" width={994} height={818} alt="Table of browser measurements used for browser fingerprinting" />
        </figure>
        <section className="ms-parameter-list" aria-label="Parameter groups">
          {parameters.map(([label, detail], index) => (
            <div key={label} className="ms-parameter-row"><span>{String(index + 1).padStart(2, '0')}</span><p><strong>{label}</strong>{detail}</p></div>
          ))}
        </section>
      </div>
    </div>
  );
}

function CanvasFingerprintingVisual() {
  return (
    <div className="ms-vichanshu-layout ms-canvas-layout" aria-label="Canvas fingerprinting layers and visual differences">
      <header className="ms-vichanshu-heading">
        <div className="ms-kicker"><span>06</span><span className="ms-kicker-dot" /><span>Vichanshu</span></div>
        <h2>Canvas Fingerprinting</h2>
        <p>Canvas output captures subtle differences in the browser&apos;s graphics stack and device environment.</p>
      </header>
      <div className="ms-canvas-content">
        <section className="ms-canvas-copy">
          <ol className="ms-canvas-layers">
            <li><span>01</span><div><strong>Font probing</strong><p>Text metrics and glyph rasterization differ across installed fonts and rendering engines.</p></div></li>
            <li><span>02</span><div><strong>Device &amp; OS rendering</strong><p>Browser, operating-system, and graphics settings change the final pixel output.</p></div></li>
            <li><span>03</span><div><strong>Hardware graphics</strong><p>GPU and driver behavior influence antialiasing, color, and canvas drawing results.</p></div></li>
          </ol>
          <aside className="ms-canvas-hash"><span>Combined hash</span><p>These independent rendering traces combine into a compact device signal for fingerprint comparison.</p></aside>
        </section>
        <div className="ms-canvas-evidence">
          <figure><Image src="/evidence/canvas-emoji-differences.png" width={636} height={555} alt="Emoji rendering differences across operating systems and devices" /></figure>
          <figure><Image src="/evidence/canvas-font-differences.png" width={1011} height={184} alt="Text rendering differences in canvas output" /></figure>
        </div>
      </div>
    </div>
  );
}

function CrossBrowserDirectionVisual() {
  return (
    <div className="ms-vichanshu-layout ms-cross-browser-layout" aria-label="Transition from single-browser to cross-browser fingerprinting">
      <header className="ms-vichanshu-heading">
        <div className="ms-kicker"><span>07</span><span className="ms-kicker-dot" /><span>Vichanshu</span></div>
        <h2>Going Toward Cross-Browser</h2>
        <p>Move from browser-specific output toward the device and operating-system signals that persist when the browser changes.</p>
      </header>
      <div className="ms-cross-browser-flow">
        <section className="ms-fingerprint-stage">
          <div className="ms-fingerprint-orbit"><span>OS &amp; hardware<br />level</span><div className="ms-browser-core">Browser</div></div>
          <p>Single-browser fingerprinting</p>
        </section>
        <div className="ms-cross-arrow" aria-hidden="true">→</div>
        <section className="ms-fingerprint-stage ms-cross-stage">
          <div className="ms-fingerprint-orbit"><span>OS &amp; hardware<br />level</span><div className="ms-device-core" /></div>
          <p>Cross-browser fingerprinting</p>
        </section>
      </div>
    </div>
  );
}

function NdssParametersVisual({ secondHalf = false }: { secondHalf?: boolean }) {
  const entries = secondHalf
    ? [
        {
          number: '03',
          title: 'Persistent OS-Level Baselines',
          copy: 'Screen resolution and timezone form a persistent operating-system baseline for the cross-browser task mask.',
        },
        {
          number: '04',
          title: 'WebGL Rendering Tasks',
          copy: 'Instead of only reading a GPU name, the method runs 3D rendering tasks. GPU-specific timing and pixel behavior provide a stable hardware signal across browsers.',
        },
      ]
    : [
        {
          number: '01',
          title: 'Audio Processing',
          copy: 'The AudioContext API processes complex waves. Differences in clipping and processing speed expose a signature of the sound hardware and CPU that remains stable across browsers.',
        },
        {
          number: '02',
          title: 'Hardware Concurrency',
          copy: 'The browser exposes logical CPU core count, while task scheduling and execution timing provide a hardware-level benchmark that does not depend on the browser engine.',
        },
      ];

  return (
    <div className="ms-vichanshu-layout ms-ndss-layout" aria-label="NDSS cross-browser fingerprinting parameters">
      <header className="ms-vichanshu-heading">
        <div className="ms-kicker"><span>{secondHalf ? '09' : '08'}</span><span className="ms-kicker-dot" /><span>Vichanshu</span></div>
        <h2>NDSS Parameters</h2>
        <p>Cross-browser matching relies on browser-independent hardware and operating-system evidence.</p>
      </header>
      <div className="vsh-flaws-focus ms-ndss-panels">
        {entries.map((entry) => (
          <section key={entry.number} className="vsh-flaw-section">
            <div className="vsh-flaw-heading"><span>{entry.number}</span><h3>{entry.title}</h3></div>
            <p className="vsh-flaw-formula">Cross-browser signal</p>
            <ul className="vsh-flaw-points"><li>{entry.copy}</li></ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function ResearchGapLimitsVisual() {
  const gaps = [
    ['The uniqueness ceiling', 'Current literature has not demonstrated 100% absolute device uniqueness at global scale, even with advanced fingerprinting methods.'],
    ['Standardized hardware and privacy defenses', 'Mass-produced devices share similar components, while browser privacy protections can reduce or sandbox client-side fingerprinting signals.'],
    ['Evasion and constrained datasets', 'Hardware-level tracking often relies on limited datasets and can be weakened by tools that randomize Canvas or WebGL rendering output.'],
  ];

  return (
    <div className="ms-vichanshu-layout ms-gap-layout" aria-label="Research gap: the limits of absolute device uniqueness">
      <header className="ms-vichanshu-heading">
        <div className="ms-kicker"><span>10</span><span className="ms-kicker-dot" /><span>Vichanshu</span></div>
        <h2>Research Gap</h2>
        <p>Browser fingerprints provide useful evidence, but no single client-side method can guarantee a unique identity in every setting.</p>
      </header>
      <div className="ms-gap-statements">
        {gaps.map(([title, copy], index) => (
          <article key={title} className="ms-gap-statement">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><h3>{title}</h3><p>{copy}</p></div>
          </article>
        ))}
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
            <h1>VPN Detection Using <em>Browser Fingerprinting</em></h1>
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
                    src="/images/vpn-process-diagram-simple.png"
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

        if (item.presenter === 'Vichanshu' && item.title === 'Literature Review Overview') {
          return <Slide key={`${item.presenter}-${item.title}`} nav={item.title} notes={item.brief} className="ms-slide ms-owner-vichanshu"><LiteratureReviewVisual /></Slide>;
        }

        if (item.presenter === 'Vichanshu' && item.title === 'Paper 1: Browser Fingerprinting') {
          return <Slide key={`${item.presenter}-${item.title}`} nav={item.title} notes={item.brief} className="ms-slide ms-owner-vichanshu"><BrowserParametersVisual /></Slide>;
        }

        if (item.presenter === 'Vichanshu' && item.title === 'Paper 2: Cross-Browser Device Identification') {
          return <Slide key={`${item.presenter}-${item.title}`} nav={item.title} notes={item.brief} className="ms-slide ms-owner-vichanshu"><CanvasFingerprintingVisual /></Slide>;
        }

        if (item.presenter === 'Vichanshu' && item.title === 'Paper 3: Server-Side VPN Detection') {
          return <Slide key={`${item.presenter}-${item.title}`} nav={item.title} notes={item.brief} className="ms-slide ms-owner-vichanshu"><CrossBrowserDirectionVisual /></Slide>;
        }

        if (item.presenter === 'Vichanshu' && item.title === 'Literature Review Synthesis') {
          return <Slide key={`${item.presenter}-${item.title}`} nav={item.title} notes={item.brief} className="ms-slide ms-owner-vichanshu"><NdssParametersVisual /></Slide>;
        }

        if (item.presenter === 'Vichanshu' && item.title === 'Research Gap') {
          return <Slide key={`${item.presenter}-${item.title}`} nav={item.title} notes={item.brief} className="ms-slide ms-owner-vichanshu"><NdssParametersVisual secondHalf /></Slide>;
        }

        if (item.presenter === 'Vichanshu' && item.title === 'Limits of Absolute Device Uniqueness') {
          return <Slide key={`${item.presenter}-${item.title}`} nav={item.title} notes={item.brief} className="ms-slide ms-owner-vichanshu"><ResearchGapLimitsVisual /></Slide>;
        }

        if (item.presenter === 'Vishwas' && item.title === 'Current System Flaws and Limitations') {
          return (
            <Slide
              key={`${item.presenter}-${item.title}`}
              nav={item.title}
              notes={item.brief}
              className="ms-slide ms-flaws-slide ms-owner-vishwas"
            >
              <div className="ms-flaws-main">
                <div className="ms-kicker">
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <span className="ms-kicker-dot" />
                  <span>{item.presenter}</span>
                </div>
                <h2>{item.title}</h2>
                <SystemFlawsVisual />
              </div>
            </Slide>
          );
        }

        if (item.presenter === 'Vishwas' && item.title === 'Future Improvements') {
          return (
            <Slide
              key={`${item.presenter}-${item.title}`}
              nav={item.title}
              notes={item.brief}
              className="ms-slide ms-improvement-slide ms-owner-vishwas"
            >
              <div className="ms-flaws-main">
                <div className="ms-kicker">
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <span className="ms-kicker-dot" />
                  <span>{item.presenter}</span>
                </div>
                <h2>{item.title}</h2>
                <FutureImprovementsVisual />
              </div>
            </Slide>
          );
        }

        if (item.presenter === 'Vishwas' && item.title === 'Statistical Parameter-Importance Analysis') {
          return (
            <Slide
              key={`${item.presenter}-${item.title}`}
              nav={item.title}
              notes={item.brief}
              className="ms-slide ms-flaws-slide ms-owner-vishwas"
            >
              <div className="ms-flaws-main">
                <div className="ms-kicker">
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <span className="ms-kicker-dot" />
                  <span>{item.presenter}</span>
                </div>
                <h2>{item.title}</h2>
                <ParameterImportanceVisual />
              </div>
            </Slide>
          );
        }

        if (item.presenter === 'Vishwas' && item.title === 'Redundancy Analysis and Feature Selection') {
          return (
            <Slide
              key={`${item.presenter}-${item.title}`}
              nav={item.title}
              notes={item.brief}
              className="ms-slide ms-improvement-slide ms-owner-vishwas"
            >
              <div className="ms-flaws-main">
                <div className="ms-kicker">
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <span className="ms-kicker-dot" />
                  <span>{item.presenter}</span>
                </div>
                <h2>{item.title}</h2>
                <RedundancySelectionVisual />
              </div>
            </Slide>
          );
        }

        if (item.presenter === 'Vishwas' && item.title === 'Conclusion') {
          return (
            <Slide
              key={`${item.presenter}-${item.title}`}
              nav={item.title}
              notes={item.brief}
              className="ms-slide ms-flaws-slide ms-owner-vishwas"
            >
              <div className="ms-flaws-main">
                <div className="ms-kicker">
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <span className="ms-kicker-dot" />
                  <span>{item.presenter}</span>
                </div>
                <h2>{item.title}</h2>
                <ConclusionVisual />
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
                  <p className="ms-comparison-context">Compare browser sessions using stable device signals and independent network evidence.</p>
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
              ) : item.presenter === 'Vishwas' && item.title === 'Current System Flaws and Limitations' ? (
                <SystemFlawsVisual />
              ) : item.presenter === 'Vishwas' && item.title === 'Future Improvements' ? (
                <FutureImprovementsVisual />
              ) : item.presenter === 'Vishwas' && item.title === 'Statistical Parameter-Importance Analysis' ? (
                <ParameterImportanceVisual />
              ) : item.presenter === 'Vishwas' && item.title === 'Redundancy Analysis and Feature Selection' ? (
                <RedundancySelectionVisual />
              ) : item.presenter === 'Vishwas' && item.title === 'Conclusion' ? (
                <ConclusionVisual />
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
