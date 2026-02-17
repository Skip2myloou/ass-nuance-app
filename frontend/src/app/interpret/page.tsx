"use client";

import Link from "next/link";
import { useState } from "react";
import { interpret, type InterpretResult, ApiError } from "@/lib/api";

const EXAMPLES = [
  "Haha ja hoor, tuurlijk \u{1F609}",
  "Dus\u2026 wat zoek je hier eigenlijk?",
  "Je bent wel heel stil ineens",
];

/** Build a /reply URL with pre-filled query params. */
function replyHref(text: string, goal: string) {
  const p = new URLSearchParams({ text, goal });
  return `/reply?${p.toString()}`;
}

export default function InterpretPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<InterpretResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await interpret(text);
      data.possible_meanings.sort((a, b) => b.confidence - a.confidence);
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

  return (
    <main className="container">
      <Link href="/" className="back">
        &larr; Terug
      </Link>
      <h1>Begrijp bericht</h1>
      <p className="subtitle">
        Plak het bericht dat je hebt ontvangen, of kies een voorbeeld.
      </p>

      {/* ── Example fixtures ────────────────────────────────────── */}
      <div className="examples">
        <span className="examples-label">Probeer:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="example-chip"
            onClick={() => {
              setText(ex);
              setResult(null);
              setError("");
            }}
          >
            &ldquo;{ex}&rdquo;
          </button>
        ))}
      </div>

      {/* ── Input form ──────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="msg">Ontvangen bericht</label>
          <textarea
            id="msg"
            className="textarea"
            rows={4}
            placeholder="Plak hier het bericht..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !text.trim()}
        >
          {loading ? "Bezig met analyseren..." : "Analyseer"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && (
        <p className="loading">Even geduld, we analyseren het bericht...</p>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {result && (
        <section>
          <h2>Wat zegt dit letterlijk?</h2>
          <div className="card">
            <div className="card-body">{result.literal_summary}</div>
          </div>

          <ul className="tag-list" style={{ marginTop: "0.75rem" }}>
            {result.tone_tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>

          <h2>Wat kan dit betekenen?</h2>
          {result.possible_meanings.map((pm, i) => (
            <div key={i} className="card">
              <div className="card-body">
                {pm.meaning}
                <span className="confidence-bar">
                  <span
                    className="confidence-fill"
                    style={{ width: `${pm.confidence}%` }}
                  />
                </span>
                <span className="confidence-pct">{pm.confidence}%</span>
              </div>
              <div className="card-note">{pm.why}</div>
            </div>
          ))}

          <h2>Om rustig te blijven</h2>
          <div className="card">
            <div className="card-body">{result.regulation}</div>
          </div>

          <h2>Wat kun je doen?</h2>
          <div className="action-row">
            {result.suggested_actions.some((a) => a.action === "reply") && (
              <Link
                href={replyHref(
                  text,
                  "Vriendelijk reageren en gesprek voortzetten"
                )}
                className="btn btn-primary action-btn"
              >
                Reageer
                <span className="action-btn-sub">
                  {result.suggested_actions.find((a) => a.action === "reply")
                    ?.why}
                </span>
              </Link>
            )}

            {result.suggested_actions.some(
              (a) => a.action === "ask_clarifying_question"
            ) && (
              <Link
                href={replyHref(text, "Een verduidelijkende vraag stellen")}
                className="btn btn-outline action-btn"
              >
                Vraag door
                <span className="action-btn-sub">
                  {result.suggested_actions.find(
                    (a) => a.action === "ask_clarifying_question"
                  )?.why}
                </span>
              </Link>
            )}

            {result.suggested_actions.some((a) => a.action === "pause") && (
              <div className="btn btn-outline action-btn action-btn-muted">
                Wacht even
                <span className="action-btn-sub">
                  {result.suggested_actions.find((a) => a.action === "pause")
                    ?.why}
                </span>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
