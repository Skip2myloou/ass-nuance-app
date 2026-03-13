"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// ── Charge colour tokens ──────────────────────────────────────
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

// ── Data ──────────────────────────────────────────────────────
const SIGNALEN: { key: "lichamelijk" | "psychisch" | "gedrag"; label: string; items: string[] }[] = [
  {
    key: "lichamelijk",
    label: "Lichamelijk",
    items: ["Hart sneller kloppen", "Vermoeidheid", "Hoofdpijn", "Gespannen spieren", "Slaapproblemen"],
  },
  {
    key: "psychisch",
    label: "Psychisch",
    items: ["Snel geïrriteerd", "Angstig", "Somber", "Overzicht verliezen"],
  },
  {
    key: "gedrag",
    label: "Gedrag",
    items: ["Terugtrekken", "Rusteloos", "Piekeren", "Moeite met concentratie"],
  },
];

const OPLADEN_ITEMS = [
  "Bewegen",
  "Rust / stilte",
  "Alleen zijn",
  "Buiten zijn",
  "Creatief bezig zijn",
  "Sociaal contact (klein en veilig)",
  "Slapen",
  "Schermen weg",
];

// ── Component ─────────────────────────────────────────────────
function VerdiepingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  // Accordion open/dicht per categorie
  const [open, setOpen] = useState<Record<string, boolean>>({
    lichamelijk: false,
    psychisch: false,
    gedrag: false,
  });

  // Geselecteerde items per categorie
  const [selected, setSelected] = useState<Record<string, Set<string>>>({
    lichamelijk: new Set(),
    psychisch: new Set(),
    gedrag: new Set(),
  });

  // Anders-tekst per categorie
  const [anders, setAnders] = useState<Record<string, string>>({
    lichamelijk: "",
    psychisch: "",
    gedrag: "",
  });

  // Opladen
  const [opladen, setOpladen] = useState<Set<string>>(new Set());
  const [opladentAnders, setOpladentAnders] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSignaal(cat: string, item: string) {
    setSelected(prev => {
      const next = new Set(prev[cat]);
      if (next.has(item)) { next.delete(item); } else { next.add(item); }
      return { ...prev, [cat]: next };
    });
  }

  function toggleOpladen(item: string) {
    setOpladen(prev => {
      const next = new Set(prev);
      if (next.has(item)) { next.delete(item); } else { next.add(item); }
      return next;
    });
  }

  function buildList(cat: string): string[] {
    const items = Array.from(selected[cat]);
    const a = anders[cat].trim();
    if (a) items.push(a);
    return items;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const opladentList = Array.from(opladen);
    const opladentA = opladentAnders.trim();
    if (opladentA) opladentList.push(opladentA);

    const body = {
      date,
      signalen_lichamelijk: buildList("lichamelijk"),
      signalen_psychisch:   buildList("psychisch"),
      signalen_gedrag:      buildList("gedrag"),
      opladen:              opladentList,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/charge/verdieping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Opslaan mislukt");
      router.push("/");
    } catch {
      setError("Er ging iets mis. Probeer opnieuw.");
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .vd-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 60px; padding: 0 32px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .vd-wordmark {
          font-size: 15px; font-weight: 800; color: ${CH.ink};
          letter-spacing: -0.5px; font-family: system-ui,-apple-system,sans-serif;
          text-decoration: none;
        }
        .vd-wordmark-accent { color: ${CH.amber}; }
        .vd-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: ${CH.muted};
          text-decoration: none; padding: 7px 14px;
          border-radius: 10px; border: 1.5px solid ${CH.amberLight};
          background: transparent;
          transition: color 200ms, border-color 200ms, background 200ms;
        }
        .vd-back:hover { color: ${CH.amber}; border-color: ${CH.amber}; background: ${CH.amberPale}; }

        .vd-section {
          background: #fff;
          border: 1px solid ${CH.border};
          border-radius: 16px;
          margin-bottom: 12px;
          overflow: hidden;
        }

        /* Accordion header */
        .vd-accordion-btn {
          width: 100%; padding: 18px 20px;
          display: flex; align-items: center; justify-content: space-between;
          background: none; border: none; cursor: pointer;
          font-family: inherit; text-align: left;
        }
        .vd-accordion-label {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: ${CH.amber};
        }
        .vd-accordion-chevron {
          font-size: 11px; color: ${CH.muted};
          transition: transform 200ms;
        }
        .vd-accordion-chevron-open { transform: rotate(180deg); }
        .vd-accordion-body { padding: 0 20px 20px; }

        /* Checkboxes */
        .vd-checkbox-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .vd-checkbox-item {
          display: flex; align-items: center; gap: 10px;
          cursor: pointer; font-size: 14px; color: ${CH.inkMid};
        }
        .vd-checkbox {
          width: 18px; height: 18px; border-radius: 5px;
          border: 1.5px solid ${CH.border}; background: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: border-color 200ms, background 200ms;
        }
        .vd-checkbox-checked {
          border-color: ${CH.amber}; background: ${CH.amber};
        }
        .vd-checkbox-check { color: #fff; font-size: 11px; font-weight: 700; }

        /* Toggle chips for opladen */
        .vd-toggle-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .vd-toggle {
          padding: 9px 16px; border-radius: 999px;
          border: 1.5px solid ${CH.border}; background: #fff;
          font-size: 13px; font-weight: 500; color: ${CH.inkMid};
          cursor: pointer; font-family: inherit;
          transition: border-color 200ms, background 200ms, color 200ms;
        }
        .vd-toggle:hover { border-color: ${CH.amber}; color: ${CH.amber}; }
        .vd-toggle-active {
          border-color: ${CH.amber}; background: ${CH.amberPale}; color: ${CH.amber}; font-weight: 600;
        }

        /* Anders input */
        .vd-anders-input {
          width: 100%; border: 1.5px solid ${CH.border};
          border-radius: 10px; padding: 9px 12px;
          font-size: 14px; font-family: inherit; color: ${CH.ink};
          background: #fff; box-sizing: border-box;
          transition: border-color 200ms;
        }
        .vd-anders-input:focus { outline: none; border-color: ${CH.amber}; }
        .vd-anders-input::placeholder { color: #C0BDC8; }

        .vd-section-plain { padding: 20px; }
        .vd-section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: ${CH.amber};
          margin-bottom: 14px; display: block;
        }

        /* Save button */
        .vd-save {
          width: 100%; padding: 15px;
          border-radius: 16px; border: none;
          font-size: 16px; font-weight: 700; font-family: inherit;
          cursor: pointer;
          background: ${CH.amber}; color: #fff;
          box-shadow: 0 4px 16px rgba(193,123,42,0.30);
          transition: background 200ms, transform 200ms, box-shadow 200ms;
        }
        .vd-save:hover:not(:disabled) {
          background: ${CH.amberDark}; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(143,90,26,0.35);
        }
        .vd-save:disabled { background: rgba(0,0,0,0.08); color: ${CH.muted}; cursor: not-allowed; box-shadow: none; }

        @media (max-width: 600px) { .vd-nav { padding: 0 20px; } }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="vd-nav">
        <Link href="/charge" className="vd-wordmark">
          <span className="vd-wordmark-accent">Charge</span>
          <span style={{ color: CH.muted, fontWeight: 400, fontSize: 12, marginLeft: 6 }}>by LiteralPause</span>
        </Link>
        <Link href="/charge" className="vd-back">← Charge</Link>
      </nav>

      <div className="container" style={{ background: CH.bg, minHeight: "100vh" }}>
        <h1 style={{ color: CH.amber, fontFamily: "system-ui,-apple-system,sans-serif", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Verder uitwerken
        </h1>
        <p className="subtitle" style={{ marginBottom: 28 }}>Optioneel — vul in wat relevant is.</p>

        {/* ── Signalen — accordions ── */}
        <p style={{ fontSize: 13, fontWeight: 600, color: CH.inkMid, marginBottom: 10 }}>Wat merk je aan jezelf?</p>

        {SIGNALEN.map(({ key, label, items }) => (
          <div key={key} className="vd-section">
            <button
              className="vd-accordion-btn"
              onClick={() => setOpen(prev => ({ ...prev, [key]: !prev[key] }))}
            >
              <span className="vd-accordion-label">{label}</span>
              <span className={`vd-accordion-chevron ${open[key] ? "vd-accordion-chevron-open" : ""}`}>▼</span>
            </button>

            {open[key] && (
              <div className="vd-accordion-body">
                <div className="vd-checkbox-list">
                  {items.map(item => {
                    const checked = selected[key].has(item);
                    return (
                      <label key={item} className="vd-checkbox-item">
                        <div
                          className={`vd-checkbox ${checked ? "vd-checkbox-checked" : ""}`}
                          onClick={() => toggleSignaal(key, item)}
                        >
                          {checked && <span className="vd-checkbox-check">✓</span>}
                        </div>
                        <span onClick={() => toggleSignaal(key, item)}>{item}</span>
                      </label>
                    );
                  })}
                </div>
                <input
                  type="text"
                  className="vd-anders-input"
                  placeholder="Anders…"
                  value={anders[key]}
                  onChange={e => setAnders(prev => ({ ...prev, [key]: e.target.value }))}
                  maxLength={100}
                />
              </div>
            )}
          </div>
        ))}

        {/* ── Opladen ── */}
        <div className="vd-section vd-section-plain" style={{ marginTop: 8 }}>
          <span className="vd-section-label">Wat helpt je nu opladen?</span>
          <div className="vd-toggle-group" style={{ marginBottom: 14 }}>
            {OPLADEN_ITEMS.map(item => (
              <button
                key={item}
                className={`vd-toggle ${opladen.has(item) ? "vd-toggle-active" : ""}`}
                onClick={() => toggleOpladen(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="vd-anders-input"
            placeholder="Anders…"
            value={opladentAnders}
            onChange={e => setOpladentAnders(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* ── Opslaan ── */}
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}
        <button className="vd-save" onClick={handleSave} disabled={saving}>
          {saving ? "Opslaan…" : "Opslaan →"}
        </button>

        <button
          onClick={() => router.push("/")}
          style={{ display: "block", width: "100%", marginTop: 14, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: CH.muted, fontFamily: "inherit", textAlign: "center" }}
        >
          Overslaan
        </button>
      </div>
    </>
  );
}

export default function ChargeVerdiepingPage() {
  return (
    <Suspense>
      <VerdiepingInner />
    </Suspense>
  );
}
