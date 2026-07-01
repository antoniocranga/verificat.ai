/* eslint-disable */
import React, { useEffect, useState } from "react";
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonGhostSmall,
  HeadingMd,
  BodyMd,
  BodySm,
  Surface,
} from "@verificat/ui";

const CONSENT_KEY = "local:privacy_consent";

type PopupState = "idle" | "recording" | "processing" | "result" | "error";

export function App() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [popupState, setPopupState] = useState<PopupState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [streamActive, setStreamActive] = useState(false);
  const [streamStatus, setStreamStatus] = useState("Inactiv");
  const [interimText, setInterimText] = useState("");
  const [segments, setSegments] = useState<
    { id: string; text: string; verdict?: string; explanation?: string }[]
  >([]);

  useEffect(() => {
    chrome.storage.local.get([CONSENT_KEY], (result) => {
      if (result[CONSENT_KEY]) {
        setHasConsent(true);
        chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response: any) => {
          if (response?.ready) {
            setPopupState("idle");
          }
        });
      } else {
        setHasConsent(false);
      }
    });

    const handleMessage = (msg: any) => {
      if (msg.type === "CAPTURE_STARTED") setPopupState("recording");
      if (msg.type === "VERIFICATION_STARTED") setPopupState("processing");
      if (msg.type === "VERIFICATION_PROGRESS" && popupState === "processing") {
        // Keep processing state
      }
      if (msg.type === "VERIFICATION_COMPLETED") setPopupState("result");
      if (msg.type === "VERIFICATION_FAILED") setPopupState("error");

      if (msg.type === "STREAM_TRANSCRIPT_UPDATE") {
        const text = msg.text;
        const segmentId = msg.segmentId;
        const wsType = guessWsType(msg);

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
  }, [popupState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (popupState === "recording" || streamActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [popupState, streamActive]);

  const handleAcceptConsent = () => {
    chrome.storage.local.set({ [CONSENT_KEY]: true }, () => {
      setHasConsent(true);
      setPopupState("idle");
    });
  };

  const handleStart = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.sidePanel.open({ tabId }).then(() => {
          chrome.runtime.sendMessage({ type: "START_MIC_CAPTURE" });
        });
      }
    });
  };

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    chrome.runtime.sendMessage({ type: "STOP_TAB_CAPTURE" });
    setPopupState("idle");
  };

  const handleOpenPanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.sidePanel.open({ tabId }).then(() => {
          window.close();
        });
      }
    });
  };

  const handleStartStreamMic = () => {
    chrome.runtime.sendMessage({ type: "START_STREAM_MIC" }, (res: any) => {
      if (res?.error) {
        setStreamStatus(`Eroare: ${translateError(res.error)}`);
        return;
      }
      setStreamActive(true);
      setStreamStatus("⏺ Ascultare activă...");
    });
  };

  const handleStartStreamTab = () => {
    chrome.runtime.sendMessage({ type: "START_STREAM_TAB" }, (res: any) => {
      if (res?.error) {
        setStreamStatus(`Eroare: ${translateError(res.error)}`);
        return;
      }
      setStreamActive(true);
      setStreamStatus("⏺ Ascultare activă...");
    });
  };

  const handleStopStream = () => {
    chrome.runtime.sendMessage({ type: "STOP_STREAM" });
    setStreamActive(false);
    setStreamStatus("Inactiv");
  };

  function guessWsType(msg: any): string {
    if (msg.segmentId && msg.verdict) return "result";
    if (msg.segmentId && msg.text) return "final";
    if (msg.text && !msg.segmentId) return "interim";
    return "unknown";
  }

  function translateError(rawMsg: string): string {
    const msg = rawMsg.toLowerCase();
    if (msg.includes("page failed to load") || msg.includes("offscreen")) {
      return "Nu s-a putut porni captarea audio. Reîncărcați extensia și încercați din nou.";
    }
    if (
      msg.includes("chrome pages cannot be captured") ||
      msg.includes("restricted")
    ) {
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

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timerDisplay = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  if (hasConsent === null) return null;

  if (!hasConsent) {
    return (
      <Surface
        elevation="base"
        style={{ padding: "var(--spacing-md)", width: "320px" }}
      >
        <HeadingMd style={{ marginBottom: "var(--spacing-sm)" }}>
          Confidențialitate
        </HeadingMd>
        <BodyMd style={{ marginBottom: "var(--spacing-sm)" }}>
          verificat.xyz captează audio pentru a verifica afirmațiile în timp
          real. Datele audio sunt procesate și nu sunt stocate după verificare.
        </BodyMd>
        <BodySm style={{ marginBottom: "var(--spacing-md)" }}>
          <a
            href={`${process.env.VITE_WEB_HOST || "https://verificat.xyz"}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-blue)" }}
          >
            Politica de Confidențialitate
          </a>
        </BodySm>
        <ButtonPrimary onClick={handleAcceptConsent} style={{ width: "100%" }}>
          Accept și Continuă
        </ButtonPrimary>
      </Surface>
    );
  }

  return (
    <Surface
      elevation="base"
      style={{ padding: "var(--spacing-md)", width: "320px" }}
    >
      <BodySm
        style={{
          color: "var(--color-mid)",
          textAlign: "center",
          marginBottom: "var(--spacing-md)",
        }}
      >
        {popupState === "idle"
          ? "Pregătit"
          : popupState === "recording"
            ? "Se ascultă..."
            : popupState === "processing"
              ? "Se verifică..."
              : popupState === "result"
                ? "Verdict primit"
                : "Eroare"}
      </BodySm>

      {(popupState === "recording" || streamActive) && (
        <BodyMd
          style={{
            fontFamily: "var(--font-mono)",
            textAlign: "center",
            marginBottom: "var(--spacing-md)",
            fontSize: "24px",
          }}
        >
          {timerDisplay}
        </BodyMd>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)",
        }}
      >
        {popupState === "idle" ||
        popupState === "result" ||
        popupState === "error" ? (
          <ButtonPrimary onClick={handleStart}>
            {popupState === "idle"
              ? "Începe Ascultarea"
              : popupState === "result"
                ? "Noua Verificare"
                : "Încearcă din Nou"}
          </ButtonPrimary>
        ) : (
          <ButtonSecondary onClick={handleStop}>Oprește</ButtonSecondary>
        )}
        <ButtonGhostSmall onClick={handleOpenPanel} style={{ width: "100%" }}>
          Deschide Panoul Lateral
        </ButtonGhostSmall>
      </div>

      <div
        style={{
          marginTop: "var(--spacing-lg)",
          borderTop: "1px solid var(--color-subtle)",
          paddingTop: "var(--spacing-md)",
        }}
      >
        <HeadingMd
          style={{ fontSize: "16px", marginBottom: "var(--spacing-sm)" }}
        >
          Verificare în Timp Real 🇷🇴
        </HeadingMd>
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-xs)",
            marginBottom: "var(--spacing-sm)",
          }}
        >
          <ButtonSecondary
            onClick={handleStartStreamMic}
            disabled={streamActive}
            style={{ flex: 1, padding: "4px" }}
          >
            🎤 Mic
          </ButtonSecondary>
          <ButtonSecondary
            onClick={handleStartStreamTab}
            disabled={streamActive}
            style={{ flex: 1, padding: "4px" }}
          >
            🔊 Tab
          </ButtonSecondary>
          <ButtonSecondary
            onClick={handleStopStream}
            disabled={!streamActive}
            style={{ flex: 1, padding: "4px" }}
          >
            ⏹ Stop
          </ButtonSecondary>
        </div>
        <BodySm
          style={{
            color: "var(--color-mid)",
            marginBottom: "var(--spacing-sm)",
          }}
        >
          {streamStatus}
        </BodySm>

        <div
          style={{
            maxHeight: "150px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-xs)",
          }}
        >
          {segments.map((seg) => (
            <Surface
              key={seg.id}
              elevation="inset"
              style={{ padding: "var(--spacing-xs)" }}
            >
              <BodySm>{seg.text}</BodySm>
              {seg.verdict && (
                <div
                  style={{
                    marginTop: "4px",
                    display: "inline-block",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "10px",
                    fontWeight: 600,
                    backgroundColor:
                      seg.verdict === "TRUE"
                        ? "var(--color-green)"
                        : seg.verdict === "FALSE"
                          ? "var(--color-accent)"
                          : "var(--color-mid)",
                    color: "var(--color-canvas)",
                  }}
                >
                  {seg.verdict === "TRUE"
                    ? "ADEVĂRAT"
                    : seg.verdict === "FALSE"
                      ? "FALS"
                      : "INCERT"}
                </div>
              )}
            </Surface>
          ))}
          {interimText && (
            <BodySm style={{ color: "var(--color-mid)", fontStyle: "italic" }}>
              {interimText}
            </BodySm>
          )}
        </div>
      </div>
    </Surface>
  );
}
