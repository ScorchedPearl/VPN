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
      weekThree={
        <>
      <Cover
        nav="Week 3"
        notes="Week 3 provides a comprehensive catalog of all client-side hardware, rendering, typography, network, and server-side parameters captured by our browser fingerprinting engine."
        kicker="Week 3 · Browser fingerprinting inventory"
        title={
          <>
            Captured parameters
            <br />
            <span className="accent-text">&amp; fingerprint surface</span>
          </>
        }
        subtitle="Complete catalog of hardware, display, graphical rendering, typography, WebRTC telemetry, and server-side ingress parameters collected to date."
        foot="VPN-risk research · Week 3"
      />

      <Slide nav="01 · Hardware & Specs" notes="Slide 1 covers hardware, CPU, memory, display geometry, operating system, and high-entropy architecture hints.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Collected parameters · Slide 01</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Hardware, OS &amp; <span className="accent-text">display geometry</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="kicker" style={{ marginBottom: 14 }}>CPU &amp; Device Memory</div>
                {[
                  ['hardwareConcurrency', 'Logical CPU core thread count'],
                  ['hardwareBucket', '<=2 · <=4 · <=8 · <=16 · >16'],
                  ['deviceMemory', 'Approximate device RAM in GB'],
                  ['memoryBucket', '<=2 · <=4 · <=8 · <=16 · >16'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '9px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#30c9f4', fontFamily: 'var(--font-mono)' }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="kicker" style={{ marginBottom: 14 }}>Display &amp; Screen Geometry</div>
                {[
                  ['screen.width / height', 'Physical display resolution'],
                  ['max / minDimensionBucket', '100px rounded dimension buckets'],
                  ['pixelRatioBucket', 'Device pixel ratio rounded to 0.25'],
                  ['colorDepth', 'Screen bit depth (24 / 30 / 32-bit)'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '9px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#62e6b7', fontFamily: 'var(--font-mono)' }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="kicker" style={{ marginBottom: 14 }}>OS, Platform &amp; Hints</div>
                {[
                  ['osFamily & platform', 'Windows · macOS · Linux · iOS'],
                  ['architecture', 'High-Entropy UA hint (arm / x86)'],
                  ['bitness', 'High-Entropy UA bitness (32 / 64-bit)'],
                  ['touchPoints', 'navigator.maxTouchPoints count'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '9px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#f2c94c', fontFamily: 'var(--font-mono)' }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="02 · Graphical & Fonts" notes="Slide 2 covers 2D Canvas render hashing, WebGL GPU unmasking and parameter hashing, 25-font baseline tests, and Web API capabilities.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Collected parameters · Slide 02</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Canvas, WebGL &amp; <span className="accent-text">system typography</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#ff9c66', borderColor: '#ff9c6655', background: '#ff9c6614', marginBottom: 12 }}>Canvas 2D Engine</div>
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                  Renders multi-color text, shapes &amp; gradients to exploit sub-pixel anti-aliasing quirks.
                </div>
                {[
                  ['canvas.hash', 'SHA-256 hash of canvas data URL'],
                  ['canvas.repeatable', 'Dual-pass render consistency check'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#ff9c66', fontFamily: 'var(--font-mono)' }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#30c9f4', borderColor: '#30c9f455', background: '#30c9f414', marginBottom: 12 }}>WebGL &amp; GPU Profile</div>
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                  Queries debug info to unmask actual hardware vendor, renderer &amp; buffer limits.
                </div>
                {[
                  ['webgl.vendor / renderer', 'Unmasked GPU name (e.g. Apple M2)'],
                  ['webgl.rendererFamily', 'apple-gpu · nvidia · amd · intel'],
                  ['webgl.parameterHash', 'SHA-256 of extensions &amp; limits'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#30c9f4', fontFamily: 'var(--font-mono)' }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#62e6b7', borderColor: '#62e6b755', background: '#62e6b714', marginBottom: 12 }}>Fonts &amp; Capabilities</div>
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                  Measures font fallback widths and checks 12 modern Web platform APIs.
                </div>
                {[
                  ['fonts (25 checked)', 'Arial, Segoe UI, Roboto, Menlo, ...'],
                  ['capabilities (12 APIs)', 'webgl2, webgpu, wasm, webrtc, usb, hid...'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#62e6b7', fontFamily: 'var(--font-mono)' }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="03 · Network & Ingress" notes="Slide 3 covers typed WebRTC candidates, timezone and UTC offset, network information, GeoIP enrichment, server request headers, and dual signatures.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Collected parameters · Slide 03</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              WebRTC, timezone &amp; <span className="accent-text">server ingress</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330 }}>
                <div className="kicker" style={{ marginBottom: 14 }}>WebRTC &amp; Timezone Telemetry</div>
                {[
                  ['webrtcCandidates[]', 'Typed ICE candidates (host, srflx, relay, prflx)'],
                  ['addressFamily & isPublic', 'Parsed into ipv4, ipv6, mdns, and public status'],
                  ['timezone.name', 'Resolved IANA timezone (e.g. Asia/Kolkata)'],
                  ['timezone.offsetMinutes', 'Accurate system UTC offset (-getTimezoneOffset)'],
                  ['languages[]', 'Configured browser language preference array'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 12, padding: '9px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <span style={{ color: '#30c9f4', fontFamily: 'var(--font-mono)' }}>{param}</span>
                    <span style={{ color: 'var(--fg-muted)' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330 }}>
                <div className="kicker" style={{ marginBottom: 14 }}>Server-Side Ingress &amp; Signatures</div>
                {[
                  ['geoIp.ip / city / country', 'Egress public IP and country location'],
                  ['geoIp.org / asn', 'ISP autonomous system network name'],
                  ['cf-connecting-ip / xff', 'Ingress CDN & proxy forwarded headers'],
                  ['sec-ch-ua / platform', 'High-accuracy client hints unmasking true UA'],
                  ['signatures.browser', 'Full application-stack SHA-256 signature'],
                  ['signatures.coarseDevice', 'Hardware-only invariant SHA-256 signature'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#62e6b7', fontFamily: 'var(--font-mono)' }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="04 · Prior Bottlenecks 1" notes="Explain why our previous parameters failed across browsers: User-Agent strings change, Canvas toDataURL() uses lossy browser-specific encoders, and screen dimensions change on page zoom.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Cross-browser bottlenecks · Slide 04</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Why prior parameters <span className="accent-text">broke across browsers (Part 1)</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#ff6b6b', borderColor: '#ff6b6b55', background: '#ff6b6b14', marginBottom: 12 }}>Browser-Bound Strings</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>UA &amp; Client Hints Divergence</div>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Parameters like <code>User-Agent</code>, <code>sec-ch-ua</code>, and <code>browserFamily</code> change 100% when switching from Chrome to Firefox/Safari, yielding only <strong>1.39%</strong> cross-browser stability.
                </p>
                <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: '#1c0d12', color: '#ff8a8a', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  Bound to application layer
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#ff9c66', borderColor: '#ff9c6655', background: '#ff9c6614', marginBottom: 12 }}>Lossy Image Encoders</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>DataURL &amp; JPEG Variance</div>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  <code>canvas.toDataURL()</code> and JPEG export use lossy compression implemented differently per browser engine. Even on identical GPUs, different browsers generate completely different canvas hashes (<strong>8.17%</strong> stability).
                </p>
                <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: '#1f1208', color: '#ffb27d', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  Compression corrupts GPU hash
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#f2c94c', borderColor: '#f2c94c55', background: '#f2c94c14', marginBottom: 12 }}>Zoom-Vulnerable Screen</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Resolution Changes with Zoom</div>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Browsers like Firefox and IE alter <code>screen.width / height</code> values proportionally when a user zooms (<code>Ctrl++</code>), causing unnormalized screen resolution to drop to <strong>9.13%</strong> cross-browser stability.
                </p>
                <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: '#1f1b0a', color: '#ffd76a', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  Broken by user zoom level
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="05 · Prior Bottlenecks 2" notes="Explain why audio waveforms, web fonts, video codecs, and WebGL string masking destroyed cross-browser linkage.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Cross-browser bottlenecks · Slide 05</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Why prior parameters <span className="accent-text">broke across browsers (Part 2)</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#ff6b6b', borderColor: '#ff6b6b55', background: '#ff6b6b14', marginBottom: 12 }}>Full Audio Waveforms</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Browser-Level Audio Stack</div>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Hashing full <code>DynamicsCompressorNode</code> audio output captures browser software DSP algorithms rather than the underlying OS/sound card hardware, causing waveforms to drift across browsers.
                </p>
                <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: '#1c0d12', color: '#ff8a8a', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  Software DSP obscuring hardware
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#ff9c66', borderColor: '#ff9c6655', background: '#ff9c6614', marginBottom: 12 }}>Web Fonts &amp; Flash</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Obsolete Flash &amp; Web Bundles</div>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Prior methods relied on obsolete Flash plugins (entropy dropped to 2.40) or measured generic web fonts bundled into specific browsers rather than permanent OS-installed system typefaces.
                </p>
                <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: '#1f1208', color: '#ffb27d', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  Web-specific font pollution
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#f2c94c', borderColor: '#f2c94c55', background: '#f2c94c14', marginBottom: 12 }}>Lossy Codecs &amp; Masking</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Video Loss &amp; String Privacy</div>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Video decompression (WebM/MP4) is lossy (<strong>5.48%</strong> stability). Furthermore, privacy browsers like Firefox intentionally hide or generalize raw WebGL vendor and renderer debug strings (<strong>15.39%</strong> stability).
                </p>
                <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: '#1f1b0a', color: '#ffd76a', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  Strings hidden by privacy flags
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="06 · NDSS OS & Hardware" notes="Explain the NDSS paper core thesis: extract invariant OS and hardware features below the browser layer (Screen Ratio, CPU cores with Safari doubling, audio destination properties, and installed language scripts).">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>NDSS '17 Solution · Slide 06</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Extracting OS &amp; hardware features <span className="accent-text">below the browser</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="kicker" style={{ marginBottom: 14 }}>Screen Ratio &amp; Boundaries</div>
                {[
                  ['Screen Aspect Ratio', 'width / height ratio is invariant to browser zoom (97.57% stability)'],
                  ['availWidth / availHeight', 'Screen area excluding OS taskbar / Mac top menu'],
                  ['availLeft / availTop / orient', 'Screen position & orientation across multiple monitors'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#30c9f4', fontWeight: 600 }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="kicker" style={{ marginBottom: 14 }}>CPU Cores &amp; Normalization</div>
                {[
                  ['hardwareConcurrency', 'Hardware CPU virtual cores (100% stability with mask)'],
                  ['Safari Worker Normalization', 'Doubles Safari reported count (Safari cuts workers in half)'],
                  ['Worker Timing Side-Channel', 'Measures completion escalation time when API is unsupported'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#62e6b7', fontWeight: 600 }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="kicker" style={{ marginBottom: 14 }}>Audio Stack &amp; Writing Scripts</div>
                {[
                  ['Audio Destination Device', 'sampleRate, maxChannelCount, channelCountMode (97.48% stability)'],
                  ['Frequency Peak Bins', 'Discretizes peak frequencies & values into small 2D bins'],
                  ['36 Writing Scripts', 'Detects OS language packages (Arabic, Chinese, Hebrew) via box side-channel (97.91%)'],
                ].map(([param, desc]) => (
                  <div key={param} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <div style={{ color: '#f2c94c', fontWeight: 600 }}>{param}</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="07 · NDSS GPU Tasks" notes="Detail the 20+ GPU rendering tasks proposed by the paper: Anti-aliasing, color varyings, high-contrast random textures, discrete alpha blending, and complex light reflection.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>NDSS '17 Solution · Slide 07</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              20+ GPU rendering tasks <span className="accent-text">&amp; shader pipeline profiling</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#30c9f4', borderColor: '#30c9f455', background: '#30c9f414', marginBottom: 12 }}>Shaders &amp; Anti-Aliasing</div>
                {[
                  ['Anti-Aliasing Smoothing', 'Captures GPU driver edge-smoothing algorithms on 2D curves & 3D models (74-90% stability).'],
                  ['Fragment Shader Varyings', 'Rasterization color interpolation across cube & Suzanne surfaces (88.25% stability).'],
                  ['Lines & Curves Gradients', 'Trigonometric curves y = 256 - 100cos(...) testing sub-pixel coordinate shifts.'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <strong style={{ color: '#30c9f4', display: 'block' }}>{title}</strong>
                    <span style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#62e6b7', borderColor: '#62e6b755', background: '#62e6b714', marginBottom: 12 }}>Textures &amp; Alpha Blending</div>
                {[
                  ['High-Contrast Noise Texture', 'Random 256x256 RGB noise amplifies GPU texture filtering & interpolation differences (81.47%).'],
                  ['Discrete Alpha Blending', '8 precise alpha values (0.09 to 1.0) testing GPU rounding & transparency jumps (82.75%).'],
                  ['Float & Cubemap Textures', 'Depth buffer float textures and 6-face cubemap Fresnel reflections (58-74%).'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <strong style={{ color: '#62e6b7', display: 'block' }}>{title}</strong>
                    <span style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="chip" style={{ width: 'fit-content', color: '#f2c94c', borderColor: '#f2c94c55', background: '#f2c94c14', marginBottom: 12 }}>Lighting &amp; 5,000 Models</div>
                {[
                  ['Specular Reflection Highlight', 'Diffuse + specular point lights causing distinct GPU specular spot reflections (80.64%).'],
                  ['Multi-Model Shadow Mapping', 'Suzanne + Sofa models testing inter-model shadow and hidden surface visibility (80.94%).'],
                  ['5,000 Metallic Ring Tracing', 'Seeded pseudorandom pile of 5,000 rings testing complex multi-light reflection tracing (Task k).'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ padding: '8px 0', borderTop: '1px solid var(--hair-2)', fontSize: 13 }}>
                    <strong style={{ color: '#f2c94c', display: 'block' }}>{title}</strong>
                    <span style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="08 · NDSS Masking & Pipeline" notes="Explain the lossless PNG/pixel-buffer data transfer pipeline and the trained browser-pair mask generation algorithm that achieved 99.24% single-browser and 83.24% cross-browser uniqueness with 91.44% stability.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>NDSS '17 Solution · Slide 08</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Browser-pair masking &amp; <span className="accent-text">lossless data pipeline</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Reveal delay={0.06}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="kicker" style={{ marginBottom: 14 }}>Lossless Data Protocol</div>
                <div style={{ padding: 14, borderRadius: 10, background: '#030712', border: '1px solid var(--hair-2)', marginBottom: 14 }}>
                  <div style={{ color: '#62e6b7', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>Replace DataURL with Lossless PNG / Raw Buffers</div>
                  <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
                    Transfers raw canvas pixel buffers to eliminate browser-specific compression differences from corrupting GPU hardware hashes.
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                  <strong>Graceful Fallbacks:</strong> Distinguishes software rendering (SwiftShader, Microsoft Basic Rendering) from native hardware drivers without breaking fingerprint consistency.
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mat" style={{ ...cardStyle, minHeight: 330, display: 'flex', flexDirection: 'column' }}>
                <div className="kicker" style={{ marginBottom: 14 }}>Trained Browser-Pair Masks (Algorithm 1)</div>
                <div style={{ padding: 14, borderRadius: 10, background: '#0a192f', border: '1px solid #30c9f433', marginBottom: 14 }}>
                  <div style={{ color: '#30c9f4', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    Mask Optimization: Maximize(Stability × Uniqueness)
                  </div>
                  <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 6 }}>
                    Applies custom masks for each pair (e.g. <code>Chrome vs Firefox</code>, <code>Chrome vs Edge</code>) to discard browser-divergent task bits.
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 'auto' }}>
                  <div style={{ padding: 10, borderRadius: 8, background: '#091e17', border: '1px solid #62e6b733', textAlign: 'center' }}>
                    <div style={{ color: '#62e6b7', fontSize: 20, fontWeight: 700 }}>99.24%</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 11 }}>Single-Browser Uniqueness</div>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: '#091620', border: '1px solid #30c9f433', textAlign: 'center' }}>
                    <div style={{ color: '#30c9f4', fontSize: 20, fontWeight: 700 }}>83.24%</div>
                    <div style={{ color: 'var(--fg-muted)', fontSize: 11 }}>Cross-Browser (91.44% Stable)</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>
        </>
      }
      weekFour={
        <>
      <Cover
        nav="Architecture"
        notes="Week 4 / Architecture presents the complete 5-Layer Zero-Touch Passive VPN Detection Architecture, spanning kernel TCP/IP stack signals, flow traces, TLS cryptography, BGP routing intelligence, and silent client telemetry."
        kicker="Zero-Touch Telemetry · 5-Layer Architecture"
        title={
          <>
            5-Layer Passive
            <br />
            <span className="accent-text">VPN &amp; Inconsistency Architecture</span>
          </>
        }
        subtitle="Zero-touch multi-layer telemetry combining kernel TCP/IP stack inspection, traffic trace dynamics, TLS JA4 cryptography, BGP routing intelligence, and silent background client telemetry."
        foot="Passive Detection Stack · 2026"
      />

      <Slide nav="Architecture Matrix" notes="This table outlines the implementation architecture, data collector technology, processing overhead, and weight in the overall scoring model.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Architecture Blueprint</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              5-Layer collection &amp; <span className="accent-text">scoring architecture</span>
            </h2>
          </Reveal>
          <div className="mat" style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0a1628', borderBottom: '1px solid var(--hair-2)', color: 'var(--fg-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11 }}>
                  <th style={{ padding: '14px 20px' }}>Layer &amp; Feature Group</th>
                  <th style={{ padding: '14px 20px' }}>Data Collector</th>
                  <th style={{ padding: '14px 20px' }}>Processing Overhead</th>
                  <th style={{ padding: '14px 20px' }}>Weight in Scoring</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Layer 1: TCP/IP Stack', 'Initial TTL, DF flag, MSS clamping, Window scale, JA4T options', 'p0f / eBPF / Kernel Driver', 'Near 0%', 'High (40%)', '#30c9f4'],
                  ['Layer 2: Flow Trace (TPA-SSTM)', 'Direction/Size vector, Inter-packet delay Δt, Burst metrics', 'Network TAP / Packet Capture', 'Low', 'High (35%)', '#62e6b7'],
                  ['Layer 3: TLS JA4', 'JA4/JA3 hash, cipher suite ordering, ALPN negotiation', 'Reverse Proxy (HAProxy / NGINX / Cloudflare)', 'Minimal', 'Medium (15%)', '#f2c94c'],
                  ['Layer 4: BGP ASN & RTT', 'Datacenter ASN, CIDR ranges, Handshake RTT triangulation', 'Server-side IP Database Lookup', 'Negligible', 'Critical Override', '#ff9c66'],
                  ['Layer 5: Silent Client JS', 'Timezone vs IP, Locale vs GeoIP, WebGL GPU vs UA, Screen coherency', 'Asynchronous fetch() script', 'Minimal', 'Medium (10%)', '#c084fc'],
                ].map(([layer, desc, collector, overhead, weight, color]) => (
                  <tr key={layer} style={{ borderTop: '1px solid var(--hair-2)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <strong style={{ color, display: 'block', marginBottom: 2 }}>{layer}</strong>
                      <span style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{desc}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', color: '#d8e2ef', fontSize: 12 }}>{collector}</td>
                    <td style={{ padding: '14px 20px', color: '#62e6b7' }}>{overhead}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="chip" style={{ color, borderColor: `${color}44`, background: `${color}14` }}>{weight}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Slide>

      <Slide nav="Layer 1 · TCP/IP Stack" notes="Extracted from the initial TCP SYN packet before any HTTP payload is transferred. No client JavaScript execution required.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Layer 01 · Server / Gateway Level · 40% Weight</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Passive TCP/IP stack <span className="accent-text">fingerprinting (JA4T)</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 310, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#30c9f4', borderColor: '#30c9f455', background: '#30c9f414' }}>TTL &amp; DF Flag</div>
                <h3 style={{ fontSize: 20 }}>Initial TTL &amp; Path MTU</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Standard OS baselines: Windows = 128, Linux/Android = 64, macOS/iOS = 64. Deviations reveal intermediate proxy/tunnel hops.
                </p>
                <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: '#030712', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#30c9f4', border: '1px solid var(--hair-2)' }}>
                  DF Flag: Path MTU discovery differentiates consumer stacks from server kernels.
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 310, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#ff9c66', borderColor: '#ff9c6655', background: '#ff9c6614' }}>MSS Clamping</div>
                <h3 style={{ fontSize: 20 }}>Tunnel Encapsulation</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Standard Ethernet MTU is 1500 bytes (MSS ~1460). VPN crypto wrappers (WireGuard, OpenVPN, IPsec) force MSS down to 1380, 1350, or 1280 bytes.
                </p>
                <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: '#120803', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff9c66', border: '1px solid #ff9c6633' }}>
                  MSS &lt; 1440: Direct physical proof of network tunneling.
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mat" style={{ ...cardStyle, minHeight: 310, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#62e6b7', borderColor: '#62e6b755', background: '#62e6b714' }}>JA4T Options</div>
                <h3 style={{ fontSize: 20 }}>Kernel Option Ordering</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  The sequence of TCP options (MSS → NOP → WS → SACK → TS) identifies the true routing kernel (Linux exit gateway vs client OS).
                </p>
                <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: '#03120b', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#62e6b7', border: '1px solid #62e6b733' }}>
                  Window Scale: Static server buffers vs dynamic client windows.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="Layer 2 · Flow Trace" notes="Extracted passively from the first 100 to 500 packets of a session using the TPA-SSTM temporal packet analysis model.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Layer 02 · Traffic Dynamics · 35% Weight</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Traffic trace &amp; <span className="accent-text">flow metadata (TPA-SSTM)</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              ['Direction & Size', 'Sequence vector of (Direction, Size) pairs e.g. [+1460, -64, +540, -64] capturing structural resource footprints.', '#30c9f4'],
              ['Inter-Packet Delay Δt', 'Microsecond-level packet timestamps exposing encryption encapsulation overhead, queuing delay, and jitter.', '#62e6b7'],
              ['Directional Bursts', 'Burst metrics: consecutive packet count without turnaround, burst volume in bytes, and burst duration.', '#f2c94c'],
              ['Byte-Flow Trajectory', 'Cumulative byte-flow curve slope over elapsed session time, characterizing interactive vs automated streams.', '#ff9c66'],
            ].map(([title, desc, color], index) => (
              <Reveal key={title} delay={index * 0.06}>
                <div className="mat" style={{ ...cardStyle, minHeight: 270, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {signalIcon(color, `0${index + 1}`)}
                  <h3 style={{ fontSize: 18 }}>{title}</h3>
                  <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Slide>

      <Slide nav="Layer 3 · TLS JA4" notes="Analyzed during the TLS ClientHello handshake at the reverse proxy level before HTTP payload decryption.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Layer 03 · Edge Cryptography · 15% Weight</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Cryptographic &amp; <span className="accent-text">TLS JA4 fingerprinting</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 300, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#f2c94c', borderColor: '#f2c94c55', background: '#f2c94c14' }}>JA4 / JA3 Hash</div>
                <h3 style={{ fontSize: 21 }}>Runtime Detection</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Hashes the exact TLS protocol version, cipher suites, TLS extensions, and supported elliptic curves from the ClientHello packet.
                </p>
                <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10, background: '#0e1726', color: '#ffd978', fontFamily: 'var(--font-mono)', fontSize: 12, border: '1px solid var(--hair-2)' }}>
                  Unmasks Python urllib, Go http, or OpenVPN wrappers spoofing browser User-Agents.
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 300, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#62e6b7', borderColor: '#62e6b755', background: '#62e6b714' }}>Cipher Ordering</div>
                <h3 style={{ fontSize: 21 }}>Cipher Suite Priority</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Standard browsers (Chrome, Safari, Firefox) broadcast strictly defined cipher preference sequences. Custom proxy scripts and VPN clients use unique cipher arrays.
                </p>
                <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10, background: '#041c14', color: '#62e6b7', fontFamily: 'var(--font-mono)', fontSize: 12, border: '1px solid #62e6b733' }}>
                  Differentiates genuine Chrome/Blink from Chromium-based proxy bots.
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mat" style={{ ...cardStyle, minHeight: 300, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#30c9f4', borderColor: '#30c9f455', background: '#30c9f414' }}>ALPN Protocol</div>
                <h3 style={{ fontSize: 21 }}>Protocol Negotiation</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Application-Layer Protocol Negotiation inspects whether the client requests <code>h2</code>, <code>http/1.1</code>, or <code>h3</code> (QUIC).
                </p>
                <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10, background: '#071828', color: '#30c9f4', fontFamily: 'var(--font-mono)', fontSize: 12, border: '1px solid #30c9f433' }}>
                  Mismatches between claimed HTTP/2 support and low-level TLS capabilities trigger scrutiny.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="Layer 4 · Infrastructure" notes="BGP routing intelligence cross-referenced against authoritative ASN routing tables. Acts as a critical override.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Layer 04 · IP Intelligence · Critical Override</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Infrastructure &amp; <span className="accent-text">BGP routing data</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Reveal delay={0.05}>
              <div className="mat" style={{ ...cardStyle, minHeight: 290, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#ff9c66', borderColor: '#ff9c6655', background: '#ff9c6614' }}>BGP ASN</div>
                <h3 style={{ fontSize: 20 }}>Autonomous System</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Categorizes the Autonomous System Number into Datacenter / Cloud (M247, DataCamp, AWS, DigitalOcean) vs Residential ISP (Comcast, Jio, AT&amp;T).
                </p>
                <div style={{ marginTop: 'auto', color: '#ff9c66', fontSize: 12 }}>Critical override: Human interactive browsing directly from cloud ASNs is highly anomalous.</div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mat" style={{ ...cardStyle, minHeight: 290, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#30c9f4', borderColor: '#30c9f455', background: '#30c9f414' }}>CIDR Classification</div>
                <h3 style={{ fontSize: 20 }}>IP Block Classification</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Classifies IP blocks against verified feeds of commercial VPN exit nodes, public proxies, Tor relay directories, and hosting networks.
                </p>
                <div style={{ marginTop: 'auto', color: '#30c9f4', fontSize: 12 }}>Continuous enrichment against multi-source BGP feeds.</div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mat" style={{ ...cardStyle, minHeight: 290, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="chip" style={{ width: 'fit-content', color: '#62e6b7', borderColor: '#62e6b755', background: '#62e6b714' }}>RTT Triangulation</div>
                <h3 style={{ fontSize: 20 }}>Handshake Latency vs Geo</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>
                  Measures TCP SYN/ACK handshake RTT against the theoretical speed-of-light optical distance (~200 km/ms) to the claimed GeoIP coordinates.
                </p>
                <div style={{ marginTop: 'auto', color: '#62e6b7', fontSize: 12 }}>Physics cannot be spoofed: Handshake latency exceeding theoretical bounds proves intermediate relaying.</div>
              </div>
            </Reveal>
          </div>
        </div>
      </Slide>

      <Slide nav="Layer 5 · Client Telemetry" notes="Captured silently via background JavaScript execution during the initial page connection.">
        <div className="container">
          <Reveal>
            <div className="kicker" style={{ marginBottom: 12 }}>Layer 05 · Client Runtime · 10% Weight</div>
            <h2 className="headline" style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Silent client-side <span className="accent-text">inconsistency telemetry</span>
            </h2>
          </Reveal>
          <div className="cols" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              ['Timezone vs IP', 'Compares Intl.DateTimeFormat().resolvedOptions().timeZone against the public IP timezone. Flags mismatches >= 90 mins.', '#30c9f4'],
              ['Locale & Languages', 'Compares navigator.languages and date formatting against the regional language of the claimed GeoIP country.', '#62e6b7'],
              ['WebGL GPU vs UA', 'Extracts UNMASKED_RENDERER_WEBGL to unmask real GPU hardware (Apple M-series, Nvidia) against claimed User-Agent.', '#f2c94c'],
              ['Screen Coherency', 'Audits screen width/height, devicePixelRatio, and colorDepth for headless or virtual display anomalies.', '#c084fc'],
            ].map(([title, desc, color], index) => (
              <Reveal key={title} delay={index * 0.06}>
                <div className="mat" style={{ ...cardStyle, minHeight: 270, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {signalIcon(color, `0${index + 1}`)}
                  <h3 style={{ fontSize: 18 }}>{title}</h3>
                  <p style={{ color: 'var(--fg-muted)', fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Slide>

      <Slide center nav="Architecture Takeaway" notes="Summary of the 5-layer passive detection model."
        style={{ background: 'radial-gradient(60% 70% at 50% 45%, rgba(18, 76, 92, 0.52), transparent 72%), var(--bg)' }}>
        <Reveal>
          <div className="kicker" style={{ marginBottom: 18 }}>5-Layer Zero-Touch Standard</div>
          <h2 className="display" style={{ maxWidth: 940, fontSize: 'clamp(38px, 6.5vw, 84px)', textAlign: 'center', marginInline: 'auto' }}>
            Multi-layer synthesis.
            <br />
            <span className="accent-text">Zero user friction.</span>
          </h2>
          <p className="subhead" style={{ marginTop: 24, maxWidth: 760 }}>
            Combining packet-level TCP/IP stack signals (40%), flow trace dynamics (35%), TLS JA4 cryptography (15%), BGP ASN overrides, and silent client telemetry (10%) to detect VPNs through mathematical inconsistency.
          </p>
          <div className="foot" style={{ marginTop: 36 }}>Passive Zero-Touch VPN Detection Framework · 2026</div>
        </Reveal>
      </Slide>
        </>
      }
    />
  );
}
