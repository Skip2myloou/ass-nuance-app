"use client";

import { CSSProperties, useState } from "react";
import {
  analyzeLens,
  realityCheck,
  LensReading,
  LensResult,
  RealityCheckResult,
} from "@/lib/api";

const LENS_CONFIG: Record<
  LensReading["lens"],
  { label: string; cardStyle: CSSProperties; labelStyle: CSSProperties }
> = {
  "Literal lens":        { label: "Letterlijk", cardStyle: { background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 16, padding: 20 }, labelStyle: { color: "#2563EB", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block" } },
  "Threat lens":         { label: "Dreiging",   cardStyle: { background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 16, padding: 20 }, labelStyle: { color: "#DC2626", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block" } },
  "Social reading lens": { label: "Sociaal",    cardStyle: { background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 16, padding: 20 }, labelStyle: { color: "#16A34A", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block" } },
  "Romantic lens":       { label: "Romantisch", cardStyle: { background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: 16, padding: 20 }, labelStyle: { color: "#9333EA", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block" } },
};

const LENS_ORDER: LensReading["lens"][] = [
  "Literal lens",
  "Threat lens",
  "Social reading lens",
  "Romantic lens",
];

const STYLE_LABEL: Record<string, string> = {
  neutraal: "Neutraal",
  speels: "Speels",
  direct: "Direct",
};

function ClipboardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function LensPage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<LensResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rcResult, setRcResult] = useState<RealityCheckResult | null>(null);
  const [rcLoading, setRcLoading] = useState(false);
  const [rcOpen, setRcOpen] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const MAX = 500;
  const remaining = MAX - message.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setRcResult(null);
    setRcLoading(false);
    setRcOpen(false);

    try {
      const data = await analyzeLens(message.trim());
      setResult(data);

      // Fire reality check in background immediately after lens analysis
      setRcLoading(true);
      realityCheck(message.trim(), data.readings)
        .then((rc) => setRcResult(rc))
        .catch(() => setRcResult(null))
        .finally(() => setRcLoading(false));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Er ging iets mis. Probeer opnieuw.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(question: string, index: number) {
    await navigator.clipboard.writeText(question);
    setCopied(index);
    setTimeout(() => setCopied(null), 1500);
  }

  const readingsByLens = result
    ? Object.fromEntries(result.readings.map((r) => [r.lens, r.reading]))
    : {};

  return (
    <div className="container" style={{ background: "#F5F7F8", minHeight: "100vh" }}>
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
              className="btn disabled:bg-[#a8b8bb] disabled:cursor-not-allowed"
              disabled={loading || !message.trim()}
              style={{ background: "#789499", color: "#fff", border: "none" }}
              onMouseOver={e => { if (!loading && message.trim()) (e.currentTarget as HTMLButtonElement).style.background = "#5C7378"; }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = loading || !message.trim() ? "" : "#789499"; }}
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
        <div className="lens-grid">
          {LENS_ORDER.map((lens) => {
            const cfg = LENS_CONFIG[lens];
            const reading = readingsByLens[lens];
            return (
              <div key={lens} style={cfg.cardStyle}>
                <span style={cfg.labelStyle}>
                  {cfg.label}
                </span>
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
        <>
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

          {!rcOpen && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                className="btn"
                onClick={() => setRcOpen(true)}
                style={{ background: "#789499", color: "#fff", border: "none" }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = "#5C7378"; }}
                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = "#789499"; }}
              >
                Wil je testen welke lezing klopt?
              </button>
            </div>
          )}

          {rcOpen && (
            <div style={{ marginTop: 24 }}>
              {(rcLoading || rcResult) && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {rcLoading
                    ? [0, 1, 2].map((i) => (
                        <div key={i} className="card" style={{ marginBottom: 0 }}>
                          <div className="card-label">
                            <span className="dot-pulse">Laden</span>
                          </div>
                          <p className="card-body" style={{ visibility: "hidden" }}>
                            &nbsp;
                          </p>
                        </div>
                      ))
                    : rcResult?.questions.map((q, i) => (
                        <div key={i} className="card" style={{ marginBottom: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div className="card-label">
                                {STYLE_LABEL[q.style] ?? q.style}
                              </div>
                              <p className="card-body">{q.question}</p>
                            </div>
                            <button
                              onClick={() => handleCopy(q.question, i)}
                              title="Kopieer"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px 6px",
                                borderRadius: 4,
                                color: copied === i ? "var(--sage)" : "var(--ink-400)",
                                flexShrink: 0,
                                marginTop: 2,
                              }}
                            >
                              {copied === i ? "✓" : <ClipboardIcon />}
                            </button>
                          </div>
                        </div>
                      ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
