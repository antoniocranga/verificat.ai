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
    <div className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-between gap-4 flex-wrap p-4 bg-white border-t border-[#ebebeb] text-[#4d4d4d] font-sans text-sm">
      <span>
        Folosim cookie-uri esențiale pentru funcționarea site-ului.
        <a
          href="/privacy"
          target="_blank"
          className="ml-1 text-[#0070f3] underline"
        >
          Află mai multe
        </a>
        .
      </span>
      <button
        onClick={accept}
        className="bg-[#171717] text-white border-none rounded-[6px] px-5 py-2 text-sm font-semibold cursor-pointer whitespace-nowrap"
      >
        Accept
      </button>
    </div>
  );
}
