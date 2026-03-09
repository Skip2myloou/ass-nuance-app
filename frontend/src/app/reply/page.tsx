"use client";

import { trackEvent } from "@/lib/plausible";

import Card from "../../components/Card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { replies, interpret, refine, type RepliesResult, ApiError } from "@/lib/api";
import {
  REPLY,
  GOALS,
  UNDERSTAND_GOAL,
  STYLE_LABELS,
  STYLE_EMOJI,
  HIGH_AROUSAL_LABELS,
  MEDIUM_AROUSAL_LABELS,
  BACK,
  getConfidenceLabel,
  PRIVACY_NOTICE,
} from "@/lib/constants";

function confidenceColor(pct: number): string {
  const hue = Math.round((pct / 100) * 120);
  return `hsl(${hue}, 65%, 45%)`;
}

const GOAL_VALUES = new Set(GOALS.map((g) => g.value));

type PageResult =
  | {
      mode: "interpret";
      analysis: {
        literal_summary: string;
        possible_meanings: { meaning: string; confidence: number; why: string }[];
        regulation: string;
        tone_tags: string[];
      };
    }
  | { mode: "reply"; options: RepliesResult["options"] }
  | { mode: "refine"; feedback: string; improved: string }
  | null;

function ReplyPageInner() {
  const searchParams = useSearchParams();
  const checkInState = searchParams.get("state");
  const prefillText = searchParams.get("text") ?? "";
  const prefillGoal = searchParams.get("goal") ?? "";

  const goalOptions = useMemo(() => {
    if (prefillGoal && !GOAL_VALUES.has(prefillGoal)) {
      return [...GOALS, { value: prefillGoal, label: prefillGoal }];
    }
    return GOALS;
  }, [prefillGoal]);

  const [text, setText] = useState(prefillText);
  const [goal, setGoal] = useState(prefillGoal || GOALS[0].value);
  const [result, setResult] = useState<PageResult>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [refining, setRefining] = useState(false);
  const [allowReplyWhenHigh, setAllowReplyWhenHigh] = useState(false);
  const [pauseSeconds, setPauseSeconds] = useState(0);
  const [draft, setDraft] = useState("");
  const [showDraft, setShowDraft] = useState(false);

  const hasDraft = showDraft && draft.trim().length > 0;
  const regulateFirst = (checkInState && HIGH_AROUSAL_LABELS.has(checkInState)) ?? false;

  useEffect(() => {
    if (regulateFirst) setGoal(UNDERSTAND_GOAL);
  }, [regulateFirst]);

  useEffect(() => {
    if (pauseSeconds <= 0) return;
    const interval = setInterval(() => {
      setPauseSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [pauseSeconds]);

  const isBusy = loading || refining;

  const fetchReplies = useCallback(
    async (goalOverride?: string) => {
      const activeGoal = goalOverride ?? goal;

      if (regulateFirst && !allowReplyWhenHigh && activeGoal !== UNDERSTAND_GOAL) {
        setPauseSeconds(90);
        return;
      }

      if (activeGoal === UNDERSTAND_GOAL) {
        setLoading(true);
        setError("");
        setResult(null);
        try {
          const regulationState =
            HIGH_AROUSAL_LABELS.has(checkInState ?? "")
              ? "overstimulated"
              : MEDIUM_AROUSAL_LABELS.has(checkInState ?? "")
              ? "tense"
              : "calm";
          const data = await interpret(text, regulationState);
          setResult({ mode: "interpret", analysis: data });
        } catch (err) {
          setError(err instanceof Error ? err.message : REPLY.errorAnalyze);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (showDraft && draft.trim()) {
        setLoading(true);
        setError("");
        setResult(null);
        try {
          const data = await refine(text, draft, activeGoal);
          setResult({ mode: "refine", feedback: data.feedback, improved: data.improved });
        } catch (err) {
          setError(err instanceof Error ? err.message : REPLY.errorRefine);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!text.trim()) return;
      setLoading(true);
      setError("");
      setResult(null);
      setCopied(null);
      try {
        const data = await replies(text, activeGoal);
        setResult({ mode: "reply", options: data.options });
        if (goalOverride) setGoal(goalOverride);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : REPLY.errorGeneric);
      } finally {
        setLoading(false);
      }
    },
    [text, goal, draft, checkInState, regulateFirst, allowReplyWhenHigh, showDraft]
  );

  useEffect(() => {
    if (prefillText && prefillGoal) fetchReplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    trackEvent("lp_generate_reply");

    setLoading(true);
    setError("");

    const data = await fetchReplies({
      text,
      goal,
    });
    setResult(data);
  }

  function handleCopy(message: string, index: number) {
    navigator.clipboard.writeText(message);
    trackEvent("lp_copy_reply");
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  const eyebrow =
    result?.mode === "interpret"
      ? REPLY.eyebrowInterpret
      : result?.mode === "refine"
      ? REPLY.eyebrowRefine
      : REPLY.eyebrowReply;

  return (
    <main className="container">
      <Link href="/" className="back">{BACK.toHome}</Link>

      <div className="t-label" style={{ marginBottom: 10 }}>
        {eyebrow}
      </div>

      <h1>
        {result?.mode === "interpret" ? (
          <>{REPLY.headingInterpret.split(REPLY.headingInterpretEm)[0]}<em>{REPLY.headingInterpretEm}</em></>
        ) : result?.mode === "refine" ? (
          <>Verbeter <em>{REPLY.headingRefineEm}</em></>
        ) : (
          <>Kies je <em>{REPLY.headingReplyEm}</em></>
        )}
      </h1>

      <p className="subtitle">
        {result?.mode === "interpret"
          ? REPLY.subtitleInterpret
          : REPLY.subtitleReply}
      </p>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label htmlFor="message">{REPLY.messageLabel}</label>
          <textarea
            id="message"
            className="textarea"
            rows={4}
            placeholder={REPLY.messagePlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <p className="field-privacy-note">{PRIVACY_NOTICE}</p>
        </div>

        <div className="form-group">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textTransform: "none",
              letterSpacing: 0,
              fontSize: 14,
              fontWeight: 500,
              color: "var(--ink-700)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showDraft}
              onChange={() => {
                const next = !showDraft;
                setShowDraft(next);
                if (!next) setDraft("");
              }}
            />
            {REPLY.draftToggle}
          </label>
        </div>

        {showDraft && (
          <div className="form-group">
            <label htmlFor="draft">{REPLY.draftLabel}</label>
            <textarea
              id="draft"
              className="textarea"
              rows={4}
              placeholder={REPLY.draftPlaceholder}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>
        )}

        {hasDraft && (
          <p className="helper-text" style={{ marginBottom: 12 }}>
            {REPLY.draftHelper}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="goal">{REPLY.goalLabel}</label>
          <select
            id="goal"
            className="select"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          >
            {goalOptions.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isBusy || !text.trim()}
          style={{ width: "100%", marginTop: 4 }}
        >
          {loading
            ? hasDraft ? REPLY.submitLoadingDraft : REPLY.submitLoadingDefault
            : hasDraft ? REPLY.submitIdleDraft : REPLY.submitIdleDefault}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && (
        <p className="loading">
          <span className="spinner" />
          {REPLY.loadingText}
        </p>
      )}

      {/* ── Interpret-modus ── */}
      {result?.mode === "interpret" && (
        <section style={{ marginTop: 24 }}>
          <Card title={REPLY.cards.literal} delay={0}>
            {result.analysis.literal_summary}
          </Card>

          <Card title={REPLY.cards.meanings} delay={60}>
            {result.analysis.possible_meanings.map((m, i) => (
              <div key={i} style={{ marginBottom: i < result.analysis.possible_meanings.length - 1 ? 20 : 0 }}>
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
          </Card>

          <Card title={REPLY.cards.tone} delay={120}>
            <div className="tag-list">
              {result.analysis.tone_tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </Card>

          <Card title={REPLY.cards.regulation} tone="soft" delay={180}>
            {result.analysis.regulation}
          </Card>
        </section>
      )}

      {/* ── Reply-modus ── */}
      {result?.mode === "reply" && (
        <>
          <section style={{ marginTop: 24 }}>
            <h2>{REPLY.repliesHeading}</h2>
            <p style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 16, marginTop: 4 }}>
              {REPLY.repliesSubtext}
            </p>
            {result.options.map((opt, i) => (
              <div key={i} className="card" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="card-label">
                  {STYLE_EMOJI[opt.style] ?? ""}{" "}
                  {STYLE_LABELS[opt.style] ?? opt.style}
                </div>
                <div className="card-body">{opt.message}</div>
                <div className="card-footer">
                  <span className="card-note">{opt.impact_label}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(opt.message, i)}
                    className="btn btn-outline btn-sm"
                    disabled={isBusy}
                  >
                    {copied === i ? REPLY.copied : REPLY.copy}
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* POST-MVP: refine-loop — verborgen in UI, logica intact
          <div className="refine-row">
            <span className="refine-label">Pas aan:</span>
            {REFINEMENTS.map((r) => (
              <button
                key={r.label}
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={isBusy}
                onClick={() => fetchReplies(r.goalTweak)}
              >
                {r.label}
              </button>
            ))}
          </div>
          {refining && (
            <p className="loading">Even herformuleren<span className="dot-pulse" /></p>
          )}
          */}
        </>
      )}

      {/* ── Refine-modus ── */}
      {result?.mode === "refine" && (
        <section style={{ marginTop: 24 }}>
          <Card title={REPLY.refineFeedbackTitle} delay={0}>{result.feedback}</Card>
          <Card title={REPLY.refineImprovedTitle} tone="soft" delay={60}>{result.improved}</Card>
        </section>
      )}

      {/* ── Pause overlay ── */}
      {pauseSeconds > 0 && (
        <div className="pause-overlay">
          <div className="pause-card">
            <h2>{REPLY.pause.heading}</h2>
            <p className="pause-sub">
              {checkInState
                ? REPLY.pause.subtitleWithState(checkInState)
                : REPLY.pause.subtitleDefault}
            </p>
            <div className="pause-countdown">
              {Math.floor(pauseSeconds / 60)}:{(pauseSeconds % 60).toString().padStart(2, "0")}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setGoal(UNDERSTAND_GOAL);
                  setPauseSeconds(0);
                  fetchReplies(UNDERSTAND_GOAL);
                }}
              >
                {REPLY.pause.ctaUnderstand}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setAllowReplyWhenHigh(true);
                  setPauseSeconds(0);
                }}
              >
                {REPLY.pause.ctaReplyAnyway}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ReplyPage() {
  return (
    <Suspense fallback={null}>
      <ReplyPageInner />
    </Suspense>
  );
}
