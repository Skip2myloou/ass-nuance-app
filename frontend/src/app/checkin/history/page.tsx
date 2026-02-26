"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import CheckinHistory from "@/components/CheckinHistory";
import { loadCheckins, CheckinEntry } from "@/lib/checkin";

export default function CheckinHistoryPage() {
  const [entries, setEntries] = useState<CheckinEntry[]>([]);

  useEffect(() => {
    setEntries(loadCheckins());
  }, []);

  return (
    <main className="container checkin-page">
      <Link href="/checkin" className="back">
        &larr; Terug naar check-in
      </Link>
      <h1>Check-in geschiedenis</h1>
      <p className="subtitle">Jouw recente check-ins, meest recent eerst.</p>
      <CheckinHistory entries={entries} />
    </main>
  );
}
