import { createClient } from "@/utils/supabase/server";

function sevenDaysAgo(): string {
  return new Date(Date.now() - 7 * 86400000).toISOString();
}

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string | null;
}

export default async function AdminUsagePage() {
  const supabase = await createClient();

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalVerdicts } = await supabase
    .from("verdicts")
    .select("*", { count: "exact", head: true });

  const { data: userVerdictCounts } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .returns<UserProfile[]>();

  const ago = sevenDaysAgo();

  const { count: claimsLast7d } = await supabase
    .from("claims")
    .select("*", { count: "exact", head: true })
    .gte("created_at", ago);

  const { count: verdictsLast7d } = await supabase
    .from("verdicts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", ago);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "-0.4px",
            color: "#171717",
            margin: "0 0 4px",
          }}
        >
          Utilizare
        </h1>
        <p style={{ fontSize: 14, color: "#8f8f8f", margin: 0 }}>
          Metrici de utilizare per utilizator și agregate
        </p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #ebebeb",
            padding: 24,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#171717",
              margin: "0 0 16px",
            }}
          >
            Prezentare generală
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#171717",
                  margin: 0,
                }}
              >
                {totalUsers ?? 0}
              </p>
              <p style={{ fontSize: 13, color: "#8f8f8f", margin: "4px 0 0" }}>
                Utilizatori totali
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#171717",
                  margin: 0,
                }}
              >
                {totalVerdicts ?? 0}
              </p>
              <p style={{ fontSize: 13, color: "#8f8f8f", margin: "4px 0 0" }}>
                Verdicte totale
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#171717",
                  margin: 0,
                }}
              >
                {claimsLast7d ?? 0}
              </p>
              <p style={{ fontSize: 13, color: "#8f8f8f", margin: "4px 0 0" }}>
                Procesări (ultimele 7 zile)
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#171717",
                  margin: 0,
                }}
              >
                {verdictsLast7d ?? 0}
              </p>
              <p style={{ fontSize: 13, color: "#8f8f8f", margin: "4px 0 0" }}>
                Verdicte (ultimele 7 zile)
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #ebebeb",
            padding: 24,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#171717",
              margin: "0 0 16px",
            }}
          >
            Utilizatori
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ebebeb" }}>
                  <th
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#8f8f8f",
                    }}
                  >
                    Nume
                  </th>
                  <th
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#8f8f8f",
                    }}
                  >
                    Rol
                  </th>
                </tr>
              </thead>
              <tbody>
                {userVerdictCounts && userVerdictCounts.length > 0 ? (
                  userVerdictCounts.map((user) => (
                    <tr
                      key={user.id}
                      style={{ borderBottom: "1px solid #f0f0f0" }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 14,
                          color: "#171717",
                        }}
                      >
                        {user.full_name || "Utilizator"}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontSize: 13,
                          color: "#4d4d4d",
                        }}
                      >
                        {user.role}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        padding: 16,
                        textAlign: "center",
                        fontSize: 14,
                        color: "#8f8f8f",
                      }}
                    >
                      Nici un utilizator
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #ebebeb",
            padding: 24,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "#8f8f8f",
              margin: 0,
              textAlign: "center",
            }}
          >
            Graficele detaliate STT/LLM necesită tabela{" "}
            <strong>usage_logs</strong> populată de backend.
          </p>
        </div>
      </div>
    </div>
  );
}
