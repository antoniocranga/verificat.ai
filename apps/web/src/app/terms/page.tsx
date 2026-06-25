import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și Condiții — verificat.xyz",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <h1>Termeni și Condiții</h1>
      <p style={{ color: "#94a3b8", marginBottom: 32 }}>
        Ultima actualizare: 25 iunie 2026
      </p>

      <section>
        <h2>1. Serviciul</h2>
        <p>
          verificat.xyz oferă un asistent de verificare a afirmațiilor din
          media, utilizând procesare avansată de limbaj natural și căutare
          semantică. Serviciul este furnizat &quot;ca atare&quot; și nu
          garantează acuratețea absolută a verdictelor.
        </p>
      </section>

      <section>
        <h2>2. Utilizarea serviciului</h2>
        <p>Prin utilizarea serviciului, sunteți de acord să:</p>
        <ul>
          <li>
            Nu încărcați conținut ilegal sau care încalcă drepturile terților
          </li>
          <li>
            Nu încercați să destabilizați sau să supraîncărcați infrastructura
          </li>
          <li>Utilizați serviciul conform scopului său declarat</li>
        </ul>
      </section>

      <section>
        <h2>3. Limitarea răspunderii</h2>
        <p>
          Verdictele furnizate de verificat.xyz sunt generate automat și nu
          reprezintă adevăr absolut. Recomandăm verificarea încrucișată a
          informațiilor din surse multiple. Nu ne asumăm răspunderea pentru
          deciziile luate pe baza verdictelor furnizate.
        </p>
      </section>

      <section>
        <h2>4. Proprietatea intelectuală</h2>
        <p>
          Toate drepturile de proprietate intelectuală asupra platformei
          verificat.xyz aparțin echipei de dezvoltare. Conținutul generat de
          utilizatori rămâne proprietatea utilizatorilor.
        </p>
      </section>

      <section>
        <h2>5. Contact</h2>
        <p>
          Pentru întrebări legate de termeni:{" "}
          <a href="mailto:legal@verificat.xyz" style={{ color: "#3b82f6" }}>
            legal@verificat.xyz
          </a>
        </p>
      </section>
    </main>
  );
}
