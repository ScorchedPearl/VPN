# VPN detection: research, parameters and implementation

Updated: 25 October 2026 · app: `final-vpn` · model `vpn-device-anchored-1.0` · fingerprint schema 5.1.0.

**Goal:** decide whether a visitor's connection goes through a VPN, proxy or relay, using only what a website legitimately sees: the HTTP request, the browser, and the history of the same physical device (from the linkage model in `RESEARCH_2022_2026.md`).

**Core idea:** a VPN changes the *network* a device appears from, not the *device*. Once the linkage model recognises "this is Vishwas's laptop", its own history becomes the baseline: usual networks, usual latency, usual country. Population-wide, a VPN exit is a network that unrelated devices pass through but none of them lives on.

---

## 1. Research reviewed

| Work | What it shows | Parameter taken | Used |
|---|---|---|---|
| Ramesh et al., **CalcuLatency**, USENIX Security 2024 | With a proxy, the HTTPS round trip reaches the client but the TCP handshake ends at the exit, so app RTT > TCP RTT | Gap > **50 ms** ⇒ proxy; 89.1% detection at 0.95% FPR | Yes, when a trusted ingress supplies TCP RTT (`TCP_RTT_HEADER_NAME`); Vercel does not |
| Schwartz et al., **SNITCH** (NDSS) | Geolocation + delay to landmarks detects VPNs without VPN lists; up to 93% | Landmark delays vs claimed location | Yes, as browser-side latency landmarks |
| Weinberg et al., **How to Catch when Proxies Lie**, IMC 2018 | ~⅓ of 2,269 proxy servers are not in their advertised country; delay-based active geolocation catches them | Physical-feasibility test on RTTs | Yes: "IP location is physically impossible" |
| Gueye et al., **Constraint-Based Geolocation**, IEEE/ACM ToN 2006; Wong et al., **Octant**, NSDI 2007 | RTT bounds distance; light in fibre ≈ ⅔ c | **RTT (ms) ≥ distance (km) / 100** | Yes, core of latency geometry |
| Khan et al., **An Empirical Analysis of the Commercial VPN Ecosystem**, IMC 2018 | 5–30% of vantage points of ~10% of providers are hosted outside the advertised country | Don't trust IP-geolocation alone | Motivates latency checks |
| Ramesh et al., **VPNalyzer**, NDSS 2022 | 80 desktop VPNs: tunnel-failure leaks (26), DNS leaks, IPv6 leaks (5), leaks even with kill switch | Leaks across parallel channels | Yes: WebRTC address vs HTTP address; IPv4/IPv6 probes kept from earlier version |
| Al-Fannah 2017; WebRTC leak literature; W3C WebRTC IP privacy | STUN may bypass browser proxies and split tunnels | srflx address ≠ HTTP address (same family) | Yes: "WebRTC reveals a different public address" |
| Venugopalan et al., **FP-Inconsistent** (2024/25); Vastel et al., **FP-Scanner** (USENIX Sec 2018) | Spoofed/relayed sessions are internally inconsistent | Cross-attribute consistency | Yes: browser timezone vs IP timezone; device home country |
| Xue et al., **OpenVPN is Open to VPN Fingerprinting**, USENIX Security 2022 | Network observers fingerprint VPN protocols (opcodes, ACK patterns) | Packet-level | Not applicable from a website; documented |
| Alazzam et al., **TPA-SSTM**, Sci. Rep. 2026 (in this folder) | Website fingerprinting through VPN tunnels with CNN-Transformer | Packet traces | Not applicable from a website; documented |
| MTU/MSS fingerprinting (WireGuard MTU 1420/1440, OpenVPN mssfix MSS; JA4T) | Tunnel overhead lowers the TCP MSS seen in the SYN | MSS outliers | Needs raw SYN packets; not available on Vercel; documented |
| Vanhoef et al., **TunnelCrack**, USENIX Security 2023; TunnelVision (2024) | VPN clients leak via routing exceptions | Leaks | Background for leak signals |
| **X4BNet lists_vpn** (MIT, auto-built from ASNs) | VPN netblocks and VPN/datacenter ASNs | List membership | Yes |
| **Apple iCloud Private Relay** egress ranges (official CSV) | Relay egress addresses | List membership | Yes: labelled as relay, not VPN |
| **Tor Project** bulk exit list | Tor exits | List membership | Yes |
| **Vercel request headers** | Free IP geolocation on every deployed request: country, region, city, lat/long, continent, postal code, IP timezone; `x-vercel-id` edge region | — | Yes: replaces the missing IP intelligence |

## 2. Signals implemented (`src/utils/vpn-detection.ts`)

Weights are natural-log likelihood ratios (positive = more likely VPN). Groups are capped so correlated evidence cannot run away. Network +5.5/−1.2, location +3/−1, path +4/−1.2, device history +3/−1.5, integrity +0.8.

| Group | Signal | Weight | Rule |
|---|---|---|---|
| Network | Tor exit | +5.0 | On Tor Project list |
| | Known VPN network | +4.0 | On X4BNet VPN list |
| | Datacenter / hosting network | +2.8 | On X4BNet datacenter list (only if not on VPN list) |
| | iCloud Private Relay | +1.5 | On Apple list; kind = `private-relay` |
| | MaxMind anonymous VPN / public / residential proxy | +3.6 / +3.0 / +2.6 | When MaxMind is configured |
| | Shared by devices that live elsewhere | +1.8 | ≥ 2 other inferred devices used this /24 while their own most-used clean network is different |
| | Ordinary ISP address | −0.7 | On none of ≥ 2 lists |
| Location | Browser vs IP timezone disagree | +2.0 | UTC offsets differ by ≥ 60 min |
| | Timezone matches | −0.5 | Offsets equal |
| | Device appears from a new country | +1.2 | IP country not among the device's earlier clean scans |
| Path | IP location physically impossible | +1.6 | A landmark > 1,500 km away answers faster than 80% of the light-in-fibre minimum |
| | Large unexplained latency | +2.4 | Excess > 180 ms |
| | Unexplained latency | +1.3 | Excess > 100 ms |
| | Latency fits the IP location | −0.9 | Excess < 50 ms |
| | WebRTC reveals a different address | +2.7 | STUN srflx ≠ HTTP address (same family) |
| | Forwarding proxy headers | +1.5 | Via, Forwarded, X-Proxy-ID, … present |
| | Application vs TCP latency gap | +2.2 | App RTT − TCP RTT > 50 ms (CalcuLatency) |
| Device history | Device left its usual network | +1.4 | Current /16 not among the device's earlier clean networks |
| | Device on its usual network | −1.0 | Current /16 is one of them |
| | Slower than usual | +1.0 | App RTT ≥ baseline + 50 ms and ≥ 1.15 × baseline |
| | Latency as usual | −0.3 | Within ± 20 ms of baseline |
| | Nearest landmark much farther than usual | +1.2 | Landmark floor ≥ baseline floor + 60 ms |

**Excess latency** = min over landmarks of (measured RTT − distance(IP location, landmark)/100). A client really at the IP's location has only last-mile delay (typically 5–50 ms). Through a distant VPN exit, every path first travels client → exit, which no landmark can explain.

**"Clean" history.** A device's earlier scans count towards its baseline only if they are on no VPN/datacenter/Tor list and were not themselves judged likely VPN. Otherwise a device that used a VPN before would learn its VPN exit as "home".

**Prior and verdict.** Prior 5% (`VPN_RISK_PRIOR`). Bands: ≥ 85% high, ≥ 35% elevated, otherwise low. The model abstains ("not enough evidence") when nothing strong fired and fewer than 40% of checks were available. A Tor or Apple-relay list match identifies the network outright.

## 3. Measurements collected

- **Server** (`server-network.ts`): canonical client IP from the trusted ingress; Vercel geolocation headers; `x-vercel-id` edge regions; proxy-revealing headers; public lists (downloaded by the server, cached 24 h, matched locally with binary search over merged CIDR ranges for IPv4 and IPv6; no visitor IP leaves the server).
- **Browser** (`latency-landmarks.ts`): 12 AWS regions at known coordinates (Mumbai, Hyderabad, Singapore, Tokyo, Sydney, UAE, Frankfurt, London, N. Virginia, N. California, São Paulo, Cape Town). DynamoDB `/ping` endpoints are requested with `no-cors`; after one warm-up request per region, the fastest of three samples is kept. About 2 seconds.
- **WebRTC**: STUN server-reflexive candidates (`ALLOW_PUBLIC_STUN=true` or your own `STUN_URL`).
- **Device history**: from the linkage model. All earlier scans ≥ 85% likely the same device, plus the inferred device of the closest match when it is > 50%.

## 4. Results on the study data (85 scans, 25 October 2026)

Replayed in capture order, each scan seeing only earlier scans (`npm run rescore`):

| | |
|---|---|
| Labelled VPN scans caught at ≥ 50% | **8 / 8** |
| False alarms on labelled no-VPN scans | **0 / 64** |
| Caught at ≥ 85% | 5 / 8 |
| PR-AUC | 1.00 |
| Unlabelled scans flagged | 2 (Akshat 185.253.163.212, Rushal 91.221.190.53, both on VPN/datacenter lists) |

| Signal | On VPN scans | On no-VPN scans |
|---|---|---|
| Device left its usual network | 7/8 | 1/64 |
| Datacenter list | 5/8 | 0/64 |
| VPN list | 3/8 | 0/64 |
| Slower than this device usually is | 5/8 | 5/64 |
| Device on its usual network (counter) | 0/8 | 28/64 |
| Ordinary ISP address (counter) | 0/8 | 64/64 |

**Read with care:**
- 8 VPN scans is a small sample.
- All participants shared one campus/mobile network, so "left its usual network" is unusually clean here. In general use, switching between home Wi-Fi and mobile data also triggers it, which is why its weight is moderate.
- The likelihood ratios come from the literature and judgement, not fitted to these 85 scans, so the result is not overfitted. They should still be recalibrated on a larger labelled set.
- Timezone, landmark-geometry and WebRTC signals did not exist when these scans were taken. They apply to new scans on the deployed app.

## 5. Deployment checklist (Vercel)

1. `TRUSTED_PROXY_PROVIDER=vercel` (canonical client IP).
2. `IP_ENRICHMENT_PROVIDER=vercel` (default): location from edge headers, no external service.
3. `PUBLIC_IP_LISTS=true` (default): needs outbound access to GitHub, Apple and the Tor Project from the function.
4. `ALLOW_PUBLIC_STUN=true`, or `STUN_URL` for your own STUN server, to enable the WebRTC check.
5. Optional: MaxMind (`MAXMIND_ACCOUNT_ID`, `MAXMIND_LICENSE_KEY`) for anonymizer flags and ASN; `TCP_RTT_HEADER_NAME` behind nginx/HAProxy for CalcuLatency.
6. Run `npm run rescore -- --apply` after model changes; it writes only the `vpn_assessment` column.

## 6. Known limits

- **Residential proxies and small or new VPNs** are often on no list. Latency geometry and device history are the fallback.
- **VPN exits near the user** (e.g. a Mumbai server for a user in India) add little latency and keep the timezone consistent. Only lists and device history catch these.
- **Opera's built-in VPN** adds almost no latency in this data; lists and device history catch it.
- **Corporate VPNs and cloud desktops** look like datacenter networks; label them separately when studying them.
- **Packet-level methods** (MTU/MSS, JA4T, protocol fingerprinting, website fingerprinting) need network access a website does not have.
