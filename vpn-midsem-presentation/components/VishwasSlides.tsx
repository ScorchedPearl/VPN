'use client';

import React from 'react';

/* =========================================================================
   SLIDE 17: Current System Flaws and Limitations
   ========================================================================= */
export function SystemFlawsVisual() {
  return (
    <div className="vsh-flaws-focus" aria-label="Entropy and multicollinearity limitations">
      <section className="vsh-flaw-section">
        <div className="vsh-flaw-heading"><span>01</span><h3>Entropy</h3></div>
        <p className="vsh-flaw-formula">
          P(Identity mismatch over time) = 1 &minus; &prod;(1 &minus; p<sub>drift,j</sub>)
        </p>
        <ul className="vsh-flaw-points">
          <li>Every volatile browser signal increases the chance that a repeat visit changes its fingerprint.</li>
          <li>Stable features should be prioritised so device matching remains reliable over time.</li>
        </ul>
        <p className="vsh-flaw-reference">Reference: <a href="/papers/beauty-sp16.pdf" target="_blank" rel="noreferrer">Laperdrix et al., <em>Beauty and the Beast</em>, IEEE S&amp;P, 2016</a>.</p>
      </section>

      <section className="vsh-flaw-section">
        <div className="vsh-flaw-heading"><span>02</span><h3>Multicollinearity</h3></div>
        <p className="vsh-flaw-formula">VIF = 1 / (1 &minus; R<sup>2</sup>)</p>
        <ul className="vsh-flaw-points">
          <li>Correlated features repeat the same information and can inflate the model&apos;s variance.</li>
          <li>Removing high-VIF features keeps the selected signal set compact and non-redundant.</li>
        </ul>
        <p className="vsh-flaw-reference">Reference: <a href="/papers/ndss2017_02B-3_Cao_paper.pdf" target="_blank" rel="noreferrer">Cao, Li &amp; Wijmans, <em>(Cross-)Browser Fingerprinting</em>, NDSS, 2017</a>.</p>
      </section>
    </div>
  );
}

/* =========================================================================
   SLIDE 18: Future Improvements
   ========================================================================= */
export function FutureImprovementsVisual() {
  return (
    <section className="vsh-improvement-focus" aria-label="Elastic distance mapping">
      <div className="vsh-improvement-grid">
        <figure className="vsh-improvement-figure">
          <img src="/images/rbf-kernel-formula-reference.png" alt="Gaussian RBF kernel formula and explanation" />
        </figure>
        <div className="vsh-improvement-copy">
          <div className="vsh-improvement-heading"><span>01</span><h3>Elastic Distance Mapping</h3></div>
          <p className="vsh-improvement-intro">A continuous similarity method that compares sessions without treating a minor signal change as a completely different device.</p>
          <p className="vsh-improvement-formula">
            Similarity(x, x&apos;) = exp(&minus;Distance<sup>2</sup> / 2&sigma;<sup>2</sup>)
          </p>
          <ul className="vsh-improvement-points">
            <li>Small changes in browser signals lower similarity gradually instead of causing an all-or-nothing mismatch.</li>
            <li>Weighted scores keep stable hardware signals important while allowing noisy or unavailable signals to contribute less.</li>
          </ul>
          <p className="vsh-improvement-reference">Formula: Gaussian / RBF kernel — <a href="https://scikit-learn.org/stable/modules/generated/sklearn.gaussian_process.kernels.RBF.html" target="_blank" rel="noreferrer">scikit-learn RBF documentation</a>.</p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   SLIDE 19: Statistical Parameter-Importance Analysis
   ========================================================================= */
export function ParameterImportanceVisual() {
  return (
    <div className="vsh-flaws-focus" aria-label="Statistical parameter importance">
      <section className="vsh-flaw-section">
        <div className="vsh-flaw-heading"><span>01</span><h3>Mutual Information</h3></div>
        <p className="vsh-flaw-formula">I(Parameter; Device) = H(Device) &minus; H(Device | Parameter)</p>
        <ul className="vsh-flaw-points">
          <li>Measures how much observing one parameter reduces uncertainty about the device.</li>
          <li>Features with higher information gain are more useful for distinguishing devices.</li>
        </ul>
        <p className="vsh-flaw-reference">Reference: <a href="/papers/beauty-sp16.pdf" target="_blank" rel="noreferrer">Laperdrix et al., <em>Beauty and the Beast</em>, IEEE S&amp;P, 2016</a>.</p>
      </section>

      <section className="vsh-flaw-section">
        <div className="vsh-flaw-heading"><span>02</span><h3>Variance Ratio</h3></div>
        <p className="vsh-flaw-formula">F = &sigma;<sup>2</sup><sub>between devices</sub> / &sigma;<sup>2</sup><sub>within device</sub></p>
        <ul className="vsh-flaw-points">
          <li>A strong parameter changes more between different devices than across repeat visits from one device.</li>
          <li>High ratios identify stable signals that can support reliable session matching.</li>
        </ul>
        <p className="vsh-flaw-reference">Reference: <a href="/papers/ndss2017_02B-3_Cao_paper.pdf" target="_blank" rel="noreferrer">Cao, Li &amp; Wijmans, <em>(Cross-)Browser Fingerprinting</em>, NDSS, 2017</a>.</p>
      </section>
    </div>
  );
}

/* =========================================================================
   SLIDE 20: Redundancy Analysis and Feature Selection
   ========================================================================= */
export function RedundancySelectionVisual() {
  return (
    <section className="vsh-improvement-focus" aria-label="Pareto-optimal feature mask">
      <div className="vsh-improvement-grid">
        <figure className="vsh-improvement-figure">
          <img src="/images/pareto-front-reference.png" alt="Pareto solutions and Pareto front in a multi-objective optimisation problem" />
        </figure>
        <div className="vsh-improvement-copy">
          <div className="vsh-improvement-heading"><span>01</span><h3>Pareto-Optimal Mask</h3></div>
          <p className="vsh-improvement-intro">Select a feature subset that balances device uniqueness, cross-browser stability, and a small feature count.</p>
          <p className="vsh-improvement-formula">m* is Pareto-optimal if no mask m improves one objective without worsening another.</p>
          <ul className="vsh-improvement-points">
            <li>Each mask on the Pareto front represents a valid trade-off between useful device evidence and feature complexity.</li>
            <li>The selected mask retains stable, independent signals while removing redundant or volatile features.</li>
          </ul>
          <p className="vsh-improvement-reference">Reference: <a href="https://optima.cs.cityu.edu.hk/research/moo.html" target="_blank" rel="noreferrer">Optima Group, Pareto Optimality Definition</a>.</p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   SLIDE 21: Conclusion
   ========================================================================= */
export function ConclusionVisual() {
  return (
    <div className="vsh-conclusion-content">
      <ul className="vsh-conclusion-bullets" aria-label="Project conclusion">
        <li>A VPN hides the original IP address, so IP data alone cannot reliably identify the same device across sessions.</li>
        <li>Browser signals can help compare repeated sessions even when the visible IP address changes.</li>
        <li>Network information and browser fingerprints work together to calculate a device-similarity score.</li>
        <li>Stable, independent signals give more reliable results than collecting every browser feature.</li>
        <li>The system supports risk-based verification. It does not prove a person&apos;s identity or VPN use by itself.</li>
      </ul>

      <section className="vsh-conclusion-links" aria-label="References and links">
        <h3>References &amp; Links</h3>
        <div className="vsh-link-group">
          <strong>Project</strong>
          <a href="https://vpn-detector-final.vercel.app/" target="_blank" rel="noreferrer">VPN Detector Website</a>
        </div>
        <div className="vsh-link-group">
          <strong>Formula Sources</strong>
          <a href="https://datatracker.ietf.org/doc/draft-eastlake-fnv/" target="_blank" rel="noreferrer">FNV-1a Hash</a>
          <a href="https://csrc.nist.gov/pubs/fips/180-4/upd1/final" target="_blank" rel="noreferrer">SHA-256 Standard</a>
          <a href="https://scikit-learn.org/stable/modules/generated/sklearn.gaussian_process.kernels.RBF.html" target="_blank" rel="noreferrer">RBF Kernel</a>
          <a href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.jaccard_score.html" target="_blank" rel="noreferrer">Jaccard Similarity</a>
          <a href="https://optima.cs.cityu.edu.hk/research/moo.html" target="_blank" rel="noreferrer">Pareto Optimality</a>
        </div>
        <div className="vsh-link-group">
          <strong>Research Papers</strong>
          <a href="/papers/beauty-sp16.pdf" target="_blank" rel="noreferrer">Beauty &amp; Beast</a>
          <a href="/papers/ndss2017_02B-3_Cao_paper.pdf" target="_blank" rel="noreferrer">Cross-Browser Fingerprinting</a>
          <a href="/papers/snitch-madweb25.pdf" target="_blank" rel="noreferrer">SNITCH</a>
          <a href="/papers/techreport-2025-3.pdf" target="_blank" rel="noreferrer">Technical Report</a>
          <a href="/papers/tunnel-ml-2022.pdf" target="_blank" rel="noreferrer">Tunnel ML</a>
        </div>
      </section>
    </div>
  );
}
