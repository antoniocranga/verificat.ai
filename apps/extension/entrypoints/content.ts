export default defineContentScript({
  matches: ["*://*.youtube.com/*", "*://*.twitch.tv/*", "*://*.vimeo.com/*"],
  main() {
    const OVERLAY_ID = "verificat-verdict-overlay";

    const verdictColors: Record<string, string> = {
      True: "#22c55e",
      "Mostly True": "#84cc16",
      "Partially True": "#d97706",
      Misleading: "#ea580c",
      False: "#ef4444",
      Unverified: "#6b7280",
    };

    const verdictTranslations: Record<string, string> = {
      True: "Adevărat",
      "Mostly True": "În mare parte adevărat",
      "Partially True": "Parțial adevărat",
      Misleading: "Înșelător",
      False: "Fals",
      Unverified: "Neverificat",
    };

    function createOverlay(): HTMLDivElement {
      const existing = document.getElementById(OVERLAY_ID);
      if (existing) return existing as HTMLDivElement;

      const host = document.createElement("div");
      host.id = OVERLAY_ID;
      host.style.cssText = `
        all: initial;
        position: fixed;
        bottom: 80px;
        right: 16px;
        z-index: 2147483647;
        font-family: 'Geist Sans', Inter, Arial, sans-serif;
        max-width: 280px;
        min-width: 200px;
        pointer-events: none;
      `;

      const shadow = host.attachShadow({ mode: "closed" });
      shadow.innerHTML = `
        <style>
          :host { all: initial; display: block; }
          .card {
            background: #ffffff;
            border: 1px solid #ebebeb;
            border-radius: 12px;
            padding: 12px;
            font-size: 13px;
            line-height: 1.5;
            color: #4d4d4d;
            transition: opacity 200ms ease;
          }
          .ink { color: #171717; }
          .mute { color: #8f8f8f; }
          .verdict-label {
            font-size: 14px;
            font-weight: 600;
            color: #171717;
            letter-spacing: -0.28px;
          }
          .confidence-bar {
            height: 3px;
            border-radius: 2px;
            margin-top: 8px;
            background: #ebebeb;
          }
          .confidence-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 0.3s ease;
          }
          .status-text {
            font-size: 12px;
            color: #8f8f8f;
            text-align: center;
            padding: 4px 0;
          }
          .evidence-item {
            font-size: 11px;
            padding: 6px 0 0 0;
            border-top: 1px solid #ebebeb;
            margin-top: 6px;
          }
          .evidence-title {
            font-weight: 500;
            color: #171717;
          }
          .evidence-url {
            color: #0070f3;
            word-break: break-all;
          }
        </style>
        <div class="card" id="card">
          <div class="status-text" id="status">Pregătit</div>
        </div>
      `;

      document.body.appendChild(host);
      return host;
    }

    function showStatus(text: string) {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const el = shadow.getElementById("status");
      if (el) el.textContent = text;
    }

    function showCapturing() {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const card = shadow.getElementById("card");
      if (!card) return;
      card.innerHTML = `<div class="status-text">Se ascultă...</div>`;
    }

    function showProgress(stage: string) {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const card = shadow.getElementById("card");
      if (!card) return;
      const labels: Record<string, string> = {
        speech: "Transcriere audio...",
        claim_detection: "Detectare afirmații...",
        evidence_retrieval: "Căutare dovezi...",
        verdict_generation: "Generare verdict...",
      };
      card.innerHTML = `<div class="status-text">${labels[stage] || "Procesare..."}</div>`;
    }

    function showVerdict(
      verdict: string,
      explanation: string,
      confidence: number,
      evidence?: Array<{ title: string; url: string; snippet?: string }>,
    ) {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const card = shadow.getElementById("card");
      if (!card) return;

      const labelColor = verdictColors[verdict] || "#171717";
      let evidenceHtml = "";
      if (evidence && evidence.length > 0) {
        evidenceHtml = evidence
          .slice(0, 2)
          .map(
            (e) =>
              `<div class="evidence-item">
                <div class="evidence-title">${e.title}</div>
                <div class="evidence-url">${e.url}</div>
              </div>`,
          )
          .join("");
      }

      card.innerHTML = `
        <div class="verdict-label" style="color:${labelColor};">${verdictTranslations[verdict] || verdict}</div>
        <div style="font-size:12px;color:#8f8f8f;margin:2px 0;">${confidence} / 100</div>
        <div style="font-size:12px;margin:4px 0;color:#4d4d4d;">${explanation}</div>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${confidence}%;background:${labelColor};"></div>
        </div>
        ${evidenceHtml}
      `;
    }

    function showError(reason: string) {
      const host = document.getElementById(OVERLAY_ID);
      if (!host) return;
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const card = shadow.getElementById("card");
      if (!card) return;
      card.innerHTML = `<div class="status-text" style="color:#dc2626;">Eroare: ${reason}</div>`;
    }

    type VerdictMsg =
      | { type: "CAPTURE_STARTED" }
      | { type: "VERIFICATION_STARTED" }
      | { type: "VERIFICATION_PROGRESS"; stage: string }
      | {
          type: "VERIFICATION_COMPLETED";
          result: {
            claims?: Array<{
              verdict: string;
              explanation: string;
              confidenceScore: number;
              evidence?: Array<{
                title: string;
                url: string;
                snippet?: string;
              }>;
            }>;
          };
        }
      | { type: "VERIFICATION_FAILED"; reason: string }
      | { type: "VERIFICATION_RESUMING" };

    chrome.runtime.onMessage.addListener((msg: unknown) => {
      const m = msg as VerdictMsg;
      if (m.type === "CAPTURE_STARTED") {
        createOverlay();
        showCapturing();
      }
      if (m.type === "VERIFICATION_STARTED") {
        createOverlay();
        showStatus("Încărcare audio...");
      }
      if (m.type === "VERIFICATION_PROGRESS") {
        createOverlay();
        showProgress(m.stage);
      }
      if (m.type === "VERIFICATION_COMPLETED" && m.result) {
        const claim = m.result.claims?.[0];
        if (claim) {
          showVerdict(
            claim.verdict,
            claim.explanation,
            claim.confidenceScore,
            claim.evidence,
          );
        }
      }
      if (m.type === "VERIFICATION_FAILED") {
        showError(m.reason);
      }
      if (m.type === "VERIFICATION_RESUMING") {
        createOverlay();
        showStatus("Se reia sesiunea...");
      }
    });
  },
});
