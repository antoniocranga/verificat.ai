import { createClient } from "@/utils/supabase/server";
import { updateReportStatus } from "@/app/admin/reports/actions";

const statusColors: Record<string, string> = {
  open: "#d97706",
  investigating: "#2563eb",
  resolved: "#059669",
  dismissed: "#6b7280",
};

const statusLabels: Record<string, string> = {
  open: "Deschis",
  investigating: "În investigare",
  resolved: "Rezolvat",
  dismissed: "Respins",
};

interface Report {
  id: string;
  created_at: string;
  status: string;
  reason: string;
  description: string | null;
}

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Report[]>();

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
          Rapoarte abuz
        </h1>
        <p style={{ fontSize: 14, color: "#8f8f8f", margin: 0 }}>
          Coada rapoartelor de abuz de la utilizatori
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
        {reports && reports.length > 0 ? (
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
                  Status
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
                  Motiv
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
                  Descriere
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
                  Creat
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
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  style={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: statusColors[report.status] || "#6b7280",
                        background: `${statusColors[report.status] || "#6b7280"}15`,
                      }}
                    >
                      {statusLabels[report.status] || report.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#4d4d4d",
                    }}
                  >
                    {report.reason}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#8f8f8f",
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {report.description || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#8f8f8f",
                    }}
                  >
                    {new Date(report.created_at).toLocaleDateString("ro-RO")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <form
                      action={updateReportStatus}
                      style={{ display: "flex", gap: 4 }}
                    >
                      <input type="hidden" name="id" value={report.id} />
                      {report.status === "open" && (
                        <button
                          type="submit"
                          name="status"
                          value="investigating"
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "1px solid #93c5fd",
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Investighează
                        </button>
                      )}
                      {report.status === "investigating" && (
                        <>
                          <button
                            type="submit"
                            name="status"
                            value="resolved"
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: "1px solid #6ee7b7",
                              background: "#ecfdf5",
                              color: "#059669",
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Rezolvă
                          </button>
                          <button
                            type="submit"
                            name="status"
                            value="dismissed"
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: "1px solid #d1d5db",
                              background: "#f9fafb",
                              color: "#6b7280",
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Respinge
                          </button>
                        </>
                      )}
                      {report.status === "open" && (
                        <button
                          type="submit"
                          name="status"
                          value="dismissed"
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "1px solid #d1d5db",
                            background: "#f9fafb",
                            color: "#6b7280",
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Respinge
                        </button>
                      )}
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#8f8f8f", margin: 0 }}>
              Nici un raport de abuz
            </p>
            <p style={{ fontSize: 13, color: "#a3a3a3", margin: "8px 0 0" }}>
              Rapoartele apar aici după ce utilizatorii raportează conținut.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
