import { registerBrandComponent } from "../../utils/brand-component";
import { startTabCapture, startMicCapture } from "../../utils/audio-capture";
import { resumePendingJob, dispatchAndWait } from "../../utils/api";

registerBrandComponent();

type CaptureState =
  | "idle"
  | "preparing"
  | "recording"
  | "processing"
  | "result"
  | "error";
type CaptureType = "tab" | "mic";

let state: CaptureState = "idle";

let micStop: (() => Promise<Blob>) | null = null;
let elapsedSeconds = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let isTabCapturing = false;

const btnTab = document.getElementById("btn-tab-record") as HTMLButtonElement;
const btnMic = document.getElementById("btn-mic-record") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;

const idleUi = document.getElementById("idle-ui") as HTMLDivElement;
const preparingUi = document.getElementById("preparing-ui") as HTMLDivElement;
const preparingText = document.getElementById(
  "preparing-text",
) as HTMLDivElement;
const recordingUi = document.getElementById("recording-ui") as HTMLDivElement;
const timerDisplay = document.getElementById("timer-display") as HTMLDivElement;
const recordingLabel = document.getElementById(
  "recording-label",
) as HTMLDivElement;
const btnStopRecording = document.getElementById(
  "btn-stop-recording",
) as HTMLButtonElement;
const processingUi = document.getElementById("processing-ui") as HTMLDivElement;
const processingStatus = document.getElementById(
  "processing-status",
) as HTMLDivElement;
const progressDetail = document.getElementById(
  "progress-detail",
) as HTMLDivElement;
const resultUi = document.getElementById("result-ui") as HTMLDivElement;
const verdictSection = document.getElementById(
  "verdict-section",
) as HTMLDivElement;
const btnNewCheck = document.getElementById(
  "btn-new-check",
) as HTMLButtonElement;
const errorUi = document.getElementById("error-ui") as HTMLDivElement;
const errorText = document.getElementById("error-text") as HTMLDivElement;
const btnErrorRetry = document.getElementById(
  "btn-error-retry",
) as HTMLButtonElement;

const permOverlay = document.getElementById("perm-overlay") as HTMLDivElement;
const permTitle = document.getElementById("perm-title") as HTMLHeadingElement;
const permDesc = document.getElementById("perm-desc") as HTMLParagraphElement;
const btnPermAllow = document.getElementById(
  "btn-perm-allow",
) as HTMLButtonElement;
const btnPermCancel = document.getElementById(
  "btn-perm-cancel",
) as HTMLButtonElement;

let pendingCapture: CaptureType | null = null;

function setStatus(text: string) {
  statusDiv.textContent = `Stare: ${text}`;
}

function transitionTo(newState: CaptureState) {
  state = newState;
  idleUi.style.display = "none";
  preparingUi.style.display = "none";
  recordingUi.style.display = "none";
  processingUi.style.display = "none";
  resultUi.style.display = "none";
  errorUi.style.display = "none";

  switch (newState) {
    case "idle":
      idleUi.style.display = "block";
      btnTab.disabled = false;
      btnMic.disabled = false;
      btnTab.textContent = "Captură Filă";
      btnMic.textContent = "Captură Microfon";
      setStatus("Pregătit");
      break;
    case "preparing":
      preparingUi.style.display = "block";
      btnTab.disabled = true;
      btnMic.disabled = true;
      setStatus("Se inițializează...");
      break;
    case "recording":
      recordingUi.style.display = "block";
      setStatus("Se înregistrează");
      break;
    case "processing":
      processingUi.style.display = "block";
      setStatus("Se procesează");
      break;
    case "result":
      resultUi.style.display = "block";
      setStatus("Verdict primit");
      break;
    case "error":
      errorUi.style.display = "block";
      setStatus("Eroare");
      break;
  }
}

function startTimer() {
  elapsedSeconds = 0;
  updateTimer();
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimer() {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function showPermDialog(type: CaptureType) {
  pendingCapture = type;
  if (type === "tab") {
    permTitle.textContent = "Permisiune pentru captura audio";
    permDesc.innerHTML =
      "<brand-name></brand-name> are nevoie de acces la sunetul din fila ta activă pentru a analiza și verifica afirmațiile.";
  } else {
    permTitle.textContent = "Permisiune pentru microfon";
    permDesc.innerHTML =
      "<brand-name></brand-name> are nevoie de acces la microfonul tău pentru a înregistra și verifica afirmațiile.";
  }
  permOverlay.classList.add("open");
}

function hidePermDialog() {
  permOverlay.classList.remove("open");
  pendingCapture = null;
}

btnPermCancel.addEventListener("click", hidePermDialog);

btnPermAllow.addEventListener("click", () => {
  hidePermDialog();
  if (pendingCapture === "tab") {
    void startTabCaptureImpl();
  } else if (pendingCapture === "mic") {
    void startMicCaptureImpl();
  }
});

btnStopRecording.addEventListener("click", () => {
  void stopRecording();
});

btnNewCheck.addEventListener("click", () => {
  transitionTo("idle");
});

btnErrorRetry.addEventListener("click", () => {
  transitionTo("idle");
});

async function startTabCaptureImpl() {
  if (isTabCapturing) return;
  transitionTo("preparing");
  preparingText.textContent = "Se inițializează capturarea filei...";

  try {
    const capture = await startTabCapture();
    isTabCapturing = true;

    micStop = capture.stop;

    recordingLabel.textContent = "Se capturează audio din filă";
    transitionTo("recording");
    startTimer();
  } catch (err: unknown) {
    const msg = (err as Error).message;
    showInlineError(msg);
  }
}

async function startMicCaptureImpl() {
  if (micStop) return;
  transitionTo("preparing");
  preparingText.textContent = "Se inițializează microfonul...";

  try {
    const capture = await startMicCapture();
    micStop = capture.stop;

    void chrome.runtime.sendMessage({
      type: "CAPTURE_STARTED",
      captureType: "mic",
    });

    recordingLabel.textContent = "Se înregistrează de la microfon";
    transitionTo("recording");
    startTimer();
  } catch (err: unknown) {
    const msg = (err as Error).message;
    showInlineError(msg);
  }
}

async function stopRecording() {
  stopTimer();

  if (micStop) {
    const stopFn = micStop;
    micStop = null;
    isTabCapturing = false;

    transitionTo("processing");
    processingStatus.textContent = "Se procesează audio...";

    try {
      const blob = await stopFn();
      if (!blob) throw new Error("Captura audio nu a produs date.");
      processingStatus.textContent = "Se analizează...";
      await dispatchAudioAndWait(blob);
    } catch (err: unknown) {
      showInlineError((err as Error).message);
    }
  }
}

async function dispatchAudioAndWait(blob: Blob) {
  const result = (await dispatchAndWait(blob, (p) => {
    showProgress(p.stage, p.progress, p.claim);
  })) as {
    claims?: {
      verdict: string;
      explanation: string;
      confidenceScore: number;
      evidence?: { title: string; url: string; snippet: string }[];
    }[];
  };

  if (result?.claims && result.claims.length > 0) {
    const c = result.claims[0];
    showVerdict(c.verdict, c.explanation, c.confidenceScore, c.evidence ?? []);
  } else {
    showVerdict(
      "Unverified",
      "Nu s-au găsit afirmații în înregistrare.",
      0,
      [],
    );
  }
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
  progressDetail.innerHTML = html;
  processingStatus.textContent = labels[stage] || "Procesare...";
}

const verdictTranslations: Record<string, string> = {
  True: "Adevărat",
  "Mostly True": "În mare parte adevărat",
  "Partially True": "Parțial adevărat",
  Misleading: "Înșelător",
  False: "Fals",
  Unverified: "Neverificat",
};

const verdictColors: Record<string, string> = {
  True: "#22c55e",
  "Mostly True": "#84cc16",
  "Partially True": "#d97706",
  Misleading: "#ea580c",
  False: "#ef4444",
  Unverified: "#6b7280",
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

  const accentColor = verdictColors[verdict] || "#171717";

  verdictSection.innerHTML = `
    <div class="verdict-label" style="color:${accentColor};">${verdictTranslations[verdict] || verdict}</div>
    <div class="verdict-confidence">${confidence} / 100</div>
    <div class="verdict-explanation">${explanation}</div>
    ${evidenceHtml ? `<div style="margin-top:var(--spacing-sm);font-size:13px;font-weight:500;color:var(--color-ink);">Surse</div>${evidenceHtml}` : ""}
    <div class="progress-bar-track" style="margin-top:12px;">
      <div class="progress-bar-fill" style="width:${confidence}%;background:${accentColor};"></div>
    </div>
  `;
  transitionTo("result");
}

function showInlineError(message: string) {
  errorText.textContent = message;
  transitionTo("error");
}

btnTab.addEventListener("click", () => {
  if (state !== "idle") return;
  showPermDialog("tab");
});

btnMic.addEventListener("click", () => {
  if (state !== "idle") return;
  showPermDialog("mic");
});

type SidepanelMessage =
  | { type: "CAPTURE_STARTED"; captureType?: string }
  | { type: "VERIFICATION_STARTED"; source?: string; jobId?: string }
  | {
      type: "VERIFICATION_PROGRESS";
      stage: string;
      progress: number;
      claim?: string;
    }
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
  if (msg.type === "VERIFICATION_STARTED") {
    transitionTo("processing");
    processingStatus.textContent =
      msg.source === "text" ? "Se analizează textul..." : "Se încarcă audio...";
  }
  if (msg.type === "VERIFICATION_PROGRESS") {
    if (state === "processing") {
      showProgress(msg.stage, msg.progress, msg.claim);
    }
  }
  if (msg.type === "VERIFICATION_COMPLETED" && msg.result?.claims) {
    if (msg.result.claims.length > 0) {
      const c = msg.result.claims[0];
      showVerdict(
        c.verdict,
        c.explanation,
        c.confidenceScore,
        c.evidence ?? [],
      );
    } else {
      showVerdict("Unverified", "Nu s-au găsit afirmații.", 0, []);
    }
  }
  if (msg.type === "VERIFICATION_FAILED") {
    showInlineError(msg.reason);
  }
  if (msg.type === "START_MIC_CAPTURE") {
    showPermDialog("mic");
  }
});

void resumePendingJob();
