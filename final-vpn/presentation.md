# VPN Detection via Browser Fingerprinting
## Project Prototype Summary

---

# 1. Project Objective
- **Goal:** Develop a prototype to detect VPN and Proxy usage.
- **Method:** Advanced browser fingerprinting and network topology analysis.
- **Target Audience:** Government organizations requiring strict identity and location verification.
- **Scope:** First phase focuses on robust data collection and anomaly detection when a user interacts with the system.

---

# 2. Technology Stack
- **Frontend & Backend:** Next.js (React Framework).
- **Styling:** Tailwind CSS for a premium, modern dashboard.
- **Animations:** Framer Motion for a sleek user experience.
- **Deployment:** Runs locally for initial research and testing.

---

# 3. Core Features Developed
1. **Interactive Dashboard:** A sleek UI to trigger identity analysis.
2. **Client-Side Engine:** Extracts deep hardware and browser identifiers.
3. **Server-Side Capture:** Intercepts HTTP and Proxy headers.
4. **Active Anomaly Detection:** Cross-references data points to flag suspicious mismatches.

---

# 4. Data Collected: Network & Server
- **Public IP Address:** Captured via external geolocation services.
- **Geolocation Data:** City, Country, ISP, and IP-specific Timezone.
- **HTTP Headers:** User-Agent, Accept-Language.
- **Proxy Headers:** `X-Forwarded-For`, `X-Real-IP`, `Via`.
- **Client Hints (`sec-ch-ua`):** Unmasks the true browser (e.g., exposing Brave even when it masks as Chrome).

---

# 5. Data Collected: Advanced Fingerprints
- **Canvas Fingerprinting:** Renders hidden graphics to create a unique hash based on OS and GPU rendering quirks.
- **WebGL Vendor & Renderer:** Bypasses software masks to reveal actual hardware (e.g., Apple M2 chips).
- **Hardware Specs:** CPU cores, Device RAM, Screen Resolution, Color Depth.
- **Font Fingerprinting:** Enumerates installed system fonts via canvas text measurements.

---

# 6. How VPNs Are Detected (Anomalies)
- **Timezone Mismatch (Primary Heuristic):** 
  - Compares the physical Timezone of the IP address against the system Timezone of the browser.
  - A mismatch heavily indicates the use of a VPN/Proxy altering the IP location.
- **WebRTC IP Leaks:** 
  - Uses hidden data channels to coax the browser into leaking internal network IPs or true public IPs, bypassing the VPN tunnel.

---

# 7. Next Steps & Future Phases
- **Server Deployment:** Host the application on a public server to test real-world IP capture.
- **Database Integration:** Store fingerprints to detect returning users who change their IP addresses.
- **Machine Learning (Optional):** Train a model to weight the suspicion score based on the combination of anomalies detected.
