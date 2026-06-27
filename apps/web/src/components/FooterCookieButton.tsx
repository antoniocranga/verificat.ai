"use client";

/**
 * Tiny client component that dispatches the vcai:open-cookie-settings event.
 * Kept separate so page.tsx remains a Server Component.
 */
export function FooterCookieButton() {
  return (
    <button
      id="btn-cookie-settings"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("vcai:open-cookie-settings"));
      }}
      style={{
        background: "none",
        border: "none",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        color: "var(--color-mid)",
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
        transition: "color var(--transition-fast)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-ink)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-mid)")}
    >
      Setări cookie-uri
    </button>
  );
}
