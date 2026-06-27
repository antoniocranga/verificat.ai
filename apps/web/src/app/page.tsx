import {
  HeroBand,
  BodyMd,
  FeatureCard,
  HeadingMd,
  HeadingLg,
  LogoStrip,
  FooterBand,
  Logo,
} from "@verificat/ui";
import { SiteNav } from "../components/SiteNav";
import { DemoVerdictCard } from "../components/DemoVerdictCard";
import { PlatformButton } from "../components/PlatformButton";
import { HoverButton } from "../components/HoverButton";
import { FooterCookieButton } from "../components/FooterCookieButton";

// ── Platform store links from environment ─────────────────────
const STORE_CHROME   = process.env.NEXT_PUBLIC_STORE_CHROME;
const STORE_FIREFOX  = process.env.NEXT_PUBLIC_STORE_FIREFOX;
const STORE_EDGE     = process.env.NEXT_PUBLIC_STORE_EDGE;
const STORE_IOS      = process.env.NEXT_PUBLIC_STORE_IOS;
const STORE_ANDROID  = process.env.NEXT_PUBLIC_STORE_ANDROID;

// ── SVG logos (Simple Icons, monochrome) ─────────────────────
function ChromeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="32" height="32">
      <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 10.545a1.455 1.455 0 1 0 0 2.91 1.455 1.455 0 0 0 0-2.91z"/>
    </svg>
  );
}

function FirefoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="32" height="32">
      <path d="M7.238 23.928C3.296 22.083 1.5 17.83 1.5 14.018 1.5 8.424 5.916 4.5 10.854 4.5c-3.54 0-6.354 2.686-6.354 6.227a6.229 6.229 0 0 0 6.229 6.228c2.52 0 4.694-1.494 5.695-3.645-.636 4.154-3.9 7.403-7.854 7.85 2.34 1.395 5.1 1.878 7.8 1.392-.84.346-1.755.517-2.682.517a10.002 10.002 0 0 1-4.45-.141zm8.312-2.03a9.924 9.924 0 0 0 5.7-5.616A6.229 6.229 0 0 1 15.021 22.5a9.884 9.884 0 0 0 .53-.601zm5.25-8.716c0 5.523-4.477 10-10 10S0.8 18.705.8 13.182a9.943 9.943 0 0 1 1.84-5.818C3.64 4.68 7.12 2.5 11 2.5c4.97 0 9.8 3.93 9.8 10.682z"/>
    </svg>
  );
}

function EdgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="32" height="32">
      <path d="M21.86 17.86c-.35.19-.71.35-1.09.48a9.55 9.55 0 0 1-3.15.52 9.08 9.08 0 0 1-6.41-2.5 6.54 6.54 0 0 0 4.7 1.96c3.87 0 5.86-2.68 5.86-5.58 0-1.8-.74-3.61-2.07-4.93A9.45 9.45 0 0 0 12 5a9.5 9.5 0 0 0-9.5 9.5C2.5 19.74 6.76 24 12 24c3.68 0 6.89-2.09 8.55-5.17.05-.09-.55.19-.69.27V17.86zM12 3.5c.91 0 1.79.13 2.63.37A9.54 9.54 0 0 0 7.19 9.5c0 4.72 3.41 8.64 7.93 9.38H12a8 8 0 0 1 0-16z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="32" height="32">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="32" height="32">
      <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.13V22.95a1.49 1.49 0 0 0 .112.13l.053.058 12.418-12.418v-.297L1.39.866l-.053.058zM14.425 19.39l-4.131-4.131v-.29l4.107-4.107.064.036 4.889 2.771c1.396.791 1.396 2.085 0 2.877l-4.929 2.795v.049zm-13.08 3.655l.88.498 13.2-13.2-.88-.88L1.345 23.045z"/>
    </svg>
  );
}

// ── "How it works" steps ───────────────────────────────────────
const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Apasă înregistrare",
    desc: "Atingeți microfonul. verificat.ai începe să asculte imediat, cu acord explicit obținut la fiecare sesiune.",
  },
  {
    step: "02",
    title: "Afirmație detectată",
    desc: "De îndată ce o afirmație verificabilă este rostită, pipeline-ul o identifică și extrage entitățile factuale.",
  },
  {
    step: "03",
    title: "Verdict în secunde",
    desc: "Adevărat, Înșelător sau Fals — cu surse citate și explicație clară, înainte ca vorbitorul să termine fraza.",
  },
];

export default function Home() {
  return (
    <div style={{ background: "var(--color-canvas)", minHeight: "100vh" }}>
      {/* ── Navigation ─────────────────────────────────────────── */}
      <SiteNav />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <HeroBand>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-16, 64px)",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Left: copy */}
          <div>
            <h1
              className="heading-display"
              style={{
                fontSize: "clamp(36px, 5.5vw, 56px)",
                margin: "0 0 var(--space-6, 24px)",
                letterSpacing: "-0.04em",
              }}
            >
              verificat.ai verifică
              <br />
              afirmații în{" "}
              <span style={{ color: "var(--color-accent)" }}>timp real</span>.
            </h1>

            <BodyMd
              style={{
                color: "var(--color-mid)",
                maxWidth: 480,
                lineHeight: 1.7,
                marginBottom: "var(--space-8, 32px)",
              }}
            >
              Auziți o afirmație la TV, radio sau podcast — verificat.ai vă
              spune dacă este adevărată înainte ca segmentul să se termine.
            </BodyMd>

            <div
              style={{
                display: "flex",
                gap: "var(--space-3, 12px)",
                flexWrap: "wrap",
              }}
            >
              <HoverButton
                id="btn-hero-try"
                href="/login"
                variant="primary"
                hoverBg="#2a2a28"
              >
                Încearcă gratuit
              </HoverButton>

              <HoverButton
                id="btn-hero-how"
                href="#cum-functioneaza"
                variant="secondary"
              >
                Cum funcționează
              </HoverButton>
            </div>
          </div>

          {/* Right: live demo card */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DemoVerdictCard />
          </div>
        </div>

        {/* Responsive hero grid styles */}
        <style>{`
          .hero-grid {
            grid-template-columns: 1fr 1fr;
          }
          @media (max-width: 767px) {
            .hero-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </HeroBand>

      {/* ── Social proof / sources strip ───────────────────────── */}
      <LogoStrip id="surse-verificate">
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-mid)",
          }}
        >
          Surse verificate:
        </span>
        {["INS", "BNR", "Transelectrica", "SEAP", "Eurostat"].map((name) => (
          <span
            key={name}
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--color-mid)",
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </span>
        ))}
      </LogoStrip>

      {/* ── How it works ───────────────────────────────────────── */}
      <section
        id="cum-functioneaza"
        style={{
          background: "var(--color-canvas)",
          padding: "var(--space-24, 96px) var(--space-6, 24px)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-16, 64px)" }}>
            <HeadingLg as="h2" style={{ marginBottom: "var(--space-4, 16px)" }}>
              Cum funcționează
            </HeadingLg>
            <BodyMd
              style={{
                color: "var(--color-mid)",
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              Verificarea nu este un singur apel LLM opac. Procesul este
              descompus în etape independente, auditate și explicate.
            </BodyMd>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--space-5, 20px)",
              position: "relative",
            }}
          >
            {HOW_IT_WORKS_STEPS.map((step) => (
              <FeatureCard key={step.step} hover id={`step-${step.step}`}>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: 48,
                    color: "var(--color-accent)",
                    lineHeight: 1,
                    marginBottom: "var(--space-4, 16px)",
                  }}
                  aria-hidden="true"
                >
                  {step.step}
                </div>
                <HeadingMd
                  as="h3"
                  style={{ fontSize: 20, marginBottom: "var(--space-3, 12px)" }}
                >
                  {step.title}
                </HeadingMd>
                <BodyMd style={{ color: "var(--color-mid)", marginTop: 0 }}>
                  {step.desc}
                </BodyMd>
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform install section ────────────────────────────── */}
      <section
        id="platforme"
        style={{
          background: "var(--color-canvas-inset)",
          padding: "var(--space-24, 96px) var(--space-6, 24px)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <HeadingLg as="h2" style={{ marginBottom: "var(--space-4, 16px)" }}>
            Disponibil oriunde asculți
          </HeadingLg>
          <BodyMd
            style={{
              color: "var(--color-mid)",
              maxWidth: 480,
              margin: "0 auto var(--space-12, 48px)",
            }}
          >
            Instalează verificat.ai în browserul sau telefonul tău — funcționează
            oriunde se redă conținut audio.
          </BodyMd>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-4, 16px)",
              justifyContent: "center",
              alignItems: "stretch",
            }}
          >
            <PlatformButton
              id="platform-chrome"
              name="Chrome"
              badge="Browser"
              logo={<ChromeIcon />}
              href={STORE_CHROME}
              comingSoon={!STORE_CHROME}
            />
            <PlatformButton
              id="platform-firefox"
              name="Firefox"
              badge="Browser"
              logo={<FirefoxIcon />}
              href={STORE_FIREFOX}
              comingSoon={!STORE_FIREFOX}
            />
            <PlatformButton
              id="platform-edge"
              name="Edge"
              badge="Browser"
              logo={<EdgeIcon />}
              href={STORE_EDGE}
              comingSoon={!STORE_EDGE}
            />
            <PlatformButton
              id="platform-ios"
              name="iPhone & iPad"
              badge="iOS"
              logo={<AppleIcon />}
              href={STORE_IOS}
              comingSoon={!STORE_IOS}
            />
            <PlatformButton
              id="platform-android"
              name="Android"
              badge="Android"
              logo={<GooglePlayIcon />}
              href={STORE_ANDROID}
              comingSoon={!STORE_ANDROID}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <FooterBand id="footer">
        {/* Column 1: Logo + tagline + copyright */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3, 12px)",
            minWidth: 200,
            flex: "1 1 200px",
          }}
        >
          <Logo variant="dark" size={24} showWordmark href="/" />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--color-mid)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Verificare afirmații în timp real.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--color-mid)",
              margin: 0,
            }}
          >
            &copy; {new Date().getFullYear()} verificat.ai
          </p>
        </div>

        {/* Column 2: Product links */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3, 12px)",
            minWidth: 140,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--color-ink)",
              letterSpacing: "-0.01em",
            }}
          >
            Produs
          </span>
          {[
            { href: "#cum-functioneaza", label: "Cum funcționează" },
            { href: "#platforme", label: "Platforme" },
          ].map((link) => (
            <HoverButton key={link.href} href={link.href} variant="ghost">
              {link.label}
            </HoverButton>
          ))}
        </div>

        {/* Column 3: Legal links */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3, 12px)",
            minWidth: 140,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--color-ink)",
              letterSpacing: "-0.01em",
            }}
          >
            Legal
          </span>
          <HoverButton href="/privacy" variant="ghost">
            Politica de confidențialitate
          </HoverButton>
          <HoverButton href="/terms" variant="ghost">
            Termeni și condiții
          </HoverButton>
          <FooterCookieButton />
        </div>
      </FooterBand>
    </div>
  );
}
