import Deck from '@/deck/Deck';
import Slide from '@/deck/Slide';
import { presentationSlides } from '@/data/presentation-store';
import { ArrowRight, Database, FingerprintPattern, LayoutDashboard, Monitor, Server, ShieldCheck } from 'lucide-react';
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

export default function Home() {
  return (
    <Deck>
      {presentationSlides.map((item, index) => (
        <Slide
          key={`${item.presenter}-${item.title}`}
          nav={item.title}
          notes={item.brief}
          className={`ms-slide ms-owner-${item.presenter.toLowerCase()}`}
        >
          <div className="ms-template">
            <header className="ms-template-header">
              <div className="ms-kicker">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="ms-kicker-dot" />
                <span>{item.presenter}</span>
              </div>
              <h2>{item.title}</h2>
            </header>

            {item.presenter === 'Saumya' && item.title === 'Problem Statement' ? (
              <ProblemStatementVisual />
            ) : item.presenter === 'Saumya' && item.title === 'Proposed Framework' ? (
              <ProposedFrameworkVisual />
            ) : item.presenter === 'Saumya' && item.title === 'System Architecture' ? (
              <SystemArchitectureVisual />
            ) : (
              <div className="ms-image-grid">
                {Array.from({ length: item.imageSlots }, (_, slotIndex) => (
                  <ImageSpace key={slotIndex} index={slotIndex} />
                ))}
              </div>
            )}
          </div>
        </Slide>
      ))}
    </Deck>
  );
}
