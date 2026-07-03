/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Sparkles, Radio } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Badge,
  BodySm,
  SiteLogo,
} from "@verificat/ui";

const CONSENT_KEY = "local:privacy_consent";

export function App() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [streamStatus, setStreamStatus] = useState("Inactiv");
  const [interimText, setInterimText] = useState("");
  const [segments, setSegments] = useState<
    { id: string; text: string; verdict?: string; explanation?: string }[]
  >([]);
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    chrome.storage.local.get([CONSENT_KEY], (result) => {
      if (result[CONSENT_KEY]) {
        setHasConsent(true);
      } else {
        setHasConsent(false);
      }
    });

    const handleMessage = (msg: any) => {
      if (msg.type === "STREAM_TRANSCRIPT_UPDATE") {
        const text = msg.text;
        const segmentId = msg.segmentId;
        const wsType = msg.originalType || "";

        if (wsType === "interim" && text !== undefined) {
          setInterimText(text);
        } else if (wsType === "final" && segmentId && text !== undefined) {
          setInterimText("");
          setSegments((prev) => [...prev, { id: segmentId, text }]);
        }
      }

      if (msg.type === "STREAM_FACT_RESULT") {
        const segmentId = msg.segmentId;
        const verdict = msg.verdict;
        if (!segmentId || !verdict) return;
        setSegments((prev) =>
          prev.map((s) =>
            s.id === segmentId
              ? { ...s, verdict, explanation: msg.explanation }
              : s,
          ),
        );
      }

      if (msg.type === "STREAM_ERROR") {
        setStreamStatus(`Eroare: ${translateError(msg.message || "unknown")}`);
        setStreamActive(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  const handleAcceptConsent = () => {
    chrome.storage.local.set({ [CONSENT_KEY]: true }, () => {
      setHasConsent(true);
    });
  };

  const handleOpenPanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.sidePanel.open({ tabId }).then(() => window.close());
      }
    });
  };

  const handleStartStreamMic = () => {
    chrome.runtime.sendMessage({ type: "UI_START_STREAM_MIC" }, (res: any) => {
      if (res?.error) {
        setStreamStatus(`Eroare: ${translateError(res.error)}`);
        return;
      }
      setStreamActive(true);
      setStreamStatus("⏺ Ascultare activă...");
    });
  };

  const handleStartStreamTab = () => {
    chrome.runtime.sendMessage({ type: "UI_START_STREAM_TAB" }, (res: any) => {
      if (res?.error) {
        setStreamStatus(`Eroare: ${translateError(res.error)}`);
        return;
      }
      setStreamActive(true);
      setStreamStatus("⏺ Ascultare activă...");
    });
  };

  const handleStopStream = () => {
    chrome.runtime.sendMessage({ type: "UI_STOP_STREAM" });
    setStreamActive(false);
    setStreamStatus("Inactiv");
  };

  function translateError(rawMsg: string): string {
    const msg = rawMsg.toLowerCase();
    if (msg.includes("page failed to load") || msg.includes("offscreen")) {
      return "Nu s-a putut porni captarea audio. Reîncărcați extensia și încercați din nou.";
    }
    if (msg.includes("chrome pages cannot be captured") || msg.includes("restricted")) {
      return "Nu se poate captura sunetul acestei pagini. Deschideți fila cu conținutul dorit și încercați din nou.";
    }
    if (msg.includes("permission denied") || msg.includes("not allowed")) {
      return "Accesul la microfon a fost refuzat. Activați-l din setările browserului.";
    }
    if (msg.includes("websocket") || msg.includes("econnrefused")) {
      return "Conexiunea a eșuat. Verificați internetul și încercați din nou.";
    }
    return "A apărut o eroare neașteptată. (" + rawMsg + ")";
  }

  if (hasConsent === null) return null;

  return (
    <Card className="w-[360px] border-0 rounded-none overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center" style={{ pointerEvents: "none" }}>
          <SiteLogo />
        </div>
        <div style={{ pointerEvents: "auto" }}>
          {mounted && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
              aria-label="Schimbă tema"
            >
              {currentTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      </CardHeader>

      {!hasConsent ? (
        <CardContent className="px-4 pb-4 space-y-3">
          <BodySm className="text-muted-foreground">
            verificat.xyz captează audio pentru a verifica afirmațiile în timp real. Datele audio sunt procesate și nu sunt stocate după verificare.
          </BodySm>
          <a
            href="https://verificat.xyz/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary no-underline hover:text-primary hover:underline hover:underline-offset-2 hover:decoration-dotted transition-colors"
          >
            Politica de Confidențialitate
          </a>
          <Button onClick={handleAcceptConsent} className="w-full">
            Accept și Continuă
          </Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="px-4 pb-2">
            <div className="border border-border rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                <span className="font-display text-sm font-semibold text-foreground tracking-tight">
                  Verificare în Timp Real
                </span>
                {streamActive && (
                  <span className="ml-auto relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}
              </div>

              <div className="flex gap-1.5">
                <Button variant="default" size="xs" onClick={handleStartStreamMic} disabled={streamActive} className="flex-1">
                  🎤 Mic
                </Button>
                <Button variant="outline" size="xs" onClick={handleStartStreamTab} disabled={streamActive} className="flex-1">
                  🔊 Tab
                </Button>
                <Button variant="outline" size="xs" onClick={handleStopStream} disabled={!streamActive} className="flex-1">
                  ⏹ Stop
                </Button>
              </div>

              <BodySm className="text-muted-foreground">{streamStatus}</BodySm>

              <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1.5 pr-1 scrollbar-thin">
                {segments.map((seg) => (
                  <div key={seg.id} className="rounded-lg bg-muted/50 px-3 py-2">
                    <BodySm>{seg.text}</BodySm>
                    {seg.verdict && (
                      <Badge
                        variant={seg.verdict === "TRUE" ? "default" : seg.verdict === "FALSE" ? "destructive" : "secondary"}
                        className="mt-1.5 text-[10px] px-1.5 py-0"
                      >
                        {seg.verdict === "TRUE" ? "ADEVĂRAT" : seg.verdict === "FALSE" ? "FALS" : "INCERT"}
                      </Badge>
                    )}
                  </div>
                ))}
                {interimText && (
                  <BodySm className="text-muted-foreground italic px-3">{interimText}</BodySm>
                )}
              </div>
            </div>
          </CardContent>

          <div className="px-4 pb-4">
            <Button variant="outline" size="sm" onClick={handleOpenPanel} className="w-full">
              Deschide Panoul Lateral
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
