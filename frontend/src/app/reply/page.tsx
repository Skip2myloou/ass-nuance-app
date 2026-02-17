"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { replies, type RepliesResult, ApiError } from "@/lib/api";

const GOALS = [
  { value: "Vriendelijk reageren en gesprek voortzetten", label: "Gesprek voortzetten" },
  { value: "Interesse tonen maar rustig aan doen", label: "Rustig interesse tonen" },
  { value: "Beleefd een grens aangeven", label: "Grens aangeven" },
  { value: "Afspraak maken", label: "Afspraak voorstellen" },
  { value: "Een verduidelijkende vraag stellen", label: "Vraag stellen" },
];

const GOAL_VALUES = new Set(GOALS.map((g) => g.value));

const STYLE_LABELS: Record<string, string> = {
  direct: "Direct",
  warm: "Warm",
  playful: "Speels",
};

const STYLE_EMOJI: Record<string, string> = {
  direct: "\u{1F3AF}",
  warm: "\u{2764}\u{FE0F}",
  playful: "\u{1F60F}",
};

const REFINEMENTS = [
  { label: "Minder direct", goalTweak: "Reageer minder direct, iets voorzichtiger en zachter" },
  { label: "Warmer",        goalTweak: "Reageer warmer en hartelijker, meer betrokkenheid tonen" },
  { label: "Neutraler",     goalTweak: "Reageer neutraler en afstandelijker, minder emotie" },
];

function ReplyPageInner() {
  const searchParams = useSearchParams();
  const prefillText = searchParams.get("text") ?? "";
  const prefillGoal = searchParams.get("goal") ?? "";

  // If the prefilled goal isn't in our dropdown, add it as a custom option
  const goalOptions = useMemo(() => {
    if (prefillGoal && !GOAL_VALUES.has(prefillGoal)) {
      return [...GOALS, { value: prefillGoal, label: prefillGoal }];
    }
    return GOALS;
  }, [prefillGoal]);

  const [text, setText] = useState(prefillText);
  const [goal, setGoal] = useState(prefillGoal || GOALS[0].value);
  const [result, setResult] = useState<RepliesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [refining, setRefining] = useState(false);
  const isBusy = loading || refining;

  const fetchReplies = useCallback(
    async (goalOverride?: string) => {
      if (!text.trim()) return;

      const isRefine = !!goalOverride;
      if (isRefine) {
        setRefining(true);
      } else {
        setLoading(true);
      }
      setError("");
      if (!isRefine) setResult(null);
      setCopied(null);

      try {
        const data = await replies(text, goalOverride ?? goal);
        setResult(data);
        if (goalOverride) setGoal(goalOverride);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Er ging iets mis. Probeer het opnieuw."
        );
      } finally {
        setLoading(false);
        setRefining(false);
      }
    },
    [text, goal]
  );

  // Auto-submit when arriving with prefilled params
  useEffect(() => {
    if (prefillText && prefillGoal) {
      fetchReplies();
    }
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchReplies();
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
      <h1>Maak antwoord</h1>
      <p className="subtitle">
        Plak het bericht en kies je doel. We stellen drie antwoorden voor.
      </p>

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

        <div className="form-group">
          <label htmlFor="goal">Wat wil je bereiken?</label>
          <select
            id="goal"
            className="select"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          >
            {goalOptions.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isBusy || !text.trim()}
        >
          {loading ? "Bezig met schrijven..." : "Stel antwoorden voor"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && (
        <p className="loading">Even geduld, we schrijven antwoorden...</p>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {result && (
        <section>
          <h2>Voorgestelde antwoorden</h2>

          {result.options.map((opt, i) => (
            <div key={i} className="card">
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
                  {copied === i ? "Gekopieerd!" : "Kopieer"}
                </button>
              </div>
            </div>
          ))}

          {/* ── Refinement row ──────────────────────────────────── */}
          <div className="refine-row">
            <span className="refine-label">Pas aan:</span>
            {REFINEMENTS.map((r) => (
              <button
                key={r.label}
                type="button"
                className="btn btn-outline btn-sm"
                disabled={isBusy}
                onClick={() => fetchReplies(r.goalTweak)}
              >
                {r.label}
              </button>
            ))}
          </div>
          {refining && (
            <p className="loading">
              Even herformuleren<span className="dot-pulse" />
            </p>
          )}
        </section>
      )}
    </main>
  );
}

export default function ReplyPage() {
  return (
    <Suspense>
      <ReplyPageInner />
    </Suspense>
  );
}
