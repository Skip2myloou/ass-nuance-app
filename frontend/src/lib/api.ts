const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

// ── Types matching backend schemas ─────────────────────────────

export interface PossibleMeaning {
  meaning: string;
  confidence: number;
  why: string;
}

export interface SuggestedAction {
  action: "ask_clarifying_question" | "reply" | "pause";
  why: string;
}

export interface InterpretResult {
  literal_summary: string;
  possible_meanings: PossibleMeaning[];
  tone_tags: string[];
  suggested_actions: SuggestedAction[];
  regulation: string;
}

export interface ReplyOption {
  style: "direct" | "warm" | "playful";
  message: string;
  impact_label: string;
}

export interface RepliesResult {
  options: ReplyOption[];
}

export interface StyleVariant {
  tone: "direct" | "warm" | "playful";
  message: string;
}

export interface StyleResult {
  variants: StyleVariant[];
}

// ── API error ──────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ── Fetch helper ───────────────────────────────────────────────

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Kan de server niet bereiken. Draait de backend?");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = data?.detail ?? `Server error (${res.status})`;
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

// ── Public API ─────────────────────────────────────────────────

export function interpret(text: string): Promise<InterpretResult> {
  return post<InterpretResult>("/api/interpret", { text });
}

export function replies(text: string, goal: string): Promise<RepliesResult> {
  return post<RepliesResult>("/api/replies", { text, goal });
}

export function style(preferences: string[]): Promise<StyleResult> {
  return post<StyleResult>("/api/style", { preferences });
}
