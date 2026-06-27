"use client";

import { useState } from "react";
import { ButtonPrimarySmall } from "@verificat/ui";

import { getApiBase } from "@/lib/api";

export default function HandoffPage() {
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    setError(null);
    setHandoffUrl(null);
    try {
      const res = await fetch(`${getApiBase()}/auth/handoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 401) {
        setError(
          "Trebuie să fii autentificat pentru a genera un link de transfer.",
        );
        return;
      }
      if (!res.ok) throw new Error("Eroare la generarea linkului");
      const data = (await res.json()) as { url: string };
      setHandoffUrl(data.url);
    } catch {
      setError("Nu s-a putut genera linkul de transfer. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        padding: "40px 16px",
        fontFamily: "'Geist Sans', Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.4px",
            margin: "0 0 8px",
            color: "#171717",
          }}
        >
          Transfer pe mobil
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#8f8f8f",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          Generează un link sigur pentru a te autentifica pe dispozitivul mobil
          fără a reintroduce parola. Linkul expiră în 5 minute și poate fi
          folosit o singură dată.
        </p>

        {!handoffUrl && (
          <ButtonPrimarySmall
            id="generate-btn"
            onClick={() => {
              void generateLink();
            }}
          >
            {loading ? "Se generează..." : "Generează link de transfer"}
          </ButtonPrimarySmall>
        )}

        {error && (
          <p style={{ fontSize: 14, color: "#dc2626", marginTop: 16 }}>
            {error}
          </p>
        )}

        {handoffUrl && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #ebebeb",
              borderRadius: 12,
              padding: 24,
              marginTop: 16,
            }}
          >
            <p style={{ fontSize: 14, color: "#4d4d4d", margin: "0 0 12px" }}>
              Deschide acest link pe telefonul tău:
            </p>
            <div
              style={{
                padding: 12,
                background: "#fafafa",
                border: "1px solid #ebebeb",
                borderRadius: 6,
                fontSize: 13,
                color: "#0070f3",
                wordBreak: "break-all",
                marginBottom: 16,
              }}
            >
              <a href={handoffUrl} target="_blank" rel="noopener">
                {handoffUrl}
              </a>
            </div>
            <p style={{ fontSize: 12, color: "#8f8f8f", margin: 0 }}>
              Sau scanează codul QR de pe telefonul mobil. Poți folosi aplicația
              verificat.xyz pentru a scana direct.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
