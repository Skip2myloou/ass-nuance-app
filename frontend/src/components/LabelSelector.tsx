"use client";

interface LabelSelectorProps {
  regulationValue: number;
  selected: string | null;
  onSelect: (label: string | null) => void;
}

const LEVEL_LABELS: Record<number, string[]> = {
  [-3]: ["Shutdown", "Gevoelloos", "Bevroren"],
  [-2]: ["Afgevlakt", "Erg moe", "Teruggetrokken"],
  [-1]: ["Moe", "Afwezig", "Rust nodig"],
  [0]: ["Helder", "Aanwezig", "Oké"],
  [1]: ["Onrustig", "Geprikkeld", "Snelle gedachten"],
  [2]: ["Overbelast", "Irriteerbaar", "Te veel"],
  [3]: ["Ontplofbaar", "Meltdown-gevaar", "Niet meer praten"],
};

export default function LabelSelector({ regulationValue, selected, onSelect }: LabelSelectorProps) {
  const labels = LEVEL_LABELS[regulationValue] ?? [];

  return (
    <div>
      <h2>Hoe voelt dat?</h2>
      <div className="label-grid">
        {labels.map((label) => (
          <button
            key={label}
            type="button"
            className={`label-btn${selected === label ? " selected" : ""}`}
            onClick={() => onSelect(selected === label ? null : label)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={`label-btn label-btn-none${selected === "Geen van deze" ? " selected" : ""}`}
          onClick={() => onSelect(selected === "Geen van deze" ? null : "Geen van deze")}
        >
          Geen van deze
        </button>
      </div>
    </div>
  );
}
