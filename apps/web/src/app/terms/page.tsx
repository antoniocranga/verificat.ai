import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și Condiții — verificat.xyz",
};

export default function TermsPage() {
  return (
    <main className="max-w-[800px] mx-auto px-6 py-12 text-[#4d4d4d] font-sans">
      <h1 className="text-[20px] font-semibold tracking-[-0.4px] text-[#171717] mb-2">
        Termeni și Condiții
      </h1>
      <p className="text-sm text-[#8f8f8f] mb-8">
        Ultima actualizare: 25 iunie 2026
      </p>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          1. Serviciul
        </h2>
        <p className="leading-relaxed">
          verificat.xyz oferă un asistent de verificare a afirmațiilor din
          media, utilizând procesare avansată de limbaj natural și căutare
          semantică. Serviciul este furnizat &quot;ca atare&quot; și nu
          garantează acuratețea absolută a verdictelor.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          2. Utilizarea serviciului
        </h2>
        <p className="mb-2 leading-relaxed">
          Prin utilizarea serviciului, sunteți de acord să:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Nu încărcați conținut ilegal sau care încalcă drepturile terților
          </li>
          <li>
            Nu încercați să destabilizați sau să supraîncărcați infrastructura
          </li>
          <li>Utilizați serviciul conform scopului său declarat</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          3. Limitarea răspunderii
        </h2>
        <p className="leading-relaxed">
          Verdictele furnizate de verificat.xyz sunt generate automat și nu
          reprezintă adevăr absolut. Recomandăm verificarea încrucișată a
          informațiilor din surse multiple. Nu ne asumăm răspunderea pentru
          deciziile luate pe baza verdictelor furnizate.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          4. Proprietatea intelectuală
        </h2>
        <p className="leading-relaxed">
          Toate drepturile de proprietate intelectuală asupra platformei
          verificat.xyz aparțin echipei de dezvoltare. Conținutul generat de
          utilizatori rămâne proprietatea utilizatorilor.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          5. Contact
        </h2>
        <p className="leading-relaxed">
          Pentru întrebări legate de termeni:{" "}
          <a href="mailto:legal@verificat.xyz" className="text-[#0070f3]">
            legal@verificat.xyz
          </a>
        </p>
      </section>
    </main>
  );
}
