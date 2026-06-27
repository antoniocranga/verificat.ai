import { login, signup } from "@/app/auth/actions";
import { OAuthButtons } from "@/components/OAuthButtons";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Autentificare — verificat.ai",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const inputStyle: React.CSSProperties = {
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
  transition:
    "border-color var(--transition-fast), box-shadow var(--transition-fast)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-heading)",
  fontWeight: 500,
  fontSize: 12,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--color-mid)",
  marginBottom: 6,
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  background: "var(--color-ink)",
  color: "var(--color-canvas)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  fontFamily: "var(--font-heading)",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  letterSpacing: "-0.01em",
  transition: "background var(--transition-fast)",
};

export default async function LoginPage({ searchParams }: PageProps) {
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Warm background blobs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(217,119,87,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(106,155,204,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Branding */}
        <div
          style={{ textAlign: "center", marginBottom: "var(--space-8, 32px)" }}
        >
          <Link
            href="/"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 32,
                letterSpacing: "-0.04em",
                color: "var(--color-ink)",
                margin: "0 0 8px",
              }}
            >
              verificat
              <span style={{ color: "var(--color-accent)" }}>.ai</span>
            </h1>
          </Link>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--color-mid)",
              margin: 0,
            }}
          >
            Verificare afirmații în timp real
          </p>
        </div>

        {/* Auth card */}
        <div
          style={{
            background: "var(--color-canvas-elevated)",
            border: "1px solid var(--color-subtle)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            padding: "var(--space-8, 32px)",
          }}
        >
          {/* Error / success messages */}
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-8, 32px)",
            }}
          >
            {/* Sign in */}
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                  color: "var(--color-ink)",
                  margin: "0 0 var(--space-1, 4px)",
                }}
              >
                Autentificare
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--color-mid)",
                  margin: "0 0 var(--space-5, 20px)",
                }}
              >
                Conectați-vă la contul dumneavoastră
              </p>

              <form
                action={login}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4, 16px)",
                }}
              >
                <div>
                  <label htmlFor="login-email" style={labelStyle}>
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    required
                    placeholder="nume@exemplu.ro"
                    className="input"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <label
                      htmlFor="login-password"
                      style={{ ...labelStyle, marginBottom: 0 }}
                    >
                      Parolă
                    </label>
                    <Link
                      href="/reset-password"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "var(--color-blue)",
                        textDecoration: "none",
                      }}
                    >
                      Ați uitat parola?
                    </Link>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="input"
                    style={inputStyle}
                  />
                </div>
                <button
                  id="btn-login-submit"
                  type="submit"
                  style={primaryBtnStyle}
                >
                  Autentificare
                </button>
              </form>

              <div style={{ marginTop: "var(--space-5, 20px)" }}>
                <OAuthButtons />
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--color-subtle)" }} />

            {/* Sign up */}
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                  color: "var(--color-ink)",
                  margin: "0 0 var(--space-1, 4px)",
                }}
              >
                Creare cont
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--color-mid)",
                  margin: "0 0 var(--space-5, 20px)",
                }}
              >
                Alăturați-vă comunității de verificare
              </p>

              <form
                action={signup}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4, 16px)",
                }}
              >
                <div>
                  <label htmlFor="signup-name" style={labelStyle}>
                    Nume complet
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    name="fullName"
                    required
                    placeholder="Ion Popescu"
                    className="input"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" style={labelStyle}>
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    required
                    placeholder="nume@exemplu.ro"
                    className="input"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" style={labelStyle}>
                    Parolă
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    name="password"
                    required
                    placeholder="Minimum 8 caractere"
                    className="input"
                    style={inputStyle}
                  />
                </div>
                <button
                  id="btn-signup-submit"
                  type="submit"
                  style={{
                    ...primaryBtnStyle,
                    background: "transparent",
                    color: "var(--color-ink)",
                    border: "1.5px solid var(--color-subtle)",
                  }}
                >
                  Înregistrare
                </button>
              </form>
            </div>
          </div>

          {/* Legal footer */}
          <div
            style={{
              marginTop: "var(--space-6, 24px)",
              paddingTop: "var(--space-4, 16px)",
              borderTop: "1px solid var(--color-subtle)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--color-mid)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Prin crearea unui cont sau autentificare, acceptați{" "}
              <Link
                href="/privacy"
                style={{ color: "var(--color-blue)", textDecoration: "none" }}
              >
                Politica de Confidențialitate
              </Link>{" "}
              și{" "}
              <Link
                href="/terms"
                style={{ color: "var(--color-blue)", textDecoration: "none" }}
              >
                Termenii de Utilizare
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
