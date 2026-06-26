import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate — verificat.xyz",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-[800px] mx-auto px-6 py-12 text-[#4d4d4d] font-sans">
      <h1 className="text-[20px] font-semibold tracking-[-0.4px] text-[#171717] mb-2">
        Politica de Confidențialitate
      </h1>
      <p className="text-sm text-[#8f8f8f] mb-8">
        Ultima actualizare: 25 iunie 2026
      </p>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          1. Ce date colectăm
        </h2>
        <p className="mb-2 leading-relaxed">
          Când utilizați verificat.xyz, colectăm următoarele categorii de date:
        </p>
        <ul className="list-disc pl-5 space-y-1">
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

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          2. Cum folosim datele
        </h2>
        <p className="mb-2 leading-relaxed">
          Datele colectate sunt utilizate exclusiv pentru:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Furnizarea serviciului de verificare a afirmațiilor</li>
          <li>Îmbunătățirea acurateții și performanței sistemului</li>
          <li>Asistență și soluționarea problemelor tehnice</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          3. Stocarea și securitatea datelor
        </h2>
        <p className="leading-relaxed">
          Datele sunt stocate pe servere securizate în Uniunea Europeană.
          Utilizăm criptare în tranzit (TLS) și în repaus. Accesul la date este
          restricționat conform principiului minimului privilegiu.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          4. Drepturile dumneavoastră (GDPR)
        </h2>
        <p className="mb-2 leading-relaxed">
          În conformitate cu Regulamentul General privind Protecția Datelor,
          aveți următoarele drepturi:
        </p>
        <ul className="list-disc pl-5 space-y-1">
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
        <p className="mt-2 leading-relaxed">
          Pentru exercitarea acestor drepturi, ne puteți contacta la{" "}
          <a href="mailto:privacy@verificat.xyz" className="text-[#0070f3]">
            privacy@verificat.xyz
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          5. Cookie-uri
        </h2>
        <p className="leading-relaxed">
          Folosim cookie-uri esențiale pentru funcționarea site-ului.
          Cookie-urile non-esențiale (analytics) sunt activate doar după
          consimțământul dumneavoastră explicit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold tracking-[-0.4px] text-[#171717] mb-2">
          6. Contact
        </h2>
        <p className="leading-relaxed">
          Pentru întrebări legate de confidențialitate:{" "}
          <a href="mailto:privacy@verificat.xyz" className="text-[#0070f3]">
            privacy@verificat.xyz
          </a>
        </p>
      </section>
    </main>
  );
}
