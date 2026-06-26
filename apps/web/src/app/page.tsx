import {
  NavBar,
  NavLink,
  HeroBand,
  BodyMd,
  Button,
  FeatureCard,
  HeadingMd,
  HeadingLg,
  MonoEyebrow,
  LogoStrip,
  CTABand,
  FooterBand,
  CodeBlock,
} from "@verificat/ui";

const steps = [
  {
    eyebrow: "Pas 01",
    title: "Captură Audio & Text",
    desc: "Capturați direct tab-ul media sau microfonul, cu acord explicit obținut la fiecare sesiune.",
  },
  {
    eyebrow: "Pas 02",
    title: "Speech-to-Text",
    desc: "Transcriere în timp real în limba română folosind modele avansate optimizate pentru diacritice.",
  },
  {
    eyebrow: "Pas 03",
    title: "Detecție Afirmații",
    desc: "Identificarea și extragerea afirmațiilor factuale concrete din discursul normalizat.",
  },
  {
    eyebrow: "Pas 04",
    title: "Căutare Dovezi",
    desc: "Interogare semantică pe surse de încredere, baze de date publice și presă acreditată.",
  },
  {
    eyebrow: "Pas 05",
    title: "Verdict & Explicație",
    desc: "Calcularea verdictului (din 6 stări oficiale) însoțit de argumentare clară și scor de încredere.",
  },
];

export default function Home() {
  return (
    <div
      style={{ background: "var(--color-canvas, #faf9f5)", minHeight: "100vh" }}
    >
      <NavBar>
        <span
          style={{
            fontFamily: "var(--font-display, Poppins, Arial, sans-serif)",
            fontWeight: 700,
            fontSize: 18,
            color: "var(--color-ink, #141413)",
            letterSpacing: "-0.02em",
          }}
        >
          verificat.xyz
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <NavLink href="#cum-functioneaza">Cum funcționează</NavLink>
          <NavLink href="#arhitectura">Arhitectură</NavLink>
          <NavLink href="#descarca">Instalare</NavLink>
        </div>
      </NavBar>

      {/* ── Hero ──────────────────────────────────────────── */}
      <HeroBand>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: "0 24px",
          }}
        >
          <h1
            className="heading-display"
            style={{ fontSize: "clamp(36px, 6vw, 64px)", margin: 0 }}
          >
            Verifică afirmațiile din media
            <br />
            în timp real
          </h1>
          <BodyMd
            style={{
              color: "var(--color-mid, #b0aea5)",
              maxWidth: 560,
            }}
          >
            Un asistent inteligent ce utilizează procesare avansată de limbaj
            natural, căutare semantică și evaluarea încrederii surselor pentru a
            furniza verdicte imediate, clare și bazate pe dovezi.
          </BodyMd>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <a href="#descarca" style={{ textDecoration: "none" }}>
              <Button id="btn-hero-download" variant="accent" size="lg">
                Instalează Extensia
              </Button>
            </a>
            <a href="#cum-functioneaza" style={{ textDecoration: "none" }}>
              <Button id="btn-hero-howitworks" variant="secondary" size="lg">
                Cum funcționează?
              </Button>
            </a>
          </div>
        </div>
      </HeroBand>

      {/* ── Logo strip ────────────────────────────────────── */}
      <LogoStrip>
        <span
          style={{
            color: "var(--color-mid, #b0aea5)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Surse verificate:
        </span>
        <span style={{ color: "var(--color-mid, #b0aea5)", fontWeight: 600 }}>
          INS
        </span>
        <span style={{ color: "var(--color-mid, #b0aea5)", fontWeight: 600 }}>
          BNR
        </span>
        <span style={{ color: "var(--color-mid, #b0aea5)", fontWeight: 600 }}>
          Transelectrica
        </span>
        <span style={{ color: "var(--color-mid, #b0aea5)", fontWeight: 600 }}>
          SEAP
        </span>
      </LogoStrip>

      {/* ── Pipeline section ──────────────────────────────── */}
      <section
        id="cum-functioneaza"
        style={{
          background: "var(--color-canvas, #faf9f5)",
          padding: "96px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <HeadingLg as="h2">Pipeline-ul modular de verificare</HeadingLg>
          <BodyMd
            style={{
              color: "var(--color-mid, #b0aea5)",
              maxWidth: 560,
              margin: "16px auto 48px",
            }}
          >
            Verificarea nu este determinată de un singur apel LLM opac. Procesul
            este descompus în etape independente, auditate și verificate.
          </BodyMd>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              textAlign: "left",
            }}
          >
            {steps.map((s, i) => (
              <FeatureCard key={i} hover>
                <MonoEyebrow style={{ color: "var(--color-accent, #d97757)" }}>
                  {s.eyebrow}
                </MonoEyebrow>
                <HeadingMd as="h3" style={{ marginTop: 12, fontSize: 18 }}>
                  {s.title}
                </HeadingMd>
                <BodyMd
                  style={{
                    color: "var(--color-mid, #b0aea5)",
                    marginTop: 8,
                  }}
                >
                  {s.desc}
                </BodyMd>
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture section ───────────────────────────── */}
      <section
        id="arhitectura"
        style={{
          background: "var(--surface-inset, #f0ede6)",
          padding: "96px 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <HeadingLg as="h2">Arhitectură deschisă</HeadingLg>
          <BodyMd
            style={{
              color: "var(--color-mid, #b0aea5)",
              maxWidth: 560,
              margin: "16px auto 32px",
            }}
          >
            Fiecare componentă a pipeline-ului este auditabilă și extensibilă.
            Codul sursă este disponibil public.
          </BodyMd>
          <CodeBlock>
            {`# Detecția afirmațiilor
claims = extract_claims(transcript)

# Căutare semantică
evidence = semantic_search(claims)

# Evaluare încredere
trust_score = evaluate_source(evidence)

# Verdict final
verdict = calculate_verdict(claims, evidence, trust_score)`}
          </CodeBlock>
        </div>
      </section>

      {/* ── CTA / Download ────────────────────────────────── */}
      <CTABand id="descarca">
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <HeadingLg as="h2" style={{ marginBottom: 16 }}>
            Instalează verificat.xyz
          </HeadingLg>
          <BodyMd
            style={{
              color: "var(--color-mid, #b0aea5)",
              maxWidth: 480,
              margin: "0 auto 28px",
            }}
          >
            Asistentul tău personal de verificare te însoțește oriunde
            navighezi.
          </BodyMd>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <a href="#" style={{ textDecoration: "none" }}>
              <Button id="btn-download-chrome" variant="accent" size="md">
                Extensia Chrome
              </Button>
            </a>
            <a href="#" style={{ textDecoration: "none" }}>
              <Button id="btn-download-firefox" variant="secondary" size="md">
                Add-on Firefox
              </Button>
            </a>
          </div>
        </div>
      </CTABand>

      {/* ── Footer ────────────────────────────────────────── */}
      <FooterBand>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 160,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display, Poppins, Arial, sans-serif)",
              fontWeight: 700,
              color: "var(--color-ink, #141413)",
              fontSize: 15,
              letterSpacing: "-0.02em",
            }}
          >
            verificat.xyz
          </span>
          <span style={{ color: "var(--color-mid, #b0aea5)", fontSize: 13 }}>
            &copy; {new Date().getFullYear()} verificat.xyz. Toate drepturile
            rezervate.
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 160,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display, Poppins, Arial, sans-serif)",
              fontWeight: 600,
              color: "var(--color-ink, #141413)",
              fontSize: 13,
            }}
          >
            Legal
          </span>
          <a
            href="/privacy"
            style={{
              color: "var(--color-mid, #b0aea5)",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Politica de confidențialitate
          </a>
          <a
            href="/terms"
            style={{
              color: "var(--color-mid, #b0aea5)",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Termeni și condiții
          </a>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 160,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display, Poppins, Arial, sans-serif)",
              fontWeight: 600,
              color: "var(--color-ink, #141413)",
              fontSize: 13,
            }}
          >
            Produs
          </span>
          <a
            href="#descarca"
            style={{
              color: "var(--color-mid, #b0aea5)",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Descarcă extensia
          </a>
          <a
            href="/cum-functioneaza"
            style={{
              color: "var(--color-mid, #b0aea5)",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Cum funcționează
          </a>
        </div>
      </FooterBand>
    </div>
  );
}
