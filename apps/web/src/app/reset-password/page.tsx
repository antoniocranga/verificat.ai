import { resetPassword } from "@/app/auth/actions";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resetare parolă — verificat.ai",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const message =
    typeof params.message === "string" ? params.message : undefined;

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
        <div
          style={{ textAlign: "center", marginBottom: "var(--space-8, 32px)" }}
        >
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
            Resetare parolă
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--color-mid)",
              margin: 0,
            }}
          >
            Introduceți emailul pentru a primi un link de recuperare
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
          {message && (
            <div
              role="status"
              style={{
                marginBottom: "var(--space-5, 20px)",
                padding: "var(--space-4, 16px)",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-green-soft)",
                border: "1px solid rgba(120,140,93,0.25)",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--color-green)",
              }}
            >
              {message}
            </div>
          )}

          <form
            action={resetPassword}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4, 16px)",
            }}
          >
            <div>
              <label
                htmlFor="reset-email"
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
                Adresă de email
              </label>
              <input
                id="reset-email"
                type="email"
                name="email"
                required
                placeholder="nume@exemplu.ro"
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
              id="btn-reset-submit"
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
              Trimite link de recuperare
            </button>
          </form>

          <div
            style={{ marginTop: "var(--space-5, 20px)", textAlign: "center" }}
          >
            <Link
              href="/login"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--color-blue)",
                textDecoration: "none",
              }}
            >
              ← Înapoi la autentificare
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
