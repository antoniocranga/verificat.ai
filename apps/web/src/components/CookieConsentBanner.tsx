"use client";

import { useState } from "react";

const CONSENT_KEY = "verificat-cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(CONSENT_KEY) === null;
    }
    return false;
  });

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: "#0d1120",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        color: "#e2e8f0",
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
      }}
    >
      <span>
        Folosim cookie-uri esențiale pentru funcționarea site-ului.
        {}
        <a
          href="/privacy"
          target="_blank"
          style={{
            color: "#3b82f6",
            marginLeft: 4,
            textDecoration: "underline",
          }}
        >
          Află mai multe
        </a>
        .
      </span>
      <button
        onClick={accept}
        style={{
          backgroundColor: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 20px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Accept
      </button>
    </div>
  );
}
