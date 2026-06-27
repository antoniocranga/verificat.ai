import { createClient } from "@/utils/supabase/server";

interface StatCard {
  label: string;
  value: number;
  id: string;
}

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

  const stats: StatCard[] = [
    { label: "Utilizatori", value: totalUsers ?? 0, id: "stat-users" },
    { label: "Afirmații verificate", value: totalVerdicts ?? 0, id: "stat-verdicts" },
    { label: "Procesări totale", value: totalClaims ?? 0, id: "stat-claims" },
    { label: "Surse de încredere", value: totalSources ?? 0, id: "stat-sources" },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "var(--space-8, 32px)" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--color-ink)",
            margin: "0 0 var(--space-2, 8px)",
          }}
        >
          Panou administrare
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--color-mid)",
            margin: 0,
          }}
        >
          Rezumat activitate platformă
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--space-4, 16px)",
          marginBottom: "var(--space-10, 40px)",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            id={stat.id}
            style={{
              background: "var(--color-canvas-elevated)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-subtle)",
              padding: "var(--space-6, 24px)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 32,
                fontWeight: 700,
                color: "var(--color-ink)",
                margin: "0 0 var(--space-1, 4px)",
                letterSpacing: "-0.04em",
              }}
            >
              {stat.value.toLocaleString("ro-RO")}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--color-mid)",
                margin: 0,
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Admin table header example */}
      <div
        style={{
          background: "var(--color-canvas-elevated)",
          border: "1px solid var(--color-subtle)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "var(--space-5, 20px) var(--space-6, 24px)",
            borderBottom: "1px solid var(--color-subtle)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 16,
              color: "var(--color-ink)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Activitate recentă
          </h2>
        </div>

        {/* Table header */}
        <div
          role="table"
          aria-label="Activitate recentă"
        >
          <div
            role="row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 100px 100px",
              padding: "var(--space-3, 12px) var(--space-6, 24px)",
              background: "var(--color-canvas)",
              borderBottom: "1px solid var(--color-subtle)",
            }}
          >
            {["Utilizator", "Afirmație", "Verdict", "Dată"].map((col) => (
              <div
                key={col}
                role="columnheader"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                  fontSize: 12,
                  color: "var(--color-mid)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Empty state */}
          <div
            role="row"
            style={{
              padding: "var(--space-12, 48px) var(--space-6, 24px)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--color-mid)",
                margin: 0,
              }}
            >
              Nu există activitate recentă de afișat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
