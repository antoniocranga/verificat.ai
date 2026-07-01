/* eslint-disable */
import React, { useEffect, useState } from "react";
import {
  ButtonPrimary,
  ButtonSecondary,
  HeadingMd,
  BodyMd,
  BodySm,
  Surface,
  SkeletonText,
  ButtonPrimarySmall,
  ButtonGhostSmall,
} from "@verificat/ui";
import { startTabCapture, startMicCapture } from "../../utils/audio-capture";

type SourceType = "mic" | "tab";
type State = "idle" | "preparing" | "recording" | "processing" | "result";

interface Segment {
  segmentId: string;
  text: string;
  verdict?: string;
  confidence?: number;
  explanation?: string;
  sources?: string[];
}

export function App() {
  const [currentSource, setCurrentSource] = useState<SourceType>("mic");
  const [currentState, setCurrentState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [interimText, setInterimText] = useState("");
  const [processingStage, setProcessingStage] = useState("");

  const [finalClaim, setFinalClaim] = useState<any>(null);

  const [stopCaptureFn, setStopCaptureFn] = useState<
    (() => Promise<void>) | null
  >(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentState === "recording") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [currentState]);

  useEffect(() => {
    const handleMessage = (msg: any) => {
      console.log("[SidePanel] Received message:", msg);
      if (msg.type === "STREAM_TRANSCRIPT_UPDATE") {
        if (msg.originalType === "interim") {
          setInterimText(msg.text);
        } else if (msg.originalType === "final" && msg.segmentId) {
          setInterimText("");
          setSegments((prev) => {
            if (prev.find((s) => s.segmentId === msg.segmentId)) return prev;
            return [...prev, { segmentId: msg.segmentId, text: msg.text }];
          });
        }
      } else if (msg.type === "STREAM_FACT_RESULT") {
        setSegments((prev) =>
          prev.map((s) =>
            s.segmentId === msg.segmentId
              ? {
                  ...s,
                  verdict: msg.verdict,
                  confidence: msg.confidence,
                  explanation: msg.explanation,
                  sources: msg.sources,
                }
              : s,
          ),
        );
      } else if (msg.type === "STREAM_ERROR") {
        setErrorMsg(translateError(msg.message || "Eroare la conexiune."));
        handleStop();
      } else if (msg.type === "VERIFICATION_STARTED") {
        setErrorMsg("");
        setSegments([]);
        setInterimText("");
        setCurrentState("processing");
        setProcessingStage("Se inițializează verificarea textului...");
      } else if (msg.type === "VERIFICATION_PROGRESS") {
        const labels: Record<string, string> = {
          speech: "Transcriere audio...",
          claim_detection: "Detectare afirmații...",
          evidence_retrieval: "Căutare dovezi...",
          verdict_generation: "Generare verdict...",
        };
        setProcessingStage(labels[msg.stage as string] || "Procesare...");
      } else if (msg.type === "VERIFICATION_COMPLETED") {
        const result = msg.result;
        if (result && result.claims && result.claims.length > 0) {
          setFinalClaim(result.claims[0]);
          setCurrentState("result");
        } else {
          setFinalClaim({ empty: true });
          setCurrentState("result");
        }
      } else if (msg.type === "VERIFICATION_FAILED") {
        setErrorMsg(msg.reason || "A apărut o eroare la verificare.");
        setCurrentState("idle");
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const translateError = (rawMsg: string): string => {
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
    return `A apărut o eroare neașteptată. (${rawMsg})`;
  };

  const handleStart = async () => {
    setErrorMsg("");
    setCurrentState("preparing");
    try {
      const capture =
        currentSource === "mic"
          ? await startMicCapture()
          : await startTabCapture();
      setStopCaptureFn(() => capture.stop);
      setCurrentState("recording");
      setSegments([]);
      setInterimText("");
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
      setCurrentState("idle");
    }
  };

  const handleStop = async () => {
    if (stopCaptureFn) {
      try {
        await stopCaptureFn();
      } catch (err: any) {
        setErrorMsg(err.message || String(err));
      }
    }
    setStopCaptureFn(null);
    setCurrentState("idle");
  };

  const handleNewCheck = () => {
    setFinalClaim(null);
    setSegments([]);
    setInterimText("");
    setErrorMsg("");
    setCurrentState("idle");
  };

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timerDisplay = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const verdictTranslations: Record<string, string> = {
    True: "Adevărat",
    "Mostly True": "În mare parte adevărat",
    "Partially True": "Parțial adevărat",
    Misleading: "Înșelător",
    False: "Fals",
    Unverified: "Neverificat",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "var(--spacing-md)",
        boxSizing: "border-box",
        backgroundColor: "var(--color-canvas)",
        color: "var(--color-ink)",
      }}
    >
      <HeadingMd style={{ marginBottom: "var(--spacing-md)", flexShrink: 0 }}>
        verificat.xyz
      </HeadingMd>

      {errorMsg && (
        <Surface
          elevation="inset"
          style={{
            backgroundColor: "rgba(192, 64, 64, 0.12)",
            color: "#C04040",
            padding: "var(--spacing-sm)",
            marginBottom: "var(--spacing-md)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <BodySm>{errorMsg}</BodySm>
        </Surface>
      )}

      {(currentState === "idle" ||
        currentState === "preparing" ||
        currentState === "recording") && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-md)",
            flexShrink: 0,
            marginBottom: "var(--spacing-md)",
          }}
        >
          <Surface
            elevation="inset"
            style={{
              display: "flex",
              padding: "4px",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <button
              onClick={() => currentState === "idle" && setCurrentSource("mic")}
              style={{
                flex: 1,
                padding: "8px",
                border: "none",
                borderRadius: "var(--radius-xl)",
                backgroundColor:
                  currentSource === "mic"
                    ? "var(--color-surface-raised)"
                    : "transparent",
                color:
                  currentSource === "mic"
                    ? "var(--color-ink)"
                    : "var(--color-mid)",
                cursor: currentState === "idle" ? "pointer" : "default",
                fontWeight: 500,
                fontFamily: "var(--font-heading)",
              }}
            >
              Microfon
            </button>
            <button
              onClick={() => currentState === "idle" && setCurrentSource("tab")}
              style={{
                flex: 1,
                padding: "8px",
                border: "none",
                borderRadius: "var(--radius-xl)",
                backgroundColor:
                  currentSource === "tab"
                    ? "var(--color-surface-raised)"
                    : "transparent",
                color:
                  currentSource === "tab"
                    ? "var(--color-ink)"
                    : "var(--color-mid)",
                cursor: currentState === "idle" ? "pointer" : "default",
                fontWeight: 500,
                fontFamily: "var(--font-heading)",
              }}
            >
              Filă activă
            </button>
          </Surface>

          {currentState === "recording" && (
            <BodyMd
              style={{
                fontFamily: "var(--font-mono)",
                textAlign: "center",
                fontSize: "24px",
              }}
            >
              {timerDisplay}
            </BodyMd>
          )}

          {currentState === "idle" ? (
            <ButtonPrimary onClick={handleStart}>
              Începe ascultarea
            </ButtonPrimary>
          ) : currentState === "preparing" ? (
            <ButtonPrimary disabled>Se inițializează...</ButtonPrimary>
          ) : (
            <ButtonPrimary
              onClick={handleStop}
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              Oprește
            </ButtonPrimary>
          )}

          <BodySm style={{ textAlign: "center", color: "var(--color-mid)" }}>
            {currentState === "idle"
              ? "Pregătit"
              : currentState === "preparing"
                ? "Așteptați..."
                : currentSource === "mic"
                  ? "Se înregistrează de la microfon"
                  : "Se capturează audio din filă"}
          </BodySm>
        </div>
      )}

      {(currentState === "idle" ||
        currentState === "preparing" ||
        currentState === "recording") && (
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
          }}
        >
          {segments.map((seg) => (
            <Surface
              key={seg.segmentId}
              elevation="raised"
              style={{
                padding: "var(--spacing-sm)",
                borderLeft: `4px solid ${seg.verdict === "TRUE" ? "var(--color-green)" : seg.verdict === "FALSE" ? "var(--color-accent)" : "transparent"}`,
                backgroundColor:
                  seg.verdict === "TRUE"
                    ? "rgba(120, 140, 93, 0.1)"
                    : seg.verdict === "FALSE"
                      ? "rgba(217, 119, 87, 0.1)"
                      : "var(--surface-raised)",
              }}
            >
              {seg.verdict && (
                <div
                  style={{
                    marginBottom: "8px",
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "11px",
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
              <BodyMd>{seg.text}</BodyMd>
              {seg.verdict && (
                <div
                  style={{
                    marginTop: "var(--spacing-sm)",
                    paddingTop: "var(--spacing-sm)",
                    borderTop: "1px solid var(--color-subtle)",
                  }}
                >
                  <BodySm style={{ color: "var(--color-mid)" }}>
                    {seg.explanation}
                  </BodySm>
                  {seg.sources && seg.sources.length > 0 && (
                    <div style={{ marginTop: "var(--spacing-xs)" }}>
                      <BodySm
                        style={{ fontWeight: 600, color: "var(--color-mid)" }}
                      >
                        Surse:
                      </BodySm>
                      {seg.sources.map((s, i) => (
                        <div key={i}>
                          <a
                            href={s}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "var(--color-blue)",
                              fontSize: "12px",
                              wordBreak: "break-all",
                            }}
                          >
                            {s}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Surface>
          ))}
          {interimText && (
            <BodyMd
              style={{
                color: "var(--color-mid)",
                fontStyle: "italic",
                padding: "var(--spacing-sm)",
              }}
            >
              {interimText}
            </BodyMd>
          )}
        </div>
      )}

      {currentState === "processing" && (
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--spacing-md)",
          }}
        >
          <div style={{ width: "100%", maxWidth: "240px" }}>
            <SkeletonText lines={3} />
          </div>
          <BodyMd style={{ color: "var(--color-mid)" }}>
            {processingStage}
          </BodyMd>
        </div>
      )}

      {currentState === "result" && finalClaim && (
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flexGrow: 1, overflowY: "auto" }}>
            {finalClaim.empty ? (
              <div style={{ textAlign: "center", padding: "var(--spacing-lg) 0" }}>
                <HeadingMd style={{ color: "var(--color-ink)", marginBottom: "var(--spacing-xs)" }}>
                  Nicio afirmație găsită
                </HeadingMd>
                <BodyMd style={{ color: "var(--color-mid)" }}>
                  Nu am identificat nicio afirmație care să poată fi verificată.
                </BodyMd>
              </div>
            ) : (
              <>
                <HeadingMd
                  style={{
                    color:
                      finalClaim.verdict === "True"
                        ? "var(--color-green)"
                        : finalClaim.verdict === "False"
                          ? "var(--color-accent)"
                          : "var(--color-ink)",
                    fontSize: "32px",
                    marginBottom: "var(--spacing-xs)",
                  }}
                >
                  {verdictTranslations[finalClaim.verdict] || finalClaim.verdict}
                </HeadingMd>
            <BodyMd
              style={{
                color: "var(--color-mid)",
                marginBottom: "var(--spacing-sm)",
              }}
            >
              Încredere: {finalClaim.confidenceScore}/100
            </BodyMd>
            <BodyMd style={{ marginBottom: "var(--spacing-md)" }}>
              {finalClaim.explanation}
            </BodyMd>

            {finalClaim.evidence && finalClaim.evidence.length > 0 && (
              <div style={{ marginTop: "var(--spacing-md)" }}>
                {finalClaim.evidence.map((e: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "var(--spacing-xs) 0",
                      borderBottom: "1px solid var(--color-subtle)",
                    }}
                  >
                    <BodySm style={{ fontWeight: 500 }}>{e.title}</BodySm>
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--color-blue)",
                        fontSize: "12px",
                        wordBreak: "break-all",
                      }}
                    >
                      {e.url}
                    </a>
                  </div>
                ))}
              </div>
            )}
            </>
            )}
          </div>
          <ButtonPrimary
            onClick={handleNewCheck}
            style={{ marginTop: "var(--spacing-md)" }}
          >
            Verificare nouă
          </ButtonPrimary>
        </div>
      )}
    </div>
  );
}
