import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate — verificat.xyz",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <h1>Politica de Confidențialitate</h1>
      <p style={{ color: "#94a3b8", marginBottom: 32 }}>
        Ultima actualizare: 25 iunie 2026
      </p>

      <section>
        <h2>1. Ce date colectăm</h2>
        <p>
          Când utilizați verificat.xyz, colectăm următoarele categorii de date:
        </p>
        <ul>
          <li>
            <strong>Date cont:</strong> adresa de email și numele (dacă vă
            creați un cont).
          </li>
          <li>
            <strong>Conținut audio:</strong> înregistrări audio procesate în
            timp real pentru verificarea afirmațiilor. Audiole nu sunt stocate
            după procesare, cu excepția cazului în care alegeți în mod explicit
            să salvați verificarea.
          </li>
          <li>
            <strong>Date de utilizare:</strong> statistici anonime despre
            interacțiunile cu extensia și site-ul web.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Cum folosim datele</h2>
        <p>Datele colectate sunt utilizate exclusiv pentru:</p>
        <ul>
          <li>Furnizarea serviciului de verificare a afirmațiilor</li>
          <li>Îmbunătățirea acurateții și performanței sistemului</li>
          <li>Asistență și soluționarea problemelor tehnice</li>
        </ul>
      </section>

      <section>
        <h2>3. Stocarea și securitatea datelor</h2>
        <p>
          Datele sunt stocate pe servere securizate în Uniunea Europeană.
          Utilizăm criptare în tranzit (TLS) și în repaus. Accesul la date este
          restricționat conform principiului minimului privilegiu.
        </p>
      </section>

      <section>
        <h2>4. Drepturile dumneavoastră (GDPR)</h2>
        <p>
          În conformitate cu Regulamentul General privind Protecția Datelor,
          aveți următoarele drepturi:
        </p>
        <ul>
          <li>
            Dreptul de acces — puteți solicita o copie a datelor dumneavoastră
          </li>
          <li>
            Dreptul la ștergerea datelor (&quot;dreptul de a fi uitat&quot;)
          </li>
          <li>Dreptul la rectificarea datelor incorecte</li>
          <li>Dreptul la portabilitatea datelor</li>
          <li>Dreptul de a vă opune prelucrării</li>
        </ul>
        <p>
          Pentru exercitarea acestor drepturi, ne puteți contacta la{" "}
          <a href="mailto:privacy@verificat.xyz" style={{ color: "#3b82f6" }}>
            privacy@verificat.xyz
          </a>
          .
        </p>
      </section>

      <section>
        <h2>5. Cookie-uri</h2>
        <p>
          Folosim cookie-uri esențiale pentru funcționarea site-ului.
          Cookie-urile non-esențiale (analytics) sunt activate doar după
          consimțământul dumneavoastră explicit.
        </p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>
          Pentru întrebări legate de confidențialitate:{" "}
          <a href="mailto:privacy@verificat.xyz" style={{ color: "#3b82f6" }}>
            privacy@verificat.xyz
          </a>
        </p>
      </section>
    </main>
  );
}
