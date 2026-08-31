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
              ['01', 'Network / Packet', 'Server-side MTU clamping, p0f OS stack, and Datacenter ASN', '#30c9f4'],
              ['02', 'Browser / JS', 'System timezone, WebRTC STUN, speech voices, and font metrics', '#62e6b7'],
              ['03', 'Hardware', 'Off-screen WebGL GPU architecture and hardware specs', '#f2c94c'],
              ['04', 'Inconsistency', 'Single-session contradiction proofs (No device collision risk)', '#ff6b6b'],
            ].map(([n, title, body, color]) => (
              <Reveal key={n} delay={Number(n) * 0.06}>
                <div className="mat" style={{ ...cardStyle, minHeight: 230, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {signalIcon(color, n)}
                  <div>
                    <h3 style={{ fontSize: 21, marginBottom: 10 }}>{title}</h3>
                    <p style={{ color: 'var(--fg-muted)', lineHeight: 1.55, fontSize: 14 }}>{body}</p>
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
        notes="This is the end-to-end collection flow. The important point is that the prototype does not rely on fragile cross-session device guessing."
        kicker="Prototype flow"
        title="Collect broadly. Prove single-session contradictions."
        items={[
          { title: 'Pre-flight & JS Telemetry', body: 'Capture server-side MTU/ASN, headers, WebRTC STUN candidates, speech synthesis voices, and timezone.' },
          { title: 'Layer Synthesis', body: 'Correlate physical network transport reality against client-reported execution environment.' },
          { title: 'Inconsistency Scoring', body: 'Detect mathematical & protocol contradictions that no VPN tunnel can conceal at both layers simultaneously.' },
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
                <div className="kicker" style={{ marginBottom: 18 }}>Server-side zero-JS capture</div>
                {[
                  ['Public IP', '152.59.185.242', '#30c9f4'],
                  ['Datacenter ASN', 'M247 / Datacamp (Flagged)', '#ff9c66'],
                  ['TCP MTU / MSS', '1420 bytes (Tunnel clamped)', '#ff9c66'],
                  ['IP timezone', 'Asia/Kolkata', '#30c9f4'],
                  ['Proxy headers', 'XFF · X-Real-IP · Via', '#d8e2ef'],
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
                <div className="kicker" style={{ marginBottom: 18 }}>Client hints &amp; TLS</div>
                <p className="lead" style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', color: 'var(--fg)', maxWidth: 18 + 'ch' }}>
                  Headers &amp; JA4 signatures reveal the client beneath the disguise.
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
              <div className="chip" style={{ color: '#ff7777', borderColor: '#ff777755', background: '#ff4d4d14' }}>3 inconsistencies</div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <BrowserFrame url="prototype.local / fingerprint-report">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, padding: 'clamp(16px, 2.4vw, 30px)', background: '#050b1d' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ ...cardStyle, padding: 18, background: '#230715', borderColor: '#7e1d3f' }}>
                    <div style={{ color: '#ff6b6b', fontWeight: 700, marginBottom: 12 }}>△ Inconsistency Engine Readout</div>
                    <div style={{ color: '#ffd3d3', fontSize: 12, lineHeight: 1.5, padding: 10, background: '#3b0d1b', borderRadius: 8 }}>Datacenter ASN: IP belongs to M247 cloud hosting rather than a residential ISP.</div>
                    <div style={{ color: '#ffd3d3', fontSize: 12, lineHeight: 1.5, padding: 10, marginTop: 8, background: '#3b0d1b', borderRadius: 8 }}>Timezone Mismatch: IP location UTC+1 (Berlin) vs browser system clock UTC-5 (New_York).</div>
                    <div style={{ color: '#ffd3d3', fontSize: 12, lineHeight: 1.5, padding: 10, marginTop: 8, background: '#3b0d1b', borderRadius: 8 }}>WebRTC STUN Discrepancy: Server-reflexive address bypassed tunnel to expose home ISP.</div>
                  </div>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>◉ Geolocation &amp; Network</div>{[['Public IP', '152.59.185.242'], ['ASN / Org', 'M247 Ltd (Datacenter)'], ['IP Timezone', 'Europe/Berlin (UTC+1)'], ['Browser Timezone', 'America/New_York (UTC-5)']].map(([label, value]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid #24304a', color: '#8b9ab5', fontSize: 12 }}><span>{label}</span><span style={{ color: label.includes('Timezone') || label.includes('ASN') ? '#30c9f4' : '#d8e2ef', fontFamily: 'var(--font-mono)' }}>{value}</span></div>)}</div>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>▣ Server-Side Transport</div><div style={{ color: '#8b9ab5', fontSize: 12, lineHeight: 1.8 }}>TCP MTU / MSS <span style={{ float: 'right', color: '#ff9c66', fontFamily: 'var(--font-mono)' }}>1420 (Clamped)</span><br />p0f OS Stack <span style={{ float: 'right', color: '#30c9f4' }}>Linux 5.x / 6.x</span><br />X-Forwarded-For <span style={{ float: 'right', color: '#d8e2ef' }}>152.59.185.242</span></div></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>◉ Browser Fingerprint Engine</div><div style={{ color: '#8b9ab5', fontSize: 12, lineHeight: 2.1 }}>Canvas Hash <span style={{ float: 'right', color: '#30c9f4', fontFamily: 'var(--font-mono)' }}>-2d9b4bef</span><br />WebGL Vendor <span style={{ float: 'right', color: '#d8e2ef' }}>Google Inc. (Apple)</span><br />WebGL Renderer <span style={{ float: 'right', color: '#d8e2ef', maxWidth: '58%', textAlign: 'right' }}>Apple M2 · Metal Renderer</span></div></div>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>▣ OS &amp; Environment Signals</div><div style={{ color: '#8b9ab5', fontSize: 12, lineHeight: 2.1 }}>Declared OS <span style={{ float: 'right', color: '#d8e2ef' }}>macOS (MacIntel)</span><br />Speech Synthesis <span style={{ float: 'right', color: '#62e6b7' }}>Apple voices (Consistent)</span><br />CPU / RAM <span style={{ float: 'right', color: '#d8e2ef' }}>8 cores · 16 GB</span><br />Screen <span style={{ float: 'right', color: '#d8e2ef' }}>1920×1080</span></div></div>
                  <div style={{ ...cardStyle, padding: 18 }}><div style={{ color: '#e7f3ff', fontWeight: 700, marginBottom: 14 }}>T Installed Fonts &amp; Voices</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{['Menlo', 'Monaco', 'Apple Color Emoji', 'Arial', 'Helvetica', 'Times New Roman', 'Samantha (en-US)', 'Alex (en-US)'].map((font) => <span key={font} style={{ padding: '5px 7px', borderRadius: 5, background: '#1a2840', color: '#b7c7db', fontSize: 10 }}>{font}</span>)}</div></div>
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
                <div className="kicker" style={{ marginBottom: 18 }}>High-signal telemetry</div>
                {[
                  ['TCP MTU & ASN', 'Zero-JS transport overhead & datacenter classification'],
                  ['Canvas & WebGL', 'Hardware identity beneath software masks'],
                  ['Speech & Font inventory', 'System voices and metrics validating declared OS'],
                  ['Timezone & WebRTC', 'Physical clock and STUN interface leak detection'],
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
                  <div style={{ height: 112 }}><BarChart data={[{ label: 'ASN', value: 94 }, { label: 'MTU', value: 88 }, { label: 'GPU', value: 82 }, { label: 'Voice', value: 76 }, { label: 'RTC', value: 91 }]} height={112} /></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <StatGrid
        nav="Anomaly detection"
        notes="Timezone mismatch is the primary heuristic. WebRTC is the highest-impact leak because it can expose the true network identity."
        kicker="03 · Inconsistency engine"
        title="The strongest signal is a contradiction."
        stats={[
          { value: '01', label: 'Single-session contradiction', caption: 'Internal layer conflicts prove VPN use without relying on fragile cross-user device matching.' },
          { value: '02', label: 'Datacenter ASN & MTU', caption: 'Cloud exit IP ranges and MTU packet clamping (<1440) expose tunnel protocol wrappers.' },
          { value: '03', label: 'WebRTC & Speech leaks', caption: 'STUN bypasses and OS speech voice arrays unmask spoofed headers and split tunnels.' },
        ]}
      />

      <Slide nav="Heuristic" notes="Reveal the comparison as a simple rule, then emphasize that the prototype flags suspicion rather than claiming certainty.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>The primary heuristic</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(22px, 4vh, 38px)', textAlign: 'center', marginInline: 'auto' }}>
              VPN detection is an <span className="accent-text">inconsistency proof.</span>
            </h2>
          </Reveal>
          <div className="mat" style={{ ...cardStyle, maxWidth: 950, margin: '0 auto', padding: 'clamp(24px, 3.2vw, 42px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'center' }}><div className="kicker" style={{ marginBottom: 10 }}>Transport Reality</div><div style={{ fontSize: 'clamp(18px, 2.4vw, 28px)', fontWeight: 600 }}>Datacenter ASN · MTU 1420</div><div style={{ color: 'var(--fg-muted)', marginTop: 6 }}>Server-side packet layer</div></div>
              <div style={{ display: 'grid', placeItems: 'center', width: 50, height: 50, borderRadius: '50%', color: '#ff6b6b', border: '1px solid #ff6b6b66', background: '#ff6b6b14', fontSize: 25 }}>≠</div>
              <div style={{ textAlign: 'center' }}><div className="kicker" style={{ marginBottom: 10 }}>Device Environment</div><div style={{ fontSize: 'clamp(18px, 2.4vw, 28px)', fontWeight: 600 }}>System Clock · Apple Voices</div><div style={{ color: 'var(--fg-muted)', marginTop: 6 }}>Client-side runtime</div></div>
            </div>
            <div style={{ marginTop: 30, paddingTop: 22, borderTop: '1px solid var(--hair-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--fg-muted)' }}>Avoids commodity device false positives: Evaluates contradictory evidence within the active connection.</span>
              <span className="chip" style={{ color: '#ff7777', borderColor: '#ff777755', background: '#ff4d4d14' }}>zero-touch inconsistency</span>
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
        notes="Week 2 deliberately skips the browser-fingerprinting basics covered in Week 1. It adds first-party session continuity and the additional signals available only with an opted-in extension or managed native app."
        kicker="Week 2 · session continuity + managed signals"
        title={
          <>
            Beyond browser signals
            <br />
            <span className="accent-text">to session and device posture</span>
          </>
        }
        subtitle="Use a first-party session identifier for continuity, then add explicit browser-extension or managed-app evidence when the deployment allows it."
        foot="VPN-risk research · Week 2"
      />

      <Slide nav="Week 2 focus" notes="Week 1 already covers IP, browser, WebRTC, and fingerprinting basics. Week 2 should focus only on the additional collection channels and what they enable.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>What is new in Week 2</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(24px, 4vh, 42px)' }}>
              Keep Week 1 basics. <span className="accent-text">Add continuity and posture.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              ['Website', 'Continue using the Week 1 signals: server-observed IP, browser context, and fingerprint similarity.', '#30c9f4'],
              ['Extension', 'Add opt-in browser-level continuity when the apparent public IP changes during a session.', '#62e6b7'],
              ['Managed app', 'Add trusted device-posture facts that a normal website cannot access.', '#f2c94c'],
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

      <Slide nav="Session cookie" notes="The cookie is a first-party essential session identifier, not a replacement for consent or an attempt to recreate a deleted identifier. It is random, scoped to this site, and rotated at sensitive boundaries.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>New capability 01 · first-party continuity</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(22px, 3.5vh, 34px)' }}>
              An essential cookie gives each <span className="accent-text">session a unique ID.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '0.9fr 1.1fr' }}>
            <Reveal>
              <div className="mat" style={{ ...cardStyle, minHeight: 345, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="kicker" style={{ marginBottom: 18 }}>Cookie design</div>
                {['Random, server-generated session ID', 'First-party only; scoped to this website', 'HttpOnly · Secure · SameSite=Lax', 'Short expiry; rotate after sign-in or risk events', 'No device or person claim from cookie alone'].map((item) => (
                  <div key={item} style={{ padding: '12px 0', borderTop: '1px solid var(--hair-2)', color: 'var(--fg-muted)' }}>↳ {item}</div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 345 }}>
                <div className="kicker" style={{ marginBottom: 18 }}>What it enables</div>
                {[
                  ['IP change history', 'The same active session can be compared before and after its apparent public IP changes.'],
                  ['Risk correlation', 'Correlate the change with the existing Week 1 signals and account history.'],
                  ['Clear boundary', 'A new cookie, private mode, or cleared storage means a new session; do not silently recreate it.'],
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
        nav="Session flow"
        notes="Show the link between the new first-party session ID and a detected public IP change. The point is continuity, not an assertion that an IP change proves VPN use."
        kicker="New capability 02 · event correlation"
        title="When the public IP changes, preserve the session story."
        items={[
          { title: 'Start', body: 'Create a random first-party session ID when the user begins a session on the website.' },
          { title: 'Observe', body: 'Record server-observed egress IP and the Week 1 context at each relevant request or explicit check.' },
          { title: 'Respond', body: 'If IP or network context changes, add explainable risk evidence and choose a proportionate action.' },
        ]}
      />

      <Slide nav="Browser extension" notes="An extension must be installed by the user or managed by the organization. It can periodically check the public egress IP and, where permission allows, observe browser proxy settings. It does not get operating-system routing or DNS configuration.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12, textAlign: 'center' }}>New capability 03 · installed extension</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(22px, 3.5vh, 34px)', textAlign: 'center', marginInline: 'auto' }}>
              An extension can make <span className="accent-text">IP changes visible during browsing.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              ['Egress check', 'Periodically call a first-party endpoint to see whether the browser’s public egress IP changed.', '#30c9f4'],
              ['Browser context', 'Attach tab, browser profile, timestamp, and session ID to the observed change.', '#62e6b7'],
              ['Proxy context', 'Read configured browser proxy settings only with the required extension permission.', '#f2c94c'],
              ['Limits', 'No access to OS routing tables, tunnel interfaces, or system DNS configuration from a normal extension.', '#ff9c66'],
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

      <Slide nav="Managed app" notes="A managed native app or endpoint agent can collect device-posture facts with explicit authorization. The website and browser extension cannot access these operating-system-level details. Report only the minimum facts needed; do not upload raw routing or DNS history by default.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>New capability 04 · native / managed app</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(22px, 3.2vh, 32px)' }}>
              A managed app can add <span className="accent-text">device network posture.</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '0.72fr 0.72fr 1.2fr' }}>
            <Reveal>
              <div className="mat" style={{ ...cardStyle, minHeight: 290, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="kicker">Network posture</div>
                <div style={{ fontSize: 'clamp(38px, 4.4vw, 58px)', lineHeight: 1.05, margin: '18px 0 12px', color: '#62e6b7', fontWeight: 700 }}>Route<br />+ tunnel</div>
                <div style={{ color: 'var(--fg-muted)' }}>Default route, active interface, and VPN / TUN adapter state.</div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mat" style={{ ...cardStyle, minHeight: 290, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="kicker">System posture</div>
                <div style={{ fontSize: 'clamp(38px, 4.4vw, 58px)', lineHeight: 1.05, margin: '18px 0 12px', color: '#30c9f4', fontWeight: 700 }}>Time<br />+ DNS</div>
                <div style={{ color: 'var(--fg-muted)' }}>Device time/timezone and configured DNS resolver facts.</div>
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mat" style={{ ...cardStyle, minHeight: 290 }}>
                <div className="kicker" style={{ marginBottom: 18 }}>Authorized app checks</div>
                {['Default route + active interface', 'VPN / proxy / TUN adapter presence', 'System clock, timezone, and drift', 'Configured DNS resolvers', 'Signed posture report with a short retention period'].map((item) => (
                  <div key={item} style={{ padding: '10px 0', borderTop: '1px solid var(--hair-2)', color: '#d8e2ef' }}>✓ {item}</div>
                ))}
                <div style={{ marginTop: 14, color: '#ffcf8b', fontSize: 13 }}>Requires managed-device policy and clear user disclosure.</div>
              </div>
            </Reveal>
          </div>
          <div style={{ marginTop: 18, color: 'var(--fg-faint)', fontSize: 13 }}>These signals strengthen device posture; they still need calibration and do not by themselves prove VPN use.</div>
        </div>
      </Slide>

      <Slide nav="Actions" notes="The output should be a proportionate policy action, not automatic blocking. A single IP change has many legitimate causes, including mobile networks, travel, and corporate proxies.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>What we can do when signals change</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 30px)' }}>
              Turn context into a <span className="accent-text">proportionate response.</span>
            </h2>
          </Reveal>
          <div className="mat" style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            {[
              ['Low context', 'A normal IP change with no contradictory signals is recorded as session history.', 'Continue'],
              ['Medium context', 'The same session changes IP and browser/network context becomes inconsistent.', 'Step-up verification'],
              ['High context', 'Repeated changes plus managed-app tunnel/route or DNS posture conflicts need review.', 'Alert / review'],
              ['Sensitive action', 'Before payments, exports, or account recovery, require re-authentication or passkey confirmation.', 'Protect account'],
            ].map(([browser, behavior, implication], index) => (
              <div key={browser} style={{ display: 'grid', gridTemplateColumns: '0.8fr 2.1fr 0.9fr', gap: 22, alignItems: 'center', padding: 'clamp(15px, 2vh, 22px) clamp(18px, 2.4vw, 30px)', borderTop: index ? '1px solid var(--hair-2)' : 'none' }}>
                <strong>{browser}</strong>
                <span style={{ color: 'var(--fg-muted)', lineHeight: 1.5 }}>{behavior}</span>
                <span style={{ color: '#30c9f4', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{implication}</span>
              </div>
            ))}
          </div>
          <div className="chip" style={{ marginTop: 20, color: '#f2c94c', borderColor: '#f2c94c55', background: '#f2c94c14' }}>No single signal proves a VPN. Explain the evidence and preserve a human-review path.</div>
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
