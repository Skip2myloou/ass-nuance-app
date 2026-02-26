"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { replies, interpret, type RepliesResult, ApiError } from "@/lib/api";

const UNDERSTAND_GOAL = "UNDERSTAND)";

const GOALS = [
  { value: UNDERSTAND_GOAL, label: "Begrijp bericht eerst" },
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

const HIGH_AROUSAL_LABELS = new Set([
  "Overbelast",
  "Te veel",
  "Ontplofbaar",
  "Meltdown-gevaar",
  "Niet meer praten",
  "Irriteerbaar",
]);

const MEDIUM_AROUSAL_LABELS = new Set([
  "Onrustig",
  "Geprikkeld",
  "Snelle gedachten",
]);

type InterpretData = {
  literal_summary: string;
  possible_meanings: {
    meaning: string;
    confidence: number;
    why: string;
  }[];
  regulation: string;
  suggested_actions: {
    action: string;
    why: string;
  }[];
  tone_tags: string[];
};

type PageResult =
  | { mode: "interpret"; analysis: string }
  | { mode: "reply"; options: RepliesResult["options"] }
  | null;

function ReplyPageInner() {
  const searchParams = useSearchParams();
  const checkInState = searchParams.get("state");
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
  const [result, setResult] = useState<PageResult>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [refining, setRefining] = useState(false);
  const [allowReplyWhenHigh, setAllowReplyWhenHigh] = useState(false);
  const [pauseSeconds, setPauseSeconds] = useState(0);
  
  const regulateFirst =
  (checkInState && HIGH_AROUSAL_LABELS.has(checkInState)) ?? false;

useEffect(() => {
  if (regulateFirst) {
    setGoal(UNDERSTAND_GOAL);
  }
}, [regulateFirst]);

useEffect(() => {
  if (pauseSeconds <= 0) return;

  const interval = setInterval(() => {
    setPauseSeconds((s) => (s <= 1 ? 0 : s -1));
  }, 1000);

  return () => clearInterval(interval);
}, [pauseSeconds]);
  
  const isBusy = loading || refining;

  const fetchReplies = useCallback(
    async (goalOverride?: string) => {
      const activeGoal = goalOverride ?? goal;
      // 🔒 Reguleer-eerst gate
      if (
        regulateFirst &&
        !allowReplyWhenHigh &&
        activeGoal !== UNDERSTAND_GOAL
     ) {
       setPauseSeconds(90);
       return;
     }
      // 🛑 ADAPTIEVE TRIGGER –
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
            console.log("INTERPRET DATA:", data);
            setResult({
              mode: "interpret",
              analysis: data,
            });  
            

        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Er ging iets mis bij het analyseren."
         );
       } finally {
         setLoading(false);
       }

       return;
      }
      // 🟩 Normale reply-modus
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
        const data = await replies(text, activeGoal);
        setResult({
          mode: "reply",
          options: data.options,
        });
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
    [text, goal, checkInState, regulateFirst, allowReplyWhenHigh]
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
{/* 🔵 Interpret-modus */}
{result?.mode === "interpret" && (
  <section>
    <h2>Wat staat hier eigenlijk?</h2>

    <div className="card">
      <div className="card-body">
        <strong>Letterlijk:</strong>
        <p>{result.analysis.literal_summary}</p>

        <strong>Mogelijke betekenissen:</strong>
        {result.analysis.possible_meanings.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <p>• {m.meaning}</p>
            <small>
              Vertrouwen: {m.confidence}% – {m.why}
            </small>
          </div>
        ))}

        <strong>Regulatie:</strong>
        <p>{result.analysis.regulation}</p>

        <strong>Toon:</strong>
        <p>{result.analysis.tone_tags.join(", ")}</p>
      </div>
    </div>
  </section>
)}

{/* 🟢 Reply-modus */}
{result?.mode === "reply" && (
  <>
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
    </section>

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
  </>
)}

    {/* bestaande reply UI hier */}
     {pauseSeconds > 0 && (
      <div className="pause-overlay">
        <div className="pause-card">
          <h2>Even pauze.</h2>

          <p className="pause-sub">
            {checkInState
              ? `Je check-in is: "${checkInState}". Zullen we eerst begrijpen wat er staat?`
              : "Zullen we het antwoord even uitstellen?"}
          </p>

          <div className="pause-countdown">
            {Math.floor(pauseSeconds / 60)}:
            {(pauseSeconds % 60).toString().padStart(2, "0")}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
           <button
             type="button"
             className="btn btn-primary"
             onClick={() => {
              setGoal(UNDERSTAND_GOAL);
              setPauseSeconds(0);
              // Optioneel: meteen "begrijp" runnen
              fetchReplies(UNDERSTAND_GOAL);
            }}
          >
            Eerst begrijpen
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setAllowReplyWhenHigh(true);
              setPauseSeconds(0);
            }}
          >
            Toch antwoorden maken
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
