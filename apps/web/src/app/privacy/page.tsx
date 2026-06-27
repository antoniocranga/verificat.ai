import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate — verificat.ai",
  description:
    "Politica de confidențialitate verificat.ai — cum colectăm, utilizăm și protejăm datele dumneavoastră.",
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

const linkStyle: React.CSSProperties = {
  color: "var(--color-blue)",
  textDecoration: "none",
};

export default function PrivacyPage() {
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
          verificat.ai
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
          Politica de Confidențialitate
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
        Politica de Confidențialitate
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
            ["#ce-date", "Ce date colectăm"],
            ["#cum-folosim", "Cum folosim datele"],
            ["#stocare", "Stocarea și securitatea datelor"],
            ["#gdpr", "Drepturile dumneavoastră (GDPR)"],
            ["#cookie", "Cookie-uri"],
            ["#contact", "Contact"],
          ].map(([href, label]) => (
            <li key={href} style={{ marginBottom: "var(--space-2, 8px)" }}>
              <a href={href} style={linkStyle}>
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Section 1 */}
      <section id="ce-date" style={{ marginBottom: "var(--space-10, 40px)" }}>
        <h2 style={sectionHeadingStyle}>1. Ce date colectăm</h2>
        <p style={bodyStyle}>
          Când utilizați verificat.ai, colectăm următoarele categorii de date:
        </p>
        <ul style={listStyle}>
          <li>
            <strong style={{ fontWeight: 600 }}>Date cont:</strong> adresa de
            email și numele (dacă vă creați un cont).
          </li>
          <li>
            <strong style={{ fontWeight: 600 }}>Conținut audio:</strong>{" "}
            înregistrări audio procesate în timp real pentru verificarea
            afirmațiilor. Audirile nu sunt stocate după procesare, cu excepția
            cazului în care alegeți în mod explicit să salvați verificarea.
          </li>
          <li>
            <strong style={{ fontWeight: 600 }}>Date de utilizare:</strong>{" "}
            statistici anonime despre interacțiunile cu extensia și site-ul web.
          </li>
        </ul>
      </section>

      {/* Section 2 */}
      <section
        id="cum-folosim"
        style={{ marginBottom: "var(--space-10, 40px)" }}
      >
        <h2 style={sectionHeadingStyle}>2. Cum folosim datele</h2>
        <p style={bodyStyle}>
          Datele colectate sunt utilizate exclusiv pentru:
        </p>
        <ul style={listStyle}>
          <li>Furnizarea serviciului de verificare a afirmațiilor</li>
          <li>Îmbunătățirea acurateții și performanței sistemului</li>
          <li>Asistență și soluționarea problemelor tehnice</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="stocare" style={{ marginBottom: "var(--space-10, 40px)" }}>
        <h2 style={sectionHeadingStyle}>3. Stocarea și securitatea datelor</h2>
        <p style={bodyStyle}>
          Datele sunt stocate pe servere securizate în Uniunea Europeană.
          Utilizăm criptare în tranzit (TLS) și în repaus. Accesul la date este
          restricționat conform principiului minimului privilegiu.
        </p>
      </section>

      {/* Section 4 */}
      <section id="gdpr" style={{ marginBottom: "var(--space-10, 40px)" }}>
        <h2 style={sectionHeadingStyle}>4. Drepturile dumneavoastră (GDPR)</h2>
        <p style={bodyStyle}>
          În conformitate cu Regulamentul General privind Protecția Datelor,
          aveți următoarele drepturi:
        </p>
        <ul style={listStyle}>
          <li>
            Dreptul de acces — puteți solicita o copie a datelor dumneavoastră
          </li>
          <li>
            Dreptul la ștergerea datelor (&ldquo;dreptul de a fi uitat&rdquo;)
          </li>
          <li>Dreptul la rectificarea datelor incorecte</li>
          <li>Dreptul la portabilitatea datelor</li>
          <li>Dreptul de a vă opune prelucrării</li>
        </ul>
        <p style={bodyStyle}>
          Pentru exercitarea acestor drepturi, ne puteți contacta la{" "}
          <a href="mailto:privacy@verificat.ai" style={linkStyle}>
            privacy@verificat.ai
          </a>
          .
        </p>
      </section>

      {/* Section 5 */}
      <section id="cookie" style={{ marginBottom: "var(--space-10, 40px)" }}>
        <h2 style={sectionHeadingStyle}>5. Cookie-uri</h2>
        <p style={bodyStyle}>
          Folosim cookie-uri esențiale pentru funcționarea site-ului.
          Cookie-urile non-esențiale (analytics) sunt activate doar după
          consimțământul dumneavoastră explicit.
        </p>
      </section>

      {/* Section 6 */}
      <section id="contact" style={{ marginBottom: "var(--space-10, 40px)" }}>
        <h2 style={sectionHeadingStyle}>6. Contact</h2>
        <p style={bodyStyle}>
          Pentru întrebări legate de confidențialitate:{" "}
          <a href="mailto:privacy@verificat.ai" style={linkStyle}>
            privacy@verificat.ai
          </a>
        </p>
      </section>
    </main>
  );
}
