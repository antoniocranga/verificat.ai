import { startTabCapture } from "../../utils/audio-capture";
import { captureAndVerifyMic } from "../../utils/api";

const btnTab = document.getElementById("btn-tab-record") as HTMLButtonElement;
const btnMic = document.getElementById("btn-mic-record") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;
const verdictSection = document.getElementById(
  "verdict-section",
) as HTMLDivElement;

const permOverlay = document.getElementById("perm-overlay") as HTMLDivElement;
const permTitle = document.getElementById("perm-title") as HTMLHeadingElement;
const permDesc = document.getElementById("perm-desc") as HTMLParagraphElement;
const btnPermAllow = document.getElementById(
  "btn-perm-allow",
) as HTMLButtonElement;
const btnPermCancel = document.getElementById(
  "btn-perm-cancel",
) as HTMLButtonElement;

let pendingCapture: "tab" | "mic" | null = null;
let recordingType: "tab" | "mic" | null = null;

function setStatus(text: string) {
  statusDiv.textContent = `Stare: ${text}`;
}

const verdictTranslations: Record<string, string> = {
  True: "Adevărat",
  "Mostly True": "În mare parte adevărat",
  "Partially True": "Parțial adevărat",
  Misleading: "Înșelător",
  False: "Fals",
  Unverified: "Neverificat",
};

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
    <div class="verdict-label">${verdictTranslations[verdict] || verdict}</div>
    <div class="verdict-confidence">${confidence} / 100</div>
    <div class="verdict-explanation">${explanation}</div>
    ${evidenceHtml ? `<div style="margin-top:var(--spacing-sm);font-size:13px;font-weight:500;color:var(--color-ink);">Surse</div>${evidenceHtml}` : ""}
  `;
}

function showProgress(stage: string, pct: number, claim?: string) {
  const labels: Record<string, string> = {
    speech: "Transcriere audio...",
    claim_detection: "Detectare afirmații...",
    evidence_retrieval: "Căutare dovezi...",
    verdict_generation: "Generare verdict...",
  };
  const clampedPct = Math.max(0, Math.min(100, pct));
  let html = `<div class="stage-text">${labels[stage] || "Procesare..."} ${clampedPct}%</div>`;
  html += `<div class="progress-bar-track"><div class="progress-bar-fill" style="width:${clampedPct}%"></div></div>`;
  if (claim) {
    html += `<div class="progress-claim">"${claim.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</div>`;
  }
  verdictSection.style.display = "block";
  verdictSection.innerHTML = html;
}

function showStatus(text: string) {
  verdictSection.style.display = "block";
  verdictSection.innerHTML = `
    <div class="stage-text">${text}</div>
  `;
}

function showPermDialog(type: "tab" | "mic") {
  pendingCapture = type;
  if (type === "tab") {
    permTitle.textContent = "Permisiune pentru captura audio";
    permDesc.textContent =
      "Verificat are nevoie de acces la sunetul din fila ta activă pentru a analiza și verifica afirmațiile.";
  } else {
    permTitle.textContent = "Permisiune pentru microfon";
    permDesc.textContent =
      "Verificat are nevoie de acces la microfonul tău pentru a înregistra și verifica afirmațiile.";
  }
  permOverlay.classList.add("open");
}

function hidePermDialog() {
  permOverlay.classList.remove("open");
  pendingCapture = null;
}

function resetButtons() {
  btnTab.textContent = "Captură Filă";
  btnMic.textContent = "Captură Microfon";
  btnTab.disabled = false;
  btnMic.disabled = false;
  recordingType = null;
}

btnPermCancel.addEventListener("click", hidePermDialog);

btnPermAllow.addEventListener("click", () => {
  hidePermDialog();
  if (pendingCapture === "tab") {
    startTabCaptureImpl();
  } else if (pendingCapture === "mic") {
    startMicCaptureImpl();
  }
});

function startTabCaptureImpl() {
  if (recordingType === "tab") {
    void chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    resetButtons();
    setStatus("Oprit");
    return;
  }

  setStatus("Se inițializează capturarea tabului...");
  startTabCapture()
    .then(() => {
      recordingType = "tab";
      setStatus("Se capturează tabul audio");
      btnTab.textContent = "Oprește";
      btnMic.disabled = true;
    })
    .catch((err: unknown) => {
      const msg = (err as Error).message;
      if (msg.includes("refuzat")) {
        setStatus("Captura audio a filei a fost refuzată.");
      } else {
        setStatus(`Eroare: ${msg}`);
      }
    });
}

function startMicCaptureImpl() {
  if (recordingType === "mic") {
    void chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    resetButtons();
    setStatus("Oprit");
    return;
  }

  setStatus("Se inițializează microfonul...");
  captureAndVerifyMic()
    .then(() => {
      resetButtons();
      setStatus("Verdict primit");
    })
    .catch((err: unknown) => {
      const msg = (err as Error).message;
      if (msg.includes("NotAllowed") || msg.includes("Permission")) {
        setStatus(
          "Accesul la microfon a fost refuzat. Verifică setările browserului și permite accesul la microfon.",
        );
      } else if (msg.includes("NotFound")) {
        setStatus("Nu s-a găsit niciun microfon.");
      } else {
        setStatus(`Eroare: ${msg}`);
      }
      resetButtons();
    });

  recordingType = "mic";
  setStatus("Se ascultă...");
  btnMic.textContent = "Oprește";
  btnTab.disabled = true;
}

btnTab.addEventListener("click", () => {
  if (recordingType === "tab") {
    void chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    resetButtons();
    setStatus("Oprit");
    return;
  }
  if (recordingType === "mic") return;
  showPermDialog("tab");
});

btnMic.addEventListener("click", () => {
  if (recordingType === "mic") {
    void chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    resetButtons();
    setStatus("Oprit");
    return;
  }
  if (recordingType === "tab") return;
  showPermDialog("mic");
});

type SidepanelMessage =
  | { type: "CAPTURE_STARTED" }
  | { type: "VERIFICATION_STARTED"; source?: string }
  | { type: "VERIFICATION_PROGRESS"; stage: string; progress: number; claim?: string }
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
  | { type: "VERIFICATION_FAILED"; reason: string }
  | { type: "START_MIC_CAPTURE" };

chrome.runtime.onMessage.addListener((msg: SidepanelMessage) => {
  if (msg.type === "CAPTURE_STARTED") {
    showStatus("Se ascultă...");
  }
  if (msg.type === "VERIFICATION_STARTED") {
    showStatus(msg.source === "text" ? "Se analizează textul..." : "Se încarcă audio...");
  }
  if (msg.type === "VERIFICATION_PROGRESS") {
    showProgress(msg.stage, msg.progress, msg.claim);
  }
  if (msg.type === "VERIFICATION_COMPLETED" && msg.result?.claims?.[0]) {
    const c = msg.result.claims[0];
    showVerdict(c.verdict, c.explanation, c.confidenceScore, c.evidence ?? []);
    setStatus("Verdict primit");
    resetButtons();
  }
  if (msg.type === "VERIFICATION_FAILED") {
    verdictSection.style.display = "block";
    verdictSection.innerHTML = `<div style="text-align:center;padding:12px;color:var(--color-body);">Eroare: ${msg.reason}</div>`;
    setStatus("Eroare");
    resetButtons();
  }
  if (msg.type === "START_MIC_CAPTURE") {
    showPermDialog("mic");
  }
});
