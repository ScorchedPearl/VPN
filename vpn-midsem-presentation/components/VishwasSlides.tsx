'use client';

import React, { useState } from 'react';

/* =========================================================================
   SLIDE 17: Current System Flaws and Limitations
   ========================================================================= */
export function SystemFlawsVisual() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);

  const flaws = [
    {
      id: 0,
      kicker: 'Information Theory · Laperdrix et al.',
      title: 'The Entropy Trap: Why More Features Cause Temporal Drift',
      mathLabel: 'Drift Probability Law',
      mathDisplay: (
        <span>
          P(Identity Mismatch over Time) = 1 &minus; &prod; (1 &minus; p<sub>drift, j</sub>) &rarr; 100%
        </span>
      ),
      summary:
        'Collecting every possible browser attribute feels intuitive, but volatile parameters inevitably change over time.',
      points: [
        {
          label: 'Temporal Instability',
          text: 'Minor browser updates, zoom levels, and extension changes cause features to flip, breaking continuity between visits.',
        },
        {
          label: 'Mathematical Consequence',
          text: 'As you add more parameters, the probability that at least one changes between visits approaches 100%.',
        },
      ],
    },
    {
      id: 1,
      kicker: 'Cross-Browser Invariance · Cao et al. (NDSS 2017)',
      title: 'Cross-Engine Disparity: The Stability vs. Uniqueness Collapse',
      mathLabel: 'Joint Fitness Objective',
      mathDisplay: (
        <span>
          Fitness = Stability &times; Uniqueness &rarr; 0 (when all features are used)
        </span>
      ),
      summary:
        'High-level browser features reflect the software engine (Blink, Gecko, WebKit), not the underlying device hardware.',
      points: [
        {
          label: 'Engine Differences',
          text: '2D Canvas rasterizers and JavaScript internals produce completely different outputs on Chrome vs. Firefox on the same laptop.',
        },
        {
          label: 'Mathematical Consequence',
          text: 'Including all parameters destroys cross-browser stability, causing the same physical device to look like two unrelated visitors.',
        },
      ],
    },
    {
      id: 2,
      kicker: 'Statistical Estimation & Privacy Defenses',
      title: 'Multicollinearity & Active Randomization Defenses',
      mathLabel: 'Variance Inflation & Injected Noise',
      mathDisplay: (
        <span>
          VIF &gt; 5 (Redundant Collinearity) &nbsp;|&nbsp; Injected Noise &epsilon; ~ N(0, &sigma;&sup2;)
        </span>
      ),
      summary:
        'Duplicate parameters inflate model instability, while privacy browsers deliberately randomize outputs.',
      points: [
        {
          label: 'Feature Redundancy',
          text: 'Collecting screen max edge, min edge, and aspect ratio duplicates geometry data without adding fresh entropy.',
        },
        {
          label: 'Hash Fragility',
          text: 'Brave Farbling and Firefox RFP inject subtle mathematical noise, causing brittle exact-hash comparisons to drop to zero.',
        },
      ],
    },
  ];

  const current = flaws[activeTab];

  return (
    <div className="vsh-deck-layout" aria-label="Current system flaws and limitations">
      <div className="vsh-pill-nav">
        {flaws.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`vsh-nav-pill ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id as 0 | 1 | 2)}
          >
            <span>0{item.id + 1}</span>
            <em>{item.title.split(':')[0]}</em>
          </button>
        ))}
      </div>

      <div className="vsh-card">
        <div className="vsh-card-header">
          <span className="vsh-kicker">{current.kicker}</span>
          <h3>{current.title}</h3>
          <p className="vsh-summary-text">{current.summary}</p>
        </div>

        <div className="vsh-math-banner">
          <span className="vsh-math-tag">{current.mathLabel}</span>
          <div className="vsh-math-equation">{current.mathDisplay}</div>
        </div>

        <div className="vsh-points-grid">
          {current.points.map((pt, idx) => (
            <div key={idx} className="vsh-point-box">
              <dt>{pt.label}</dt>
              <dd>{pt.text}</dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SLIDE 18: Future Improvements
   ========================================================================= */
export function FutureImprovementsVisual() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);

  const improvements = [
    {
      id: 0,
      kicker: 'Network Transport Layer',
      title: 'Transport Invariants: Clamping & Physical Delay Bounds',
      mathLabel: 'Physical Network Constraints',
      mathDisplay: (
        <span>
          Packet MTU &le; 1420 Bytes &nbsp;|&nbsp; Latency RTT &ge; (2 &times; Distance) / c<sub>fiber</sub>
        </span>
      ),
      summary:
        'Inspect physical transport reality directly at the server socket before executing any client JavaScript.',
      points: [
        {
          label: 'MTU Clamping',
          text: 'VPN encapsulation headers (WireGuard, IPsec) force packet MTU below 1500 B, exposing tunnels with zero client JS.',
        },
        {
          label: 'Speed-of-Light Bound',
          text: 'Packets cannot exceed light speed in fiber; latency discrepancies mathematically prove relaying.',
        },
        {
          label: 'TLS JA4 Fingerprinting',
          text: 'Cipher suite ordering unmasks the authentic operating system beneath spoofed User-Agent headers.',
        },
      ],
    },
    {
      id: 1,
      kicker: 'Fingerprint Matching Engine',
      title: 'Elastic Distance Matching: Continuous Similarity Curves',
      mathLabel: 'Smooth Kernel Distance Formulation',
      mathDisplay: (
        <span>
          Similarity(x, x&apos;) = exp(&minus;Distance&sup2; / 2&sigma;&sup2;) &nbsp;|&nbsp; S = &sum;(w<sub>i</sub> &times; s<sub>i</sub>) / &sum; w<sub>i</sub>
        </span>
      ),
      summary:
        'Replace fragile exact-match hashes (where 1 flipped bit zeroes similarity) with resilient continuous curves.',
      points: [
        {
          label: 'Noise Absorption',
          text: 'Absorbs subtle privacy perturbations (Brave Farbling) while still penalizing genuine hardware differences.',
        },
        {
          label: 'Missing-Tolerant Weights',
          text: 'When private browsing disables specific APIs, weights automatically re-normalize over available physical invariants.',
        },
        {
          label: 'Component Metrics',
          text: 'Uses normalized numerical distance for hardware specs and Jaccard set similarity for system fonts.',
        },
      ],
    },
    {
      id: 2,
      kicker: 'Single-Session Verification',
      title: 'Deterministic Contradiction Proofs (Zero Collision Risk)',
      mathLabel: 'Protocol Contradiction Rule',
      mathDisplay: (
        <span>
          Contradiction = [ STUN Public IP &ne; Server Observed IP ] &or; [ TCP OS &ne; Client User-Agent ]
        </span>
      ),
      summary:
        'Prove VPN usage through single-session physical contradictions rather than probabilistic guessing.',
      points: [
        {
          label: 'STUN Reflexive Discrepancy',
          text: 'When a WebRTC STUN request bypasses the VPN tunnel or reflects the ISP egress, the mismatch definitively proves multi-path routing.',
        },
        {
          label: 'Transport / Header Conflict',
          text: 'SYN packet TCP window and TTL parameters contradict user-reported browser headers.',
        },
        {
          label: 'Zero False Positives',
          text: 'Because evidence is verified within a single session, it eliminates device collision risks entirely.',
        },
      ],
    },
  ];

  const current = improvements[activeTab];

  return (
    <div className="vsh-deck-layout" aria-label="Future improvements architecture">
      <div className="vsh-pill-nav">
        {improvements.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`vsh-nav-pill ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id as 0 | 1 | 2)}
          >
            <span>Layer 0{item.id + 1}</span>
            <em>{item.title.split(':')[0]}</em>
          </button>
        ))}
      </div>

      <div className="vsh-card">
        <div className="vsh-card-header">
          <span className="vsh-kicker">{current.kicker}</span>
          <h3>{current.title}</h3>
          <p className="vsh-summary-text">{current.summary}</p>
        </div>

        <div className="vsh-math-banner">
          <span className="vsh-math-tag">{current.mathLabel}</span>
          <div className="vsh-math-equation">{current.mathDisplay}</div>
        </div>

        <div className="vsh-points-grid three-col">
          {current.points.map((pt, idx) => (
            <div key={idx} className="vsh-point-box">
              <dt>{pt.label}</dt>
              <dd>{pt.text}</dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SLIDE 19: Statistical Parameter-Importance Analysis
   ========================================================================= */
export function ParameterImportanceVisual() {
  const [activeCriterion, setActiveCriterion] = useState<0 | 1>(0);

  const criteria = [
    {
      id: 0,
      kicker: 'Information Theory',
      title: 'Mutual Information: Quantifying Uncertainty Reduction',
      mathLabel: 'Information Gain Formulation',
      mathDisplay: (
        <span>
          I(Parameter ; Device) = H(Device) &minus; H(Device | Parameter)
        </span>
      ),
      summary:
        'Measures the exact reduction in entropy (uncertainty) about the true device state achieved by observing a given parameter.',
      highTier: [
        'WebGL GPU Architecture & Renderer Family',
        'CPU Hardware Core Bucket (Resistant to Clamping)',
        'Server-Side TCP Packet MTU (Transport Invariant)',
        'WebRTC STUN Reflexive vs. Server IP Discrepancy',
      ],
      lowTier: [
        'Raw 2D Canvas Image Hash (Diverges on Engines & RFP)',
        'Minor User-Agent Build Number (Flips with Updates)',
        'Browser IANA Timezone String (Prone to Travel Drift)',
        'Screen Color Depth & Viewport Inner Dimensions',
      ],
    },
    {
      id: 1,
      kicker: 'Statistical Dispersion',
      title: 'Variance Ratio: Between-Device vs. Within-Device Stability',
      mathLabel: 'Fisher\'s F-Ratio Criterion',
      mathDisplay: (
        <span>
          F-Ratio = &sigma;&sup2;<sub>between devices</sub> / &sigma;&sup2;<sub>within same device</sub> &gt;&gt; 1
        </span>
      ),
      summary:
        'A parameter is statistically valuable if its variation across different devices is orders of magnitude larger than its variation on the same device.',
      highTier: [
        'Hardware Shaders & WebGL Extension Capabilities',
        'AudioContext Destination Hardware Sample Rate',
        'Display Aspect Ratio Bucket (Width / Height)',
        'TCP Syn Maximum Segment Size (MSS Clamping)',
      ],
      lowTier: [
        'Exact Client Screen Pixel Resolution',
        'HTTP Header Key Ordering (Manipulable in JS)',
        'Accept-Language Client Preference Strings',
        'Audio Oscillator Floating-Point Hashes',
      ],
    },
  ];

  const current = criteria[activeCriterion];

  return (
    <div className="vsh-deck-layout" aria-label="Statistical parameter importance">
      <div className="vsh-pill-nav">
        {criteria.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`vsh-nav-pill ${activeCriterion === item.id ? 'active' : ''}`}
            onClick={() => setActiveCriterion(item.id as 0 | 1)}
          >
            <span>Metric 0{item.id + 1}</span>
            <em>{item.title.split(':')[0]}</em>
          </button>
        ))}
      </div>

      <div className="vsh-card">
        <div className="vsh-card-header">
          <span className="vsh-kicker">{current.kicker}</span>
          <h3>{current.title}</h3>
          <p className="vsh-summary-text">{current.summary}</p>
        </div>

        <div className="vsh-math-banner">
          <span className="vsh-math-tag">{current.mathLabel}</span>
          <div className="vsh-math-equation">{current.mathDisplay}</div>
        </div>

        <div className="vsh-tier-grid">
          <div className="vsh-tier-card high">
            <div className="vsh-tier-header">
              <span className="vsh-dot teal" />
              <strong>High-Value Parameters (Retained)</strong>
            </div>
            <ul>
              {current.highTier.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <small>High information gain; stable across different browser engines.</small>
          </div>

          <div className="vsh-tier-card low">
            <div className="vsh-tier-header">
              <span className="vsh-dot slate" />
              <strong>Low-Value / Noisy Parameters (Discarded)</strong>
            </div>
            <ul>
              {current.lowTier.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <small>Low mutual information; highly volatile or actively spoofed.</small>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SLIDE 20: Redundancy Analysis and Feature Selection
   ========================================================================= */
export function RedundancySelectionVisual() {
  const [activeStep, setActiveStep] = useState<0 | 1>(0);

  return (
    <div className="vsh-deck-layout" aria-label="Redundancy analysis and feature selection">
      <div className="vsh-pill-nav">
        <button
          type="button"
          className={`vsh-nav-pill ${activeStep === 0 ? 'active' : ''}`}
          onClick={() => setActiveStep(0)}
        >
          <span>Step 01</span>
          <em>Collinearity & VIF Pruning</em>
        </button>
        <button
          type="button"
          className={`vsh-nav-pill ${activeStep === 1 ? 'active' : ''}`}
          onClick={() => setActiveStep(1)}
        >
          <span>Step 02</span>
          <em>Pareto-Optimal Feature Mask</em>
        </button>
      </div>

      <div className="vsh-card">
        {activeStep === 0 ? (
          <>
            <div className="vsh-card-header">
              <span className="vsh-kicker">Multicollinearity Diagnostics</span>
              <h3>Variance Inflation Factor (VIF) Filtering</h3>
              <p className="vsh-summary-text">
                When two features measure the exact same physical property, keeping both inflates model variance without expanding entropy.
              </p>
            </div>

            <div className="vsh-math-banner">
              <span className="vsh-math-tag">Collinearity Threshold</span>
              <div className="vsh-math-equation">
                <span>VIF = 1 / (1 &minus; R&sup2;) &nbsp;|&nbsp; Prune feature when VIF &gt; 5 (Severe Multicollinearity)</span>
              </div>
            </div>

            <div className="vsh-pairs-list">
              <div className="vsh-pair-item">
                <div className="vsh-pair-left">
                  <strong>Screen Max Edge &harr; Screen Min Edge</strong>
                  <span>Both measure the same display panel dimensions</span>
                </div>
                <div className="vsh-pair-arrow">&rarr;</div>
                <div className="vsh-pair-right">
                  <strong>Resolution:</strong>
                  <span>Retain invariant <em>Aspect Ratio Bucket</em>; prune raw pixel bounds.</span>
                </div>
              </div>

              <div className="vsh-pair-item">
                <div className="vsh-pair-left">
                  <strong>OS Family &harr; Architecture &amp; Bitness</strong>
                  <span>Tightly correlated operating system signals</span>
                </div>
                <div className="vsh-pair-arrow">&rarr;</div>
                <div className="vsh-pair-right">
                  <strong>Resolution:</strong>
                  <span>Collapse into a single <em>Coarse Hardware Platform</em> bucket.</span>
                </div>
              </div>

              <div className="vsh-pair-item">
                <div className="vsh-pair-left">
                  <strong>IP Timezone &harr; Browser UTC Offset</strong>
                  <span>Both approximate geographical longitude</span>
                </div>
                <div className="vsh-pair-arrow">&rarr;</div>
                <div className="vsh-pair-right">
                  <strong>Resolution:</strong>
                  <span>Evaluate as a single <em>Offset Delta</em> rather than independent features.</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="vsh-card-header">
              <span className="vsh-kicker">Feature Subset Optimization · Cao et al.</span>
              <h3>Pareto Mask: Maximizing Cross-Browser Retention</h3>
              <p className="vsh-summary-text">
                Finding the optimal feature subset is formulated as an optimization balancing cross-browser stability against feature count.
              </p>
            </div>

            <div className="vsh-math-banner">
              <span className="vsh-math-tag">Pareto Selection Objective</span>
              <div className="vsh-math-equation">
                <span>Max [ Stability(Subset) &times; Uniqueness(Subset) &minus; &lambda; &times; (Feature Count) ]</span>
              </div>
            </div>

            <div className="vsh-tier-grid">
              <div className="vsh-tier-card low">
                <div className="vsh-tier-header">
                  <span className="vsh-dot slate" />
                  <strong>Unpruned Feature Vector (Naive)</strong>
                </div>
                <p>Includes high-level browser rendering, exact screen pixels, and volatile headers.</p>
                <small>Result: Stability collapses to near zero across engines; noise dominates.</small>
              </div>

              <div className="vsh-tier-card high">
                <div className="vsh-tier-header">
                  <span className="vsh-dot teal" />
                  <strong>Pareto-Optimal Feature Mask (Selected)</strong>
                </div>
                <p>Restricted to invariant hardware capabilities, transport constraints, and orthogonal ratios.</p>
                <small>Result: High cross-browser retention while preserving distinct device identity.</small>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   SLIDE 21: Conclusion
   ========================================================================= */
export function ConclusionVisual() {
  return (
    <div className="vsh-deck-layout vsh-conclusion-layout" aria-label="Conclusion and synthesis">
      <div className="vsh-conclusion-main">
        <div className="vsh-card-header">
          <span className="vsh-kicker">Midsem Research Synthesis</span>
          <h3>A VPN changes the route. <em>Not the client device.</em></h3>
          <p className="vsh-summary-text">
            While IP addresses are fluid and easily masked by commercial anonymizers, physical hardware execution leaves durable, observable transport and browser footprints.
          </p>
        </div>

        <div className="vsh-conc-sections">
          <div className="vsh-conc-box">
            <div className="vsh-box-title">
              <span className="vsh-dot teal" />
              <h4>Prototype Delivered</h4>
            </div>
            <p>
              Successfully engineered the end-to-end <code>vpn-detector-final</code> framework, combining server-observed transport clamping, WebGL shader execution, and WebRTC STUN contradiction proofs.
            </p>
          </div>

          <div className="vsh-conc-box">
            <div className="vsh-box-title">
              <span className="vsh-dot teal" />
              <h4>Core Analytical Finding</h4>
            </div>
            <p>
              More features do not equal better detection. Naive parameter collection induces Shannon entropy drift and cross-engine divergence. Principled mathematical selection is mandatory for device continuity.
            </p>
          </div>

          <div className="vsh-conc-box highlight">
            <div className="vsh-box-title">
              <span className="vsh-dot blue" />
              <h4>Final Semester Roadmap</h4>
            </div>
            <p>
              1. Multi-platform empirical benchmark across diverse hardware and VPN protocols.<br />
              2. Mathematical optimization of the non-redundant feature subset.<br />
              3. Integration of active network path probing and research publication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
