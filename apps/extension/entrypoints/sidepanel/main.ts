/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-floating-promises */
import { registerBrandComponent } from "../../utils/brand-component";
import { startTabCapture, startMicCapture } from "../../utils/audio-capture";

registerBrandComponent();

type SourceType = "mic" | "tab";
type State = "idle" | "preparing" | "recording";

let currentSource: SourceType = "mic";
let currentState: State = "idle";
let stopCaptureFn: (() => Promise<void>) | null = null;

const tabMicBtn = document.getElementById("tab-mic") as HTMLButtonElement;
const tabBrowserBtn = document.getElementById(
  "tab-browser",
) as HTMLButtonElement;
const actionBtn = document.getElementById("btn-action") as HTMLButtonElement;
const statusText = document.getElementById("status-text") as HTMLDivElement;
const timerText = document.getElementById("timer-text") as HTMLDivElement;
const errorBanner = document.getElementById("error-banner") as HTMLDivElement;

let elapsedSeconds = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;

function updateTimerDisplay() {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  timerText.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function startTimer() {
  if (timerInterval) return;
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerText.style.display = "block";
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerText.style.display = "none";
}

const segmentsList = document.getElementById("segments-list") as HTMLDivElement;
const interimTextDiv = document.getElementById(
  "interim-text",
) as HTMLDivElement;
const transcriptContainer = document.getElementById(
  "transcript-container",
) as HTMLDivElement;

interface Segment {
  segmentId: string;
  text: string;
  verdict?: string;
  confidence?: number;
  explanation?: string;
  sources?: string[];
}

const segments = new Map<string, Segment>();

tabMicBtn.addEventListener("click", () => {
  if (currentState !== "idle") return;
  currentSource = "mic";
  tabMicBtn.classList.add("active");
  tabBrowserBtn.classList.remove("active");
});

tabBrowserBtn.addEventListener("click", () => {
  if (currentState !== "idle") return;
  currentSource = "tab";
  tabBrowserBtn.classList.add("active");
  tabMicBtn.classList.remove("active");
});

actionBtn.addEventListener("click", () => {
  void (async () => {
    if (currentState === "idle") {
      await startListening();
    } else {
      await stopListening();
    }
  })();
});

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
  return "A apărut o eroare neașteptată. Încercați din nou. (" + rawMsg + ")";
}

function showError(msg: string) {
  errorBanner.textContent = translateError(msg);
  errorBanner.style.display = "block";
}
function clearError() {
  errorBanner.style.display = "none";
}

async function startListening() {
  clearError();
  currentState = "preparing";
  updateUI();

  try {
    const capture =
      currentSource === "mic"
        ? await startMicCapture()
        : await startTabCapture();
    stopCaptureFn = capture.stop;
    currentState = "recording";
    // Clear transcript on new recording
    segments.clear();
    segmentsList.innerHTML = "";
    interimTextDiv.textContent = "";
    interimTextDiv.style.display = "none";
    updateUI();
  } catch (err: unknown) {
    showError(err instanceof Error ? err.message : String(err));
    currentState = "idle";
    updateUI();
  }
}

async function stopListening() {
  if (stopCaptureFn) {
    try {
      await stopCaptureFn();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : String(err));
    }
  }
  stopCaptureFn = null;
  currentState = "idle";
  interimTextDiv.style.display = "none";
  updateUI();
}

function updateUI() {
  if (currentState === "idle") {
    actionBtn.textContent = "Începe ascultarea";
    actionBtn.className = "btn-primary";
    actionBtn.disabled = false;
    statusText.textContent = "Pregătit";
    tabMicBtn.disabled = false;
    tabBrowserBtn.disabled = false;
    stopTimer();
  } else if (currentState === "preparing") {
    actionBtn.textContent = "Se inițializează...";
    actionBtn.className = "btn-primary";
    actionBtn.disabled = true;
    statusText.textContent = "Așteptați...";
    tabMicBtn.disabled = true;
    tabBrowserBtn.disabled = true;
  } else if (currentState === "recording") {
    actionBtn.textContent = "Oprește";
    actionBtn.className = `btn-primary recording-${currentSource}`;
    actionBtn.disabled = false;
    statusText.textContent =
      currentSource === "mic"
        ? "Se înregistrează de la microfon"
        : "Se capturează audio din filă";
    tabMicBtn.disabled = true;
    tabBrowserBtn.disabled = true;
    startTimer();
  }
}

// Render segments
function getVerdictClass(verdict?: string) {
  if (!verdict) return "";
  const v = verdict.toLowerCase();
  if (v === "true" || v === "adevărat") return "verdict-true";
  if (v === "false" || v === "fals") return "verdict-false";
  return "verdict-misc";
}

function getVerdictLabel(verdict?: string) {
  if (!verdict) return "";
  const v = verdict.toLowerCase();
  if (v === "true" || v === "adevărat") return "ADEVĂRAT";
  if (v === "false" || v === "fals") return "FALS";
  if (v === "unverified" || v === "neverificat") return "NEVERIFICAT";
  return "INCERT";
}

function renderSegment(seg: Segment) {
  let el = document.getElementById(`seg-${seg.segmentId}`);
  if (!el) {
    el = document.createElement("div");
    el.id = `seg-${seg.segmentId}`;
    el.className = "segment";
    el.addEventListener("click", () => {
      if (seg.verdict) el!.classList.toggle("expanded");
    });
    segmentsList.appendChild(el);
  }

  el.className = `segment ${getVerdictClass(seg.verdict)}`;

  let sourcesHtml = "";
  if (seg.sources && seg.sources.length > 0) {
    sourcesHtml =
      `<div class="detail-title">Surse:</div>` +
      seg.sources
        .map(
          (s) => `<a href="${s}" class="source-link" target="_blank">${s}</a>`,
        )
        .join("<br>");
  }

  const detailsHtml = seg.verdict
    ? `
    <div class="segment-details">
      <div class="detail-explanation">${seg.explanation || ""}</div>
      ${sourcesHtml}
    </div>
  `
    : "";

  const badgeHtml = seg.verdict
    ? `
    <div class="verdict-badge">${getVerdictLabel(seg.verdict)}</div>
  `
    : "";

  el.innerHTML = `
    ${badgeHtml}
    <div class="segment-text">${seg.text}</div>
    ${detailsHtml}
  `;

  scrollToBottom();
}

function scrollToBottom() {
  transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
}

// Listen to extension messages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
chrome.runtime.onMessage.addListener((msg: any) => {
  console.log("[SidePanel] Received relay message:", msg);
  if (msg.type === "STREAM_TRANSCRIPT_UPDATE") {
    if (msg.originalType === "interim") {
      interimTextDiv.textContent = msg.text;
      interimTextDiv.style.display = "block";
      scrollToBottom();
    } else if (msg.originalType === "final") {
      interimTextDiv.style.display = "none";
      if (msg.segmentId) {
        segments.set(msg.segmentId, {
          segmentId: msg.segmentId,
          text: msg.text,
        });
        renderSegment(segments.get(msg.segmentId)!);
      }
    }
  } else if (msg.type === "STREAM_FACT_RESULT") {
    if (msg.segmentId && segments.has(msg.segmentId)) {
      const seg = segments.get(msg.segmentId)!;
      seg.verdict = msg.verdict;
      seg.confidence = msg.confidence;
      seg.explanation = msg.explanation;
      seg.sources = msg.sources;
      renderSegment(seg);
    }
  } else if (msg.type === "STREAM_ERROR") {
    showError(msg.message || "A apărut o eroare la conexiune.");
    stopListening();
  } else if (msg.type === "VERIFICATION_STARTED") {
    clearError();
    segments.clear();
    segmentsList.innerHTML = "";
    interimTextDiv.textContent = "";
    interimTextDiv.style.display = "none";
    statusText.textContent = "Se inițializează verificarea textului...";
  } else if (msg.type === "VERIFICATION_PROGRESS") {
    const labels: Record<string, string> = {
      speech: "Transcriere audio...",
      claim_detection: "Detectare afirmații...",
      evidence_retrieval: "Căutare dovezi...",
      verdict_generation: "Generare verdict...",
    };
    statusText.textContent = labels[msg.stage as string] || "Procesare...";
  } else if (msg.type === "VERIFICATION_COMPLETED") {
    statusText.textContent = "Verificare completă";
    const result = msg.result;
    if (result && result.claims && result.claims.length > 0) {
      const claim = result.claims[0];
      const segmentId = "batch-" + Date.now();
      const seg: Segment = {
        segmentId,
        text: claim.claim || "Text selectat",
        verdict: claim.verdict,
        confidence: claim.confidenceScore,
        explanation: claim.explanation,
        sources: claim.evidence?.map((e: { url: string }) => e.url) || [],
      };
      segments.set(segmentId, seg);
      renderSegment(seg);
    } else {
      showError("Nu s-au găsit afirmații verificabile.");
    }
  } else if (msg.type === "VERIFICATION_FAILED") {
    showError((msg.reason as string) || "A apărut o eroare la verificare.");
    statusText.textContent = "Eroare";
  }
});
