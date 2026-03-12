import Link from "next/link";

// ── LensLab colour tokens ──────────────────────────────────
const LL = {
  ocean:      "#2872A1",
  oceanDark:  "#1A5480",
  cloud:      "#CBDDE9",
  cloudLight: "#EBF3F8",
  bg:         "#F5F7F8",
  bgGray:     "#eef1f2",
  ink:        "#1A2226",
  inkMid:     "#4A5C62",
  muted:      "#A8A5BE",
};

const LENS_TAGS = [
  { label: "Letterlijk", bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8" },
  { label: "Dreiging",   bg: "rgba(239,68,68,0.10)",   color: "#b91c1c" },
  { label: "Sociaal",    bg: "rgba(34,197,94,0.10)",   color: "#15803d" },
  { label: "Romantisch", bg: "rgba(168,85,247,0.10)",  color: "#7e22ce" },
];

const BLOCKS = [
  {
    label: "Waarom vier perspectieven?",
    body: "Berichten betekenen nooit precies één ding. Wat jij bedoelt en wat de ander leest zijn twee verschillende dingen. LensLab laat het verschil zien.",
  },
  {
    label: "Voor wie?",
    body: "Voor iedereen die weleens denkt: bedoelde die persoon dat nou echt zo? Voor mensen met autisme, ADHD, sociale angst en voor iedereen die helderheid wil in plaats van twijfel.",
  },
  {
    label: "Wat krijg je?",
    body: "Vier manieren van begrijpen. Geen oordeel, geen advies. En daarna drie vragen die je kunt sturen om te checken welke het dichtst bij de waarheid zit.",
  },
];

export default function LensLandingPage() {
  return (
    <>
      <style>{`
        .ll-wrap { background: ${LL.bg}; min-height: 100vh; }

        /* Nav */
        .ll-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 60px; padding: 0 32px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(245,247,248,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        /* ── Wordmark: Lens in Ocean Blue, Lab in ink ── */
        .ll-wordmark {
          font-size: 16px; font-weight: 800; color: ${LL.ink};
          letter-spacing: -0.5px; font-family: system-ui,-apple-system,sans-serif;
        }
        .ll-wordmark-accent { color: ${LL.ocean}; }

        /* Ocean Blue button */
        .btn-aqua {
          background: ${LL.ocean};
          color: #fff;
          box-shadow: 0 4px 12px rgba(40,114,161,0.25);
          border-radius: 12px;
          transition: background 200ms, transform 200ms, box-shadow 200ms;
        }
        .btn-aqua:hover {
          background: ${LL.oceanDark};
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,84,128,0.35);
        }

        /* Sections */
        .ll-hero {
          min-height: 100svh; display: flex; align-items: center;
          padding: 100px 0 80px; background: ${LL.bg};
        }
        .ll-section { padding: 72px 0; background: ${LL.bg}; }
        .ll-section-gray { background: ${LL.bgGray}; }

        /* ── Headings in Ocean Blue ── */
        .ll-h1 {
          font-family: system-ui,-apple-system,sans-serif;
          font-weight: 800;
          font-size: clamp(32px,5vw,56px);
          line-height: 1.08;
          letter-spacing: -1.5px;
          color: ${LL.ocean};
          margin-bottom: 20px;
        }
        .ll-h2 {
          font-family: system-ui,-apple-system,sans-serif;
          font-weight: 800;
          font-size: clamp(24px,3vw,36px);
          letter-spacing: -0.5px;
          color: ${LL.ocean};
          margin: 0 0 28px;
        }

        /* Content blocks */
        .ll-block {
          padding: 28px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .ll-block:last-child { border-bottom: none; }
        /* ── Block labels in Ocean Blue ── */
        .ll-block-label {
          font-weight: 700; font-size: 15px;
          color: ${LL.ocean};
          margin-bottom: 8px;
        }

        /* Example box */
        .ll-example-box {
          background: #FFFFFF;
          border: 1px solid ${LL.cloud};
          border-radius: 16px;
          padding: 28px;
        }
        .ll-lens-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 12px; }

        /* Footer */
        .ll-footer {
          border-top: 1px solid ${LL.cloud};
          padding: 20px 32px;
          display: flex; align-items: center; justify-content: space-between;
          background: ${LL.bg};
        }
        .ll-footer-note { font-size: 13px; color: ${LL.muted}; }
        .ll-footer-link { font-size: 13px; color: ${LL.muted}; text-decoration: none; }
        .ll-footer-link:hover { color: #6B6880; }

        @media (max-width: 600px) {
          .ll-nav { padding: 0 20px; }
          .ll-footer { padding: 20px; }
        }
      `}</style>

      <div className="ll-wrap">
        {/* Nav */}
        <nav className="ll-nav">
          {/* ── Wordmark: Lens in Ocean Blue ── */}
          <span className="ll-wordmark">
            <span className="ll-wordmark-accent">Lens</span>Lab
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" className="ch-nav-back">← Naar LiteralPause</Link>
            <Link href="/lens" className="btn btn-aqua btn-sm">Probeer nu →</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="ll-hero">
          <div className="lp-container-narrow">
            <h1 className="ll-h1">
              Hetzelfde bericht.<br />Vier perspectieven.
            </h1>
            <p style={{ fontSize: 18, color: LL.inkMid, lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              Zie hoe woorden landen en waarom ze soms anders aankomen dan bedoeld.
            </p>
            <Link href="/lens" className="btn btn-aqua" style={{ fontSize: 16, padding: "15px 32px" }}>
              Analyseer een bericht →
            </Link>
            <p style={{ marginTop: 14, fontSize: 13, color: LL.muted }}>
              Geen account. Geen opslag. Gewoon inzicht.
            </p>
          </div>
        </section>

        {/* Three content blocks */}
        <section className="ll-section">
          <div className="lp-container-narrow">
            {BLOCKS.map(({ label, body }) => (
              <div key={label} className="ll-block">
                <p className="ll-block-label">{label}</p>
                <p style={{ fontSize: 15, color: LL.inkMid, lineHeight: 1.75 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Example block */}
        <section className="ll-section ll-section-gray">
          <div className="lp-container-narrow">
            <div className="ll-example-box">
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: LL.muted, marginBottom: 12 }}>
                Voorbeeld
              </p>
              <p style={{ fontSize: 18, fontWeight: 600, color: LL.ink }}>
                &ldquo;haha ja hoor, misschien&rdquo;
              </p>
              <div className="ll-lens-tags">
                {LENS_TAGS.map(({ label, bg, color }) => (
                  <span
                    key={label}
                    style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, background: bg, color }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: LL.muted }}>Elke lens leest dit bericht anders.</p>
            </div>
          </div>
        </section>

        {/* In de praktijk */}
        <section className="lp-section">
          <div className="lp-container">
            <div style={{ textAlign: 'center' }}>
              <div className="lp-eyebrow-plain">In de praktijk</div>
              <h2 className="lp-heading">Zo werkt het</h2>
              <p className="lp-muted">Één bericht. Vier lezingen. Welke herken jij?</p>
            </div>
            <div className="ll-mockup-wrap">
              <div>
                <div className="ll-phone">
                  <div className="ll-screen">
                    <span className="mock-label-sm">Bericht</span>
                    <div className="mock-message-box">
                      &ldquo;Hee ja hoor. Hele drukke en roerige tijd. Niet veel behoefte en tijd voor contacten.&rdquo;
                    </div>
                    <div className="ll-grid">
                      <div className="ll-card ll-literal">
                        <div className="ll-card-label">Letterlijk</div>
                        <p>De persoon geeft aan dat het een drukke periode is met weinig ruimte voor contact.</p>
                      </div>
                      <div className="ll-card ll-threat">
                        <div className="ll-card-label">Dreiging</div>
                        <p>Er wordt geen opening geboden. Dit kan voelen als een signaal dat contact niet gewenst is.</p>
                      </div>
                      <div className="ll-card ll-social">
                        <div className="ll-card-label">Sociaal</div>
                        <p>Een gebruikelijke manier om afstand te nemen zonder de ander direct af te wijzen.</p>
                      </div>
                      <div className="ll-card ll-romantic">
                        <div className="ll-card-label">Romantisch</div>
                        <p>Weinig uitnodigend. Geen tegenvraag, geen moment vooruitgekeken.</p>
                      </div>
                    </div>
                    <div className="ll-footer-text">Vier lezingen. Welke herken jij?</div>
                  </div>
                </div>
                <p className="lp-mock-caption">Vier perspectieven tegelijk, zonder er één te kiezen.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="ll-section" style={{ textAlign: "center" }}>
          <div className="lp-container-narrow">
            <h2 className="ll-h2">Klaar om te kijken?</h2>
            <Link href="/lens" className="btn btn-aqua" style={{ fontSize: 16, padding: "15px 32px" }}>
              Analyseer een bericht →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="ll-footer">
          <div>
            <strong>LiteralPause</strong> Van bewustwording naar bewuste keuze.
          </div>
          <Link href="/privacy" className="ll-footer-link">Privacybeleid</Link>
        </footer>

      </div>
    </>
  );
}
