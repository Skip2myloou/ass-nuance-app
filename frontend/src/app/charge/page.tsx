import Link from "next/link";

// ── Charge colour tokens ───────────────────────────────────
const CH = {
  amber:      "#C17B2A",
  amberDark:  "#8F5A1A",
  amberPale:  "#FBF0E3",
  amberLight: "#F5E0C8",
  bg:         "#FAFAF8",
  bgGray:     "#F3F0EB",
  ink:        "#1C1B22",
  inkMid:     "#3A3847",
  muted:      "#6B6880",
};

const BLOCKS = [
  {
    label: "Waarom bijhouden?",
    body: "Vermoeidheid heeft een patroon. Maar dat patroon zie je pas als je het bijhoudt. Charge maakt zichtbaar welke combinaties van werk, sociale interactie en slaap de meeste energie kosten.",
  },
  {
    label: "Voor wie?",
    body: "Voor mensen die na een drukke dag niet altijd kunnen verwoorden waarom ze zo leeg zijn. Voor wie gevoelig is voor sociale prikkels, intensiteit en overvolle agenda's.",
  },
  {
    label: "Wat krijg je?",
    body: "Een dagelijks log van stress, contacten en planning. Na een paar dagen begint Charge patronen te herkennen en leert het voorspellen hoeveel energie een dag je gaat kosten.",
  },
];

export default function ChargeLandingPage() {
  return (
    <>
      <style>{`
        .ch-wrap { background: ${CH.bg}; min-height: 100vh; }

        /* Nav */
        .ch-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 60px; padding: 0 32px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .ch-wordmark {
          font-size: 16px; font-weight: 800; color: ${CH.ink};
          letter-spacing: -0.5px; font-family: system-ui,-apple-system,sans-serif;
          text-decoration: none;
        }
        .ch-wordmark-accent { color: ${CH.amber}; }

        /* Amber button */
        .btn-amber {
          background: ${CH.amber};
          color: #fff;
          box-shadow: 0 4px 12px rgba(193,123,42,0.25);
          border-radius: 12px;
          transition: background 200ms, transform 200ms, box-shadow 200ms;
        }
        .btn-amber:hover {
          background: ${CH.amberDark};
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(143,90,26,0.35);
        }

        /* Sections */
        .ch-hero {
          min-height: 100svh; display: flex; align-items: center;
          padding: 100px 0 80px; background: ${CH.bg};
        }
        .ch-section { padding: 72px 0; background: ${CH.bg}; }
        .ch-section-gray { background: ${CH.bgGray}; }

        /* Headings */
        .ch-h1 {
          font-family: system-ui,-apple-system,sans-serif;
          font-weight: 800;
          font-size: clamp(32px,5vw,56px);
          line-height: 1.08;
          letter-spacing: -1.5px;
          color: ${CH.amber};
          margin-bottom: 20px;
        }
        .ch-h2 {
          font-family: system-ui,-apple-system,sans-serif;
          font-weight: 800;
          font-size: clamp(24px,3vw,36px);
          letter-spacing: -0.5px;
          color: ${CH.amber};
          margin: 0 0 28px;
        }

        /* Content blocks */
        .ch-block {
          padding: 28px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .ch-block:last-child { border-bottom: none; }
        .ch-block-label {
          font-weight: 700; font-size: 15px;
          color: ${CH.amber};
          margin-bottom: 8px;
        }

        /* Footer */
        .ch-footer {
          border-top: 1px solid ${CH.amberLight};
          padding: 20px 32px;
          display: flex; align-items: center; justify-content: space-between;
          background: ${CH.bg};
        }
        .ch-footer-note { font-size: 13px; color: ${CH.muted}; }
        .ch-footer-link { font-size: 13px; color: ${CH.muted}; text-decoration: none; }
        .ch-footer-link:hover { color: ${CH.inkMid}; }

        @media (max-width: 600px) {
          .ch-nav { padding: 0 20px; }
          .ch-footer { padding: 20px; }
        }
      `}</style>

      <div className="ch-wrap">
        {/* Nav */}
        <nav className="ch-nav">
          <span className="ch-wordmark">
            <span className="ch-wordmark-accent">Charge</span>
          </span>
          <Link href="/charge/checkin" className="btn btn-amber btn-sm">Begin met loggen →</Link>
        </nav>

        {/* Hero */}
        <section className="ch-hero">
          <div className="lp-container-narrow">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: CH.muted, marginBottom: 16 }}>
              Sociaal energiebeheer
            </p>
            <h1 className="ch-h1">
              Na een drukke dag weet je niet altijd waarom je zo leeg bent.
            </h1>
            <p style={{ fontSize: 18, color: CH.inkMid, lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              Charge helpt je dat patroon zichtbaar maken. Je logt wat je deed, hoe je sliep, hoe het voelde — en Charge leert voorspellen hoeveel energie een dag je gaat kosten.
            </p>
            <Link href="/charge/checkin" className="btn btn-amber" style={{ fontSize: 16, padding: "15px 32px" }}>
              → Begin met loggen
            </Link>
          </div>
        </section>

        {/* Three content blocks */}
        <section className="ch-section">
          <div className="lp-container-narrow">
            {BLOCKS.map(({ label, body }) => (
              <div key={label} className="ch-block">
                <p className="ch-block-label">{label}</p>
                <p style={{ fontSize: 15, color: CH.inkMid, lineHeight: 1.75 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="ch-section ch-section-gray" style={{ textAlign: "center" }}>
          <div className="lp-container-narrow">
            <h2 className="ch-h2">Klaar om te beginnen?</h2>
            <Link href="/charge/checkin" className="btn btn-amber" style={{ fontSize: 16, padding: "15px 32px" }}>
              → Begin met loggen
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="ch-footer">
          <span className="ch-footer-note">Charge is onderdeel van LiteralPause</span>
          <Link href="/" className="ch-footer-link">← LiteralPause</Link>
        </footer>
      </div>
    </>
  );
}
