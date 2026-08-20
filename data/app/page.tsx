import type { CSSProperties, ReactNode } from 'react';
import Slide from '@/deck/Slide';
import Cover from '@/components/Cover';
import Reveal from '@/deck/Reveal';
import Steps from '@/components/Steps';
import StatGrid from '@/components/StatGrid';
import Timeline from '@/components/Timeline';
import BrowserFrame from '../components/BrowserFrame';
import { BarChart } from '@/components/Charts';
import WeekSelector from '@/components/WeekSelector';

const cardStyle: CSSProperties = {
  padding: 'clamp(18px, 2.2vw, 28px)',
  borderRadius: 'var(--radius)',
  background: 'linear-gradient(180deg, rgba(16, 27, 49, 0.92), rgba(8, 15, 30, 0.92))',
  border: '1px solid var(--hair)',
};

const signalIcon = (color: string, children: ReactNode) => (
  <span
    style={{
      display: 'grid',
      placeItems: 'center',
      width: 34,
      height: 34,
      borderRadius: 10,
      color,
      background: `${color}16`,
      border: `1px solid ${color}40`,
      fontFamily: 'var(--font-mono)',
      fontSize: 15,
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);

export default function App() {
  return (
    <WeekSelector
      weekOne={
        <>
      <Cover
        nav="Cover"
        notes="Open with the core idea: a VPN can change the apparent location, but it cannot rewrite every clue the browser gives us."
        kicker="Project prototype · browser intelligence"
        title={
          <>
            VPN detection
            <br />
            <span className="accent-text">via browser fingerprinting</span>
          </>
        }
        subtitle="A multi-signal approach to finding the gap between where a connection appears to be — and what the device reveals."
        foot="Prototype summary · 2026"
      />

      <Slide center nav="Thesis" notes="Pause after the first line. The second line is the thesis for the entire prototype.">
        <Reveal>
          <div className="kicker" style={{ marginBottom: 18 }}>The core idea</div>
          <h2 className="display" style={{ maxWidth: 940, marginInline: 'auto', fontSize: 'clamp(42px, 7.4vw, 98px)' }}>
            A VPN changes the route.
            <br />
            <span className="accent-text">Not the device.</span>
          </h2>
          <p className="subhead" style={{ marginTop: 26, maxWidth: 650 }}>
            Detect the mismatch by combining network, browser, hardware, and real-time anomaly signals.
          </p>
        </Reveal>
      </Slide>

      <Slide nav="Signal model" notes="Walk left to right. Each layer answers a different question, and the confidence comes from the combination.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>One connection · four lenses</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(24px, 4vh, 42px)', textAlign: 'center', marginInline: 'auto' }}>
              Where it is. What it is. <span className="accent-text">Whether they agree.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              ['01', 'Network', 'Where does the public IP place the user?', '#30c9f4'],
              ['02', 'Browser', 'What browser is actually running?', '#62e6b7'],
              ['03', 'Hardware', 'What device is behind the session?', '#f2c94c'],
              ['04', 'Anomaly', 'Do the signals tell one consistent story?', '#ff6b6b'],
            ].map(([n, title, body, color]) => (
              <Reveal key={n} delay={Number(n) * 0.06}>
                <div className="mat" style={{ ...cardStyle, minHeight: 230, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {signalIcon(color, n)}
                  <div>
                    <h3 style={{ fontSize: 22, marginBottom: 10 }}>{title}</h3>
                    <p style={{ color: 'var(--fg-muted)', lineHeight: 1.55 }}>{body}</p>
                  </div>
                  <div style={{ marginTop: 'auto', height: 2, width: '54%', background: color, opacity: 0.75 }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Slide>

      <Steps
        nav="Collection engine"
        notes="This is the end-to-end collection flow. The important point is that the prototype does not rely on a single browser trick."
        kicker="Prototype flow"
        title="Collect broadly. Compare continuously."
        items={[
          { title: 'Collect', body: 'Capture IP, headers, client hints, WebRTC, canvas, WebGL, fonts, and device specs.' },
          { title: 'Normalize', body: 'Turn raw browser and network observations into comparable signals.' },
          { title: 'Detect', body: 'Surface mismatches that are difficult for a VPN or proxy to hide at the same time.' },
        ]}
      />

      <Slide nav="Network signals" notes="Use this slide to separate what the server sees from what the browser reports.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>01 · Network and server</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)', textAlign: 'center', marginInline: 'auto' }}>
              The route leaves a <span className="accent-text">paper trail.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
            <Reveal>
              <div className="mat" style={{ ...cardStyle, minHeight: 330 }}>
                <div className="kicker" style={{ marginBottom: 18 }}>Server-side capture</div>
                {[
                  ['Public IP', '152.59.185.242', '#30c9f4'],
                  ['Location', 'Fatehpur, India', '#d8e2ef'],
                  ['ISP / org', 'Reliance Jio Infocomm', '#d8e2ef'],
                  ['IP timezone', 'Asia/Kolkata', '#30c9f4'],
                  ['Proxy headers', 'XFF · X-Real-IP · Via', '#ff9c66'],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, padding: '14px 0', borderTop: '1px solid var(--hair-2)', fontSize: 14 }}>
                    <span style={{ color: 'var(--fg-faint)' }}>{label}</span>
                    <span style={{ color, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="kicker" style={{ marginBottom: 18 }}>Client hints</div>
                <p className="lead" style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', color: 'var(--fg)', maxWidth: 18 + 'ch' }}>
                  Headers can reveal the browser beneath the disguise.
                </p>
                <div style={{ marginTop: 'auto', padding: 16, borderRadius: 12, background: '#030712', color: '#62e6b7', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.65, border: '1px solid var(--hair-2)' }}>
                  "Not A Brand";v="99"<br />
                  "Brave";v="151"<br />
                  "Chromium";v="151"
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="Privacy browsers" notes="Explain that Brave and Tor are intentionally restrictive here, so the prototype should treat these failures as expected rather than broken.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>Important caveat</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)', textAlign: 'center', marginInline: 'auto' }}>
              Brave and Tor can <span className="accent-text">intentionally block</span> the signals.
            </h2>
            <p className="lead" style={{ margin: '0 auto clamp(24px, 4vh, 36px)', textAlign: 'center', maxWidth: 760 }}>
              We figured out that the failure is not random: privacy-focused browsers and anonymity networks are designed to suppress the exact APIs this prototype uses.
            </p>
          </Reveal>

          <div className="cols" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Reveal>
              <div className="mat" style={{ ...cardStyle, minHeight: 300, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#ff9c66', borderColor: '#ff9c6655', background: '#ff9c6614' }}>WebRTC block</div>
                <h3 style={{ fontSize: 24 }}>NotAllowedError: Failed to construct RTCPeerConnection</h3>
                <p style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                  WebRTC can expose local and public IP details, so Brave and Tor restrict or disable it to prevent deanonymization. When the prototype tries to create a peer connection, the browser blocks it before any network details can be collected.
                </p>
                <div style={{ marginTop: 'auto', padding: 14, borderRadius: 12, background: '#120f09', color: '#ffd9b3', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6, border: '1px solid #ff9c6633' }}>
                  Expected in privacy mode<br />
                  Treat as a protected-browser signal, not a product bug.
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 300, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#30c9f4', borderColor: '#30c9f455', background: '#30c9f414' }}>Geolocation fetch failure</div>
                <h3 style={{ fontSize: 24 }}>CORS policy / ERR_FAILED from ipapi.co</h3>
                <p style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                  The request can fail because Brave and Tor use aggressive tracking protection, the Tor exit node may be blocked by the API, and stricter state isolation can interfere with third-party requests.
                </p>
                <div style={{ marginTop: 'auto', padding: 14, borderRadius: 12, background: '#091620', color: '#c6ebff', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6, border: '1px solid #30c9f433' }}>
                  Privacy browsers may reject the request outright or return a generic network error.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide full nav="Prototype demo" notes="This is the proof slide. Point first to the red anomaly panel, then trace the supporting evidence around it.">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 90% at 50% 48%, rgba(22, 44, 81, 0.72), transparent 70%), var(--bg)' }} />
        <div style={{ position: 'relative', zIndex: 1, width: 'min(92vw, 1120px)', margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 22, gap: 20 }}>
              <div>
                <div className="kicker" style={{ marginBottom: 10 }}>Live prototype readout</div>
                <h2 className="headline" style={{ fontSize: 'clamp(30px, 4vw, 52px)' }}>One session. <span className="accent-text">Many clues.</span></h2>
              </div>
              <div className="chip" style={{ color: '#ff7777', borderColor: '#ff777755', background: '#ff4d4d14' }}>2 anomalies</div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <BrowserFrame url="prototype.local / fingerprint-report">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, padding: 'clamp(16px, 2.4vw, 30px)', background: '#050b1d' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ ...cardStyle, padding: 18, background: '#230715', borderColor: '#7e1d3f' }}>
                    <div style={{ color: '#ff6b6b', fontWeight: 700, marginBottom: 12 }}>△ Anomalies Detected</div>
                    <div style={{ color: '#ffd3d3', fontSize: 12, lineHeight: 1.5, padding: 10, background: '#3b0d1b', borderRadius: 8 }}>Timezone Mismatch: IP location Asia/Kolkata does not match browser timezone Asia/Calcutta.</div>
                    <div style={{ color: '#ffd3d3', fontSize: 12, lineHeight: 1.5, padding: 10, marginTop: 8, background: '#3b0d1b', borderRadius: 8 }}>WebRTC IP Leak: detected a leaked address that may reveal the true network identity.</div>
                  </div>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>◉ Geolocation &amp; Network</div>{[['Public IP', '152.59.185.242'], ['Location', 'Fatehpur, India'], ['IP Timezone', 'Asia/Kolkata'], ['Browser Timezone', 'Asia/Calcutta']].map(([label, value]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid #24304a', color: '#8b9ab5', fontSize: 12 }}><span>{label}</span><span style={{ color: label.includes('Timezone') || label === 'Public IP' ? '#30c9f4' : '#d8e2ef', fontFamily: 'var(--font-mono)' }}>{value}</span></div>)}</div>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>▣ Server-Side Headers</div><div style={{ color: '#8b9ab5', fontSize: 12, lineHeight: 1.8 }}>Server-Seen IP <span style={{ float: 'right', color: '#d8e2ef' }}>::1</span><br />X-Forwarded-For <span style={{ float: 'right', color: '#d8e2ef' }}>::1</span><br />X-Real-IP <span style={{ float: 'right', color: '#d8e2ef' }}>None</span></div></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>◉ Browser Fingerprint Engine</div><div style={{ color: '#8b9ab5', fontSize: 12, lineHeight: 2.1 }}>Canvas Hash <span style={{ float: 'right', color: '#30c9f4', fontFamily: 'var(--font-mono)' }}>-2d9b4bef</span><br />WebGL Vendor <span style={{ float: 'right', color: '#d8e2ef' }}>Google Inc. (Apple)</span><br />WebGL Renderer <span style={{ float: 'right', color: '#d8e2ef', maxWidth: '58%', textAlign: 'right' }}>Apple M2 · Metal Renderer</span></div></div>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>▣ Hardware Leaks</div><div style={{ color: '#8b9ab5', fontSize: 12, lineHeight: 2.1 }}>Platform <span style={{ float: 'right', color: '#d8e2ef' }}>MacIntel</span><br />CPU Cores <span style={{ float: 'right', color: '#d8e2ef' }}>6</span><br />Device RAM <span style={{ float: 'right', color: '#d8e2ef' }}>8 GB</span><br />Screen <span style={{ float: 'right', color: '#d8e2ef' }}>1920×1080</span></div></div>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>T Installed Fonts (Sample)</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Impact', 'Monaco'].map((font) => <span key={font} style={{ padding: '5px 7px', borderRadius: 5, background: '#1a2840', color: '#b7c7db', fontSize: 10 }}>{font}</span>)}</div></div>
                </div>
              </div>
            </BrowserFrame>
          </Reveal>
        </div>
      </Slide>

      <Slide nav="Fingerprint surface" notes="Spend the most time on WebGL and canvas: they add device-specific texture that a simple IP lookup cannot provide.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>02 · Advanced fingerprints</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 34px)', textAlign: 'center', marginInline: 'auto' }}>
              The browser is a <span className="accent-text">sensor array.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '1.15fr 0.85fr', alignItems: 'stretch' }}>
            <Reveal>
              <div className="mat" style={{ ...cardStyle, height: '100%' }}>
                <div className="kicker" style={{ marginBottom: 18 }}>High-signal fingerprints</div>
                {[
                  ['Canvas hash', 'Rendering quirks from OS + GPU'],
                  ['WebGL renderer', 'Hardware identity beneath software masks'],
                  ['Font inventory', 'Installed system fonts via text metrics'],
                  ['Device profile', 'CPU · RAM · screen · color depth'],
                ].map(([label, body], index) => (
                  <div key={label} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 14, padding: '15px 0', borderTop: '1px solid var(--hair-2)' }}>
                    <span style={{ color: '#30c9f4', fontFamily: 'var(--font-mono)', fontSize: 13 }}>0{index + 1}</span>
                    <div><strong style={{ display: 'block', marginBottom: 3 }}>{label}</strong><span style={{ color: 'var(--fg-muted)', fontSize: 14 }}>{body}</span></div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="mat" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="kicker" style={{ marginBottom: 12 }}>Example renderer</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: '#62e6b7', fontSize: 'clamp(16px, 2vw, 22px)', lineHeight: 1.45 }}>Apple M2<br /><span style={{ color: 'var(--fg-faint)', fontSize: 13 }}>ANGLE · Metal backend</span></div>
                </div>
                <div>
                  <div className="kicker" style={{ marginBottom: 12 }}>Signal density</div>
                  <div style={{ height: 112 }}><BarChart data={[{ label: 'IP', value: 42 }, { label: 'HDR', value: 58 }, { label: 'GPU', value: 82 }, { label: 'Font', value: 68 }, { label: 'RTC', value: 91 }]} height={112} /></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <StatGrid
        nav="Anomaly detection"
        notes="Timezone mismatch is the primary heuristic. WebRTC is the highest-impact leak because it can expose the true network identity."
        kicker="03 · Anomaly detection"
        title="The strongest signal is a contradiction."
        stats={[
          { value: '01', label: 'Timezone mismatch', caption: 'IP location and browser timezone disagree.' },
          { value: '02', label: 'WebRTC leak', caption: 'Internal or true public IP escapes the tunnel.' },
          { value: '03', label: 'Header mismatch', caption: 'Proxy headers and client hints tell different stories.' },
        ]}
      />

      <Slide nav="Heuristic" notes="Reveal the comparison as a simple rule, then emphasize that the prototype flags suspicion rather than claiming certainty.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>The primary heuristic</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(22px, 4vh, 38px)', textAlign: 'center', marginInline: 'auto' }}>
              Location is not a field. <span className="accent-text">It is a consistency check.</span>
            </h2>
          </Reveal>
          <div className="mat" style={{ ...cardStyle, maxWidth: 950, margin: '0 auto', padding: 'clamp(24px, 3.2vw, 42px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'center' }}><div className="kicker" style={{ marginBottom: 10 }}>IP-derived</div><div style={{ fontSize: 'clamp(20px, 2.8vw, 34px)', fontWeight: 600 }}>Asia / Kolkata</div><div style={{ color: 'var(--fg-muted)', marginTop: 6 }}>Public address geolocation</div></div>
              <div style={{ display: 'grid', placeItems: 'center', width: 50, height: 50, borderRadius: '50%', color: '#ff6b6b', border: '1px solid #ff6b6b66', background: '#ff6b6b14', fontSize: 25 }}>≠</div>
              <div style={{ textAlign: 'center' }}><div className="kicker" style={{ marginBottom: 10 }}>Browser-derived</div><div style={{ fontSize: 'clamp(20px, 2.8vw, 34px)', fontWeight: 600 }}>Asia / Calcutta</div><div style={{ color: 'var(--fg-muted)', marginTop: 6 }}>System timezone</div></div>
            </div>
            <div style={{ marginTop: 30, paddingTop: 22, borderTop: '1px solid var(--hair-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--fg-muted)' }}>Mismatch raises suspicion — it does not prove intent.</span>
              <span className="chip" style={{ color: '#ff7777', borderColor: '#ff777755', background: '#ff4d4d14' }}>flag for review</span>
            </div>
          </div>
        </div>
      </Slide>

      <Slide nav="Next phase" notes="End with the responsible path forward: accuracy, calibration, and an ML layer trained on reviewed outcomes.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>Next phase</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(24px, 4vh, 42px)', textAlign: 'center', marginInline: 'auto' }}>
              From a strong prototype to <span className="accent-text">reliable detection.</span>
            </h2>
          </Reveal>
          <Timeline items={[
            { time: '01 · Calibrate', title: 'Separate VPN from normal travel', body: 'Build a labeled set that includes travelers, mobile networks, corporate proxies, and known VPN sessions.' },
            { time: '02 · Combine', title: 'Weight signals by context', body: 'Move beyond binary rules: score contradictions based on reliability and session context.' },
            { time: '03 · Learn', title: 'Train a model on reviewed outcomes', body: 'Use human-reviewed sessions to improve precision without turning one heuristic into a verdict.' },
          ]} />
        </div>
      </Slide>

      <Slide center nav="Close" notes="Close on the principle, not the implementation details."
        style={{ background: 'radial-gradient(60% 70% at 50% 45%, rgba(23, 62, 86, 0.52), transparent 72%), var(--bg)' }}>
        <Reveal>
          <div className="kicker" style={{ marginBottom: 18 }}>The takeaway</div>
          <h2
            className="display"
            style={{ maxWidth: 900, fontSize: 'clamp(42px, 7vw, 92px)', textAlign: 'center', marginInline: 'auto' }}
          >
            Make the route harder to fake.
            <br />
            <span className="accent-text">Read the whole session.</span>
          </h2>
          <p className="subhead" style={{ marginTop: 24 }}>A browser fingerprinting prototype for better network trust signals.</p>
          <div className="foot" style={{ marginTop: 40 }}>VPN Detection · Prototype Summary</div>
        </Reveal>
      </Slide>

        </>
      }
      weekTwo={
        <>

      <Cover
        nav="Week 2"
        notes="Week 2 moves the project from a one-session detector demo to a persistent, labelled research platform. The central result is a more defensible claim: probabilistic session linkage can support VPN-risk analysis, but it does not reveal a hidden identity or prove VPN use."
        kicker="Week 2 · research + implementation"
        title={
          <>
            From fingerprint demo
            <br />
            <span className="accent-text">to measurable experiment</span>
          </>
        }
        subtitle="What the literature changed, what the new prototype can demonstrate, and why the next milestone is a larger labelled dataset."
        foot="Browser fingerprinting × VPN-risk research · 20 Aug 2026"
      />

      <Slide nav="Week 2 thesis" notes="The research forced us to narrow the claim. A VPN normally changes network egress, while many browser and device observations remain similar. That continuity is useful risk evidence, not deanonymization or identity proof.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>The conclusion after the literature review</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(24px, 4vh, 42px)' }}>
              Fingerprinting helps link sessions. <span className="accent-text">It does not unmask a VPN by itself.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              ['What changes', 'The apparent public IP, ASN, route, and IP-derived location can change when a VPN is enabled.', '#30c9f4'],
              ['What may persist', 'OS, GPU family, screen, CPU and memory buckets, fonts, canvas, and browser capabilities may remain similar.', '#62e6b7'],
              ['What we can infer', 'A returning browser or device-like cluster with unusual network changes—not a person, physical location, or hidden source IP.', '#f2c94c'],
            ].map(([title, body, color], index) => (
              <Reveal key={title} delay={index * 0.08}>
                <div className="mat" style={{ ...cardStyle, minHeight: 270 }}>
                  {signalIcon(color, `0${index + 1}`)}
                  <h3 style={{ fontSize: 23, margin: '20px 0 10px' }}>{title}</h3>
                  <p style={{ color: 'var(--fg-muted)', lineHeight: 1.65 }}>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Slide>

      <Slide nav="Research findings" notes="An exact combined hash is brittle. The 2017 NDSS result proves cross-browser linkage can work in a controlled population, but it is not a modern production accuracy guarantee. Current browser privacy protections deliberately reduce or randomize signals.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Finding 01 · identity model</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(22px, 3.5vh, 34px)' }}>
              One exact hash is the wrong model. <span className="accent-text">Compare components.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '0.9fr 1.1fr' }}>
            <Reveal>
              <div className="mat" style={{ ...cardStyle, minHeight: 345, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="kicker" style={{ marginBottom: 18 }}>Why hashes drift</div>
                {['Browser updates', 'Private-mode defenses', 'External monitor or scaling', 'Fonts and extensions', 'Unavailable or spoofed APIs'].map((item) => (
                  <div key={item} style={{ padding: '12px 0', borderTop: '1px solid var(--hair-2)', color: 'var(--fg-muted)' }}>↳ {item}</div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 345 }}>
                <div className="kicker" style={{ marginBottom: 18 }}>Implemented workaround</div>
                {[
                  ['Same-browser model', 'Uses profile-aware signals such as canvas, WebGL, fonts, capabilities, and browser family.'],
                  ['Cross-browser device model', 'Excludes browser-specific fields and compares coarse OS, hardware, screen, touch, and GPU families.'],
                  ['Missing-tolerant score', 'Only weights components present in both captures and reports confidence plus per-component reasons.'],
                ].map(([title, body]) => (
                  <div key={title} style={{ padding: '15px 0', borderTop: '1px solid var(--hair-2)' }}>
                    <strong style={{ display: 'block', marginBottom: 6, color: '#dff8ff' }}>{title}</strong>
                    <span style={{ color: 'var(--fg-muted)', lineHeight: 1.55 }}>{body}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Steps
        nav="New prototype"
        notes="This is the Week 2 implementation. Every user-initiated capture is labelled, compared with recent observations, saved to Supabase PostgreSQL, and then available in a separate comparison explorer."
        kicker="Finding 02 · implementation"
        title="The prototype now remembers the experiment."
        items={[
          { title: 'Capture', body: 'The operator labels device, browser mode, and VPN ground truth before collecting schema 2.0 signals.' },
          { title: 'Compare', body: 'The server calculates same-device and same-browser similarity with a per-component explanation.' },
          { title: 'Persist', body: 'Supabase PostgreSQL stores observations across browsers, devices, deployments, and restarts.' },
        ]}
      />

      <Slide nav="Collected signals" notes="We corrected the WebRTC parser: host, server-reflexive, relay, mDNS, IPv4, and IPv6 are recorded separately. A private host candidate alone is not called a leak. Timezone is now a low-weight offset comparison, not a binary VPN verdict.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>Finding 03 · versioned evidence</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(22px, 3.5vh, 34px)', textAlign: 'center', marginInline: 'auto' }}>
              Four evidence layers. <span className="accent-text">No single magic signal.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              ['Browser', 'Family + major version\nLanguages and locale\nAPI capabilities\nClient hints', '#30c9f4'],
              ['Device-like', 'OS + architecture\nCPU / memory buckets\nScreen + pixel ratio\nGPU family + touch', '#62e6b7'],
              ['High entropy', 'Canvas SHA-256\nRepeatability check\nWebGL render hash\nFont availability', '#f2c94c'],
              ['Network', 'Server-observed IP\nExternal egress IP\nGeoIP + organization\nTyped WebRTC candidates', '#ff9c66'],
            ].map(([title, body, color], index) => (
              <Reveal key={title} delay={index * 0.06}>
                <div className="mat" style={{ ...cardStyle, minHeight: 300 }}>
                  {signalIcon(color, `0${index + 1}`)}
                  <h3 style={{ fontSize: 21, margin: '18px 0 12px' }}>{title}</h3>
                  <p style={{ color: 'var(--fg-muted)', whiteSpace: 'pre-line', lineHeight: 1.85, fontSize: 14 }}>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Slide>

      <Slide nav="Early result" notes="Be explicit that this is a sanity check with only two observations, not an accuracy result. The two manually entered labels refer to the same controlled Mac but differ in wording. The model still returned high similarity across normal and private mode.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>First controlled comparison · n = 2</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(22px, 3.2vh, 32px)' }}>
              Normal and private Chrome remained <span className="accent-text">strongly similar.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '0.72fr 0.72fr 1.2fr' }}>
            <Reveal>
              <div className="mat" style={{ ...cardStyle, minHeight: 290, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="kicker">Coarse device similarity</div>
                <div style={{ fontSize: 'clamp(64px, 8vw, 104px)', lineHeight: 1, margin: '18px 0 12px', color: '#62e6b7', fontWeight: 700 }}>92%</div>
                <div style={{ color: 'var(--fg-muted)' }}>High confidence in the current heuristic model</div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mat" style={{ ...cardStyle, minHeight: 290, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="kicker">Same-browser score</div>
                <div style={{ fontSize: 'clamp(64px, 8vw, 104px)', lineHeight: 1, margin: '18px 0 12px', color: '#30c9f4', fontWeight: 700 }}>87%</div>
                <div style={{ color: 'var(--fg-muted)' }}>Canvas, WebGL, fonts, and capabilities included</div>
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mat" style={{ ...cardStyle, minHeight: 290 }}>
                <div className="kicker" style={{ marginBottom: 18 }}>What matched</div>
                {['macOS + ARM + 64-bit', 'CPU bucket ≤ 8', '1680 × 1050 at 2×', 'Apple GPU family', 'Touch + color depth'].map((item) => (
                  <div key={item} style={{ padding: '10px 0', borderTop: '1px solid var(--hair-2)', color: '#d8e2ef' }}>✓ {item}</div>
                ))}
                <div style={{ marginTop: 14, color: '#ffcf8b', fontSize: 13 }}>Changed: reported memory bucket (≤ 8 → ≤ 4)</div>
              </div>
            </Reveal>
          </div>
          <div style={{ marginTop: 18, color: 'var(--fg-faint)', fontSize: 13 }}>This proves the pipeline works. It does not establish population-level accuracy; more labelled captures are required.</div>
        </div>
      </Slide>

      <Slide nav="Incognito study" notes="Incognito is ground truth entered by the operator. It is not inferred and should never increase VPN risk. Chrome often preserves several device-like values, while Firefox, Safari, and Brave may coarsen or randomize more surfaces.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Finding 04 · private browsing</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 30px)' }}>
              Incognito resets state. <span className="accent-text">It does not create a new machine.</span>
            </h2>
          </Reveal>
          <div className="mat" style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            {[
              ['Chrome / Chromium', 'Cookies and local state start fresh; many device/rendering signals may remain similar.', 'Measure stability'],
              ['Firefox private', 'Fingerprinting protection can add canvas noise and coarsen fonts, CPU, screen, and touch.', 'Expect missing/drift'],
              ['Safari private', 'Ephemeral storage plus advanced fingerprinting protection can noise canvas/WebGL and screen metrics.', 'Expect isolation'],
              ['Brave private', 'Per-site, per-session farbling can deliberately change fingerprintable values.', 'Exact hashes should differ'],
            ].map(([browser, behavior, implication], index) => (
              <div key={browser} style={{ display: 'grid', gridTemplateColumns: '0.8fr 2.1fr 0.9fr', gap: 22, alignItems: 'center', padding: 'clamp(15px, 2vh, 22px) clamp(18px, 2.4vw, 30px)', borderTop: index ? '1px solid var(--hair-2)' : 'none' }}>
                <strong>{browser}</strong>
                <span style={{ color: 'var(--fg-muted)', lineHeight: 1.5 }}>{behavior}</span>
                <span style={{ color: '#30c9f4', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{implication}</span>
              </div>
            ))}
          </div>
          <div className="chip" style={{ marginTop: 20, color: '#f2c94c', borderColor: '#f2c94c55', background: '#f2c94c14' }}>Private mode is a labelled test condition—not VPN evidence.</div>
        </div>
      </Slide>

      <Slide nav="VPN-risk role" notes="Fingerprinting contributes continuity and consistency evidence. Primary VPN signals should come from maintained IP intelligence and trusted server-side network observations. A correctly configured VPN may expose no original public IP to page JavaScript.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>Finding 05 · where fingerprinting helps</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(24px, 4vh, 42px)', textAlign: 'center', marginInline: 'auto' }}>
              Link the session. Test the network story. <span className="accent-text">Explain the risk.</span>
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'stretch', gap: 14 }}>
            {[
              ['1', 'Continuity', 'A stable device-like cluster appears while IP, ASN, or country changes.'],
              ['2', 'Consistency', 'Timezone offset, WebRTC public candidate, GeoIP, and server IP are checked for disagreement.'],
              ['3', 'Risk output', 'The UI reports a score, confidence, and human-readable reasons—not a binary identity verdict.'],
            ].map(([n, title, body], index) => (
              <div key={title} style={{ display: 'contents' }}>
                <Reveal delay={index * 0.08}>
                  <div className="mat" style={{ ...cardStyle, minHeight: 270 }}>
                    {signalIcon(index === 2 ? '#62e6b7' : '#30c9f4', n)}
                    <h3 style={{ fontSize: 22, margin: '20px 0 10px' }}>{title}</h3>
                    <p style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>{body}</p>
                  </div>
                </Reveal>
                {index < 2 && <div style={{ alignSelf: 'center', color: '#30c9f4', fontSize: 28 }}>→</div>}
              </div>
            ))}
          </div>
          <p style={{ marginTop: 22, color: 'var(--fg-faint)', textAlign: 'center' }}>Strongest production baseline: trusted IP intelligence + account history. Fingerprint similarity is secondary evidence.</p>
        </div>
      </Slide>

      <Slide nav="Data collection" notes="The current phase is deliberately data-first. The observation explorer is read-only for research users. The application exposes no DELETE endpoint; only a database administrator can remove records directly in Supabase.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Current phase · collect before calibrating</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(22px, 3.5vh, 34px)' }}>
              We are building the <span className="accent-text">labelled evidence base.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '1.12fr 0.88fr' }}>
            <Reveal>
              <div className="mat" style={{ ...cardStyle, minHeight: 340 }}>
                <div className="kicker" style={{ marginBottom: 16 }}>Capture matrix per controlled device</div>
                {[
                  ['Browsers', 'Chrome · Firefox · Safari · Edge · Brave'],
                  ['Mode', 'Normal · fresh profile · private / incognito'],
                  ['Time', 'Immediate repeats · restart · next day · update'],
                  ['Network', 'Home · hotspot · authorized corporate network'],
                  ['VPN', 'Off · providers · protocols · near / distant exits'],
                  ['Display', 'Resize · zoom · monitor · orientation'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 18, padding: '12px 0', borderTop: '1px solid var(--hair-2)' }}>
                    <strong style={{ color: '#dff8ff' }}>{label}</strong><span style={{ color: 'var(--fg-muted)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 340 }}>
                <div className="kicker" style={{ marginBottom: 18 }}>Shared research store</div>
                <div style={{ fontSize: 24, lineHeight: 1.4, marginBottom: 24 }}>Website → API → <span style={{ color: '#62e6b7' }}>Supabase PostgreSQL</span></div>
                {['Persists across devices and browsers', 'Groups by manual ground-truth label', 'Compares any two stored captures', 'Filters by browser, mode, label, IP, or organization', 'No deletion control or DELETE API in the application'].map((item) => (
                  <div key={item} style={{ padding: '11px 0', borderTop: '1px solid var(--hair-2)', color: 'var(--fg-muted)' }}>✓ {item}</div>
                ))}
                <div className="chip" style={{ marginTop: 20, color: '#f2c94c', borderColor: '#f2c94c55', background: '#f2c94c14' }}>Deletion is database-admin-only</div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="Next checkpoint" notes="The next review should present measured distributions, not a few screenshots. Start with 20–30 heterogeneous consented devices, then report false matches, false non-matches, missingness, and VPN classification performance against a network-only baseline.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>Next checkpoint</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(24px, 4vh, 42px)', textAlign: 'center', marginInline: 'auto' }}>
              Replace anecdotes with <span className="accent-text">measured performance.</span>
            </h2>
          </Reveal>
          <Timeline items={[
            { time: '01 · Expand', title: 'Collect 20–30 diverse devices', body: 'Include common hardware, multiple browsers, private modes, repeated visits, and labelled VPN-on / VPN-off conditions.' },
            { time: '02 · Measure', title: 'Evaluate linkage honestly', body: 'Plot genuine versus impostor scores; report false-match, false-non-match, stability, missingness, and collision rates.' },
            { time: '03 · Calibrate', title: 'Test VPN-risk lift', body: 'Compare IP-intelligence-only performance with the combined model and measure precision, recall, PR-AUC, and calibration.' },
          ]} />
        </div>
      </Slide>

      <Slide nav="Evidence base" notes="These are the primary references behind Week 2. The 2017 NDSS accuracy is historical and population-specific. RFC 8828 explains WebRTC address exposure. Browser vendor documentation explains why private modes may suppress or randomize components.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Primary references</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 30px)' }}>
              The design follows the research—and <span className="accent-text">its limitations.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {[
              ['W3C · Fingerprinting Guidance (2025)', 'Defines fingerprinting, security uses, privacy risks, and why VPNs alone do not stop application-layer correlation.', 'https://www.w3.org/TR/fingerprinting-guidance/'],
              ['NDSS · Cross-browser Fingerprinting (2017)', 'Demonstrates OS/hardware-based cross-browser linkage in a controlled experimental population.', 'https://www.ndss-symposium.org/ndss2017/ndss-2017-programme/cross-browser-fingerprinting-os-and-hardware-level-features/'],
              ['IETF · RFC 8828', 'Defines WebRTC IP-address handling and the conditions under which ICE/STUN may expose addresses.', 'https://datatracker.ietf.org/doc/html/rfc8828'],
              ['Firefox · Fingerprinting Protection', 'Documents canvas noise, font restrictions, and coarsened hardware or screen values.', 'https://support.mozilla.org/en-US/kb/firefox-protection-against-fingerprinting'],
              ['Brave · Fingerprinting Defenses 2.0', 'Explains per-site, per-session farbling designed to break stable cross-session fingerprints.', 'https://brave.com/privacy-updates/4-fingerprinting-defenses-2.0/'],
              ['WebKit · Private Browsing 2.0', 'Documents ephemeral storage and advanced fingerprinting protection in Safari private browsing.', 'https://webkit.org/blog/15697/private-browsing-2-0/'],
            ].map(([title, body, href], index) => (
              <Reveal key={title} delay={(index % 2) * 0.06}>
                <a href={href} target="_blank" rel="noreferrer" className="mat" style={{ ...cardStyle, display: 'block', minHeight: 125, textDecoration: 'none', color: 'inherit' }}>
                  <strong style={{ display: 'block', marginBottom: 7, color: '#dff8ff' }}>{title}</strong>
                  <span style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.5 }}>{body}</span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </Slide>

      <Slide center nav="Week 2 close" notes="Close with the measurable target. The next claim should be backed by labelled genuine and impostor comparisons, plus a network-only baseline."
        style={{ background: 'radial-gradient(62% 74% at 50% 45%, rgba(18, 76, 92, 0.5), transparent 72%), var(--bg)' }}>
        <Reveal>
          <div className="kicker" style={{ marginBottom: 18 }}>Week 2 takeaway</div>
          <h2 className="display" style={{ maxWidth: 940, fontSize: 'clamp(40px, 6.8vw, 88px)', textAlign: 'center', marginInline: 'auto' }}>
            The prototype is ready.
            <br />
            <span className="accent-text">Now the dataset must prove it.</span>
          </h2>
          <p className="subhead" style={{ marginTop: 24, maxWidth: 760 }}>Collect labelled captures, measure errors, and treat fingerprinting as explainable supporting evidence—not identity proof.</p>
        </Reveal>
      </Slide>
        </>
      }
    />
  );
}
