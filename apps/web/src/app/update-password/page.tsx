import { updatePassword } from "@/app/auth/actions";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Parolă nouă — verificat.ai",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UpdatePasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-canvas)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6, 24px)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8, 32px)" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "-0.04em",
                color: "var(--color-ink)",
              }}
            >
              verificat<span style={{ color: "var(--color-accent)" }}>.ai</span>
            </span>
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
              margin: "var(--space-4, 16px) 0 var(--space-2, 8px)",
            }}
          >
            Parolă nouă
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--color-mid)",
              margin: 0,
            }}
          >
            Introduceți noua parolă mai jos
          </p>
        </div>

        <div
          style={{
            background: "var(--color-canvas-elevated)",
            border: "1px solid var(--color-subtle)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
            padding: "var(--space-8, 32px)",
          }}
        >
          {error && (
            <div
              role="alert"
              style={{
                marginBottom: "var(--space-5, 20px)",
                padding: "var(--space-4, 16px)",
                borderRadius: "var(--radius-sm)",
                background: "rgba(192,57,43,0.08)",
                border: "1px solid rgba(192,57,43,0.20)",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "#c0392b",
              }}
            >
              {error}
            </div>
          )}

          <form
            action={updatePassword}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-4, 16px)" }}
          >
            <div>
              <label
                htmlFor="new-password"
                style={{
                  display: "block",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-mid)",
                  marginBottom: 6,
                }}
              >
                Parolă nouă
              </label>
              <input
                id="new-password"
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="input"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--color-canvas-elevated)",
                  border: "1.5px solid var(--color-subtle)",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "var(--color-ink)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              id="btn-update-password-submit"
              type="submit"
              style={{
                height: 48,
                background: "var(--color-ink)",
                color: "var(--color-canvas)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                transition: "background var(--transition-fast)",
              }}
            >
              Actualizează parola
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
