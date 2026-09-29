import Deck from '@/deck/Deck';
import Slide from '@/deck/Slide';
import { presentationSlides } from '@/data/presentation-store';
import Image from 'next/image';
import './midsem.css';

function ImageSpace({ index }: { index: number }) {
  return (
    <div
      className={`ms-image-space ms-image-space-${index + 1}`}
      aria-label={`Image space ${index + 1}`}
    />
  );
}

export default function Home() {
  return (
    <Deck>
      <Slide
        nav="Title"
        notes="Introduce the team and the project topic."
        className="ms-slide ms-midsem-cover"
      >
        <div className="ms-midsem-cover-layout">
          <div className="ms-midsem-cover-main">
            <p className="ms-midsem-cover-kicker">Midsem Presentation</p>
            <h1>VPN &amp; <em>Browser Fingerprinting</em></h1>
            <p className="ms-midsem-cover-topic">Finding device uniqueness through browser-observed signals</p>
          </div>

          <dl className="ms-midsem-cover-team">
            <div><dt>IIT2024087</dt><dd>Vishwas Pahwa</dd></div>
            <div><dt>IIT2024018</dt><dd>Saumya Sood</dd></div>
            <div><dt>IIT2024083</dt><dd>Vichanshu Raj</dd></div>
          </dl>
        </div>
      </Slide>
      {presentationSlides.map((item, index) => {
        if (index === 0) {
          return (
            <Slide
              key={`${item.presenter}-${item.title}`}
              nav={item.title}
              notes={item.brief}
              className="ms-slide ms-vpn-intro ms-owner-vishwas"
            >
              <div className="ms-vpn-intro-layout">
                <section className="ms-vpn-copy">
                  <div className="ms-kicker">
                    <span>02</span>
                    <span className="ms-kicker-dot" />
                    <span>{item.presenter}</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p className="ms-vpn-lead">
                    A VPN encrypts a user’s traffic and routes it through a remote server. The website sees the VPN server’s IP address instead of the user’s original public IP.
                  </p>

                  <div className="ms-vpn-reasons">
                    <p>Why detection matters</p>
                    <ul>
                      <li><strong>Location controls</strong><span>A VPN can change the user’s apparent country or network.</span></li>
                      <li><strong>Account protection</strong><span>Unexpected network changes can signal suspicious access.</span></li>
                      <li><strong>Fraud review</strong><span>Proxy-based abuse can trigger additional verification.</span></li>
                    </ul>
                  </div>
                </section>

                <figure className="ms-vpn-diagram">
                  <Image
                    src="/images/vpn-process-diagram.png"
                    width={1672}
                    height={941}
                    priority
                    alt="VPN process from a user device through an encrypted tunnel and VPN server to the internet, with reasons to detect VPN use"
                  />
                </figure>
              </div>
            </Slide>
          );
        }

        if (index === 1) {
          return (
            <Slide
              key={`${item.presenter}-${item.title}`}
              nav={item.title}
              notes={item.brief}
              className="ms-slide ms-ip-problem ms-owner-vishwas"
            >
              <div className="ms-ip-problem-layout">
                <section className="ms-ip-problem-copy">
                  <div className="ms-kicker">
                    <span>03</span>
                    <span className="ms-kicker-dot" />
                    <span>{item.presenter}</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p className="ms-ip-problem-lead">
                    An IP address alone cannot reliably identify VPN usage or confirm that two sessions came from the same device.
                  </p>

                  <div className="ms-ip-problem-points">
                    <p>Why IP-only detection is limited</p>
                    <ul>
                      <li>IP addresses can be dynamic or shared.</li>
                      <li>Travel, mobile networks, corporate gateways, and proxies can change the IP.</li>
                      <li>GeoIP and VPN classifications may be inaccurate.</li>
                    </ul>
                  </div>

                  <p className="ms-ip-problem-approach">
                    <strong>Our approach:</strong> combine browser fingerprinting with IP and network signals, then compare sessions using a device-similarity score.
                  </p>
                </section>

                <figure className="ms-ip-problem-figure">
                  <Image
                    src="/images/ip-only-limitation-diagram.png"
                    width={1536}
                    height={1024}
                    alt="One device can appear through home Wi-Fi, mobile network, corporate gateway, or VPN exit, showing that IP alone cannot confirm device continuity"
                  />
                </figure>
              </div>
            </Slide>
          );
        }

        return (
          <Slide
            key={`${item.presenter}-${item.title}`}
            nav={item.title}
            notes={item.brief}
            className={`ms-slide ms-owner-${item.presenter.toLowerCase()}`}
          >
            <div className="ms-template">
              <header className="ms-template-header">
                <div className="ms-kicker">
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <span className="ms-kicker-dot" />
                  <span>{item.presenter}</span>
                </div>
                <h2>{item.title}</h2>
              </header>

              <div className="ms-image-grid">
                {Array.from({ length: item.imageSlots }, (_, slotIndex) => (
                  <ImageSpace key={slotIndex} index={slotIndex} />
                ))}
              </div>
            </div>
          </Slide>
        );
      })}
    </Deck>
  );
}
