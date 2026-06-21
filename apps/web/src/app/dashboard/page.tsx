import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const message =
    typeof params.message === "string" ? params.message : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/10 blur-3xl" />

      <div className="max-w-4xl mx-auto z-10 relative">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              verificat.xyz Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as {user.email}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="py-2 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-100 rounded-lg text-sm font-semibold transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-sm">
            {message}
          </div>
        )}

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-lg font-bold text-slate-200 mb-4">
            User Session details
          </h2>
          <div className="space-y-4 text-sm text-slate-300">
            <div className="grid grid-cols-3 border-b border-slate-800/50 py-2">
              <span className="text-slate-400 font-medium">User ID</span>
              <span className="col-span-2 font-mono text-xs">{user.id}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-800/50 py-2">
              <span className="text-slate-400 font-medium">Full Name</span>
              <span className="col-span-2">
                {profile?.full_name || "No name set"}
              </span>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-800/50 py-2">
              <span className="text-slate-400 font-medium">Role Privilege</span>
              <span className="col-span-2">
                <span className="px-2 py-0.5 bg-violet-950/65 border border-violet-800/65 text-violet-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {profile?.role || "user"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
