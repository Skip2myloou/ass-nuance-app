"use client";

interface RegulationSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const GRADIENT =
  "linear-gradient(to right, #3b82f6 0%, #60a5fa 33%, #22c55e 50%, #eab308 67%, #f97316 83%, #ef4444 100%)";

export default function RegulationSlider({ value, onChange }: RegulationSliderProps) {
  return (
    <div className="slider-wrapper">
      <input
        type="range"
        className="slider-range"
        min={-3}
        max={3}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: GRADIENT }}
        aria-label="Regulatie niveau"
        aria-valuemin={-3}
        aria-valuemax={3}
        aria-valuenow={value}
      />
      <div className="slider-labels">
        <span>Hypo −3</span>
        <span>In balans 0</span>
        <span>+3 Hyper</span>
      </div>
    </div>
  );
}
