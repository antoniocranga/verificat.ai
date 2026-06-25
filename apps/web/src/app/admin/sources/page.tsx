import { createClient } from "@/utils/supabase/server";
import { addSource, deleteSource } from "@/app/admin/actions";

interface Source {
  id: string;
  name: string;
  url: string;
  trust_score: number | null;
  created_at: string;
}

export default async function AdminSourcesPage() {
  const supabase = await createClient();
  const { data: sources } = await supabase
    .from("sources")
    .select("*")
    .order("name", { ascending: true })
    .returns<Source[]>();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.4px",
              color: "#171717",
              margin: "0 0 4px",
            }}
          >
            Surse de încredere
          </h1>
          <p style={{ fontSize: 14, color: "#8f8f8f", margin: 0 }}>
            Gestionează sursele de încredere și scorurile de trust
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid #ebebeb",
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#171717",
            margin: "0 0 16px",
          }}
        >
          Adaugă sursă nouă
        </h2>
        <form
          action={addSource}
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr auto",
            alignItems: "end",
          }}
        >
          <div>
            <label
              htmlFor="name"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#4d4d4d",
                display: "block",
                marginBottom: 4,
              }}
            >
              Nume
            </label>
            <input
              id="name"
              name="name"
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
                color: "#171717",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="url"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#4d4d4d",
                display: "block",
                marginBottom: 4,
              }}
            >
              URL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
                color: "#171717",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="trust_score"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#4d4d4d",
                display: "block",
                marginBottom: 4,
              }}
            >
              Trust Score (0-100)
            </label>
            <input
              id="trust_score"
              name="trust_score"
              type="number"
              min="0"
              max="100"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
                color: "#171717",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "8px 24px",
              borderRadius: 8,
              border: "none",
              background: "#171717",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Adaugă sursă
          </button>
        </form>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid #ebebeb",
          overflow: "hidden",
        }}
      >
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
                Nume
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
                URL
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
                Trust Score
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
            {sources && sources.length > 0 ? (
              sources.map((source) => (
                <tr
                  key={source.id}
                  style={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 14,
                      color: "#171717",
                    }}
                  >
                    {source.name}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#2563eb",
                    }}
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#2563eb", textDecoration: "none" }}
                    >
                      {source.url}
                    </a>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 12,
                        fontWeight: 600,
                        color:
                          source.trust_score != null && source.trust_score >= 70
                            ? "#059669"
                            : source.trust_score != null &&
                                source.trust_score >= 40
                              ? "#d97706"
                              : "#6b7280",
                        background:
                          source.trust_score != null && source.trust_score >= 70
                            ? "#ecfdf5"
                            : source.trust_score != null &&
                                source.trust_score >= 40
                              ? "#fffbeb"
                              : "#f9fafb",
                      }}
                    >
                      {source.trust_score != null
                        ? `${source.trust_score}%`
                        : "-"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#8f8f8f",
                    }}
                  >
                    {new Date(source.created_at).toLocaleDateString("ro-RO")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <form action={deleteSource} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={source.id} />
                      <button
                        type="submit"
                        style={{
                          padding: "4px 12px",
                          borderRadius: 6,
                          border: "1px solid #fca5a5",
                          background: "#fef2f2",
                          color: "#dc2626",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Șterge
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    fontSize: 14,
                    color: "#8f8f8f",
                  }}
                >
                  Nici o sursă înregistrată
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
