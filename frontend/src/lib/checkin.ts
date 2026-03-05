export interface CheckinEntry {
  timestamp: string;       // ISO 8601
  regulationValue: number; // -3 to +3
  label: string;
}

export function getZone(v: number): "hypo" | "regulated" | "hyper" {
  if (v <= -1) return "hypo";
  if (v === 0) return "regulated";
  return "hyper";
}

export function valueToColor(v: number): string {
  if (v <= -1) return "#3b82f6";
  if (v === 0) return "#22c55e";
  return "#f97316";
}

const KEY = "literalpause_checkins";

export function loadCheckins(): CheckinEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCheckin(entry: CheckinEntry): void {
  const existing = loadCheckins();
  existing.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(existing));
}

export function getMostRecent(): CheckinEntry | null {
  const all = loadCheckins();
  return all.length > 0 ? all[0] : null;
}

export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "zojuist";
  if (mins < 60) return `${mins} min geleden`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} uur geleden`;
  const days = Math.floor(hrs / 24);
  return `${days} dag${days > 1 ? "en" : ""} geleden`;
}
