import { login, signup } from "@/app/auth/actions";
import { OAuthButtons } from "@/components/OAuthButtons";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const message =
    typeof params.message === "string" ? params.message : undefined;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/25 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/25 blur-3xl" />

      <div className="w-full max-w-md z-10">
        {/* Header/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Verificat
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Verificare în timp real cu surse și dovezi
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-sm">
              {message}
            </div>
          )}

          {/* Simple Tab Control via client-side or CSS/Multiple Forms */}
          {/* We render a login form and signup form side-by-side or combined into neat UI */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                Autentificare
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Conectați-vă la contul dumneavoastră
              </p>

              <form action={login} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nume@exemplu.ro"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Parolă
                    </label>
                    <a
                      href="/reset-password"
                      className="text-xs text-violet-400 hover:underline"
                    >
                      Ați uitat parola?
                    </a>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-slate-100 rounded-lg font-semibold transition-all transform hover:scale-[1.01] shadow-lg shadow-violet-950/50 text-sm"
                >
                  Autentificare
                </button>
              </form>

              {/* OAuth provider sign-in */}
              <div className="mt-5">
                <OAuthButtons />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h2 className="text-xl font-semibold text-slate-100">
                Creare Cont
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Alăturați-vă comunității de verificare
              </p>

              <form action={signup} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Nume complet
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Ion Popescu"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nume@exemplu.ro"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Parolă
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Minimum 8 caractere"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-semibold transition-all transform hover:scale-[1.01] text-sm"
                >
                  Înregistrare
                </button>
              </form>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs leading-relaxed">
              Prin crearea unui cont sau autentificare, acceptați{" "}
              <a
                href="https://verificat.xyz/privacy"
                className="text-violet-400 hover:underline"
                target="_blank"
                rel="noopener"
              >
                Politica de Confidențialitate
              </a>{" "}
              și{" "}
              <a
                href="https://verificat.xyz/terms"
                className="text-violet-400 hover:underline"
                target="_blank"
                rel="noopener"
              >
                Termenii de Utilizare
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
