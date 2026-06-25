import {
  getConsentStatus,
  setConsentStatus,
  startTabCapture,
  startMicCapture,
} from "../../utils/audio-capture";

const consentTab = document.getElementById("consent-tab") as HTMLInputElement;
const consentMic = document.getElementById("consent-mic") as HTMLInputElement;
const btnTab = document.getElementById("btn-tab-record") as HTMLButtonElement;
const btnMic = document.getElementById("btn-mic-record") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;
const verdictSection = document.getElementById(
  "verdict-section",
) as HTMLDivElement;

let activeStream: MediaStream | null = null;

function updateConsent() {
  setConsentStatus({
    tabConsent: consentTab.checked,
    micConsent: consentMic.checked,
  }).catch((err: unknown) => {
    statusDiv.textContent = `Eroare salvare acord: ${String(err)}`;
  });
}

consentTab.addEventListener("change", updateConsent);
consentMic.addEventListener("change", updateConsent);

getConsentStatus()
  .then((consent) => {
    consentTab.checked = consent.tabConsent;
    consentMic.checked = consent.micConsent;
  })
  .catch((err: unknown) => {
    statusDiv.textContent = `Eroare încărcare acord: ${String(err)}`;
  });

function setStatus(text: string) {
  statusDiv.textContent = `Stare: ${text}`;
}

function showVerdict(
  verdict: string,
  explanation: string,
  confidence: number,
  evidence: Array<{ title: string; url: string; snippet: string }>,
) {
  let evidenceHtml = "";
  if (evidence && evidence.length > 0) {
    evidenceHtml = evidence
      .map(
        (e) =>
          `<div class="evidence-item">
            <div class="evidence-source-name">${e.title}</div>
            <div class="evidence-url"><a href="${e.url}" target="_blank" rel="noopener">${e.url}</a></div>
            <div style="font-size:12px;color:var(--color-mute);margin-top:2px;">${e.snippet}</div>
          </div>`,
      )
      .join("");
  }

  verdictSection.style.display = "block";
  verdictSection.innerHTML = `
    <div class="verdict-label">${verdict}</div>
    <div class="verdict-confidence">${confidence} / 100</div>
    <div class="verdict-explanation">${explanation}</div>
    ${evidenceHtml ? `<div style="margin-top:var(--spacing-sm);font-size:13px;font-weight:500;color:var(--color-ink);">Surse</div>${evidenceHtml}` : ""}
  `;
}

function showProgress(stage: string) {
  const labels: Record<string, string> = {
    speech: "Transcriere audio...",
    claim_detection: "Detectare afirmații...",
    evidence_retrieval: "Căutare dovezi...",
    verdict_generation: "Generare verdict...",
  };
  verdictSection.style.display = "block";
  verdictSection.innerHTML = `
    <div class="stage-text">${labels[stage] || "Procesare..."}</div>
  `;
}

function showStatus(text: string) {
  verdictSection.style.display = "block";
  verdictSection.innerHTML = `
    <div class="stage-text">${text}</div>
  `;
}

btnTab.addEventListener("click", () => {
  if (activeStream) {
    void chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
    setStatus("Oprit");
    btnTab.textContent = "Captură Filă";
    btnMic.disabled = false;
    return;
  }

  setStatus("Se inițializează capturarea tabului...");
  startTabCapture()
    .then((stream) => {
      activeStream = stream;
      void chrome.runtime.sendMessage({ type: "START_TAB_CAPTURE" });
      setStatus("Se capturează tabul audio");
      btnTab.textContent = "Oprește";
      btnMic.disabled = true;
    })
    .catch((err: unknown) => {
      setStatus(`Eroare: ${String(err)}`);
    });
});

btnMic.addEventListener("click", () => {
  if (activeStream) {
    void chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
    setStatus("Oprit");
    btnMic.textContent = "Captură Microfon";
    btnTab.disabled = false;
    return;
  }

  setStatus("Se inițializează microfonul...");
  startMicCapture()
    .then((stream) => {
      activeStream = stream;
      void chrome.runtime.sendMessage({ type: "START_MIC_CAPTURE" });
      setStatus("Se capturează microfonul");
      btnMic.textContent = "Oprește";
      btnTab.disabled = true;
    })
    .catch((err: unknown) => {
      setStatus(`Eroare: ${String(err)}`);
    });
});

type SidepanelMessage =
  | { type: "CAPTURE_STARTED" }
  | { type: "VERIFICATION_STARTED" }
  | { type: "VERIFICATION_PROGRESS"; stage: string }
  | {
      type: "VERIFICATION_COMPLETED";
      result: {
        claims: Array<{
          verdict: string;
          explanation: string;
          confidenceScore: number;
          evidence?: Array<{ title: string; url: string; snippet: string }>;
        }>;
      };
    }
  | { type: "VERIFICATION_FAILED"; reason: string };

chrome.runtime.onMessage.addListener((msg: SidepanelMessage) => {
  if (msg.type === "CAPTURE_STARTED") {
    showStatus("Se ascultă...");
  }
  if (msg.type === "VERIFICATION_STARTED") {
    showStatus("Se încarcă audio...");
  }
  if (msg.type === "VERIFICATION_PROGRESS") {
    showProgress(msg.stage);
  }
  if (msg.type === "VERIFICATION_COMPLETED" && msg.result?.claims?.[0]) {
    const c = msg.result.claims[0];
    showVerdict(c.verdict, c.explanation, c.confidenceScore, c.evidence ?? []);
    setStatus("Verdict primit");
  }
  if (msg.type === "VERIFICATION_FAILED") {
    verdictSection.style.display = "block";
    verdictSection.innerHTML = `<div style="text-align:center;padding:12px;color:var(--color-body);">Eroare: ${msg.reason}</div>`;
    setStatus("Eroare");
  }
});
