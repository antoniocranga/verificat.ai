import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
    return redirect("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <header
        style={{
          borderBottom: "1px solid #ebebeb",
          background: "#ffffff",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a
            href="/admin"
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#171717",
              textDecoration: "none",
              letterSpacing: "-0.4px",
            }}
          >
            verificat.xyz Admin
          </a>
          <nav style={{ display: "flex", gap: 16 }}>
            <a
              href="/admin"
              style={{
                fontSize: 14,
                color: "#4d4d4d",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Dashboard
            </a>
            <a
              href="/admin/sources"
              style={{
                fontSize: 14,
                color: "#4d4d4d",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Surse
            </a>
            <a
              href="/admin/reports"
              style={{
                fontSize: 14,
                color: "#4d4d4d",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Rapoarte
            </a>
            <a
              href="/admin/usage"
              style={{
                fontSize: 14,
                color: "#4d4d4d",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Utilizare
            </a>
            {profile?.role === "admin" && (
              <a
                href="/admin/audit-log"
                style={{
                  fontSize: 14,
                  color: "#4d4d4d",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Audit
              </a>
            )}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#8f8f8f" }}>
            {profile?.role === "admin" ? "SuperAdmin" : "Moderator"}
          </span>
          <a
            href="/dashboard"
            style={{
              fontSize: 14,
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Dashboard utilizator
          </a>
        </div>
      </header>
      <main style={{ padding: "32px 24px" }}>{children}</main>
    </div>
  );
}
