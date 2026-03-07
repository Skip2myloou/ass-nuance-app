import Link from "next/link";

const LENS_TAGS = [
  { label: "Letterlijk" },
  { label: "Dreiging" },
  { label: "Sociaal" },
  { label: "Romantisch" },
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
        .ll-wrap { background: #F5F7F8; min-height: 100vh; }

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
        .ll-wordmark {
          font-size: 16px; font-weight: 800; color: #1A2226;
          letter-spacing: -0.5px; font-family: system-ui,-apple-system,sans-serif;
        }

        /* Aqua button */
        .btn-aqua {
          background: #789499;
          color: #fff;
          box-shadow: 0 4px 12px rgba(120,148,153,0.25);
          border-radius: 12px;
        }
        .btn-aqua:hover {
          background: #5C7378;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(92,115,120,0.35);
        }

        /* Sections */
        .ll-hero {
          min-height: 100svh; display: flex; align-items: center;
          padding: 100px 0 80px; background: #F5F7F8;
        }
        .ll-section { padding: 72px 0; background: #F5F7F8; }
        .ll-section-gray { background: #eef1f2; }

        /* Headings (override globals serif) */
        .ll-h1 {
          font-family: system-ui,-apple-system,sans-serif;
          font-weight: 800;
          font-size: clamp(32px,5vw,56px);
          line-height: 1.08;
          letter-spacing: -1.5px;
          color: #1A2226;
          margin-bottom: 20px;
        }
        .ll-h2 {
          font-family: system-ui,-apple-system,sans-serif;
          font-weight: 800;
          font-size: clamp(24px,3vw,36px);
          letter-spacing: -0.5px;
          color: #1A2226;
          margin: 0 0 28px;
        }

        /* Content blocks */
        .ll-block {
          padding: 28px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .ll-block:last-child { border-bottom: none; }

        /* Example box */
        .ll-example-box {
          background: #FFFFFF;
          border: 1px solid #C8E6EA;
          border-radius: 16px;
          padding: 28px;
        }
        .ll-lens-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 12px; }

        /* Footer */
        .ll-footer {
          border-top: 1px solid #C8E6EA;
          padding: 20px 32px;
          display: flex; align-items: center; justify-content: space-between;
          background: #F5F7F8;
        }
        .ll-footer-note { font-size: 13px; color: #A8A5BE; }
        .ll-footer-link { font-size: 13px; color: #A8A5BE; text-decoration: none; }
        .ll-footer-link:hover { color: #6B6880; }

        @media (max-width: 600px) {
          .ll-nav { padding: 0 20px; }
          .ll-footer { padding: 20px; }
        }
      `}</style>

      <div className="ll-wrap">
        {/* Nav */}
        <nav className="ll-nav">
          <span className="ll-wordmark">LensLab</span>
          <Link href="/lens" className="btn btn-aqua btn-sm">Probeer nu →</Link>
        </nav>

        {/* Hero */}
        <section className="ll-hero">
          <div className="lp-container-narrow">
            <h1 className="ll-h1">
              Hetzelfde bericht.<br />Vier perspectieven.
            </h1>
            <p style={{ fontSize: 18, color: "#4A5C62", lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              Zie hoe woorden landen en waarom ze soms anders aankomen dan bedoeld.
            </p>
            <Link href="/lens" className="btn btn-aqua" style={{ fontSize: 16, padding: "15px 32px" }}>
              Analyseer een bericht →
            </Link>
            <p style={{ marginTop: 14, fontSize: 13, color: "#A8A5BE" }}>
              Geen account. Geen opslag. Gewoon inzicht.
            </p>
          </div>
        </section>

        {/* Three content blocks */}
        <section className="ll-section">
          <div className="lp-container-narrow">
            {BLOCKS.map(({ label, body }) => (
              <div key={label} className="ll-block">
                <p style={{ fontWeight: 700, fontSize: 15, color: "#1A2226", marginBottom: 8 }}>
                  {label}
                </p>
                <p style={{ fontSize: 15, color: "#4A5C62", lineHeight: 1.75 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Example block */}
        <section className="ll-section ll-section-gray">
          <div className="lp-container-narrow">
            <div className="ll-example-box">
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "#A8A5BE", marginBottom: 12 }}>
                Voorbeeld
              </p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#1A2226" }}>
                &ldquo;haha ja hoor, misschien&rdquo;
              </p>
              <div className="ll-lens-tags">
                {LENS_TAGS.map(({ label }) => (
                  <span
                    key={label}
                    style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, background: "#FFD2C2", color: "#1A2226" }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "#A8A5BE" }}>Elke lens leest dit bericht anders.</p>
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
          <span className="ll-footer-note">LensLab is onderdeel van NeuroNuance</span>
          <Link href="/privacy" className="ll-footer-link">Privacybeleid</Link>
        </footer>

      </div>
    </>
  );
}
