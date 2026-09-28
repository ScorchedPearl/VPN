# Browser Fingerprinting for VPN-Risk Research

Research and implementation plan for the `vpn-detector` prototype  
Updated: 20 August 2026

## Scope and safety boundary

This document treats fingerprinting as a consented, first-party security and research technique. It is suitable for detecting fraud, measuring whether a controlled test browser returns, and assessing whether a session's network and browser signals are inconsistent.

It should not be used to identify a person across unrelated sites, reconstruct an offline identity, or secretly defeat a user's privacy choices. In this document, **session linkage** means associating observations within the authorized project. It does not mean discovering the human behind a properly configured VPN.

## Executive conclusion

1. A VPN changes the network path and apparent public IP. It normally does not change the device's GPU, screen, fonts, operating system, browser configuration, or rendering behavior. A fingerprint can therefore provide continuity when the apparent IP changes.
2. A browser fingerprint identifies an observed browser environment probabilistically. It is not a hardware serial number and is not proof of a person, device, VPN, or physical location.
3. A single exact hash is the wrong design. Browser updates, privacy defenses, monitors, fonts, extensions, and incognito modes change or suppress individual signals. Store versioned components and compare them with a missing-tolerant similarity model.
4. Cross-browser matching is possible in a controlled population, but it is much less dependable on the modern web than a 2017 laboratory result may suggest. A public website has no standard API that returns a stable physical-device identifier across Chrome, Firefox, Safari, and private windows.
5. For production security, use deterministic first-party mechanisms first: account/session identity, a first-party random identifier, and WebAuthn/passkeys. Use fingerprint similarity only as secondary risk evidence.
6. Fingerprinting does not directly detect a VPN. The strongest web-app VPN signals are server-observed IP intelligence, Tor/proxy/hosting classification, user-consented location comparison, and account/device history. Timezone, language, WebRTC, and fingerprint changes are supporting signals only.
7. A correctly configured VPN with modern WebRTC protections generally does not expose the user's non-VPN public IP to ordinary page JavaScript. Without a leak or privileged network/endpoint access, the prototype cannot recover it.

## 1. What is being identified?

Keep four concepts separate in the code and dashboard:

| Concept | What it can mean | What it cannot prove |
|---|---|---|
| Browser instance | A browser profile or a group of very similar observations | A unique physical device |
| Device cluster | Several browser observations that probably came from the same hardware | The human using it |
| Network egress | The public IP/ASN from which a request reached the service | The device's physical location or original IP |
| Account/person | A user who authenticated or was otherwise verified | That every session is controlled by that person |

This distinction prevents the most dangerous analytical mistake: converting a similarity score into a claim of identity.

The W3C defines fingerprinting as re-identifying a user agent or device through observable characteristics and explicitly notes both security uses and privacy risks. It also notes that VPN use does not prevent correlation through application-layer fingerprinting. See [W3C fingerprinting guidance](https://www.w3.org/TR/fingerprinting-guidance/).

## 2. Audit of the current prototype

The current collector is a useful demonstration, but its two red flags are not yet a defensible VPN classifier.

| Current behavior | Problem | Recommended change |
|---|---|---|
| `webrtcLeak = webrtcIps.length > 0` | A private host candidate is not automatically a leak; modern browsers may expose an mDNS name, a VPN address, a relay, IPv6, or nothing. The parser only accepts IPv4. | Parse ICE candidate type (`host`, `srflx`, `relay`), address family, and mDNS separately. Only call it a potential public-IP discrepancy when a server-reflexive public candidate differs from the server-observed public IP. Treat absence as unknown, not safe. |
| Exact IANA timezone comparison | Equivalent zones can have different names; travel, remote desktops, stale GeoIP, OS settings, and corporate networks create false positives. | Compare current UTC offset first and retain IANA-zone mismatch as a low-weight explanation. Account for DST and GeoIP confidence. |
| Client calls `ipapi.co` directly | It may be blocked, rate-limited, routed differently, or reveal data to an unnecessary third party. | Observe the IP at the first-party server and enrich it server-side. If a second vantage point is required for a split-tunnel experiment, disclose it and label it as a separate path. |
| API trusts forwarding headers | `X-Forwarded-For` is only trustworthy when a known reverse proxy removes user-supplied values and writes its own. | Define trusted-proxy behavior per deployment and use the platform's canonical client-IP field. Never trust arbitrary forwarding headers from the internet. |
| One 32-bit canvas hash | It is collision-prone, browser-specific, and changes under anti-fingerprinting noise. | Retain a versioned canvas component, hash it cryptographically on the server, and never use it alone. Repeat once to test within-page consistency. |
| One combined result with no persistence | The app cannot answer “is this the same browser/device?” because it stores no observations or ground truth. | Add consented experiment sessions, operator-supplied device labels, observation timestamps, component versions, and a comparison endpoint. |
| Raw exact values | They increase privacy risk and make the model brittle. | Bucket coarse values, store HMACs of high-entropy values, minimize retention, and keep raw diagnostic values only in explicitly enabled lab runs. |
| UI says Client Hints can expose Brave | Brave intentionally uses a Chrome-like desktop UA, and Client Hints are neither universal nor a reliable “true browser” oracle. | Display hints as reported client data and test them for internal consistency; do not claim they reveal a hidden browser identity. |
| Two Boolean anomalies | No base rate, calibration, uncertainty, or explanation hierarchy. | Produce a versioned, explainable risk score with `unknown`, `low`, `medium`, and `high` evidence states and validate thresholds on labeled data. |

Other limitations in the existing fields:

- `navigator.deviceMemory` is unavailable in some browsers and is deliberately coarse where present.
- `hardwareConcurrency` may be clamped by privacy protections.
- screen size changes with displays, scaling, orientation, and browser defenses.
- WebGL vendor/renderer may be hidden, generalized, software-rendered, or randomized.
- font visibility is deliberately restricted by Safari, Firefox protections, and Brave.
- network `rtt`, `downlink`, and `effectiveType` are volatile and not supported uniformly. They should not be identity inputs.
- a client can modify every JavaScript-derived field. Client data is evidence, not trusted attestation.

## 3. How to generate a useful fingerprint

### 3.1 Collect components, not “the fingerprint”

Use a versioned observation schema with four groups:

**A. Browser/profile signals**

- browser family and major version, parsed from UA and low-entropy Client Hints;
- language list and locale;
- supported Web APIs, codecs, CSS features, and media-query capabilities;
- privacy/feature-reduction observations, represented as “reduced” or “unavailable,” not as errors.

**B. Device-ish signals**

- OS family and broad version family;
- CPU-core bucket such as `1-2`, `3-4`, `5-8`, `9+`;
- memory bucket when available;
- screen dimensions, color depth, device-pixel-ratio bucket, color gamut, and touch capability;
- coarse WebGL vendor/renderer family and a versioned render result;
- canvas 2D result and font-availability groups in consented lab mode;
- optional audio-render result only in an explicitly disclosed research mode.

**C. Environment signals**

- timezone name and current UTC offset;
- locale and language order;
- current screen/orientation/window state;
- network information API fields, if present.

**D. Server/network signals**

- canonical server-observed IP, IP version, prefix, ASN, and organization category;
- IP intelligence flags: anonymous VPN, public proxy, residential proxy, Tor exit, hosting provider;
- IP geolocation with provider confidence and database date;
- TLS/HTTP characteristics exposed by the trusted CDN or ingress, if available;
- server receipt time and rate/velocity aggregates.

Do not put IP, RTT, current window dimensions, or exact browser version into a cross-browser device signature. They are useful observation or risk features, not durable device features.

### 3.2 Canonicalize and protect the data

For each component:

1. Normalize case, ordering, whitespace, units, and browser-specific labels.
2. Bucket values where exact precision adds privacy risk but little security value.
3. Record `unavailable`, `blocked`, and `collection_failed` separately. Missing data is not a zero.
4. Include a schema and collector version.
5. Compute component identifiers server-side using `HMAC-SHA-256(project_secret, schema_version || canonical_value)`. Do not expose stable raw hashes that another party could reuse for correlation.
6. Rotate/link secrets according to the approved retention period. Rotation can intentionally prevent indefinite linkage.

Keep the normal-mode first-party identifier separate from the fingerprint:

- `browser_instance_id`: random, first-party, revocable value stored in an `HttpOnly`, `Secure`, `SameSite` cookie;
- `observation_id`: random server identifier for one scan;
- `component_hashes`: protected feature values;
- `similarity_cluster_id`: server-side research label produced by a matcher, never sent as a global identifier;
- `ground_truth_device_id`: manually assigned random label for consented test devices only.

### 3.3 Match with similarity, not exact equality

For two observations `a` and `b`, calculate a missing-tolerant score:

```text
score(a,b) = sum(weight_i * similarity_i(a_i,b_i))
             / sum(weight_i for components present in both)
```

Where `similarity_i` can be:

- exact equality for categorical values;
- bucket or normalized distance for numeric values;
- Jaccard similarity for sets such as fonts or capabilities;
- family-level equality for GPUs, operating systems, and browsers;
- a learned calibrated probability after enough labeled observations exist.

Maintain two different models:

1. **Same-browser model:** may use browser family, major version, canvas, and profile-level capability details.
2. **Cross-browser device model:** excludes browser-specific fields and uses coarse OS/hardware/rendering families. It must use a stricter “insufficient evidence” state because many commodity devices look alike.

Do not assign weights from intuition permanently. Start with explicit heuristic weights, collect a balanced labeled dataset, then fit and calibrate a logistic-regression or gradient-boosted model. Keep a simple model as a baseline and retain human-readable reason codes.

## 4. The cross-browser problem and practical workarounds

The same device will usually generate different whole-fingerprint hashes in Chrome, Firefox, Safari, Edge, and Brave. The browser engine changes rendering, available APIs, user-agent data, privacy defenses, font exposure, codec support, and error behavior.

The 2017 NDSS cross-browser paper demonstrated that OS- and hardware-level tasks could link browsers in its experimental population, reporting 99.24% identification. That is evidence that cross-browser linkage can work; it is not a production accuracy guarantee for current browsers or a new population. Modern Safari, Firefox, and Brave deliberately reduce or randomize several of those signals. See [(Cross-)Browser Fingerprinting via OS and Hardware Level Features](https://www.ndss-symposium.org/ndss2017/ndss-2017-programme/cross-browser-fingerprinting-os-and-hardware-level-features/).

Use the following hierarchy:

| Requirement | Preferred method | Reliability | Important limitation |
|---|---|---:|---|
| Same browser profile returns | First-party random cookie plus account/session history | High | Cleared or isolated in private mode |
| Same authorized user across browsers | Login or explicit account linking | High | Identifies account, not necessarily device |
| Strong authentication | WebAuthn/passkey | High for credential possession | Passkeys may sync across devices; not a universal physical-device ID |
| Same managed enterprise device | MDM/device certificate or an approved native agent providing signed device posture | High in managed scope | Requires endpoint control and clear policy; not available to an ordinary public webpage |
| Same public-web physical device, no login | Probabilistic cross-browser similarity | Low to medium, population-dependent | Collisions, drift, spoofing, privacy defenses |

The key workaround is therefore **not** to force all browsers into one deterministic hash. It is to use deterministic account or managed-device binding when the requirement is deterministic, and use a confidence-labelled similarity model when only public-web signals are available.

WebAuthn is deliberately relying-party scoped and designed to avoid cross-site correlation. It proves possession of a credential, not a globally visible machine serial number. See the [WebAuthn specification](https://www.w3.org/TR/webauthn/).

## 5. Incognito/private-mode expectations

Private browsing mainly isolates or removes stored state. It does not promise that a site cannot observe the browser or network. Chrome states that sites can still collect information and that incognito is a separate session whose site data is removed at the end. See [Chrome's incognito documentation](https://support.google.com/chrome/answer/95464).

However, private modes are no longer equivalent across browsers:

| Browser family | Expected effect on this project |
|---|---|
| Chromium/Chrome incognito | First-party stored ID starts fresh; many device/rendering values may remain similar. Extensions are usually absent unless enabled. Do not assume every fingerprint remains identical. |
| Firefox private mode | Stored ID starts fresh; current fingerprinting protection can add canvas noise, restrict fonts, and coarsen CPU/screen/touch values. |
| Safari private browsing | Ephemeral storage plus advanced tracking/fingerprinting protections can add API noise and isolate tabs/site state. |
| Brave private window | Storage starts fresh; fingerprintable values may be farbled per session and site, so exact hashes are expected to change. |

Firefox documents canvas noise, font restriction, and coarsened hardware/screen values in its current protections. Brave describes deterministic per-site, per-session randomization. WebKit documents ephemeral private sessions and fingerprinting defenses. See [Firefox fingerprinting protection](https://support.mozilla.org/en-US/kb/firefox-protection-against-fingerprinting), [Brave fingerprint randomization](https://brave.com/privacy-updates/3-fingerprint-randomization/), and [WebKit tracking prevention](https://webkit.org/tracking-prevention/).

Do not make “incognito detected” a VPN-risk feature. Private mode is legitimate, detection is unreliable, and a wrong result has no causal connection to VPN use. In the study, the operator should label private-mode runs as ground truth rather than have the page infer them.

## 6. How fingerprinting can help VPN-risk detection

Fingerprinting helps indirectly in three ways.

### 6.1 Continuity despite network changes

If an authenticated account or high-confidence browser cluster appears from many distant IP geolocations or switches rapidly between residential and hosting/VPN networks, that history can increase risk. The conclusion is “same account/browser pattern with unusual network changes,” not “we discovered the real IP.”

Useful history features include:

- number of ASNs, countries, and IP prefixes per account/device window;
- time required to move between observations (“impossible travel”), with generous error bounds;
- rapid alternation between known residential and anonymizer networks;
- many accounts sharing one known exit IP;
- one account showing many incompatible device clusters in a short period;
- stable device-like signals combined with large, repeated network changes.

### 6.2 Network/browser consistency

Use weak indicators as a combination:

- IP country/timezone versus browser UTC offset;
- IP country versus language list, never as a nationality assumption;
- user-consented, fresh geolocation versus IP geolocation;
- server-observed IP versus a genuine WebRTC `srflx` public candidate, when exposed;
- OS/browser claims versus mutually inconsistent capability or rendering families;
- TLS/HTTP client characteristics versus application-layer browser claims when the trusted ingress exposes them.

Each has benign explanations: travel, corporate gateways, mobile carriers, remote desktops, virtual machines, accessibility tools, browser privacy settings, shared networks, and inaccurate GeoIP.

### 6.3 Resistance to trivial state clearing

A changed cookie plus a highly similar browser observation can signal that a supposedly new session may be related to an earlier one. This is useful for rate-limit recovery and account-protection review. It should not silently recreate deleted identifiers or extend tracking beyond the disclosed security purpose.

### 6.4 What fingerprinting cannot do

- It cannot prove that a VPN is active merely because the browser is unique.
- It cannot reliably reveal the non-VPN public IP unless a separate leak exists.
- It cannot distinguish a VPN from every corporate proxy, carrier-grade NAT, privacy relay, remote browser, or cloud workstation.
- It cannot reliably determine the human's physical location without a trusted, consented location mechanism.
- It cannot serve as an authentication factor by itself because JavaScript signals can be altered or replayed.

Network-side VPN protocol fingerprinting is a different capability. Research such as [OpenVPN is Open to VPN Fingerprinting](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) studies passive traffic features and active probing from a network observer. An ordinary HTTPS application server does not have the same packet-path visibility, so those results should not be presented as browser-side capabilities.

## 7. Recommended explainable VPN-risk model

Use three independent sub-scores so the UI shows *why* it is suspicious:

```text
network_anonymizer_score  = IP intelligence + ASN/prefix history + Tor list
location_consistency_score = consented location + timezone/locale consistency
session_continuity_score = account/browser-cluster history + velocity

overall_risk = calibrated_model(all available features)
```

An initial research-only rule baseline can be:

| Evidence | Starting contribution | Notes |
|---|---:|---|
| Current IP is in a maintained Tor exit list | +50 | Strong Tor evidence, not maliciousness |
| Two independent IP sources classify anonymous VPN/public proxy | +45 | Use source date and disagreement state |
| Hosting-provider network | +20 | Cloud users and corporate gateways cause false positives |
| Fresh, consented device geolocation conflicts materially with IP country | +30 | Only with adequate accuracy and age |
| Server IP differs from an exposed public `srflx` WebRTC candidate | +25 | Validate candidate type; modern browsers may suppress it |
| UTC offset inconsistent with IP location at that timestamp | +8 | Low weight; handle DST and zone alternatives |
| High-confidence browser cluster changes countries implausibly fast | +15 | Account for GeoIP error and travel hubs |
| Language uncommon for IP country | +3 | Very weak; never use alone |

These numbers are hypotheses for experiments, not production thresholds. Calibrate them against labeled VPN-on/VPN-off data and report performance at the real deployment base rate. A score should normally trigger stepped-up verification or review, not automatic denial.

For production IP classification, a maintained provider is more realistic than a static list. For example, MaxMind exposes separate `is_anonymous_vpn`, `is_hosting_provider`, `is_public_proxy`, `is_residential_proxy`, and `is_tor_exit_node` flags. Its own documentation warns that legitimate transactions can use anonymizers and that hosting networks are only supporting evidence. See [MaxMind anonymizer risk data](https://support.maxmind.com/knowledge-base/articles/ip-anonymizer-risk-data-minfraud).

## 8. Controlled test plan

### 8.1 Research questions

- RQ1: How stable is each component in the same browser profile over minutes, days, browser restarts, and updates?
- RQ2: How accurately can the model link different browsers on the same controlled device?
- RQ3: Which components change in private/incognito mode for each browser?
- RQ4: Which network signals distinguish VPN-on from VPN-off, and what legitimate conditions create the same pattern?
- RQ5: How much does fingerprint similarity improve VPN-risk classification beyond IP intelligence alone?

### 8.2 Test matrix

Use at least 20–30 heterogeneous consented devices for an initial pilot; more are needed for meaningful uniqueness claims. Include common and identical device models so the matcher is tested on collisions, not only diversity.

For every controlled device, collect repeated observations across:

| Dimension | Conditions |
|---|---|
| Browser | Chrome, Firefox, Safari on macOS, Edge on Windows, Brave; include mobile browsers separately |
| Profile | existing profile, fresh profile, normal mode, private/incognito |
| Time | 5 immediate repeats, restart, next day, next week, before/after a browser update |
| Display | normal window, resized window, zoom change, external monitor, orientation change |
| Network | home Wi-Fi, mobile hotspot, corporate network if authorized |
| VPN | off; at least two providers; two protocols; nearby and distant exits; reconnect to same and different exits |
| Privacy | default settings, Firefox strict/private, Brave shields/private, Safari private/advanced protection |

Use a manual random `ground_truth_device_id` entered by the test operator. Do not derive ground truth from the fingerprint you are evaluating.

### 8.3 Suggested row structure

```json
{
  "study_id": "vpn-fp-pilot-01",
  "ground_truth_device_id": "random-lab-label",
  "observation_id": "random-server-id",
  "collector_version": "2.0.0",
  "browser_family": "firefox",
  "mode_ground_truth": "private",
  "vpn_ground_truth": {
    "enabled": true,
    "provider_code": "provider-a",
    "protocol": "wireguard",
    "exit_country": "DE"
  },
  "components": {},
  "server_network": {},
  "consent_version": "2026-08-20",
  "collected_at": "ISO-8601 timestamp"
}
```

Keep provider labels pseudonymous in any published dataset and do not publish IP addresses or reversible high-entropy component values.

### 8.4 Metrics

For fingerprint linkage:

- per-component stability and missingness by browser/mode;
- genuine-pair versus impostor-pair score distributions;
- false-match rate, false-non-match rate, equal-error rate;
- precision/recall and top-1 retrieval for same-device matching;
- results split by same-browser, cross-browser, normal/private, and time gap;
- collision rate among identical/common hardware models.

For VPN detection:

- IP-intelligence-only baseline versus combined model;
- precision, recall, false-positive rate, ROC-AUC, and especially PR-AUC for an imbalanced population;
- Brier score or calibration curve;
- performance by VPN provider/protocol/exit type;
- false positives for corporate networks, mobile carriers, travel, privacy relays, cloud desktops, and Tor;
- abstention rate when evidence is missing.

Never publish only “fingerprint uniqueness.” A model can make every observation unique while failing to recognize the same browser tomorrow or falsely merging two common devices.

## 9. Recommended project architecture

```text
Browser collector
  -> sends versioned components and consent context
  -> first-party collection API
       -> canonical server IP from trusted ingress
       -> server-side IP enrichment
       -> normalization + HMAC component protection
       -> append-only observation store
            -> browser matcher
            -> cross-browser research matcher
            -> VPN-risk scorer
                 -> explanations + uncertainty
                 -> allow / step-up / review policy
```

Important separation:

- the client collects observations but never decides that a VPN exists;
- the server owns normalization, protected hashing, enrichment, scoring, and model versioning;
- the database stores evidence and lineage, not just a final Boolean;
- the policy layer decides whether to allow, ask for stronger verification, or send to review;
- model outputs never overwrite ground truth.

Suggested storage tables:

- `study_participants`: consent/version and random lab label;
- `observations`: timestamp, mode ground truth, VPN ground truth, collector version;
- `components`: normalized/HMAC value, source, availability, confidence;
- `network_assessments`: provider/version, flags, ASN, coarse geography;
- `matches`: model version, candidate observation, probability, reasons;
- `risk_assessments`: model version, sub-scores, final score, action, explanations.

## 10. Implementation roadmap for this repository

### P0 — correct misleading detections

- Replace the WebRTC Boolean with candidate parsing and `none/host/mdns/srflx/relay/public_discrepancy/unknown` states.
- Move public-IP enrichment to the server.
- define trusted-proxy handling for local, Vercel, or other deployments;
- replace exact timezone-name alarm with offset-aware, low-weight evidence;
- rename UI claims from “identity” and “hardware leaks” to “observed signals”;
- add explicit consent text and a research-mode toggle before high-entropy collection.

### P1 — make same-device testing possible

- add a versioned component schema and cryptographic server-side component HMACs;
- add a local database for observations and manually entered lab ground truth;
- add normal/private/VPN condition labels;
- implement same-browser and cross-browser similarity separately;
- show pairwise component differences and confidence rather than only a hash;
- export a de-identified CSV/JSON dataset for analysis.

### P2 — build VPN-risk evaluation

- integrate a maintained IP intelligence source and official Tor exit data;
- implement explainable sub-scores and an abstain state;
- add velocity/history features only after retention rules are approved;
- build the evaluation report with baselines, confidence intervals, false positives, and calibration;
- add step-up verification instead of blocking from one heuristic.

### P3 — production hardening, only if the study justifies it

- WebAuthn/account binding for deterministic continuity;
- rate limiting, signed server-issued scan challenges, replay detection, and schema validation;
- data-retention jobs, access audit logs, secret rotation, deletion/withdrawal workflow;
- bias testing across browsers, operating systems, languages, regions, and accessibility configurations;
- independent privacy, security, and legal review.

The open-source [FingerprintJS library](https://github.com/fingerprintjs/fingerprintjs) can be used as a benchmark collector, not as ground truth. Its maintainers explicitly describe client-side accuracy and spoofing limitations. Compare its component output and identifier stability with the project's transparent collector; do not silently add a third-party hosted collector.

## 11. Research papers and primary references

### Foundational browser fingerprinting

1. Peter Eckersley, **How Unique Is Your Web Browser?**, PETS 2010. The Panopticlick study reported 83.6% unique fingerprints in its self-selected sample and established entropy-based measurement. The sampling and browser ecosystem are old, so the number is historical, not a current accuracy target. [Paper](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf)
2. Nick Nikiforakis et al., **Cookieless Monster: Exploring the Ecosystem of Web-Based Device Fingerprinting**, IEEE S&P 2013. Useful for the fingerprinting ecosystem and the gap between theory and deployed tracking. [DOI](https://doi.org/10.1109/SP.2013.43)
3. Gunes Acar et al., **The Web Never Forgets: Persistent Tracking Mechanisms in the Wild**, CCS 2014. Large-scale study of canvas fingerprinting, respawning, and cookie syncing. [Project and paper summary](https://economics.princeton.edu/working-papers/the-web-never-forgets-persistent-tracking-mechanisms-in-the-wild/)
4. Pierre Laperdrix, Walter Rudametkin, and Benoit Baudry, **Beauty and the Beast: Diverting Modern Web Browsers to Build Unique Browser Fingerprints**, IEEE S&P 2016. Important for systematic attribute collection and the tradeoff between diversity and privacy. [Paper record](https://softwarediversity.eu/wp-publications/laperdrix16/index.html)

### Cross-browser, evolution, and real-world reliability

5. Yinzhi Cao, Song Li, and Erik Wijmans, **(Cross-)Browser Fingerprinting via OS and Hardware Level Features**, NDSS 2017. Directly addresses the same-device/different-browser question using OS/hardware tasks. [Paper and presentation](https://www.ndss-symposium.org/ndss2017/ndss-2017-programme/cross-browser-fingerprinting-os-and-hardware-level-features/)
6. Antoine Vastel et al., **FP-STALKER: Tracking Browser Fingerprint Evolutions**, IEEE S&P 2018. Shows why evolving fingerprints require linkage algorithms rather than exact hashes. [HAL record](https://hal.science/hal-01652021)
7. Alejandro Gómez-Boix, Pierre Laperdrix, and Benoit Baudry, **Hiding in the Crowd: An Analysis of the Effectiveness of Browser Fingerprinting at Large Scale**, WWW 2018. Reported 33.6% unique fingerprints in a large real-world dataset, much lower than earlier self-selected studies, while noting fragility of anonymity sets. [DOI](https://doi.org/10.1145/3178876.3186097)
8. Pierre Laperdrix et al., **Browser Fingerprinting: A Survey**, ACM TWEB 2020. Best single starting point for the taxonomy, uses, measurements, and defenses. [DOI](https://doi.org/10.1145/3386040)
9. Nampoina Andriamilanto et al., **A Large-scale Empirical Analysis of Browser Fingerprints Properties for Web Authentication**, TOPS 2021. Evaluates distinctiveness, longitudinal stability, collection cost, and verification error on a large dataset; useful for methodology, not proof that a fingerprint is an authentication factor. [Paper](https://arxiv.org/abs/2006.09511)

### VPN and WebRTC relevance

10. Nasser Mohammed Al-Fannah, **One Leak Will Sink a Ship: WebRTC IP Address Leaks**, ICCST 2017. Historically demonstrates that some browser/VPN combinations exposed additional addresses. Browser mitigations have changed since the experiment. [Paper record](https://pure.royalholloway.ac.uk/en/publications/one-leak-will-sink-a-ship-webrtc-ip-address-leaks/)
11. IETF, **RFC 8828: WebRTC IP Address Handling Requirements**. Current architectural reference for what ICE candidates can reveal and how browsers can limit exposure. [RFC 8828](https://datatracker.ietf.org/doc/html/rfc8828)
12. Diwen Xue et al., **OpenVPN is Open to VPN Fingerprinting**, USENIX Security 2022. Shows network-observer VPN protocol fingerprinting; it is relevant background but not an ordinary browser-web-app method. [Paper and artifacts](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen)

### Browser defenses and standards

13. W3C Privacy Working Group, **Mitigating Browser Fingerprinting in Web Specifications**, 2025. Current threat model, severity factors, and mitigation guidance. [W3C Note](https://www.w3.org/TR/fingerprinting-guidance/)
14. Mozilla, **Firefox's Protection Against Fingerprinting**. Current behaviors include canvas noise, font restrictions, and coarse hardware/screen reporting under relevant protection modes. [Mozilla documentation](https://support.mozilla.org/en-US/kb/firefox-protection-against-fingerprinting)
15. Brave, **Fingerprint Randomization** and **Fingerprinting Defenses 2.0**. Describes per-site/per-session randomization (“farbling”). [Overview](https://brave.com/privacy-updates/3-fingerprint-randomization/) and [technical follow-up](https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/)
16. WebKit, **Tracking Prevention in WebKit** and **Private Browsing 2.0**. Describes ephemeral storage, font/API restrictions, and advanced fingerprinting protections. [Tracking prevention](https://webkit.org/tracking-prevention/) and [Private Browsing 2.0](https://webkit.org/blog/15697/private-browsing-2-0/)

## 12. Privacy, governance, and publication requirements

Browser fingerprints, IP histories, precise locations, and account associations can be personal data. Before collecting a study dataset:

- state the exact security/research purpose and prohibit reuse for unrelated tracking;
- obtain informed consent for research participants and provide withdrawal/deletion;
- collect high-entropy signals only after the user initiates the scan;
- avoid third-party collection endpoints unless disclosed and contractually controlled;
- define retention for raw observations, protected components, matches, and reports;
- restrict access and log research-data exports;
- publish aggregate statistics and remove IPs, exact timestamps, account IDs, and reusable hashes;
- conduct a DPIA/privacy-impact assessment before real-user deployment;
- document false-positive appeal and step-up verification paths;
- do not make consequential government decisions from a fingerprint/VPN score alone.

European regulators explicitly treat fingerprinting as a storage/access tracking technology in relevant circumstances. See the [EDPB's final Article 5(3) guidance](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en) and [CNIL's tracker guidance](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi). In India, the [Digital Personal Data Protection Rules, 2025](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digit) have a staged commencement schedule; deployment should be reviewed against the provisions in force on the launch date and the project's government/legal mandate. This paragraph is an engineering risk flag, not legal advice.

## 13. Direct answers to the project questions

**Will the same device show the same fingerprint?**  
Often in the same browser/profile over a short period, but not always. Exact stability falls after updates, display/configuration changes, and privacy defenses. Measure a similarity score and uncertainty.

**Will different browsers on the same device show the same fingerprint?**  
The full hash should be expected to differ. A separate cross-browser model can compare OS/hardware families, but it remains probabilistic. For a deterministic answer, require account/WebAuthn binding or managed-device attestation.

**What happens in incognito/private mode?**  
Stored identifiers reset or become isolated. Some observable characteristics remain, while Firefox, Safari, and Brave may coarsen or randomize additional signals. Test each browser/version with operator-labelled ground truth.

**How does this help VPN detection?**  
It links or compares authorized sessions while the network egress changes, supplies low-weight consistency signals, and helps build velocity/history features. IP intelligence and trusted server-side network evidence should remain the primary VPN indicators.

**Can it deanonymize a VPN user?**  
Not by itself. It may correlate a VPN session with an earlier authorized observation of a similar browser, but it does not reveal a properly hidden source IP or prove a person's identity. Present this capability as probabilistic session linkage with strict privacy controls.

