/**
 * Centrale UI-teksten voor LiteralPause.
 *
 * Structuur: één `nl` object per locale, gegroepeerd per pagina/sectie.
 * Om later een Engelse versie toe te voegen:
 *   1. Exporteer een `en` object met dezelfde sleutels.
 *   2. Wissel `nl` → `en` in de pagina-imports (of gebruik een locale-provider).
 *
 * Bevat GEEN vertaallogica — alleen constanten.
 *
 * USP-stelregel: suggereert deze tekst dat de app iets doet,
 * of dat de gebruiker iets kiest?
 * "Analyseer" en "Kies" = goed.
 * "Stel voor" en "Maak" = vermijden.
 */

// ─── Metadata ────────────────────────────────────────────────────────────────

export const META = {
  title: "LiteralPause | Van bewustwording naar keuze",
  description:
    "Een helder model dat de lagen in communicatie zichtbaar maakt.",
  lang: "nl",
} as const;

// ─── Navigatie & Layout ──────────────────────────────────────────────────────

export const NAV = {
  brand: "LiteralPause",
  checkin: "Check-in",
  start: "Start →",
} as const;

export const FOOTER = {
  brand: "LiteralPause",
  tagline: "LensLab is onderdeel van LiteralPause.",
  privacy: "Privacybeleid",
} as const;

export const PRIVACY_NOTICE =
  "Wat je hier invult wordt alleen gebruikt om je antwoord te genereren. We slaan berichten niet op.";

export const BACK = {
  toHome: "← Terug",
  toCheckin: "← Terug naar check-in",
} as const;

// ─── Gedeelde UI-elementen ────────────────────────────────────────────────────

export const SHARED = {
  copied: "✓ Gekopieerd",
  copy: "Kopieer",
  loading: "Even geduld...",
  errorGeneric: "Er ging iets mis. Probeer het opnieuw.",
} as const;

// ─── Homepagina ──────────────────────────────────────────────────────────────

export const HOME = {
  eyebrow: "LiteralPause",
  heading: ["Begrijp het bericht.", "Reageer bewust."] as const,
  headingEm: "bewust.",
  subtitle:
    "Voor als sociale berichten langer blijven hangen dan je wilt. Eerst helderheid. Dan actie.",
  ctaPrimary: "Probeer met een bericht →",
  ctaSecondary: "Doe eerst een check-in",
  trustStrip: "Check-in · Wat staat er? · Betekenis · Doel · Reactie",
  body: {
    opener: "Je hoeft niets te fixen. Soms helpt het als iets met je meedenkt.",
    recognizeHeading: "Herken je dit?",
    recognize:
      "Je leest een bericht meerdere keren. Je vraagt je af wat diegene precies bedoelt. Je twijfelt of je reactie te direct is. Te warm. Of te veel. Je hoofd blijft ermee bezig, ook als je verder wilt.",
    recognize2:
      "LiteralPause helpt je eerst helderheid te krijgen, voordat je iets terugstuurt.",
    howHeading: "Hoe het werkt",
    how1: "Eerst een korte check-in: hoe zit je systeem nu?",
    how2: "Daarna kijken we samen naar wat er letterlijk staat, welke lezingen er mogelijk zijn, en wat jouw doel is met je reactie.",
    how3: "Pas daarna kies je een antwoord dat past. Zonder druk. Zonder interpretatie-spiraal.",
    forHeading: "Voor mensen die",
    for: "Sociale nuance intens ervaren, snel blijven nadenken over berichten, gevoelig zijn voor toon en onderliggende betekenis, en baat hebben bij structuur vóór actie.",
    ctaBottom: "Probeer LiteralPause →",
    ctaBottomSecondary: "Check-in eerst",
  },
} as const;

// ─── Check-in pagina ─────────────────────────────────────────────────────────

export const CHECKIN = {
  eyebrow: "Stap 01 · Check-in",
  heading: "Waar zit je systeem nu?",
  headingEm: "systeem",
  subtitle: "Schuif de slider naar waar je je nu bevindt.",
  saveBusy: "Opgeslagen! →",
  saveIdle: "Opslaan & verder →",
  prevNote: "Vorige check-in:",
  historyLink: "Bekijk geschiedenis →",
  onboarding: {
    eyebrow: "Welkom",
    heading: "Dit is je regulatiekompas",
    body: "Links is vertraging of afsluiting. Midden is in balans. Rechts is oplopende spanning of overbelasting.",
    cta: "Begrepen →",
  },
} as const;

// ─── Check-in · Geschiedenis ─────────────────────────────────────────────────

export const CHECKIN_HISTORY = {
  eyebrow: "Check-in · Geschiedenis",
  heading: "Je check-ins",
  headingEm: "check-ins",
  subtitle: "Jouw recente check-ins, meest recent eerst.",
} as const;

// ─── Interpreteer-pagina (standalone /interpret) ─────────────────────────────

export const INTERPRET = {
  eyebrow: "Stap 01 · Check-in",
  heading: "Begrijp bericht",
  headingEm: "bericht",
  subtitle: "Laten we samen kijken wat hier bedoeld wordt.",

  // Check-in blok
  checkinHeading: "Even kort checken",
  checkinSubtitle: "Hoe zit je er nu bij terwijl je het ontvangen bericht leest?",
  states: {
    calm: { label: "Helder & rustig", icon: "🟢" },
    tense: { label: "Twijfelend of gespannen", icon: "🟡" },
    overstimulated: { label: "Overprikkeld", icon: "🔴" },
  },

  // Formulier
  messageLabel: "Ontvangen bericht",
  messagePlaceholder: "Plak hier het bericht...",
  submitIdle: "Kijk mee →",
  submitBusy: "Even kijken...",

  // Voorbeelden
  examplesLabel: "Voorbeelden",
  examples: [
    "Haha ja hoor, tuurlijk 😉",
    "Dus… wat zoek je hier eigenlijk?",
    "Je bent wel heel stil ineens",
  ] as string[],

  // Laad-/foutstatus
  loadingText: "Even geduld, we analyseren het bericht...",
  errorGeneric: "Er ging iets mis. Probeer het opnieuw.",

  // Resultaat-kaarten
  cards: {
    literal: "Wat staat hier letterlijk?",
    meanings: "Wat kan dit betekenen?",
    tone: "Toon",
    regulation: "Om rustig te blijven",
  },
} as const;

// ─── Reply-pagina (/reply) ────────────────────────────────────────────────────

export const REPLY = {
  // Step-labels (bovenaan pagina, afhankelijk van modus)
  eyebrowInterpret: "Stap 01–02 · Wat staat er? & Wat kan het betekenen?",
  eyebrowRefine: "Stap 03 · Reactie verfijnen",
  eyebrowReply: "Stap 03 · Kies je antwoord",

  // Paginatitels (afhankelijk van modus)
  headingInterpret: "Begrijp bericht",
  headingInterpretEm: "bericht",
  headingRefine: "Verbeter reactie",
  headingRefineEm: "reactie",
  headingReply: "Kies je antwoord",
  headingReplyEm: "antwoord",

  // Ondertitels
  subtitleInterpret:
    "Plak het bericht. We analyseren wat er staat en wat het kan betekenen.",
  subtitleReply: "Plak het bericht en kies je doel. We stellen drie antwoorden voor.",

  // Formulier
  messageLabel: "Ontvangen bericht",
  messagePlaceholder: "Plak hier het bericht dat je hebt ontvangen...",
  draftToggle: "Ik heb al een concept reactie",
  draftLabel: "Mijn concept reactie (optioneel)",
  draftPlaceholder: "Typ hier je eigen conceptreactie...",
  draftHelper: "We kijken mee en helpen je reactie sterker of duidelijker maken.",
  goalLabel: "Wat wil je bereiken?",

  // Submit-knop (afhankelijk van status)
  submitLoadingDraft: "Bezig met meekijken...",
  submitLoadingDefault: "Bezig met schrijven...",
  submitIdleDraft: "Kijk mee",
  submitIdleDefault: "Analyseer bericht →",

  // Laad-/foutstatus
  loadingText: "Even geduld, we schrijven antwoorden...",
  errorAnalyze: "Er ging iets mis bij het analyseren.",
  errorRefine: "Er ging iets mis bij het verbeteren.",
  errorGeneric: "Er ging iets mis. Probeer het opnieuw.",

  // Resultaat reply-modus
  repliesHeading: "Kies je richting",
  repliesSubtext: "Dit zijn drie richtingen. Jij kiest wat past.",
  copied: "✓ Gekopieerd",
  copy: "Kopieer",

  // Resultaat interpret-modus (in reply-pagina)
  cards: {
    literal: "Wat staat hier eigenlijk?",
    meanings: "Mogelijke betekenissen",
    tone: "Toon",
    regulation: "Om rustig te blijven",
  },

  // Resultaat refine-modus
  refineFeedbackTitle: "Feedback op je reactie",
  refineImprovedTitle: "Voorstel (aangescherpt)",

  // Pauze-overlay
  pause: {
    heading: "Even pauze.",
    subtitleWithState: (state: string) =>
      `Je check-in is: "${state}". Zullen we eerst begrijpen wat er staat?`,
    subtitleDefault: "Zullen we het antwoord even uitstellen?",
    ctaUnderstand: "Eerst begrijpen",
    ctaReplyAnyway: "Toch antwoorden maken",
  },
} as const;

// ─── Doelen (reply-pagina dropdown) ─────────────────────────────────────────

/** De UNDERSTAND_GOAL-waarde wordt intern gebruikt als trigger voor interpret-modus. */
export const UNDERSTAND_GOAL = "UNDERSTAND)";

/**
 * MVP: 3 doelen.
 * POST-MVP doelen staan hieronder als commentaar.
 */
export const GOALS: { value: string; label: string }[] = [
  { value: UNDERSTAND_GOAL, label: "Begrijp bericht eerst" },
  { value: "Rustig en vriendelijk reageren", label: "Rustig reageren" },
  { value: "Beleefd een grens aangeven", label: "Grens aangeven" },
  // POST-MVP:
  // { value: "Vriendelijk reageren en gesprek voortzetten", label: "Gesprek voortzetten" },
  // { value: "Interesse tonen maar rustig aan doen", label: "Rustig interesse tonen" },
  // { value: "Afspraak maken", label: "Afspraak voorstellen" },
  // { value: "Een verduidelijkende vraag stellen", label: "Vraag stellen" },
];

// ─── Stijl-labels & emoji (gedeeld tussen reply- en style-pagina) ─────────────

export const STYLE_LABELS: Record<string, string> = {
  direct: "Direct",
  warm: "Warm",
  playful: "Speels",
};

export const STYLE_EMOJI: Record<string, string> = {
  direct: "\u{1F3AF}",
  warm: "\u2764\uFE0F",
  playful: "\u{1F60F}",
};

// ─── Verfijn-opties (POST-MVP — logica in code, verborgen in UI) ──────────────

export const REFINEMENTS: { label: string; goalTweak: string }[] = [
  // POST-MVP:
  // { label: "Minder direct", goalTweak: "Reageer minder direct, iets voorzichtiger en zachter" },
  // { label: "Warmer",        goalTweak: "Reageer warmer en hartelijker, meer betrokkenheid tonen" },
  // { label: "Neutraler",     goalTweak: "Reageer neutraler en afstandelijker, minder emotie" },
];

// ─── Confidence-labels (interpret- en reply-pagina) ──────────────────────────

export const CONFIDENCE_LABELS: { min: number; label: string }[] = [
  { min: 80, label: "Dit klopt waarschijnlijk" },
  { min: 60, label: "Kan goed kloppen" },
  { min: 40, label: "Misschien, maar niet zeker" },
  { min: 20, label: "Minder waarschijnlijk" },
  { min: 0,  label: "Onwaarschijnlijk" },
];

/** Geeft het bijpassende confidence-label terug op basis van percentage. */
export function getConfidenceLabel(pct: number): string {
  for (const { min, label } of CONFIDENCE_LABELS) {
    if (pct >= min) return label;
  }
  return CONFIDENCE_LABELS[CONFIDENCE_LABELS.length - 1].label;
}

// ─── Check-in arousal sets (reply-pagina logica) ─────────────────────────────

export const HIGH_AROUSAL_LABELS = new Set([
  "Overbelast",
  "Te veel",
  "Ontplofbaar",
  "Meltdown-gevaar",
  "Niet meer praten",
  "Irriteerbaar",
]);

export const MEDIUM_AROUSAL_LABELS = new Set([
  "Onrustig",
  "Geprikkeld",
  "Snelle gedachten",
]);

// ─── Stijlprofiel-pagina (/style) ────────────────────────────────────────────

export const STYLE_PAGE = {
  eyebrow: "Stijlprofiel",
  heading: "Beschrijf je stijl",
  headingEm: "stijl",
  subtitle:
    "Kies je communicatievoorkeuren. We maken een natuurlijke uitleg die je kunt delen met een match.",
  preferencesLegend: "Mijn voorkeuren",
  submitIdle: "Genereer uitleg →",
  submitBusy: "Bezig met schrijven...",
  loadingText: "Even geduld, we schrijven varianten...",
  errorGeneric: "Er ging iets mis. Probeer het opnieuw.",
  resultsHeading: "Jouw stijl in woorden",

  preferences: [
    "Duidelijke vragen met opties",
    "Expliciete intenties",
    "Korte concrete zinnen",
    "Geen verborgen verwachtingen",
  ] as string[],
} as const;
