# VPN & Device Linkage Research Lab

A consent-based research prototype for demonstrating:

- same-device similarity across repeated visits;
- coarse cross-browser device comparison;
- normal versus private/incognito observations;
- continuity when an apparent public IP changes;
- corrected WebRTC ICE candidate interpretation;
- explainable VPN-compatible risk evidence.

The app does **not** claim that a browser fingerprint proves a person, a physical device, or VPN use. Ground-truth labels are stored separately from the calculated score so the experiment can measure correct and incorrect matches.

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

- versioned fingerprint schema (`2.0.0`);
- SHA-256 browser and coarse-device demonstration signatures;
- missing-tolerant weighted similarity rather than one exact hash;
- separate same-browser and cross-browser models;
- per-component score explanations and research-label agreement;
- browser/OS, CPU and memory buckets, screen, GPU family, canvas, WebGL, fonts, capabilities, timezone, and network observations;
- typed WebRTC `host`, `srflx`, `relay`, and mDNS handling;
- external egress enrichment through `ipapi.co` after the user initiates a scan;
- first-party server network observation;
- persistent Supabase PostgreSQL storage across browsers, devices, deployments, and server restarts;
- explainable evidence for hosting networks, timezone mismatch, public WebRTC discrepancy, vantage-point disagreement, and stable-device/network-change continuity.

## Verification

```bash
npm run lint
npx next build --webpack
```

The webpack build option is useful in restricted environments where Turbopack cannot open its temporary local worker port.

## Important limitations

- The database URL stays in `.env.local` and is used only by server-side code. Configure the same `DATABASE_URL` deployment secret when hosting the app.
- JavaScript-derived fields can be modified or replayed and are not trusted attestation.
- IP enrichment is heuristic and the free demo lookup is not a maintained anonymous-VPN database.
- Private browsers may suppress, coarsen, or randomize fingerprint components.
- Risk scores are research hypotheses that require calibration on a larger labelled dataset.

See [BROWSER_FINGERPRINTING_RESEARCH.md](./BROWSER_FINGERPRINTING_RESEARCH.md) for the methodology, test matrix, papers, privacy controls, and production roadmap.
