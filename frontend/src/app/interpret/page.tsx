"use client";

import Link from "next/link";
import { useState } from "react";
import { interpret, type InterpretResult, ApiError } from "@/lib/api";
import { INTERPRET, BACK, getConfidenceLabel, PRIVACY_NOTICE } from "@/lib/constants";

function confidenceColor(pct: number): string {
  // hsl: 120 = groen, 40 = oranje, 0 = rood
  const hue = Math.round((pct / 100) * 120);
  return `hsl(${hue}, 65%, 45%)`;
}

function CardInline({
  title,
  children,
  tone = "neutral",
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "neutral" | "soft" | "accent";
  delay?: number;
}) {
  return (
    <div className={`card card-${tone}`} style={{ animationDelay: `${delay}ms` }}>
      <h3 className="card-title">{title}</h3>
      <div className="card-content">{children}</div>
    </div>
  );
}

export default function InterpretPage() {
  const [checkInState, setCheckInState] = useState<"calm" | "tense" | "overstimulated">("calm");
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
        err instanceof ApiError ? err.message : INTERPRET.errorGeneric
      );
    } finally {
      setLoading(false);
    }
  }

  const states = INTERPRET.states;

  return (
    <main className="container interpret-page">
      <Link href="/" className="back">{BACK.toHome}</Link>

      <div className="t-label" style={{ marginBottom: 10 }}>{INTERPRET.eyebrow}</div>
      <h1>Begrijp <em>{INTERPRET.headingEm}</em></h1>
      <p className="subtitle">{INTERPRET.subtitle}</p>

      {/* ── Check-in ── */}
      <div className="checkin">
        <h3>{INTERPRET.checkinHeading}</h3>
        <p>{INTERPRET.checkinSubtitle}</p>

        <div className="checkin-options">
          <button
            type="button"
            className={`state-btn state-calm${checkInState === "calm" ? " active" : ""}`}
            onClick={() => setCheckInState("calm")}
          >
            <span style={{ fontSize: 14 }}>{states.calm.icon}</span>
            {states.calm.label}
          </button>
          <button
            type="button"
            className={`state-btn state-tense${checkInState === "tense" ? " active" : ""}`}
            onClick={() => setCheckInState("tense")}
          >
            <span style={{ fontSize: 14 }}>{states.tense.icon}</span>
            {states.tense.label}
          </button>
          <button
            type="button"
            className={`state-btn state-overstimulated${checkInState === "overstimulated" ? " active" : ""}`}
            onClick={() => setCheckInState("overstimulated")}
          >
            <span style={{ fontSize: 14 }}>{states.overstimulated.icon}</span>
            {states.overstimulated.label}
          </button>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="msg">{INTERPRET.messageLabel}</label>
          <textarea
            id="msg"
            className="textarea"
            rows={4}
            placeholder={INTERPRET.messagePlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
          />
          <p className="field-privacy-note">{PRIVACY_NOTICE}</p>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !text.trim()}
          style={{ width: "100%" }}
        >
          {loading ? (
            <><span className="spinner" />{INTERPRET.submitBusy}</>
          ) : INTERPRET.submitIdle}
        </button>
      </form>

      {/* ── Voorbeelden ── */}
      <div className="examples">
        <span className="examples-label">{INTERPRET.examplesLabel}</span>
        {INTERPRET.examples.map((ex) => (
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

      {loading && (
        <p className="loading">
          <span className="spinner" />
          {INTERPRET.loadingText}
        </p>
      )}

      {error && <p className="error">{error}</p>}

      {/* ── Interpret resultaat ── */}
      {result && (
        <section style={{ marginTop: 24 }}>
          <CardInline title={INTERPRET.cards.literal} delay={0}>
            {result.literal_summary}
          </CardInline>

          <CardInline title={INTERPRET.cards.meanings} delay={60}>
            {result.possible_meanings.map((m, i) => (
              <div key={i} style={{ marginBottom: i < result.possible_meanings.length - 1 ? 20 : 0 }}>
                <p style={{ color: "var(--ink-900)", fontWeight: 500, marginBottom: 2 }}>
                  {m.meaning}
                </p>
                <p style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 6 }}>
                  {m.why}
                </p>
                <div className="confidence-wrapper">
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${m.confidence}%`,
                        background: confidenceColor(m.confidence),
                      }}
                    />
                  </div>
                  <span className="confidence-label">
                    {getConfidenceLabel(m.confidence)}
                  </span>
                </div>
              </div>
            ))}
          </CardInline>

          <CardInline title={INTERPRET.cards.tone} delay={120}>
            <div className="tag-list">
              {result.tone_tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </CardInline>

          <CardInline title={INTERPRET.cards.regulation} tone="soft" delay={180}>
            {result.regulation}
          </CardInline>
        </section>
      )}

    </main>
  );
}
