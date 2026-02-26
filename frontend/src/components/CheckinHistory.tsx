"use client";

import { CheckinEntry, valueToColor } from "@/lib/checkin";

interface CheckinHistoryProps {
  entries: CheckinEntry[];
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
}

export default function CheckinHistory({ entries }: CheckinHistoryProps) {
  if (entries.length === 0) {
    return <p className="history-empty">Nog geen check-ins opgeslagen.</p>;
  }

  return (
    <ul className="history-list">
      {entries.map((entry, i) => {
        const { date, time } = formatDateTime(entry.timestamp);
        const color = valueToColor(entry.regulationValue);
        const displayValue =
          entry.regulationValue > 0
            ? `+${entry.regulationValue}`
            : String(entry.regulationValue);

        return (
          <li key={i} className="history-item">
            <span
              className="history-dot"
              style={{ background: color }}
              aria-hidden="true"
            />
            <div className="history-meta">
              <div className="history-label">{entry.label}</div>
              <div className="history-datetime">
                {date} – {time}
              </div>
            </div>
            <div className="history-value" style={{ color }}>
              {displayValue}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
