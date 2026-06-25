import { createClient } from "@/utils/supabase/server";

export default async function AdminAuditLogPage() {
  const supabase = await createClient();

  const { data: auditLogs } = await supabase
    .from("audit_log")
    .select("id, action, payload, created_at, actor_id")
    .order("created_at", { ascending: false })
    .limit(100);

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
          Jurnal audit
        </h1>
        <p style={{ fontSize: 14, color: "#8f8f8f", margin: 0 }}>
          Toate acțiunile administrative înregistrate
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid #ebebeb",
          overflow: "hidden",
        }}
      >
        {auditLogs && auditLogs.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ebebeb" }}>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#8f8f8f",
                  }}
                >
                  Acțiune
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#8f8f8f",
                  }}
                >
                  Detalii
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#8f8f8f",
                  }}
                >
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(
                (log: {
                  id: string;
                  action: string;
                  payload: Record<string, unknown>;
                  created_at: string;
                }) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: "1px solid #f0f0f0" }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          padding: "2px 8px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#4d4d4d",
                          fontFamily: "monospace",
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#4d4d4d",
                      }}
                    >
                      {JSON.stringify(log.payload).slice(0, 120)}
                      {JSON.stringify(log.payload).length > 120 ? "..." : ""}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#8f8f8f",
                      }}
                    >
                      {new Date(log.created_at).toLocaleString("ro-RO")}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#8f8f8f", margin: 0 }}>
              Nici o înregistrare de audit
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
