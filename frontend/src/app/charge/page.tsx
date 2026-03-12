"use client";
import Link from "next/link";
import { useState } from "react";

// ── Charge colour tokens ───────────────────────────────────
const CH = {
  amber:      "#C17B2A",
  amberDark:  "#8F5A1A",
  amberPale:  "#FBF0E3",
  amberLight: "#F5E0C8",
  bg:         "#FAFAF8",
  ink:        "#1C1B22",
  inkMid:     "#3A3847",
  muted:      "#6B6880",
  border:     "rgba(0,0,0,0.08)",
};

const PLANNING_OPTIONS = ["Werk", "Sociaal", "Alleen", "Combinatie"];
const SLEEP_QUALITY_OPTIONS = ["Goed", "Matig", "Slecht"];
const INTENSITY_OPTIONS = ["Licht", "Gemiddeld", "Zwaar"] as const;
type Intensity = typeof INTENSITY_OPTIONS[number];

function getDayLabel() {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
}

export default function ChargePage() {
  // Required fields
  const [stress, setStress] = useState(5);
  const [socialCount, setSocialCount] = useState(0);
  const [socialIntensity, setSocialIntensity] = useState<Intensity | null>(null);
  const [planning, setPlanning] = useState<string[]>([]);

  // Optional fields
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState<string | null>(null);
  const [planningTomorrow, setPlanningTomorrow] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = socialIntensity !== null && planning.length > 0;

  function togglePlanning(option: string) {
    setPlanning(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  }

  function togglePlanningTomorrow(option: string) {
    setPlanningTomorrow(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  }

  async function handleSave() {
    if (!canSave) return;
    const entry = {
      date: new Date().toISOString().split("T")[0],
      stress,
      social_count: socialCount,
      social_intensity: socialIntensity?.toLowerCase(),
      planning: planning.map(p => p.toLowerCase()),
      sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
      sleep_quality: sleepQuality?.toLowerCase() ?? null,
      planning_tomorrow: planningTomorrow.map(p => p.toLowerCase()),
      notes: notes.trim() || null,
    };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/charge/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error("Opslaan mislukt");
      setSaved(true);
    } catch {
      setError("Er ging iets mis bij het opslaan. Probeer opnieuw.");
    }
  }

  return (
    <>
      <style>{`
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
          font-size: 15px; font-weight: 800; color: ${CH.ink};
          letter-spacing: -0.5px; font-family: system-ui,-apple-system,sans-serif;
          text-decoration: none;
        }
        .ch-wordmark-accent { color: ${CH.amber}; }
        .ch-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: ${CH.muted};
          text-decoration: none; padding: 7px 14px;
          border-radius: 10px; border: 1.5px solid ${CH.amberLight};
          background: transparent;
          transition: color 200ms, border-color 200ms, background 200ms;
        }
        .ch-back:hover { color: ${CH.amber}; border-color: ${CH.amber}; background: ${CH.amberPale}; }

        .ch-section {
          background: #fff;
          border: 1px solid ${CH.border};
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
        }
        .ch-section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: ${CH.amber};
          margin-bottom: 6px; display: block;
        }
        .ch-section-sub {
          font-size: 13px; color: ${CH.muted}; margin-bottom: 14px; line-height: 1.5;
        }

        /* Stress slider */
        .ch-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 8px; border-radius: 4px; outline: none; border: none;
          background: linear-gradient(
            to right,
            ${CH.amber} 0%,
            ${CH.amber} var(--val),
            rgba(0,0,0,0.08) var(--val),
            rgba(0,0,0,0.08) 100%
          );
          cursor: pointer;
        }
        .ch-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 24px; height: 24px; border-radius: 50%;
          background: #fff; border: 2px solid ${CH.amber};
          box-shadow: 0 2px 8px rgba(193,123,42,0.25); cursor: grab;
        }
        .ch-slider::-webkit-slider-thumb:active { cursor: grabbing; }
        .ch-slider::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: #fff; border: 2px solid ${CH.amber};
          box-shadow: 0 2px 8px rgba(193,123,42,0.25);
        }
        .ch-slider-value {
          font-size: 2rem; font-weight: 700; color: ${CH.ink};
          text-align: center; margin-bottom: 10px;
          font-variant-numeric: tabular-nums;
        }
        .ch-slider-labels {
          display: flex; justify-content: space-between;
          font-size: 12px; color: ${CH.muted}; margin-top: 6px;
        }

        /* Toggle group */
        .ch-toggle-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .ch-toggle {
          padding: 9px 16px; border-radius: 999px;
          border: 1.5px solid ${CH.border}; background: #fff;
          font-size: 13px; font-weight: 500; color: ${CH.inkMid};
          cursor: pointer; font-family: inherit;
          transition: border-color 200ms, background 200ms, color 200ms;
        }
        .ch-toggle:hover { border-color: ${CH.amber}; color: ${CH.amber}; }
        .ch-toggle-active {
          border-color: ${CH.amber}; background: ${CH.amberPale}; color: ${CH.amber}; font-weight: 600;
        }

        /* Counter */
        .ch-counter {
          display: flex; align-items: center; gap: 16px;
        }
        .ch-counter-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1.5px solid ${CH.border}; background: #fff;
          font-size: 18px; font-weight: 500; color: ${CH.inkMid};
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: border-color 200ms, color 200ms;
        }
        .ch-counter-btn:hover { border-color: ${CH.amber}; color: ${CH.amber}; }
        .ch-counter-value {
          font-size: 1.6rem; font-weight: 700; color: ${CH.ink};
          min-width: 2ch; text-align: center;
          font-variant-numeric: tabular-nums;
        }

        /* Optional disclosure */
        .ch-disclosure {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; color: ${CH.muted};
          font-family: inherit; padding: 0; margin-bottom: 12px;
          transition: color 200ms;
        }
        .ch-disclosure:hover { color: ${CH.amber}; }

        /* Sleep hours input */
        .ch-input {
          width: 80px; border: 1.5px solid ${CH.border};
          border-radius: 10px; padding: 9px 12px;
          font-size: 15px; font-family: inherit; color: ${CH.ink};
          background: #fff; text-align: center;
          transition: border-color 200ms;
        }
        .ch-input:focus { outline: none; border-color: ${CH.amber}; }

        /* Notes textarea */
        .ch-textarea {
          width: 100%; border: 1.5px solid ${CH.border};
          border-radius: 12px; padding: 12px 14px;
          font-size: 14px; font-family: inherit; color: ${CH.inkMid};
          background: #fff; resize: vertical; min-height: 80px; line-height: 1.6;
          transition: border-color 200ms;
        }
        .ch-textarea:focus { outline: none; border-color: ${CH.amber}; }
        .ch-textarea::placeholder { color: #C0BDC8; }

        /* Save button */
        .ch-save {
          width: 100%; padding: 15px;
          border-radius: 16px; border: none;
          font-size: 16px; font-weight: 700; font-family: inherit;
          cursor: pointer;
          transition: background 200ms, transform 200ms, box-shadow 200ms;
        }
        .ch-save-active {
          background: ${CH.amber}; color: #fff;
          box-shadow: 0 4px 16px rgba(193,123,42,0.30);
        }
        .ch-save-active:hover {
          background: ${CH.amberDark}; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(143,90,26,0.35);
        }
        .ch-save-disabled {
          background: rgba(0,0,0,0.06); color: ${CH.muted}; cursor: not-allowed;
        }

        /* Saved state */
        .ch-saved {
          text-align: center; padding: 32px 0;
        }
        .ch-saved-icon {
          font-size: 2.5rem; margin-bottom: 12px;
        }
        .ch-saved-title {
          font-size: 18px; font-weight: 700; color: ${CH.ink}; margin-bottom: 8px;
        }
        .ch-saved-sub {
          font-size: 14px; color: ${CH.muted}; line-height: 1.6;
        }

        @media (max-width: 600px) {
          .ch-nav { padding: 0 20px; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="ch-nav">
        <Link href="/" className="ch-wordmark">
          <span className="ch-wordmark-accent">Charge</span>
          <span style={{ color: CH.muted, fontWeight: 400, fontSize: 12, marginLeft: 6 }}>by LiteralPause</span>
        </Link>
        <Link href="/" className="ch-back">← LiteralPause</Link>
      </nav>

      <div className="container" style={{ background: CH.bg, minHeight: "100vh" }}>

        {saved ? (
          <div className="ch-saved">
            <div className="ch-saved-icon">⚡</div>
            <p className="ch-saved-title">Opgeslagen</p>
            <p className="ch-saved-sub">
              Je log voor vandaag is bewaard.<br />
              Nog 2 dagen tot je eerste energievoorspelling.
            </p>
            <button
              onClick={() => setSaved(false)}
              style={{ marginTop: 24, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: CH.amber, fontFamily: "inherit", fontWeight: 600 }}
            >
              Aanpassen →
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ color: CH.amber, fontFamily: "system-ui,-apple-system,sans-serif", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Hoe was gisteren?
            </h1>
            <p className="subtitle" style={{ marginBottom: 28 }}>{getDayLabel()}</p>

            {/* ── Stress ── */}
            <div className="ch-section">
              <span className="ch-section-label">Stress</span>
              <p className="ch-section-sub">Hoe zwaar voelde de dag?</p>
              <div className="ch-slider-value">{stress}</div>
              <input
                type="range" min={1} max={10} value={stress}
                className="ch-slider"
                style={{ "--val": `${(stress - 1) / 9 * 100}%` } as React.CSSProperties}
                onChange={e => setStress(Number(e.target.value))}
              />
              <div className="ch-slider-labels">
                <span>Rustig</span>
                <span>Zwaar</span>
              </div>
            </div>

            {/* ── Sociale contacten ── */}
            <div className="ch-section">
              <span className="ch-section-label">Sociale contacten</span>
              <p className="ch-section-sub">Hoeveel interacties had je?</p>
              <div className="ch-counter" style={{ marginBottom: 20 }}>
                <button
                  className="ch-counter-btn"
                  onClick={() => setSocialCount(c => Math.max(0, c - 1))}
                >−</button>
                <span className="ch-counter-value">{socialCount}</span>
                <button
                  className="ch-counter-btn"
                  onClick={() => setSocialCount(c => c + 1)}
                >+</button>
              </div>
              <p className="ch-section-sub" style={{ marginBottom: 10 }}>Hoe intensief?</p>
              <div className="ch-toggle-group">
                {INTENSITY_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    className={`ch-toggle ${socialIntensity === opt ? "ch-toggle-active" : ""}`}
                    onClick={() => setSocialIntensity(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Planning vandaag ── */}
            <div className="ch-section">
              <span className="ch-section-label">Planning vandaag</span>
              <p className="ch-section-sub">Wat staat er op de agenda? Meerdere keuzes mogelijk.</p>
              <div className="ch-toggle-group">
                {PLANNING_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    className={`ch-toggle ${planning.includes(opt) ? "ch-toggle-active" : ""}`}
                    onClick={() => togglePlanning(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Optioneel ── */}
            <div className="ch-section">
              <button
                className="ch-disclosure"
                onClick={() => setOptionalOpen(o => !o)}
              >
                <span style={{ fontSize: 11 }}>{optionalOpen ? "▲" : "▼"}</span>
                Optioneel toevoegen
              </button>

              {optionalOpen && (
                <>
                  {/* Slaap */}
                  <span className="ch-section-label" style={{ marginTop: 4 }}>Slaap</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="number" min={0} max={24} step={0.5}
                        placeholder="6.5"
                        value={sleepHours}
                        onChange={e => setSleepHours(e.target.value)}
                        className="ch-input"
                      />
                      <span style={{ fontSize: 13, color: CH.muted }}>uur</span>
                    </div>
                    <div className="ch-toggle-group">
                      {SLEEP_QUALITY_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          className={`ch-toggle ${sleepQuality === opt ? "ch-toggle-active" : ""}`}
                          onClick={() => setSleepQuality(opt)}
                          style={{ padding: "7px 12px", fontSize: 12 }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Planning morgen */}
                  <span className="ch-section-label">Planning morgen</span>
                  <div className="ch-toggle-group" style={{ marginBottom: 16 }}>
                    {PLANNING_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        className={`ch-toggle ${planningTomorrow.includes(opt) ? "ch-toggle-active" : ""}`}
                        onClick={() => togglePlanningTomorrow(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {/* Notitie */}
                  <span className="ch-section-label">Notitie</span>
                  <textarea
                    className="ch-textarea"
                    placeholder="Had een moeilijk gesprek, ben thuis gebleven…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    maxLength={500}
                  />
                </>
              )}
            </div>

            {/* ── Opslaan ── */}
            {!canSave && (
              <p style={{ fontSize: 12, color: CH.muted, textAlign: "center", marginBottom: 10 }}>
                Kies nog een intensiteit en planning om op te slaan.
              </p>
            )}
            {error && <div className="error">{error}</div>}
            <button
              className={`ch-save ${canSave ? "ch-save-active" : "ch-save-disabled"}`}
              onClick={handleSave}
              disabled={!canSave}
            >
              Opslaan →
            </button>
          </>
        )}
      </div>
    </>
  );
}
