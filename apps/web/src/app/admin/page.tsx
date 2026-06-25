import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalClaims } = await supabase
    .from("claims")
    .select("*", { count: "exact", head: true });

  const { count: totalVerdicts } = await supabase
    .from("verdicts")
    .select("*", { count: "exact", head: true });

  const { count: totalSources } = await supabase
    .from("sources")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "-0.4px",
          color: "#171717",
          margin: "0 0 8px",
        }}
      >
        Panou administrare
      </h1>
      <p style={{ fontSize: 14, color: "#8f8f8f", margin: "0 0 32px" }}>
        Rezumat activitate platformă
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {[
          { label: "Utilizatori", value: totalUsers ?? 0 },
          { label: "Afirmații verificate", value: totalVerdicts ?? 0 },
          { label: "Procesări totale", value: totalClaims ?? 0 },
          { label: "Surse de încredere", value: totalSources ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #ebebeb",
              padding: 24,
            }}
          >
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#171717",
                margin: "0 0 4px",
              }}
            >
              {stat.value}
            </p>
            <p style={{ fontSize: 13, color: "#8f8f8f", margin: 0 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
