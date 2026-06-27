"use client";

import { useState, useEffect, useCallback } from "react";

const CONSENT_KEY = "vcai_cookie_consent";

type ConsentState = {
  analytics: boolean;
  marketing: boolean;
} | null;

// Global consent helper — safe to call from anywhere after consent is set
if (typeof window !== "undefined") {
  (
    window as typeof window & { consentGranted: (category: string) => boolean }
  ).consentGranted = (category: string) => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) return false;
      const parsed = JSON.parse(stored) as ConsentState;
      if (!parsed) return false;
      if (category === "essential") return true;
      if (category === "analytics") return parsed.analytics ?? false;
      if (category === "marketing") return parsed.marketing ?? false;
      return false;
    } catch {
      return false;
    }
  };
}

function Toggle({
  id,
  checked,
  onChange,
  disabled = false,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: "var(--radius-pill)",
        border: "none",
        background: checked ? "var(--color-accent)" : "var(--color-subtle)",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        transition: "background var(--transition-base)",
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        padding: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "white",
          boxShadow: "var(--shadow-sm)",
          transition: "left var(--transition-base)",
        }}
      />
    </button>
  );
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  // Read localStorage after mount only
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) {
        setVisible(true);
      }
    }, 0);
  }, []);

  // Listen for "open cookie settings" event from footer
  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("vcai:open-cookie-settings", handler);
    return () =>
      window.removeEventListener("vcai:open-cookie-settings", handler);
  }, []);

  const saveConsent = useCallback(
    (state: { analytics: boolean; marketing: boolean }) => {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
      // Install the global helper with the updated consent
      (
        window as typeof window & { consentGranted: (c: string) => boolean }
      ).consentGranted = (category: string) => {
        if (category === "essential") return true;
        if (category === "analytics") return state.analytics;
        if (category === "marketing") return state.marketing;
        return false;
      };
    },
    [],
  );

  const acceptAll = useCallback(() => {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
    setModalOpen(false);
  }, [saveConsent]);

  const rejectNonEssential = useCallback(() => {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
    setModalOpen(false);
  }, [saveConsent]);

  const savePreferences = useCallback(() => {
    saveConsent(prefs);
    setVisible(false);
    setModalOpen(false);
  }, [prefs, saveConsent]);

  if (!mounted) return null;

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-label="Consimțământ cookie-uri"
        aria-modal="false"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          display: "flex",
          justifyContent: "center",
          padding: "0 var(--space-6, 24px) var(--space-4, 16px)",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            width: "100%",
            background: "var(--color-canvas-elevated)",
            borderTop: "1px solid var(--color-subtle)",
            borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
            boxShadow:
              "0 -16px 48px rgba(20,20,19,0.12), 0 -4px 12px rgba(20,20,19,0.06)",
            padding: "var(--space-6, 24px)",
            transform: visible ? "translateY(0)" : "translateY(110%)",
            opacity: visible ? 1 : 0,
            transition: "transform 300ms ease-out, opacity 300ms ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "var(--space-5, 20px)",
              justifyContent: "space-between",
            }}
          >
            {/* Description */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--color-mid)",
                margin: 0,
                flex: "1 1 320px",
                lineHeight: 1.6,
              }}
            >
              Folosim cookie-uri esențiale pentru funcționarea site-ului și, cu
              acordul dumneavoastră, cookie-uri pentru analiză și marketing.{" "}
              <a
                href="/privacy#cookie"
                style={{
                  color: "var(--color-blue)",
                  textDecoration: "none",
                }}
              >
                Politica de confidențialitate
              </a>
            </p>

            {/* Button row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "var(--space-3, 12px)",
              }}
            >
              <button
                id="btn-cookie-accept-all"
                onClick={acceptAll}
                style={{
                  height: 40,
                  padding: "0 20px",
                  background: "var(--color-ink)",
                  color: "var(--color-canvas)",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#2a2a28")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--color-ink)")
                }
              >
                Acceptă tot
              </button>

              <button
                id="btn-cookie-reject"
                onClick={rejectNonEssential}
                style={{
                  height: 40,
                  padding: "0 20px",
                  background: "transparent",
                  color: "var(--color-ink)",
                  borderRadius: "var(--radius-pill)",
                  border: "1.5px solid var(--color-subtle)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "border-color var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-mid)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-subtle)")
                }
              >
                Refuz non-esențiale
              </button>

              <button
                id="btn-cookie-manage"
                onClick={() => setModalOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--color-mid)",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Gestionează preferințe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Preferences Modal ────────────────────────────────── */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Preferințe cookie-uri"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-6, 24px)",
            background: "rgba(20,20,19,0.4)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            style={{
              background: "var(--color-canvas-elevated)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              padding: "var(--space-8, 32px)",
              width: "100%",
              maxWidth: 520,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
                margin: "0 0 var(--space-2, 8px)",
              }}
            >
              Preferințe cookie-uri
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--color-mid)",
                margin: "0 0 var(--space-6, 24px)",
                lineHeight: 1.6,
              }}
            >
              Alegeți ce tipuri de cookie-uri acceptați. Cookie-urile esențiale
              nu pot fi dezactivate — sunt necesare pentru funcționarea
              site-ului.
            </p>

            {/* Category: Essential */}
            {[
              {
                id: "toggle-essential",
                category: "essential" as const,
                title: "Esențiale",
                desc: "Necesare pentru autentificare, securitate și funcționarea de bază a site-ului. Nu pot fi dezactivate.",
                checked: true,
                disabled: true,
              },
              {
                id: "toggle-analytics",
                category: "analytics" as const,
                title: "Analiză",
                desc: "Ne ajută să înțelegem cum este utilizat site-ul, prin date anonime de trafic.",
                checked: prefs.analytics,
                disabled: false,
              },
              {
                id: "toggle-marketing",
                category: "marketing" as const,
                title: "Marketing",
                desc: "Folosite pentru afișarea de conținut publicitar relevant pentru dumneavoastră.",
                checked: prefs.marketing,
                disabled: false,
              },
            ].map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "var(--space-5, 20px)",
                  padding: "var(--space-5, 20px) 0",
                  borderTop: "1px solid var(--color-subtle)",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "var(--color-ink)",
                      margin: "0 0 4px",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--color-mid)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
                <Toggle
                  id={item.id}
                  checked={item.checked}
                  disabled={item.disabled}
                  onChange={(v) => {
                    if (item.category === "analytics")
                      setPrefs((p) => ({ ...p, analytics: v }));
                    if (item.category === "marketing")
                      setPrefs((p) => ({ ...p, marketing: v }));
                  }}
                />
              </div>
            ))}

            {/* Save */}
            <div
              style={{
                display: "flex",
                gap: "var(--space-3, 12px)",
                marginTop: "var(--space-6, 24px)",
                flexWrap: "wrap",
              }}
            >
              <button
                id="btn-cookie-save-prefs"
                onClick={savePreferences}
                style={{
                  height: 44,
                  padding: "0 24px",
                  background: "var(--color-ink)",
                  color: "var(--color-canvas)",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#2a2a28")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--color-ink)")
                }
              >
                Salvează preferințele
              </button>

              <button
                id="btn-cookie-modal-accept-all"
                onClick={acceptAll}
                style={{
                  height: 44,
                  padding: "0 24px",
                  background: "transparent",
                  color: "var(--color-ink)",
                  borderRadius: "var(--radius-pill)",
                  border: "1.5px solid var(--color-subtle)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "border-color var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-mid)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-subtle)")
                }
              >
                Acceptă tot
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
