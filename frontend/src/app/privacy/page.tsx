import Link from "next/link";
import { BACK } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <main className="container" style={{ maxWidth: 640, paddingTop: 48, paddingBottom: 80 }}>
      <Link href="/" className="back">{BACK.toHome}</Link>

      <h1 style={{ marginTop: 24, marginBottom: 8 }}>
        Privacybeleid
      </h1>
      <p style={{ color: "var(--ink-500)", fontSize: 14, marginBottom: 40 }}>
        Laatst bijgewerkt: maart 2026
      </p>

      <section style={{ marginBottom: 36 }}>
        <h2>Wat we verzamelen</h2>
        <p>
          Als je een bericht invult, sturen we die tekst naar de AI om een analyse
          of reactie te genereren. Verder slaan we in je browser op: je
          check-in-scores (de schuifregelaar) en of je de uitleg al hebt gezien.
          Dat is alles.
        </p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2>Wat we ermee doen</h2>
        <p>
          De tekst die je invoert wordt direct doorgestuurd naar de AI-dienst
          (Anthropic Claude) om jouw antwoord te genereren. Het resultaat wordt
          teruggegeven aan jouw scherm. Daarna is het weg.
        </p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2>Wat we <em>niet</em> doen</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li>We slaan berichten niet op in een database.</li>
          <li>We gebruiken jouw berichten niet om AI-modellen te trainen.</li>
          <li>We verkopen geen gegevens aan derden.</li>
          <li>We plaatsen geen tracking-cookies of advertenties.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2>Contact</h2>
        <p>
          Heb je een vraag over je privacy of wil je dat we iets verwijderen?
          Stuur een e-mail naar{" "}
          <a href="mailto:privacy@literalpause.nl">privacy@literalpause.nl</a>.
          We reageren binnen vijf werkdagen.
        </p>
      </section>
    </main>
  );
}
