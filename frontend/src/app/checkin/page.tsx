"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RegulationSlider from "@/components/RegulationSlider";
import LabelSelector from "@/components/LabelSelector";
import {
  CheckinEntry,
  saveCheckin,
  getMostRecent,
  timeAgo,
} from "@/lib/checkin";
import { CHECKIN, BACK } from "@/lib/constants";

const ONBOARDING_KEY = "nn_onboarding_seen";

export default function CheckinPage() {
  const [regulationValue, setRegulationValue] = useState<number>(0);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [prevEntry, setPrevEntry] = useState<CheckinEntry | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setPrevEntry(getMostRecent());
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) setShowOnboarding(true);
  }, []);

  function dismissOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  }

  function handleSliderChange(newValue: number) {
    if (newValue !== regulationValue) setSelectedLabel(null);
    setRegulationValue(newValue);
  }

  function handleSave() {
    if (selectedLabel === null) return;
    const entry: CheckinEntry = {
      timestamp: new Date().toISOString(),
      regulationValue,
      label: selectedLabel,
    };
    saveCheckin(entry);
    setPrevEntry(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.push(`/reply?state=${selectedLabel}`);
  }

  const ob = CHECKIN.onboarding;

  return (
    <>
      {/* ── Onboarding modal ── */}
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-modal">
            <div className="t-label" style={{ marginBottom: 12, textAlign: "center" }}>
              {ob.eyebrow}
            </div>
            <h2>{ob.heading}</h2>
            <p>{ob.body}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={dismissOnboarding}
            >
              {ob.cta}
            </button>
          </div>
        </div>
      )}

      <main className="container checkin-page">
        <Link href="/" className="back">{BACK.toHome}</Link>

        <div className="t-label" style={{ marginBottom: 10 }}>{CHECKIN.eyebrow}</div>
        <h1>Waar zit je <em>{CHECKIN.headingEm}</em> nu?</h1>
        <p className="subtitle">{CHECKIN.subtitle}</p>

        <RegulationSlider value={regulationValue} onChange={handleSliderChange} />

        <LabelSelector
          regulationValue={regulationValue}
          selected={selectedLabel}
          onSelect={setSelectedLabel}
        />

        <div className="checkin-save-section">
          <button
            type="button"
            className="btn btn-primary btn-big"
            disabled={selectedLabel === null}
            onClick={handleSave}
          >
            {saved ? CHECKIN.saveBusy : CHECKIN.saveIdle}
          </button>

          {prevEntry && (
            <p className="prev-checkin-note">
              {CHECKIN.prevNote} <strong>{prevEntry.label}</strong> – {timeAgo(prevEntry.timestamp)}
            </p>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/checkin/history" className="back">
            {CHECKIN.historyLink}
          </Link>
        </div>
      </main>
    </>
  );
}
