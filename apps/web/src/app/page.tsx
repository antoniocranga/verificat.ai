"use client";

import { useState } from "react";

interface ClaimMock {
  assertion: string;
  verdict:
    | "True"
    | "Mostly True"
    | "Partially True"
    | "Misleading"
    | "False"
    | "Unverified";
  confidenceScore: number;
  explanation: string;
  citedSources: Array<{
    name: string;
    url: string;
    trustScore: number;
    trustReason: string;
  }>;
}

const mockClaims: ClaimMock[] = [
  {
    assertion:
      "Rata inflației în România a scăzut în decembrie 2023 la sub 7%.",
    verdict: "True",
    confidenceScore: 94,
    explanation:
      "Datele oficiale publicate de Institutul Național de Statistică (INS) și Banca Națională a României (BNR) confirmă că rata anuală a inflației în luna decembrie 2023 a fost de 6.61%, coborând sub pragul de 7%.",
    citedSources: [
      {
        name: "Institutul Național de Statistică",
        url: "https://insse.ro",
        trustScore: 98,
        trustReason:
          "Instituție publică oficială responsabilă cu statisticile naționale.",
      },
      {
        name: "Banca Națională a României",
        url: "https://bnr.ro",
        trustScore: 98,
        trustReason:
          "Bancă centrală națională cu autoritate supremă pe date monetare.",
      },
    ],
  },
  {
    assertion:
      "România produce peste 90% din energia sa electrică din surse eoliene.",
    verdict: "False",
    confidenceScore: 99,
    explanation:
      "Conform raportărilor oficiale Transelectrica, energia eoliană reprezintă o pondere medie anuală cuprinsă doar între 12% și 16% din totalul producției de energie electrică din România. Restul provine din surse hidro, nucleare, gaz, cărbune și solare.",
    citedSources: [
      {
        name: "Transelectrica - Producția în timp real",
        url: "https://transelectrica.ro",
        trustScore: 99,
        trustReason: "Operatorul național de transport de energie electrică.",
      },
    ],
  },
  {
    assertion:
      "Noul drum expres Craiova-Pitești reduce timpul de tranzit la jumătate.",
    verdict: "Mostly True",
    confidenceScore: 82,
    explanation:
      "Pe tronsoanele date deja în folosință (Tronsonul 2 și 3), datele GPS indică o reducere a timpului de deplasare cu aproximativ 42-45% față de vechiul traseu pe DN65. Reducerea de 50% este fezabilă odată cu finalizarea integrală a proiectului.",
    citedSources: [
      {
        name: "Asociația Pro Infrastructură",
        url: "https://proinfrastructura.ro",
        trustScore: 90,
        trustReason:
          "ONG independent de monitorizare a proiectelor de infrastructură.",
      },
    ],
  },
  {
    assertion:
      "Salariul mediu net a depășit suma de 5.000 de lei în toate județele din țară.",
    verdict: "Misleading",
    confidenceScore: 91,
    explanation:
      "Deși media națională a salariului mediu net a depășit 5.000 de lei în cursul anului 2024, această valoare este puternic distorsionată de veniturile din București, Cluj, Timiș și Ilfov. În peste 35 de județe, media netă reală este substanțial mai mică de 4.000 de lei.",
    citedSources: [
      {
        name: "Institutul Național de Statistică",
        url: "https://insse.ro",
        trustScore: 98,
        trustReason:
          "Instituție publică oficială responsabilă cu statisticile naționale.",
      },
    ],
  },
  {
    assertion:
      "Ploile din amonte vor determina inundații severe pe Dunăre în 48 de ore.",
    verdict: "Partially True",
    confidenceScore: 78,
    explanation:
      "Prognoza oficială emisă de Institutul Național de Hidrologie și Gospodărire a Apelor (INHGA) arată o creștere semnificativă a debitului Dunării la intrarea în țară (Baziaș), dar nivelurile se vor menține sub cotele de pericol. Sunt prognozate inundații doar în zonele inundabile neindiguite.",
    citedSources: [
      {
        name: "Institutul Național de Hidrologie și Gospodărire a Apelor",
        url: "http://www.hidro.ro",
        trustScore: 95,
        trustReason:
          "Autoritate națională în hidrologie și prognoză de inundații.",
      },
    ],
  },
  {
    assertion:
      "Toate blocurile din Sectorul 1 vor fi reabilitate termic integral până în august.",
    verdict: "Unverified",
    confidenceScore: 88,
    explanation:
      "Nu există nicio bază de date publică sau contract semnat în SEAP care să ateste finanțarea sau execuția lucrărilor pentru reabilitarea integrală în acest termen. Lipsesc detalii operaționale concrete din bugetul local aprobat.",
    citedSources: [
      {
        name: "Sistemul Electronic de Achiziții Publice (SEAP)",
        url: "https://e-licitatie.ro",
        trustScore: 99,
        trustReason:
          "Registrul oficial național al achizițiilor publice din România.",
      },
    ],
  },
];

export default function Home() {
  const [selectedClaim, setSelectedClaim] = useState<ClaimMock>(mockClaims[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleAudioSim = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2500);
  };

  const getVerdictStyles = (verdict: ClaimMock["verdict"]) => {
    switch (verdict) {
      case "True":
        return {
          bg: "bg-emerald-950/40 border-emerald-500/30 text-emerald-400",
          text: "text-emerald-400 border-emerald-500/20",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        };
      case "Mostly True":
        return {
          bg: "bg-teal-950/40 border-teal-500/30 text-teal-400",
          text: "text-teal-400 border-teal-500/20",
          badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/30",
        };
      case "Partially True":
        return {
          bg: "bg-yellow-950/30 border-yellow-500/30 text-yellow-400",
          text: "text-yellow-400 border-yellow-500/20",
          badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        };
      case "Misleading":
        return {
          bg: "bg-amber-950/40 border-amber-500/30 text-amber-400",
          text: "text-amber-400 border-amber-500/20",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      case "False":
        return {
          bg: "bg-rose-950/40 border-rose-500/30 text-rose-400",
          text: "text-rose-400 border-rose-500/20",
          badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        };
      case "Unverified":
      default:
        return {
          bg: "bg-slate-900 border-slate-700/50 text-slate-400",
          text: "text-slate-400 border-slate-700/30",
          badgeBg: "bg-slate-800 text-slate-300 border-slate-700/50",
        };
    }
  };

  const activeStyles = getVerdictStyles(selectedClaim.verdict);

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none animate-pulse-glow" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-display font-bold text-white text-lg shadow-lg shadow-blue-500/20">
              V
            </div>
            <span
              id="site-logo"
              className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
            >
              verificat.xyz
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a
              href="#cum-functioneaza"
              className="hover:text-white transition-colors"
            >
              Cum funcționează
            </a>
            <a
              href="#demonstratie"
              className="hover:text-white transition-colors"
            >
              Demonstrație interactivă
            </a>
            <a href="#descarca" className="hover:text-white transition-colors">
              Instalare
            </a>
          </nav>

          <div>
            <a
              id="btn-nav-download"
              href="#descarca"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all"
            >
              Descarcă asistentul
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-32">
        {/* Hero Section */}
        <section className="text-center space-y-8 max-w-4xl mx-auto py-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium tracking-wide">
            <span>🛡️ Asistent de verificare în timp real</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Verifică afirmațiile din media <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              în timp real
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Un asistent inteligent (extensie de browser și aplicație mobilă) ce
            utilizează procesare avansată de limbaj natural, căutare semantică
            și evaluarea încrederii surselor pentru a furniza verdicte imediate,
            clare și bazate pe dovezi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <a
              id="btn-hero-extension"
              href="#descarca"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center justify-center gap-2 group"
            >
              <span>Instalează Extensia</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
            <a
              id="btn-hero-howitworks"
              href="#cum-functioneaza"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all text-sm"
            >
              Cum funcționează?
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-xs text-slate-500">
            <span className="flex items-center gap-1">✅ Fără reclame</span>
            <span className="flex items-center gap-1">
              ✅ Confidențialitate garantată
            </span>
            <span className="flex items-center gap-1">
              ✅ 100% Sursă deschisă
            </span>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="cum-functioneaza" className="space-y-16 scroll-mt-24">
          <div className="text-center space-y-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">
              Pipeline-ul modular de verificare
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Verificarea nu este determinată de un singur apel LLM opac.
              Procesul este descompus în etape independente, auditate și
              verificate în mod riguros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                title: "Captură Audio & Text",
                desc: "Capturați direct tab-ul media sau microfonul, cu acord explicit obținut la fiecare sesiune.",
              },
              {
                step: "02",
                title: "Speech-to-Text",
                desc: "Transcriere în timp real în limba română folosind modele avansate optimizate pentru diacritice.",
              },
              {
                step: "03",
                title: "Detecție Afirmații",
                desc: "Identificarea și extragerea afirmațiilor factuale concrete din discursul normalizat.",
              },
              {
                step: "04",
                title: "Căutare Dovezi",
                desc: "Interogare semantică pe surse de încredere, baze de date publice și presă acreditată.",
              },
              {
                step: "05",
                title: "Verdict & Explicație",
                desc: "Calcularea verdictului (din 6 stări oficiale) însoțit de argumentare clară și scor de încredere.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-blue-500/20 transition-all group"
              >
                <div className="space-y-4">
                  <span className="font-display text-4xl font-extrabold text-blue-500/20 group-hover:text-blue-500/40 transition-colors">
                    {item.step}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Demonstrator Section */}
        <section id="demonstratie" className="space-y-16 scroll-mt-24">
          <div className="text-center space-y-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white">
              Demonstrație interactivă
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Selectează un exemplu din panoul din stânga pentru a vedea cum
              asistentul analizează, extrage dovezi și emite verdictul.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left selector */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase px-1">
                Afirmații de testat
              </span>
              <div className="space-y-2">
                {mockClaims.map((claim, idx) => {
                  const isSelected =
                    selectedClaim.assertion === claim.assertion;
                  return (
                    <button
                      key={idx}
                      id={`btn-claim-select-${idx}`}
                      onClick={() => setSelectedClaim(claim)}
                      className={`w-full text-left p-4 rounded-xl text-xs font-medium transition-all flex flex-col gap-2 ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500/40 text-white border"
                          : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/10"
                      }`}
                    >
                      <span className="line-clamp-2 leading-relaxed">
                        {claim.assertion}
                      </span>
                      <div className="flex items-center justify-between w-full pt-1">
                        <span className="text-[10px] text-slate-500">
                          Verdict probabil:
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${
                            getVerdictStyles(claim.verdict).badgeBg
                          }`}
                        >
                          {claim.verdict}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Audio transcription simulation card */}
              <div className="glass-panel p-5 rounded-xl border-dashed border-white/10 flex flex-col gap-3 items-center justify-center text-center mt-6">
                <span className="text-xs text-slate-400 font-medium">
                  Vrei să simulezi transcrierea audio?
                </span>
                <button
                  id="btn-simulate-audio"
                  onClick={handleAudioSim}
                  disabled={isPlayingAudio}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isPlayingAudio
                      ? "bg-purple-600/20 text-purple-400 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-600/10"
                  }`}
                >
                  {isPlayingAudio
                    ? "🎙️ Se ascultă fluxul..."
                    : "🎤 Simulează input voce (STT)"}
                </button>
                {isPlayingAudio && (
                  <p className="text-[10px] text-purple-400 animate-pulse">
                    &quot;{selectedClaim.assertion}&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Right Display panel */}
            <div className="lg:col-span-7">
              <div className="glass-panel rounded-2xl p-8 space-y-8 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent blur-xl pointer-events-none" />

                {/* Verdict Badge & Confidence */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-medium">
                      Verdictul asistentului
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-full font-bold text-sm border tracking-wide uppercase ${activeStyles.badgeBg}`}
                      >
                        {selectedClaim.verdict}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <span className="text-xs text-slate-500 font-medium">
                      Nivel încredere
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedClaim.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white">
                        {selectedClaim.confidenceScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim Statement */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Afirmația extrasă
                  </span>
                  <p className="text-base font-semibold text-white leading-relaxed">
                    &quot;{selectedClaim.assertion}&quot;
                  </p>
                </div>

                {/* Verdict Explanation */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Explicația dovezilor
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    {selectedClaim.explanation}
                  </p>
                </div>

                {/* Cited Sources */}
                <div className="space-y-4">
                  <span className="text-xs text-slate-500 font-medium block">
                    Surse citate
                  </span>
                  <div className="space-y-3">
                    {selectedClaim.citedSources.map((source, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {source.name}
                            </span>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
                            >
                              Vizitează sursa 🔗
                            </a>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {source.trustReason}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Scor încredere
                          </span>
                          <span className="px-2 py-1 rounded bg-slate-800 text-xs font-bold text-slate-200 border border-white/5">
                            {source.trustScore}/100
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download / Stores CTA Section */}
        <section id="descarca" className="scroll-mt-24">
          <div className="glass-panel rounded-3xl p-12 text-center space-y-8 relative overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 blur-[80px] pointer-events-none rounded-full" />

            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="font-display text-4xl font-bold tracking-tight text-white">
                Instalează verificat.xyz
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Asistentul tău personal de verificare a faptelor te însoțește
                oriunde navighezi, fie pe browserul laptopului sau pe ecranul
                telefonului mobil.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
              {[
                {
                  name: "Chrome Extension",
                  dev: "Chrome / Brave / Edge",
                  icon: "🌐",
                  id: "btn-download-chrome",
                },
                {
                  name: "Firefox Add-on",
                  dev: "Mozilla Firefox",
                  icon: "🦊",
                  id: "btn-download-firefox",
                },
                {
                  name: "Android App",
                  dev: "Google Play Store",
                  icon: "🤖",
                  id: "btn-download-android",
                },
                {
                  name: "iOS App",
                  dev: "Apple App Store",
                  icon: "🍎",
                  id: "btn-download-ios",
                },
              ].map((store, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between gap-4 hover:border-blue-500/20 transition-all cursor-pointer group"
                >
                  <span className="text-3xl">{store.icon}</span>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white">
                      {store.name}
                    </h3>
                    <p className="text-[10px] text-slate-500">{store.dev}</p>
                  </div>
                  <button
                    id={store.id}
                    className="w-full py-2 rounded-lg bg-white/5 group-hover:bg-blue-600 group-hover:text-white text-xs font-semibold text-slate-300 border border-white/5 group-hover:border-blue-500 transition-all"
                  >
                    Descarcă (Planificat)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/40 py-12 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-white">
              verificat.xyz
            </span>
            <span>
              &copy; {new Date().getFullYear()} FactCheck.ro. Toate drepturile
              rezervate.
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="/privacy" className="hover:text-white transition-colors">
              Politica de Confidențialitate
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Termeni și Condiții
            </a>
            <a href="#descarca" className="hover:text-white transition-colors">
              Descarcă extensia
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
