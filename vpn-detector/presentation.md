# VPN Detection via Zero-Touch Passive Telemetry
## 5-Layer Passive Detection & Inconsistency Architecture

---

# 1. Project Objective
- **Goal:** Passive zero-touch detection of VPNs, Proxies, and Tor relays without requiring user interaction (zero CAPTCHA/MFA friction).
- **Method:** Multi-layer transport, flow dynamics, cryptographic, BGP, and client environment contradiction synthesis.
- **Target Audience:** Organizations requiring strict identity and location verification.
- **Core Principle:** Single-session physical and protocol contradiction proofs (eliminating false alarms from identical mass-market devices).

---

# 2. 5-Layer Zero-Touch Architecture

| Layer & Feature Group | Data Collector | Processing Overhead | Weight in Scoring |
| :--- | :--- | :--- | :--- |
| **Layer 1: Passive TCP/IP Stack** | p0f / eBPF / Kernel Driver | Near 0% | High (40%) |
| **Layer 2: Flow Trace (TPA-SSTM)** | Network TAP / Packet Capture | Low | High (35%) |
| **Layer 3: TLS JA4 Cryptography** | Reverse Proxy (HAProxy/NGINX) | Minimal | Medium (15%) |
| **Layer 4: BGP ASN & IP Intelligence** | Server-side IP Database Lookup | Negligible | Critical Override |
| **Layer 5: Silent Client JS** | Asynchronous `fetch()` script | Minimal | Medium (10%) |

---

# 3. Layer Breakdown

### Layer 1: Passive TCP/IP Stack Features (40% Weight)
- **Initial TTL:** Baselines (Windows=128, Linux/macOS/iOS=64) exposing intermediate proxy hops.
- **Don't Fragment (DF) Flag:** Evaluates path MTU discovery differences between consumer and server kernels.
- **MSS Clamping:** Tunnel encapsulation drops MSS from standard 1460 bytes to 1380, 1350, or 1280 bytes.
- **Initial Window Size & Scale:** Identifies large static datacenter buffers vs dynamic consumer stacks.
- **TCP Options String (JA4T):** Option ordering (MSS → NOP → WS → SACK → TS) identifies the true routing kernel.

### Layer 2: Traffic Trace & Flow Metadata (TPA-SSTM) (35% Weight)
- **Direction & Size Sequence:** Sequence vector (e.g. `[+1460, -64, +540, -64]`) capturing structural resource footprints.
- **Inter-Packet Arrival Delay ($\Delta t$):** Microsecond timestamps exposing VPN crypto overhead and queuing jitter.
- **Directional Burst Metrics:** Consecutive packet count, burst volume (bytes), and burst duration.
- **Cumulative Byte-Flow Trajectory:** Byte transfer slope over session elapsed time.

### Layer 3: Cryptographic & TLS Fingerprinting (15% Weight)
- **JA4 / JA3 Hash:** Hashes TLS version, ciphers, extensions, curves; unmasks non-browser runtimes (Python, Go, OpenVPN wrappers).
- **Cipher Suite Ordering:** Distinguishes genuine browsers from proxy scripts and custom VPN wrappers.
- **ALPN Negotiation:** Inspects `h2`, `http/1.1`, or `h3` negotiation consistency.

### Layer 4: Infrastructure & Routing Data (Critical Override)
- **BGP ASN Classification:** Flags cloud/datacenter ASNs (M247, DataCamp, AWS, OVH, Hetzner, DigitalOcean) vs residential ISPs.
- **CIDR Range Classification:** Known VPN exit nodes, public proxies, and Tor relay directories.
- **TCP Handshake RTT:** Speed-of-light triangulation (~200 km/ms) against claimed GeoIP distance.

### Layer 5: Silent Client-Side Telemetry (10% Weight)
- **Timezone Offset vs IP:** System clock offset vs GeoIP timezone.
- **System Locale & Languages:** `navigator.languages` vs IP native region language.
- **WebGL GPU vs User-Agent:** `UNMASKED_RENDERER_WEBGL` hardware string vs declared OS.
- **Speech Voices & System Fonts:** Native OS voice signatures (`window.speechSynthesis.getVoices()`) validating platform.
- **WebRTC STUN Leaks:** Server-reflexive address unmasking non-tunneled network interfaces.

---

# 4. Next Steps & Future Phases
- **Kernel / eBPF Integration:** Implement zero-overhead SYN packet parser for real-time JA4T extraction.
- **TPA-SSTM Flow Model:** Deploy flow-based traffic classifier on ingress TAP.
- **Unified Inconsistency Engine:** Weighted composite scoring combining Layers 1–5 with explainable evidence output.
