# VPN & Device Linkage Research Lab

A consent-based schema 3.0 research prototype for demonstrating:

- same-device similarity across repeated visits;
- coarse cross-browser device comparison;
- normal versus private/incognito observations;
- continuity when an apparent public IP changes;
- corrected WebRTC ICE candidate interpretation;
- explainable VPN-compatible risk evidence.
- server-authoritative IP collection and enrichment;
- optional MaxMind anonymizer confidence and official Tor exit checks;
- HMAC-signed IPv4/IPv6 path probes and configurable first-party STUN;
- permissioned device-location comparison with accuracy bounds;
- temporal ASN/country/network-class history;
- grouped likelihood-ratio scoring with a base-rate prior and abstention;
- stored precision, recall, specificity, PR-AUC, and Brier evaluation metrics.

The app does **not** claim that a browser fingerprint proves a person, a physical device, or VPN use. The displayed probability is an **uncalibrated research posterior**, not a production probability, until evaluated and recalibrated on representative labelled traffic. Ground-truth labels are stored separately from the calculated score.

## Dataset separation

The final app writes only to `public.vpn_ndss2017_research_observations`.
The original prototype table, `public.vpn_research_observations`, is queried
read-only for comparison in the observation explorer. New NDSS-suite captures,
matching, evaluation, and retention therefore never mix with or alter legacy
records.

## Configuration

Copy `.env.example` to `.env.local` and configure at minimum `DATABASE_URL` and the deployment's trusted ingress provider. Network evidence remains explicitly non-authoritative until `TRUSTED_PROXY_PROVIDER` is set.

For the strongest network evidence:

1. Configure MaxMind Insights credentials or another reviewed server-side enrichment source.
2. Deploy dedicated IPv4-only and IPv6-only probe hostnames and share `PROBE_SIGNING_SECRET` across them.
3. Operate a first-party/contracted STUN service and set `STUN_URL`.
4. Set independent high-entropy secrets for scan challenges, probe signing, protected component HMACs, and maintenance.
5. Schedule the authenticated retention endpoint according to the approved raw-data retention period.

JA4 and HTTP protocol values are accepted only from explicitly configured trusted-ingress headers. A normal VPN frequently preserves the browser's TLS fingerprint, so these are client-consistency signals, not direct VPN proof.

## Run the demo

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Three-minute presentation flow

1. Leave the label as `demo-device-01`, select **Normal** and **VPN off**, then click **Capture & compare**. This establishes the baseline.
2. Enable a VPN, select **VPN on**, and capture again. The page should show a high device-similarity score and an IP change. That continuity becomes one explainable VPN-compatible signal.
3. Open the same deployed URL in another browser, private window, or physical device. Use the same controlled-device label when appropriate, select the correct mode, and capture. The shared PostgreSQL store lets the matcher compare this observation with the earlier baseline.
4. Use a different physical machine with a different label to demonstrate an impostor comparison.

The matcher reads the 200 most recent observations from PostgreSQL. The application has no observation-deletion endpoint; dataset removal is restricted to database administrators.

## What is implemented

- versioned fingerprint schema (`3.0.0`);
- SHA-256 browser and coarse-device demonstration signatures;
- missing-tolerant weighted similarity rather than one exact hash;
- separate same-browser and cross-browser models;
- per-component score explanations and research-label agreement;
- browser/OS, CPU and memory buckets, screen, GPU family, canvas, WebGL, fonts, capabilities, timezone, and network observations;
- typed WebRTC `host`, `srflx`, `relay`, and mDNS handling;
- server-side IP enrichment through MaxMind or `ipapi.co` after the user initiates a scan;
- deployment-specific canonical client-IP handling rather than trusting every forwarding header;
- maintained Tor exit lookup, richer anonymizer classes, confidence, provider, and database lineage;
- optional signed dual-stack path probes, first-party STUN, JA4/HTTP context, and permissioned geolocation;
- expanded WebGL, display, media-codec, storage, optional AudioContext, and speech-voice research components;
- persistent Supabase PostgreSQL storage across browsers, devices, deployments, and server restarts;
- explainable evidence grouped into network, path, location, history, and integrity families so correlated signals are capped;
- server-issued scan challenges, payload/rate limits, server timestamps, server-side HMAC component protection, and authenticated retention;
- evaluation metrics computed only from observations with known ground truth.
- an opt-in NDSS 2017 reproduction suite covering the paper's display, CPU,
  AudioContext-destination, writing-system, WebGL/Canvas, texture, alpha,
  clipping, lighting, compressed-texture, and media-capability task families;
- deterministic task inputs, per-task SHA-256 outputs, capability-aware task
  exclusion, and a bounded browser-pair mask search trained only from
  consented lab labels.

### NDSS 2017 suite

Enable **NDSS 2017 opt-in task suite** before capture to run the disclosed
paper-derived experiment inventory. It uses a fixed 256 x 256 canvas, a fixed
ambient-light/camera configuration, deterministic texture data, the paper's
eight alpha values, 36 writing-system checks, and WebGL capability probes for
DDS, PVR, float/depth, cubemap, and video-texture families. Browser output is
reduced to task hashes and support states; raw rendered pixels are not sent to
the server.

For a browser pair, the server trains a bounded version of the paper's mask
search on manually labelled study observations. It chooses only supported,
cross-browser-eligible task outputs that jointly optimize stability and
uniqueness. With insufficient labelled pairs, it deliberately contributes no
paper-task match score rather than inventing a linkage.

## Verification

```bash
npm run lint
npx next build --webpack
```

The webpack build option is useful in restricted environments where Turbopack cannot open its temporary local worker port.

## Important limitations

- The database URL stays in `.env.local` and is used only by server-side code. Configure the same `DATABASE_URL` deployment secret when hosting the app.
- JavaScript-derived fields can be modified or replayed and are not trusted attestation.
- The `ipapi` fallback provides geography/ASN and only a weak hosting heuristic; use maintained anonymizer intelligence for classification.
- Private browsers may suppress, coarsen, or randomize fingerprint components.
- Likelihood ratios, the 5% prior, and decision thresholds are research hypotheses that require calibration on a larger labelled dataset split by device, time, provider, and protocol.

See [BROWSER_FINGERPRINTING_RESEARCH.md](./BROWSER_FINGERPRINTING_RESEARCH.md) for the methodology, test matrix, papers, privacy controls, and production roadmap.
