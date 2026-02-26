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
    if (!seen) {
      setShowOnboarding(true);
    }
  }, []);

  function dismissOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  }

  function handleSliderChange(newValue: number) {
    if (newValue !== regulationValue) {
      setSelectedLabel(null);
    }
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
    // 🔥 Direct naar reply met state
    router.push(`/reply?state=${selectedLabel}`);
 }

  return (
    <>
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-modal">
            <h2>Dit is je regulatiekompas</h2>
            <p>
              Links is vertraging of afsluiting. Midden is in balans. Rechts is
              oplopende spanning of overbelasting.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={dismissOnboarding}
            >
              Begrepen
            </button>
          </div>
        </div>
      )}

      <main className="container checkin-page">
        <Link href="/" className="back">
          &larr; Terug
        </Link>
        <h1>Waar zit je systeem nu?</h1>
        <p className="subtitle">Schuif de slider naar waar je je nu bevindt.</p>

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
            {saved ? "Opgeslagen!" : "Opslaan"}
          </button>

          {prevEntry && (
            <p className="prev-checkin-note">
              Vorige check-in: {prevEntry.label} – {timeAgo(prevEntry.timestamp)}
            </p>
          )}
        </div>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link href="/checkin/history" className="back">
            Bekijk geschiedenis &rarr;
          </Link>
        </div>
      </main>
    </>
  );
}
