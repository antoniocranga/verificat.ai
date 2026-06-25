"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ButtonPrimarySmall, ButtonGhostSmall, TextInput } from "@verificat/ui";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://staging.verificat.xyz/api";

interface VerdictResult {
  id: string;
  verdict: string;
  confidenceScore: number;
  explanation: string;
  createdAt: string;
  claim: { text?: string };
}

interface SearchResponse {
  data: VerdictResult[];
  total: number;
  page: number;
  limit: number;
}

export default function ArchivePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VerdictResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchResults = async (searchQuery: string, pageNum: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: String(pageNum),
        limit: String(limit),
      });
      const res = await fetch(`${API_BASE}/fact-checks/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as SearchResponse;
      setResults(data.data);
      setTotal(data.total);
      setPage(data.page);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResults("", 1).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchResults(query, 1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main
      style={{
        padding: "40px 16px",
        maxWidth: 720,
        margin: "0 auto",
        background: "#fafafa",
        minHeight: "100vh",
        fontFamily: "'Geist Sans', Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 600,
          letterSpacing: "-0.4px",
          margin: "0 0 24px",
          color: "#171717",
        }}
      >
        Arhivă verificări
      </h1>

      <form
        onSubmit={handleSearch}
        style={{ marginBottom: 24, display: "flex", gap: 8 }}
      >
        <div style={{ flex: 1 }}>
          <TextInput
            id="search-input"
            placeholder="Caută în arhivă..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
          />
        </div>
        <ButtonPrimarySmall id="search-btn">Caută</ButtonPrimarySmall>
      </form>

      {loading && (
        <p
          style={{ fontSize: 16, lineHeight: 1.6, color: "#4d4d4d", margin: 0 }}
        >
          Se încarcă...
        </p>
      )}

      {!loading && results.length === 0 && (
        <p style={{ fontSize: 14, color: "#8f8f8f", margin: 0 }}>
          Niciun rezultat găsit.
        </p>
      )}

      {results.map((item) => (
        <Link
          key={item.id}
          href={`/check/${item.id}`}
          style={{ textDecoration: "none", display: "block" }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #ebebeb",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                color: "#171717",
                fontWeight: 600,
                marginBottom: 4,
                fontSize: 18,
                lineHeight: 1.6,
              }}
            >
              {item.claim?.text || "Revendicare"}
            </div>
            <div style={{ fontSize: 14, color: "#8f8f8f", marginBottom: 4 }}>
              Verdict: {item.verdict} &middot; {item.confidenceScore}% &middot;{" "}
              {new Date(item.createdAt).toLocaleDateString("ro-RO")}
            </div>
            <p
              style={{
                fontSize: 14,
                color: "#4d4d4d",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {item.explanation.slice(0, 200)}
              {item.explanation.length > 200 ? "..." : ""}
            </p>
          </div>
        </Link>
      ))}

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 24,
          }}
        >
          <ButtonGhostSmall
            id="prev-btn"
            onClick={() => {
              void fetchResults(query, page - 1);
            }}
          >
            Anterior
          </ButtonGhostSmall>
          <span style={{ padding: "8px 0", color: "#4d4d4d" }}>
            Pagina {page} din {totalPages}
          </span>
          <ButtonGhostSmall
            id="next-btn"
            onClick={() => {
              void fetchResults(query, page + 1);
            }}
          >
            Următoarea
          </ButtonGhostSmall>
        </div>
      )}
    </main>
  );
}
