"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import CheckinHistory from "@/components/CheckinHistory";
import { loadCheckins, CheckinEntry } from "@/lib/checkin";
import { CHECKIN_HISTORY, BACK } from "@/lib/constants";

export default function CheckinHistoryPage() {
  const [entries, setEntries] = useState<CheckinEntry[]>([]);

  useEffect(() => {
    setEntries(loadCheckins());
  }, []);

  return (
    <main className="container checkin-page">
      <Link href="/checkin" className="back">{BACK.toCheckin}</Link>

      <div className="t-label" style={{ marginBottom: 10 }}>{CHECKIN_HISTORY.eyebrow}</div>
      <h1>Je <em>{CHECKIN_HISTORY.headingEm}</em></h1>
      <p className="subtitle">{CHECKIN_HISTORY.subtitle}</p>

      <CheckinHistory entries={entries} />
    </main>
  );
}
