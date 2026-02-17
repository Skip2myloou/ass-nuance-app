import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <h1>Nuance Coach</h1>
      <p className="subtitle">
        Hulp bij het begrijpen van datingberichten en het opstellen van
        antwoorden.
      </p>

      <div className="home-actions">
        <Link href="/interpret" className="btn btn-primary btn-big">
          Begrijp bericht
        </Link>
        <Link href="/reply" className="btn btn-outline btn-big">
          Maak antwoord
        </Link>
        <Link href="/style" className="btn btn-outline btn-big">
          Beschrijf je stijl
        </Link>
      </div>
    </main>
  );
}
