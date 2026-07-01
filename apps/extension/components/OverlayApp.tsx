/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Surface, BodyMd, BodySm, SkeletonText } from "@verificat/ui";

type State = "idle" | "capturing" | "processing" | "result" | "error";

export function OverlayApp() {
  const [currentState, setCurrentState] = useState<State>("idle");
  const [statusText, setStatusText] = useState("");
  const [finalClaim, setFinalClaim] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (msg: any) => {
      if (msg.type === "CAPTURE_STARTED") {
        setCurrentState("capturing");
        setStatusText("Se ascultă...");
      }
      if (msg.type === "VERIFICATION_STARTED") {
        setCurrentState("processing");
        setStatusText("Se inițializează...");
      }
      if (msg.type === "VERIFICATION_PROGRESS") {
        setCurrentState("processing");
        const labels: Record<string, string> = {
          speech: "Transcriere audio...",
          claim_detection: "Detectare afirmații...",
          evidence_retrieval: "Căutare dovezi...",
          verdict_generation: "Generare verdict...",
        };
        setStatusText(labels[msg.stage as string] || "Procesare...");
      }
      if (msg.type === "VERIFICATION_COMPLETED") {
        const result = msg.result;
        if (result && result.claims && result.claims.length > 0) {
          setFinalClaim(result.claims[0]);
          setCurrentState("result");
        } else {
          setCurrentState("idle");
        }
      }
      if (msg.type === "VERIFICATION_FAILED") {
        setCurrentState("error");
        setStatusText(`Eroare: ${msg.reason}`);
      }
      if (msg.type === "VERIFICATION_RESUMING") {
        setCurrentState("capturing");
        setStatusText("Se reia sesiunea...");
      }
      if (msg.type === "STOP_CAPTURE" || msg.type === "STOP_STREAM") {
        setCurrentState("idle");
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  if (currentState === "idle") {
    return null;
  }

  const verdictTranslations: Record<string, string> = {
    True: "Adevărat",
    "Mostly True": "În mare parte adevărat",
    "Partially True": "Parțial adevărat",
    Misleading: "Înșelător",
    False: "Fals",
    Unverified: "Neverificat",
  };

  const isPositive = finalClaim?.verdict === "True";
  const isNegative = finalClaim?.verdict === "False";

  return (
    <Surface
      elevation="overlay"
      style={{
        minWidth: "200px",
        maxWidth: "280px",
        padding: "var(--spacing-md)",
      }}
    >
      {currentState === "capturing" && (
        <BodySm style={{ color: "var(--color-mid)", textAlign: "center" }}>
          {statusText}
        </BodySm>
      )}

      {currentState === "processing" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-xs)",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%" }}>
            <SkeletonText lines={2} />
          </div>
          <BodySm style={{ color: "var(--color-mid)" }}>{statusText}</BodySm>
        </div>
      )}

      {currentState === "error" && (
        <BodySm style={{ color: "var(--color-accent)" }}>{statusText}</BodySm>
      )}

      {currentState === "result" && finalClaim && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-xs)",
          }}
        >
          <div
            style={{
              color: isPositive
                ? "var(--color-green)"
                : isNegative
                  ? "var(--color-accent)"
                  : "var(--color-ink)",
              fontWeight: 600,
              fontSize: "14px",
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.28px",
            }}
          >
            {verdictTranslations[finalClaim.verdict] || finalClaim.verdict}
          </div>
          <BodySm style={{ color: "var(--color-mid)" }}>
            {finalClaim.confidenceScore} / 100
          </BodySm>
          <BodyMd
            style={{
              margin: "var(--spacing-xs) 0",
              color: "var(--color-inksub)",
              fontSize: "12px",
            }}
          >
            {finalClaim.explanation}
          </BodyMd>

          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "var(--color-subtle)",
              marginTop: "var(--spacing-xs)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${finalClaim.confidenceScore}%`,
                background: isPositive
                  ? "var(--color-green)"
                  : isNegative
                    ? "var(--color-accent)"
                    : "var(--color-mid)",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {finalClaim.evidence && finalClaim.evidence.length > 0 && (
            <div style={{ marginTop: "var(--spacing-xs)" }}>
              {finalClaim.evidence.slice(0, 2).map((e: any, i: number) => (
                <div
                  key={i}
                  style={{
                    borderTop: "1px solid var(--color-subtle)",
                    paddingTop: "6px",
                    marginTop: "6px",
                  }}
                >
                  <BodySm
                    style={{ fontWeight: 500, color: "var(--color-ink)" }}
                  >
                    {e.title}
                  </BodySm>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--color-blue)",
                      fontSize: "11px",
                      wordBreak: "break-all",
                      textDecoration: "none",
                    }}
                  >
                    {e.url}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Surface>
  );
}
