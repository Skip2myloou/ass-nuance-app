"use client";

import { useState } from "react";
import { analyzeLens, LensReading, LensResult } from "@/lib/api";

const LENS_CONFIG: Record<
  LensReading["lens"],
  { label: string; color: string; bg: string; border: string }
> = {
  "Literal lens": {
    label: "Letterlijk",
    color: "#1d4ed8",
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.30)",
  },
  "Threat lens": {
    label: "Dreiging",
    color: "#b91c1c",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.30)",
  },
  "Social reading lens": {
    label: "Sociaal",
    color: "#15803d",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.30)",
  },
  "Romantic lens": {
    label: "Romantisch",
    color: "#7e22ce",
    bg: "rgba(168,85,247,0.06)",
    border: "rgba(168,85,247,0.30)",
  },
};

const LENS_ORDER: LensReading["lens"][] = [
  "Literal lens",
  "Threat lens",
  "Social reading lens",
  "Romantic lens",
];

export default function LensPage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<LensResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX = 500;
  const remaining = MAX - message.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeLens(message.trim());
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Er ging iets mis. Probeer opnieuw.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const readingsByLens = result
    ? Object.fromEntries(result.readings.map((r) => [r.lens, r.reading]))
    : {};

  return (
    <div className="container">
      <h1>LensLab</h1>
      <p className="subtitle">Bekijk een bericht door vier verschillende lenzen.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="message">Bericht</label>
          <textarea
            id="message"
            className="textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX}
            rows={4}
            placeholder="Plak hier het bericht dat je wilt analyseren…"
            disabled={loading}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span
              className="helper-text"
              style={{ color: remaining < 50 ? "var(--red)" : undefined }}
            >
              {remaining} tekens over
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !message.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Analyseren…
                </>
              ) : (
                "Analyseer"
              )}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {(loading || result) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
            marginTop: 24,
          }}
          className="lens-grid"
        >
          {LENS_ORDER.map((lens) => {
            const cfg = LENS_CONFIG[lens];
            const reading = readingsByLens[lens];
            return (
              <div
                key={lens}
                className="card"
                style={{
                  background: cfg.bg,
                  borderColor: cfg.border,
                  marginBottom: 0,
                }}
              >
                <div
                  className="card-label"
                  style={{ color: cfg.color }}
                >
                  {cfg.label}
                </div>
                {loading ? (
                  <div className="card-body loading">
                    <span className="dot-pulse">Laden</span>
                  </div>
                ) : (
                  <p className="card-body">{reading ?? "—"}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {result && !loading && (
        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 14,
            color: "var(--ink-500)",
          }}
        >
          Vier lezingen. Welke herkent jij?
        </p>
      )}

      <style>{`
        @media (max-width: 600px) {
          .lens-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
