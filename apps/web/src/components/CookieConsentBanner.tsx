"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Switch, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, Card } from "@verificat/ui";

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
        className={`fixed z-[200] bottom-0 left-0 right-0 p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] transition-all duration-500 md:left-auto md:p-5 md:pb-[calc(20px+env(safe-area-inset-bottom,0px))] xl:pr-8 xl:pb-8 ${visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        role="dialog"
        aria-label="Consimțământ cookie-uri"
        aria-describedby="cookieDesc"
      >
        <Card className="max-w-[440px] md:max-w-[360px] mx-auto md:ml-auto p-5 pb-4 shadow-lg flex flex-col gap-4 bg-card/95 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-7 h-7 rounded-md bg-primary flex items-center justify-center mt-0.5">
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-white">
                <path d="M8 0a8 8 0 1016 8A8 8 0 008 0zm3.5 11.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-4 1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM6 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-base leading-snug text-foreground mb-1">
                Confidențialitatea dumneavoastră
              </div>
              <div className="text-[13px] leading-relaxed text-muted-foreground" id="cookieDesc">
                Folosim cookie-uri pentru a vă oferi o experiență mai bună.{" "}
                <a
                  href="/privacy#cookie"
                  aria-label="Mai multe despre cookie-uri"
                  className="text-primary hover:underline"
                >
                  Află mai multe
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="default" onClick={acceptAll} className="w-full">
              Acceptă tot
            </Button>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setModalOpen(true)}
                className="flex-1"
              >
                Preferințe
              </Button>
              <Button
                variant="ghost"
                onClick={rejectNonEssential}
                className="flex-1"
              >
                Refuză
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Preferences Modal ────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Preferințe cookie-uri</DialogTitle>
            <DialogDescription>
              Alegeți ce tipuri de cookie-uri acceptați. Cookie-urile esențiale
              nu pot fi dezactivate — sunt necesare pentru funcționarea
              site-ului.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
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
            ].map((item, index) => (
              <div key={item.id} className={`flex items-start justify-between gap-4 ${index > 0 ? "pt-6 border-t border-border" : ""}`}>
                <div className="flex flex-col gap-1 pr-4">
                  <h4 className="font-medium text-[15px] leading-none">{item.title}</h4>
                  <p className="text-[13px] text-muted-foreground leading-snug">
                    {item.desc}
                  </p>
                </div>
                <Switch
                  id={item.id}
                  checked={item.checked}
                  disabled={item.disabled}
                  onCheckedChange={(v) => {
                    if (item.category === "analytics")
                      setPrefs((p) => ({ ...p, analytics: v }));
                    if (item.category === "marketing")
                      setPrefs((p) => ({ ...p, marketing: v }));
                  }}
                  className="mt-1"
                />
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" onClick={savePreferences}>
              Salvează preferințele
            </Button>
            <Button variant="default" onClick={acceptAll}>
              Acceptă tot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
