"use client";

import { useState } from "react";
import { analyzeLens, LensReading, LensResult } from "@/lib/api";

const LENS_CONFIG: Record<
  LensReading["lens"],
  { label: string; accent: string; border: string; bg: string }
> = {
  "Literal lens": {
    label: "Letterlijk",
    accent: "text-blue-700",
    border: "border-blue-300",
    bg: "bg-blue-50",
  },
  "Threat lens": {
    label: "Dreiging",
    accent: "text-red-700",
    border: "border-red-300",
    bg: "bg-red-50",
  },
  "Social reading lens": {
    label: "Sociaal",
    accent: "text-green-700",
    border: "border-green-300",
    bg: "bg-green-50",
  },
  "Romantic lens": {
    label: "Romantisch",
    accent: "text-purple-700",
    border: "border-purple-300",
    bg: "bg-purple-50",
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
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">LensLab</h1>
        <p className="mb-6 text-gray-600">
          Bekijk een bericht door vier verschillende lenzen.
        </p>

        <form onSubmit={handleSubmit} className="mb-8">
          <label
            htmlFor="message"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Bericht
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX}
            rows={4}
            placeholder="Plak hier het bericht dat je wilt analyseren…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          />
          <div className="mt-1 flex items-center justify-between">
            <span
              className={`text-xs ${
                remaining < 50 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {remaining} tekens over
            </span>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyseren…" : "Analyseer"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {LENS_ORDER.map((lens) => {
              const cfg = LENS_CONFIG[lens];
              return (
                <div
                  key={lens}
                  className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}
                >
                  <div
                    className={`mb-2 text-xs font-semibold uppercase tracking-wide ${cfg.accent}`}
                  >
                    {cfg.label}
                  </div>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
              );
            })}
          </div>
        )}

        {result && !loading && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {LENS_ORDER.map((lens) => {
                const cfg = LENS_CONFIG[lens];
                const reading = readingsByLens[lens];
                return (
                  <div
                    key={lens}
                    className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}
                  >
                    <div
                      className={`mb-2 text-xs font-semibold uppercase tracking-wide ${cfg.accent}`}
                    >
                      {cfg.label}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-800">
                      {reading ?? "—"}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-center text-sm text-gray-500">
              Vier lezingen. Welke herkent jij?
            </p>
          </>
        )}
      </div>
    </main>
  );
}
