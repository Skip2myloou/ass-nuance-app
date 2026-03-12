import Link from "next/link";
export default function Home() {
  return (
    <>
      <section className="lp-hero">
        <div className="lp-container">
          <div className="lp-hero-inner">
            <div className="lp-hero-text">
              <div className="lp-eyebrow">
                <span className="lp-eyebrow-dot" />
                Voor als een bericht je blijft bezighouden
              </div>
              <h1 className="lp-display">
                Begrijp je niet altijd<br />wat de ander <em>bedoelt?</em>
              </h1>
              <p className="lp-subtitle">
                LiteralPause helpt je zien wat er staat, wat het kan betekenen,
                en hoe je kunt reageren. Stap voor stap.
              </p>
              <div className="lp-actions">
                <Link href="/reply" className="btn btn-primary btn-big">Probeer het uit →</Link>
                <Link href="#hoe-het-werkt" className="btn btn-ghost btn-big">Wat is het precies?</Link>
              </div>
              <div className="lp-trust">
                <div className="lp-trust-dots">
                  <span style={{ background: "var(--green)" }} />
                  <span style={{ background: "var(--yellow)" }} />
                  <span style={{ background: "var(--red)" }} />
                </div>
                <p>Wat staat er? · Wat kan het betekenen? · Kies je antwoord</p>
              </div>
            </div>
            <div className="lp-mockup-wrap">
              <div className="lp-phone">
                <div className="lp-screen lp-screen-framework">
                  <div className="lp-incoming-message">
                    <span className="lp-incoming-label">bericht</span>
                    <p className="lp-incoming-text">&ldquo;Hey, het gaat me niet lukken vanavond, &hellip;&rdquo;</p>
                  </div>
                  <div className="lp-framework-icon">💬</div>
                  <p className="lp-framework-title">LiteralPause</p>
                  <div className="lp-framework-steps">
                    <div className="lp-pill lp-pill-active">01 · Wat staat er?</div>
                    <div className="lp-pill">02 · Wat kan het betekenen?</div>
                    <div className="lp-pill">03 · Kies je antwoord</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="lp-divider" />
      <section className="lp-section lp-section-alt">
        <div className="lp-container-narrow">
          <div className="t-label" style={{ marginBottom: 16 }}>Aanleiding</div>
          <h2 className="lp-heading" style={{ marginBottom: 48 }}>Waarom LiteralPause bestaat</h2>
          <div className="lp-why-card">
            <div className="lp-why-row">
              <div className="lp-why-arrow">→</div>
              <p>Berichten roepen vaak <strong>direct een gevoel of interpretatie</strong> op, soms voordat je er erg in hebt.</p>
            </div>
            <div className="lp-why-row">
              <div className="lp-why-arrow">→</div>
              <p>Die interpretatie beïnvloedt hoe je reageert, wat je zegt, en hoe een gesprek verder gaat.</p>
            </div>
            <div className="lp-why-row">
              <div className="lp-why-arrow">→</div>
              <p>LiteralPause maakt die lagen zichtbaar, zodat je <strong>bewuster kunt kiezen</strong> wat je doet.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="lp-divider" />
      <section className="lp-section" id="hoe-het-werkt">
        <div className="lp-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="t-label" style={{ marginBottom: 14 }}>Het model</div>
            <h2 className="lp-heading" style={{ marginBottom: 12 }}>Hoe LiteralPause werkt</h2>
            <p className="lp-muted">Drie heldere stappen, van automatische reactie naar bewuste keuze.</p>
          </div>
          <div className="lp-steps-grid">
            <div className="lp-step-card">
              <div className="lp-step-number">01</div>
              <h3 className="lp-step-title">Wat staat er?</h3>
              <p className="lp-step-desc">Wat staat er letterlijk? Los van gevoel of aanname.</p>
            </div>
            <div className="lp-step-card">
              <div className="lp-step-number">02</div>
              <h3 className="lp-step-title">Wat kan het betekenen?</h3>
              <p className="lp-step-desc">Meerdere lezingen naast elkaar. Zonder één te kiezen.</p>
            </div>
            <div className="lp-step-card">
              <div className="lp-step-number">03</div>
              <h3 className="lp-step-title">Kies je antwoord</h3>
              <p className="lp-step-desc">Drie stijlen. Jij kiest bewust wat past bij dit moment.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="lp-divider" />
      <section className="lp-section lp-section-alt">
        <div className="lp-container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="t-label" style={{ marginBottom: 14 }}>In de praktijk</div>
            <h2 className="lp-heading">Zo werkt het</h2>
          </div>
          <div className="lp-mockups-grid">
            <div className="lp-mockup-col">
              <div className="lp-phone">
                <div className="lp-screen lp-app-screen">
                  <div className="lp-mock-label">Stap 01</div>
                  <h3>Wat staat er?</h3>
                  <p>Plak het bericht. We analyseren wat er staat en wat het kan betekenen.</p>
                  <label>Ontvangen bericht</label>
                  <div className="lp-textarea-mock">"Hey, ja hoor. Hele drukke tijd. Niet veel behoefte aan contacten."</div>
                  <button className="lp-cta-soft" style={{ background: "var(--accent)" }}>Analyseer →</button>
                </div>
              </div>
              <p className="lp-mock-caption">Plak het bericht. Geen account nodig.</p>
            </div>
            <div className="lp-mockup-col">
              <div className="lp-phone">
                <div className="lp-screen lp-app-screen">
                  <div className="lp-mock-label">Stap 02</div>
                  <h3>Wat kan het betekenen?</h3>
                  <div className="lp-message-box">
                    <div className="lp-message-tag">Bericht</div>
                    <p>"Hey, ja hoor. Hele drukke tijd. Niet veel behoefte aan contacten."</p>
                  </div>
                  <div className="lp-option">Ze zijn oprecht overweldigd en trekken zich tijdelijk terug.</div>
                  <div className="lp-option lp-option-selected">Ze voelen zich nu niet genoeg verbonden om energie in dit contact te steken.</div>
                  <div className="lp-option">Ze willen eerlijk zijn over hun beperkte capaciteit.</div>
                </div>
              </div>
              <p className="lp-mock-caption">Meerdere lezingen, zonder er één te kiezen.</p>
            </div>
            <div className="lp-mockup-col">
              <div className="lp-phone">
                <div className="lp-screen lp-app-screen">
                  <div className="lp-mock-label">Stap 03</div>
                  <h3>Kies je antwoord</h3>
                  <label>Wat wil je bereiken?</label>
                  <div className="lp-goal-mock">Rustig reageren</div>
                  <div className="lp-response-card">
                    <div className="lp-response-type">🎯 Direct</div>
                    <p>"Begrijpelijk. Laat maar weten als je weer ruimte hebt."</p>
                  </div>
                  <div className="lp-response-card lp-response-selected">
                    <div className="lp-response-type">❤️ Warm</div>
                    <p>"Dat klinkt pittig. Geen druk hoor. Als je tijd hebt, hoor ik het wel."</p>
                  </div>
                  <div className="lp-response-card">
                    <div className="lp-response-type">😉 Speels</div>
                    <p>"Snap ik! Neem je tijd. Ik ben er nog als de rust terugkeert."</p>
                  </div>
                </div>
              </div>
              <p className="lp-mock-caption">Drie stijlen. Eén bewuste keuze.</p>
            </div>
          </div>
        </div>
      </section>
      <div className="lp-divider" />
      <section className="lp-section lp-section-alt">
        <div className="lp-container">

          <div className="spokes-intro">
            <div className="lp-eyebrow-plain">Dieper gaan</div>
            <h2 className="lp-heading">Als je meer wilt weten</h2>
            <p className="lp-muted">
              LiteralPause is het startpunt. Twee aanvullende tools zijn er
              als je een specifieke vraag hebt, niet als verplichte stap.
            </p>
          </div>

          <div className="spokes-grid">

            <Link href="/lens" className="spoke-card">
              <span className="spoke-chip">Verdieping</span>
              <div className="spoke-icon">🔍</div>
              <div className="spoke-name">LensLab</div>
              <div className="spoke-tagline">Hoe leest dit voor anderen?</div>
              <p className="spoke-desc">
                Bekijk hetzelfde bericht door vier perspectieven tegelijk:
                letterlijk, dreigend, sociaal en romantisch.
                Handig als je begrijpt wat er staat, maar niet snapt
                waarom iemand anders reageerde dan verwacht.
              </p>
              <span className="spoke-link">Open LensLab →</span>
            </Link>

            <Link href="/charge" className="spoke-card">
              <span className="spoke-chip">Context</span>
              <div className="spoke-icon">⚡</div>
              <div className="spoke-name">Charge</div>
              <div className="spoke-tagline">Hoeveel heb je vandaag al gegeven?</div>
              <p className="spoke-desc">
                Sociaal contact kost energie, maar niet altijd even veel.
                Charge helpt je patronen te zien in wat je uitput en oplaadt,
                zodat een lege avond na een drukke dag minder verrassing is.
              </p>
              <span className="spoke-link">Open Charge →</span>
            </Link>

          </div>
        </div>
      </section>
      <section className="lp-cta-section">
        <div className="lp-container-narrow" style={{ textAlign: "center" }}>
          <div className="t-label" style={{ color: "rgba(210,190,140,0.8)", marginBottom: 16 }}>Klaar om te beginnen?</div>
          <h2 className="lp-display" style={{ color: "#fff" }}>
            Klaar om te kijken<br />wat er <em style={{ color: "rgba(210,190,140,0.9)" }}>écht staat?</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 16, fontSize: 15 }}>Geen account nodig. Gewoon starten.</p>
          <Link href="/reply" className="lp-btn-inverse">Probeer LiteralPause →</Link>
        </div>
      </section>
    </>
  );
}
