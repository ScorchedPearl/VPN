import Deck from '@/deck/Deck';
import Slide from '@/deck/Slide';
import { presentationSlides } from '@/data/presentation-store';
import Image from 'next/image';
import { ArrowRight, Database, FingerprintPattern, LayoutDashboard, Monitor, Server, ShieldCheck } from 'lucide-react';
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
              </header>

              {item.presenter === 'Saumya' && item.title === 'Problem Statement' ? (
                <ProblemStatementVisual />
              ) : item.presenter === 'Saumya' && item.title === 'Proposed Framework' ? (
                <ProposedFrameworkVisual />
              ) : item.presenter === 'Saumya' && item.title === 'System Architecture' ? (
                <SystemArchitectureVisual />
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
