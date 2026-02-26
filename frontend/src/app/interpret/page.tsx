"use client";

import Link from "next/link";
import { useState } from "react";
import { interpret, type InterpretResult, ApiError } from "@/lib/api";

const EXAMPLES = [
  "Haha ja hoor, tuurlijk 😉",
  "Dus… wat zoek je hier eigenlijk?",
  "Je bent wel heel stil ineens",
];

function replyHref(text: string, goal: string) {
  const p = new URLSearchParams({ text, goal });
  return `/reply?${p.toString()}`;
}

export default function InterpretPage() {
  const [checkInState, setCheckInState] = useState<
    "calm" | "tense" | "overstimulated"
  >("calm");

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
      const data = await interpret(text, checkInState);
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
    <main className="container interpret-page">
      <Link href="/" className="back">
        ← Terug
      </Link>

      <h1>Begrijp bericht</h1>
      <p className="subtitle">
        Laten we samen kijken wat hier bedoeld wordt.
      </p>

      {/* ── Check-in ───────────────────────── */}
      <div className="checkin">
        <h3>Even kort checken</h3>
        <p>Hoe zit je er nu bij terwijl je het ontvangen bericht leest?</p>

        <div className="checkin-options">
          <button
            type="button"
            className={checkInState === "calm" ? "btn btn-selected" : "btn"}
            onClick={() => setCheckInState("calm")}
          >
            🟢 Helder & rustig
          </button>

          <button
            type="button"
            className={checkInState === "tense" ? "btn btn-selected" : "btn"}
            onClick={() => setCheckInState("tense")}
          >
            🟡 Twijfelend of gespannen
          </button>

          <button
            type="button"
            className={
              checkInState === "overstimulated" ? "btn btn-selected" : "btn"
            }
            onClick={() => setCheckInState("overstimulated")}
          >
            🔴 Overprikkeld
          </button>
        </div>
      </div>

      {/* ── Input form ───────────────────────── */}
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
          {loading ? "Even kijken..." : "Kijk mee"}
        </button>
      </form>

      {loading && (
        <p className="loading">
          Even geduld, we analyseren het bericht...
        </p>
      )}

      {/* ── Example chips ───────────────────────── */}
      <div className="examples">
        <span className="examples-label">Voorbeeldzinnen</span>
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
            “{ex}”
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      {/* ── Results ───────────────────────── */}
      {result && (
        <section>
          <h2>Wat zegt dit letterlijk?</h2>
          <div className="card">
            <div className="card-body">{result.literal_summary}</div>
          </div>

          <h2>Wat kan dit betekenen?</h2>
          {result.possible_meanings.map((pm, i) => (
            <div key={i} className="card">
              <div className="card-body">
                {pm.meaning}

                {checkInState === "calm" && (
                  <div className="confidence-wrapper">
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{ width: `${pm.confidence}%` }}
                      />
                    </div>
                    <span className="confidence-pct">
                      {pm.confidence}%
                    </span>
                  </div>
                )}
              </div>

              <div className="card-note">{pm.why}</div>
            </div>
          ))}

          <h2>Om rustig te blijven</h2>
          <div className="card">
            <div className="card-body">{result.regulation}</div>
          </div>
        </section>
      )}
    </main>
  );
}
