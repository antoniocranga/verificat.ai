import { resetPassword } from "@/app/auth/actions";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const message =
    typeof params.message === "string" ? params.message : undefined;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/25 blur-3xl" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Reset Password
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Enter your email to receive a recovery link
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8">
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

          <form action={resetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-slate-100 rounded-lg font-semibold transition-all transform hover:scale-[1.01] text-sm"
            >
              Send Recovery Link
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-xs text-violet-400 hover:underline"
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
