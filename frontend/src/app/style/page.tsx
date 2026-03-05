"use client";

import Link from "next/link";
import { useState } from "react";
import { style, type StyleResult, ApiError } from "@/lib/api";
import { STYLE_PAGE, STYLE_LABELS, STYLE_EMOJI, BACK } from "@/lib/constants";

export default function StylePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<StyleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  function togglePreference(pref: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pref)) next.delete(pref);
      else next.add(pref);
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
        err instanceof ApiError ? err.message : STYLE_PAGE.errorGeneric
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
      <Link href="/" className="back">{BACK.toHome}</Link>

      <div className="t-label" style={{ marginBottom: 10 }}>{STYLE_PAGE.eyebrow}</div>
      <h1>Beschrijf je <em>{STYLE_PAGE.headingEm}</em></h1>
      <p className="subtitle">{STYLE_PAGE.subtitle}</p>

      <form onSubmit={handleSubmit}>
        <fieldset style={{ border: "none", padding: 0, marginBottom: 20 }}>
          <legend className="t-label" style={{ marginBottom: 14 }}>
            {STYLE_PAGE.preferencesLegend}
          </legend>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {STYLE_PAGE.preferences.map((pref) => (
              <label
                key={pref}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: selected.has(pref) ? "var(--accent-light)" : "var(--surface)",
                  border: `1.5px solid ${selected.has(pref) ? "var(--accent-glow)" : "rgba(0,0,0,0.08)"}`,
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: selected.has(pref) ? 600 : 400,
                  color: selected.has(pref) ? "var(--accent)" : "var(--ink-700)",
                  transition: "all 220ms cubic-bezier(0.22,1,0.36,1)",
                  boxShadow: "var(--shadow-xs)",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(pref)}
                  onChange={() => togglePreference(pref)}
                />
                {pref}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || selected.size === 0}
          style={{ width: "100%" }}
        >
          {loading ? (
            <><span className="spinner" />{STYLE_PAGE.submitBusy}</>
          ) : STYLE_PAGE.submitIdle}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && (
        <p className="loading">
          <span className="spinner" />
          {STYLE_PAGE.loadingText}
        </p>
      )}

      {result && (
        <section style={{ marginTop: 24 }}>
          <h2>{STYLE_PAGE.resultsHeading}</h2>

          {result.variants.map((v, i) => (
            <div key={i} className="card" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="card-label">
                {STYLE_EMOJI[v.tone] ?? ""} {STYLE_LABELS[v.tone] ?? v.tone}
              </div>
              <div className="card-body">{v.message}</div>
              <div className="card-footer">
                <span />
                <button
                  type="button"
                  onClick={() => handleCopy(v.message, i)}
                  className="btn btn-outline btn-sm"
                >
                  {copied === i ? "✓ Gekopieerd" : "Kopieer"}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
