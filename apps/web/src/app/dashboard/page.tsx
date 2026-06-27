import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FeatureCard, ButtonPrimarySmall, verdictColors } from "@verificat/ui";
import type { VerdictLabel } from "@verificat/ui";

interface VerdictRow {
  id: string;
  verdict: string;
  confidence_score: number;
  explanation: string;
  created_at: string;
}

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

  const { data: recentChecks } = await supabase
    .from("verdicts")
    .select(
      `
      id,
      verdict,
      confidence_score,
      explanation,
      created_at
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<VerdictRow[]>();

  return (
    <main
      data-testid="dashboard-content"
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        padding: "32px 16px",
        fontFamily: "'Geist Sans', Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            borderBottom: "1px solid #ebebeb",
            paddingBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-1.28px",
                margin: 0,
                color: "#171717",
              }}
            >
              Dashboard
            </h1>
            <p style={{ fontSize: 14, color: "#8f8f8f", margin: "4px 0 0" }}>
              {user.email}
            </p>
          </div>
          <form action={signOut}>
            <ButtonPrimarySmall id="signout-btn">Sign Out</ButtonPrimarySmall>
          </form>
        </div>

        {message && (
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              borderRadius: 12,
              background: "#ffffff",
              border: "1px solid #ebebeb",
              color: "#4d4d4d",
              fontSize: 14,
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: "grid", gap: 32 }}>
          <FeatureCard id="recent-checks">
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.4px",
                margin: "0 0 16px",
                color: "#171717",
              }}
            >
              Verificări recente
            </h2>
            {!recentChecks || recentChecks.length === 0 ? (
              <p style={{ fontSize: 14, color: "#8f8f8f", margin: 0 }}>
                Nu ai nicio verificare salvată. Folosește extensia de browser
                sau aplicația mobilă pentru a verifica afirmații.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {recentChecks.map((check) => (
                  <Link
                    key={check.id}
                    href={`/check/${check.id}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: "#ffffff",
                        border: "1px solid #ebebeb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            border: `1px solid ${verdictColors[check.verdict as VerdictLabel] || "#171717"}40`,
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                            color:
                              check.verdict === "Unverified"
                                ? "#6b7280"
                                : verdictColors[
                                    check.verdict as VerdictLabel
                                  ] || "#171717",
                          }}
                        >
                          {check.verdict}
                        </span>
                        <span style={{ fontSize: 11, color: "#8f8f8f" }}>
                          {new Date(check.created_at).toLocaleDateString(
                            "ro-RO",
                          )}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#4d4d4d",
                          margin: "0 0 4px",
                          lineHeight: 1.5,
                        }}
                      >
                        {check.explanation}
                      </p>
                      <p style={{ fontSize: 11, color: "#8f8f8f", margin: 0 }}>
                        Încredere: {check.confidence_score}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </FeatureCard>

          <FeatureCard id="account-settings">
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.4px",
                margin: "0 0 16px",
                color: "#171717",
              }}
            >
              Setări cont
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  borderBottom: "1px solid #ebebeb",
                  paddingBottom: 12,
                }}
              >
                <span
                  style={{ fontSize: 14, fontWeight: 500, color: "#8f8f8f" }}
                >
                  Email
                </span>
                <span style={{ fontSize: 14, color: "#4d4d4d" }}>
                  {user.email}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  borderBottom: "1px solid #ebebeb",
                  paddingBottom: 12,
                }}
              >
                <span
                  style={{ fontSize: 14, fontWeight: 500, color: "#8f8f8f" }}
                >
                  Nume
                </span>
                <span style={{ fontSize: 14, color: "#4d4d4d" }}>
                  {profile?.full_name || "Nu este setat"}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  paddingBottom: 12,
                }}
              >
                <span
                  style={{ fontSize: 14, fontWeight: 500, color: "#8f8f8f" }}
                >
                  Rol
                </span>
                <span style={{ fontSize: 14, color: "#4d4d4d" }}>
                  {profile?.role || "user"}
                </span>
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </main>
  );
}
