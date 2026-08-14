import type { CSSProperties, ReactNode } from 'react';
import Deck from '@/deck/Deck';
import Slide from '@/deck/Slide';
import Cover from '@/components/Cover';
import Reveal from '@/deck/Reveal';
import Steps from '@/components/Steps';
import StatGrid from '@/components/StatGrid';
import Timeline from '@/components/Timeline';
import BrowserFrame from '../components/BrowserFrame';
import { BarChart } from '@/components/Charts';

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
    <Deck>
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
    </Deck>
  );
}
