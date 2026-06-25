import {
  NavBar,
  NavLink,
  HeroBand,
  BodyMd,
  ButtonPrimary,
  ButtonSecondary,
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
    <div style={{ background: "#fafafa", minHeight: "100vh" }}>
      <NavBar>
        <span style={{ fontWeight: 600, fontSize: 20, color: "#171717" }}>
          verificat.xyz
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <NavLink href="#cum-functioneaza">Cum funcționează</NavLink>
          <NavLink href="#arhitectura">Arhitectură</NavLink>
          <NavLink href="#descarca">Instalare</NavLink>
        </div>
      </NavBar>

      <HeroBand>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            padding: "0 24px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Geist Sans', Arial, sans-serif",
              fontSize: 48,
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "-2.4px",
              margin: 0,
              color: "#171717",
            }}
          >
            Verifică afirmațiile din media
            <br />
            în timp real
          </h1>
          <BodyMd style={{ color: "#4d4d4d", maxWidth: 600 }}>
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
              <ButtonPrimary id="btn-hero-download">
                Instalează Extensia
              </ButtonPrimary>
            </a>
            <a href="#cum-functioneaza" style={{ textDecoration: "none" }}>
              <ButtonSecondary id="btn-hero-howitworks">
                Cum funcționează?
              </ButtonSecondary>
            </a>
          </div>
        </div>
      </HeroBand>

      <LogoStrip>
        <span style={{ color: "#8f8f8f", fontSize: 14 }}>
          Surse verificate:
        </span>
        <span style={{ color: "#8f8f8f" }}>INS</span>
        <span style={{ color: "#8f8f8f" }}>BNR</span>
        <span style={{ color: "#8f8f8f" }}>Transelectrica</span>
        <span style={{ color: "#8f8f8f" }}>SEAP</span>
      </LogoStrip>

      <section
        id="cum-functioneaza"
        style={{ background: "#fafafa", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <HeadingLg as="h2" style={{ color: "#171717" }}>
            Pipeline-ul modular de verificare
          </HeadingLg>
          <BodyMd
            style={{
              color: "#4d4d4d",
              maxWidth: 600,
              margin: "16px auto 48px",
            }}
          >
            Verificarea nu este determinată de un singur apel LLM opac. Procesul
            este descompus în etape independente, auditate și verificate.
          </BodyMd>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              textAlign: "left",
            }}
          >
            {steps.map((s, i) => (
              <FeatureCard key={i}>
                <MonoEyebrow style={{ color: "#8f8f8f" }}>
                  {s.eyebrow}
                </MonoEyebrow>
                <HeadingMd as="h3" style={{ color: "#171717", marginTop: 8 }}>
                  {s.title}
                </HeadingMd>
                <BodyMd style={{ color: "#4d4d4d", marginTop: 8 }}>
                  {s.desc}
                </BodyMd>
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      <section
        id="arhitectura"
        style={{ background: "#fafafa", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <HeadingLg as="h2" style={{ color: "#171717" }}>
            Arhitectură deschisă
          </HeadingLg>
          <BodyMd
            style={{
              color: "#4d4d4d",
              maxWidth: 600,
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

      <CTABand id="descarca">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <HeadingLg as="h2" style={{ color: "#171717", marginBottom: 16 }}>
            Instalează verificat.xyz
          </HeadingLg>
          <BodyMd
            style={{ color: "#4d4d4d", maxWidth: 500, margin: "0 auto 24px" }}
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
              <ButtonPrimary id="btn-download-chrome">
                Extensia Chrome
              </ButtonPrimary>
            </a>
            <a href="#" style={{ textDecoration: "none" }}>
              <ButtonSecondary id="btn-download-firefox">
                Add-on Firefox
              </ButtonSecondary>
            </a>
          </div>
        </div>
      </CTABand>

      <FooterBand>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 160,
          }}
        >
          <span style={{ fontWeight: 600, color: "#171717", fontSize: 16 }}>
            verificat.xyz
          </span>
          <span>
            &copy; {new Date().getFullYear()} FactCheck.ro. Toate drepturile
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
          <span style={{ fontWeight: 500, color: "#171717" }}>Legal</span>
          <a
            href="/privacy"
            style={{ color: "#8f8f8f", textDecoration: "none" }}
          >
            Politica de confidențialitate
          </a>
          <a href="/terms" style={{ color: "#8f8f8f", textDecoration: "none" }}>
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
          <span style={{ fontWeight: 500, color: "#171717" }}>Produs</span>
          <a
            href="#descarca"
            style={{ color: "#8f8f8f", textDecoration: "none" }}
          >
            Descarcă extensia
          </a>
          <a
            href="/cum-functioneaza"
            style={{ color: "#8f8f8f", textDecoration: "none" }}
          >
            Cum funcționează
          </a>
        </div>
      </FooterBand>
    </div>
  );
}
