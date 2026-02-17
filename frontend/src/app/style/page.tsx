"use client";

import Link from "next/link";
import { useState } from "react";
import { style, type StyleResult, ApiError } from "@/lib/api";

const PREFERENCES = [
  "Duidelijke vragen met opties",
  "Expliciete intenties",
  "Korte concrete zinnen",
  "Geen verborgen verwachtingen",
];

const TONE_LABELS: Record<string, string> = {
  direct: "Direct",
  warm: "Warm",
  playful: "Speels",
};

const TONE_EMOJI: Record<string, string> = {
  direct: "\uD83C\uDFAF",
  warm: "\u2764\uFE0F",
  playful: "\uD83D\uDE0F",
};

export default function StylePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<StyleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  function togglePreference(pref: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pref)) {
        next.delete(pref);
      } else {
        next.add(pref);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) return;

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(null);

    try {
      const data = await style(Array.from(selected));
      setResult(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Er ging iets mis. Probeer het opnieuw."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(message: string, index: number) {
    navigator.clipboard.writeText(message);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <main className="container">
      <Link href="/" className="back">
        &larr; Terug
      </Link>
      <h1>Beschrijf je stijl</h1>
      <p className="subtitle">
        Kies je communicatievoorkeuren. We maken een natuurlijke uitleg die je
        kunt delen met een match.
      </p>

      {/* ── Preference checkboxes ───────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <fieldset style={{ border: "none", padding: 0 }}>
          <legend
            style={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--fg-muted)",
              marginBottom: "0.5rem",
            }}
          >
            Mijn voorkeuren
          </legend>
          {PREFERENCES.map((pref) => (
            <label
              key={pref}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0",
                cursor: "pointer",
                fontSize: "0.95rem",
                color: "var(--fg)",
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(pref)}
                onChange={() => togglePreference(pref)}
                style={{
                  width: "1.1rem",
                  height: "1.1rem",
                  accentColor: "var(--accent)",
                }}
              />
              {pref}
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || selected.size === 0}
          style={{ marginTop: "1rem" }}
        >
          {loading ? "Bezig met schrijven..." : "Genereer uitleg"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && (
        <p className="loading">Even geduld, we schrijven varianten...</p>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {result && (
        <section>
          <h2>Jouw stijl in woorden</h2>

          {result.variants.map((v, i) => (
            <div key={i} className="card">
              <div className="card-label">
                {TONE_EMOJI[v.tone] ?? ""} {TONE_LABELS[v.tone] ?? v.tone}
              </div>
              <div className="card-body">{v.message}</div>
              <div className="card-footer">
                <span />
                <button
                  type="button"
                  onClick={() => handleCopy(v.message, i)}
                  className="btn btn-outline btn-sm"
                >
                  {copied === i ? "Gekopieerd!" : "Kopieer"}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
