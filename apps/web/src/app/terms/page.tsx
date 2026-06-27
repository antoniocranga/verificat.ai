import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termeni și Condiții — verificat.xyz",
  description:
    "Termenii și condițiile de utilizare a serviciului verificat.xyz.",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontWeight: 600,
  fontSize: 20,
  letterSpacing: "-0.02em",
  color: "var(--color-ink)",
  margin: "0 0 var(--space-3, 12px)",
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 16,
  lineHeight: 1.75,
  color: "var(--color-ink)",
  margin: "0 0 var(--space-4, 16px)",
};

const listStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 16,
  lineHeight: 1.75,
  color: "var(--color-ink)",
  paddingLeft: "var(--space-6, 24px)",
  margin: "0 0 var(--space-4, 16px)",
};

export default function TermsPage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding:
          "var(--space-24, 96px) var(--space-6, 24px) var(--space-16, 64px)",
      }}
    >
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{ marginBottom: "var(--space-8, 32px)" }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--color-mid)",
            textDecoration: "none",
          }}
        >
          verificat.xyz
        </Link>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--color-mid)",
            margin: "0 var(--space-2, 8px)",
          }}
        >
          →
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--color-ink)",
          }}
        >
          Termeni și Condiții
        </span>
      </nav>

      {/* Title */}
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: "-0.03em",
          color: "var(--color-ink)",
          margin: "0 0 var(--space-3, 12px)",
        }}
      >
        Termeni și Condiții
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--color-mid)",
          margin: "0 0 var(--space-12, 48px)",
        }}
      >
        Ultima actualizare: 25 iunie 2026
      </p>

      {/* Anchor nav */}
      <nav
        aria-label="Conținut"
        style={{
          background: "var(--color-canvas-inset)",
          border: "1px solid var(--color-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-5, 20px) var(--space-6, 24px)",
          marginBottom: "var(--space-12, 48px)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-mid)",
            margin: "0 0 var(--space-3, 12px)",
          }}
        >
          Cuprins
        </p>
        <ol style={{ ...listStyle, margin: 0 }}>
          {[
            ["#serviciul", "Serviciul"],
            ["#utilizare", "Utilizarea serviciului"],
            ["#raspundere", "Limitarea răspunderii"],
            ["#proprietate", "Proprietatea intelectuală"],
            ["#contact", "Contact"],
          ].map(([href, label]) => (
            <li key={href} style={{ marginBottom: "var(--space-2, 8px)" }}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Section 1 */}
      <section id="serviciul" style={{ marginBottom: "var(--space-10, 40px)" }}>
        <h2 style={sectionHeadingStyle}>1. Serviciul</h2>
        <p style={bodyStyle}>
          verificat.xyz oferă un asistent de verificare a afirmațiilor din
          media, utilizând procesare avansată de limbaj natural și căutare
          semantică. Serviciul este furnizat &ldquo;ca atare&rdquo; și nu
          garantează acuratețea absolută a verdictelor.
        </p>
      </section>

      {/* Section 2 */}
      <section id="utilizare" style={{ marginBottom: "var(--space-10, 40px)" }}>
        <h2 style={sectionHeadingStyle}>2. Utilizarea serviciului</h2>
        <p style={bodyStyle}>
          Prin utilizarea serviciului, sunteți de acord să:
        </p>
        <ul style={listStyle}>
          <li>
            Nu încărcați conținut ilegal sau care încalcă drepturile terților
          </li>
          <li>
            Nu încercați să destabilizați sau să supraîncărcați infrastructura
          </li>
          <li>Utilizați serviciul conform scopului său declarat</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section
        id="raspundere"
        style={{ marginBottom: "var(--space-10, 40px)" }}
      >
        <h2 style={sectionHeadingStyle}>3. Limitarea răspunderii</h2>
        <p style={bodyStyle}>
          Verdictele furnizate de verificat.xyz sunt generate automat și nu
          reprezintă adevăr absolut. Recomandăm verificarea încrucișată a
          informațiilor din surse multiple. Nu ne asumăm răspunderea pentru
          deciziile luate pe baza verdictelor furnizate.
        </p>
      </section>

      {/* Section 4 */}
      <section
        id="proprietate"
        style={{ marginBottom: "var(--space-10, 40px)" }}
      >
        <h2 style={sectionHeadingStyle}>4. Proprietatea intelectuală</h2>
        <p style={bodyStyle}>
          Toate drepturile de proprietate intelectuală asupra platformei
          verificat.xyz aparțin echipei de dezvoltare. Conținutul generat de
          utilizatori rămâne proprietatea utilizatorilor.
        </p>
      </section>

      {/* Section 5 */}
      <section id="contact" style={{ marginBottom: "var(--space-10, 40px)" }}>
        <h2 style={sectionHeadingStyle}>5. Contact</h2>
        <p style={bodyStyle}>
          Pentru întrebări legate de termeni:{" "}
          <a href="mailto:legal@verificat.xyz">legal@verificat.xyz</a>
        </p>
      </section>
    </main>
  );
}
