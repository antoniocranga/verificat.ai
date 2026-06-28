import { registerBrandComponent } from "../../utils/brand-component";
registerBrandComponent();

type PopupState = "idle" | "recording" | "processing" | "result" | "error";

let popupState: PopupState = "idle";
let elapsedSeconds = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;

const CONSENT_KEY = "local:privacy_consent";

const consentScreen = document.getElementById("consent-screen")!;
const mainUi = document.getElementById("main-ui")!;
const btnAcceptConsent = document.getElementById(
  "btn-accept-consent",
) as HTMLButtonElement;
const statusText = document.getElementById("status-text") as HTMLSpanElement;
const timerText = document.getElementById("timer-text") as HTMLDivElement;
const btnStart = document.getElementById("btn-start") as HTMLButtonElement;
const btnStop = document.getElementById("btn-stop") as HTMLButtonElement;
const btnOpen = document.getElementById("btn-open") as HTMLButtonElement;

function setStatus(text: string) {
  statusText.textContent = text;
}

function showTimer() {
  timerText.style.display = "block";
  updateTimerDisplay();
}

function hideTimer() {
  timerText.style.display = "none";
}

function startTimer() {
  elapsedSeconds = 0;
  updateTimerDisplay();
  showTimer();
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
  hideTimer();
}

function updateTimerDisplay() {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  timerText.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function showIdle() {
  popupState = "idle";
  setStatus("Pregătit");
  btnStart.style.display = "block";
  btnStart.textContent = "Începe Ascultarea";
  btnStop.style.display = "none";
  stopTimer();
}

function showRecording() {
  popupState = "recording";
  setStatus("Se ascultă...");
  btnStart.style.display = "none";
  btnStop.style.display = "block";
  startTimer();
}

function showProcessing() {
  popupState = "processing";
  setStatus("Se verifică...");
  btnStart.style.display = "none";
  btnStop.style.display = "none";
  stopTimer();
}

function showResult() {
  popupState = "result";
  setStatus("Verdict primit");
  btnStart.style.display = "block";
  btnStart.textContent = "Noua Verificare";
  btnStop.style.display = "none";
  stopTimer();
}

function showError() {
  popupState = "error";
  setStatus("Eroare");
  btnStart.style.display = "block";
  btnStart.textContent = "Încearcă din Nou";
  btnStop.style.display = "none";
  stopTimer();
}

chrome.storage.local.get([CONSENT_KEY], (result: Record<string, unknown>) => {
  if (result[CONSENT_KEY]) {
    consentScreen.style.display = "none";
    mainUi.style.display = "block";
    void chrome.runtime.sendMessage(
      { type: "GET_STATUS" },
      (response: { ready?: boolean }) => {
        if (response?.ready) {
          setStatus("Pregătit");
        }
      },
    );
  }
});

btnAcceptConsent.addEventListener("click", () => {
  chrome.storage.local.set({ [CONSENT_KEY]: true }, () => {
    consentScreen.style.display = "none";
    mainUi.style.display = "block";
    setStatus("Pregătit");
  });
});

chrome.runtime.onMessage.addListener((msg: unknown) => {
  const m = msg as Record<string, unknown>;
  if (m.type === "CAPTURE_STARTED") {
    showRecording();
  }
  if (m.type === "VERIFICATION_STARTED") {
    showProcessing();
  }
  if (m.type === "VERIFICATION_PROGRESS") {
    if (popupState === "processing") {
      setStatus("Se procesează...");
    }
  }
  if (m.type === "VERIFICATION_COMPLETED") {
    showResult();
  }
  if (m.type === "VERIFICATION_FAILED") {
    showError();
  }
});

btnStart.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId) {
      void chrome.sidePanel.open({ tabId }).then(() => {
        void chrome.runtime.sendMessage({ type: "START_MIC_CAPTURE" });
      });
    }
  });
});

btnStop.addEventListener("click", () => {
  void chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
  void chrome.runtime.sendMessage({ type: "STOP_TAB_CAPTURE" });
  showIdle();
});

btnOpen.addEventListener("click", () => {
  chrome.tabs?.query(
    { active: true, currentWindow: true },
    (tabs: Array<chrome.tabs.Tab>) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        void chrome.sidePanel?.open({ tabId });
      }
    },
  );
});

// ─── Real-time streaming controls ────────────────────────────────────────────

const btnStreamMic = document.getElementById(
  "btn-stream-mic",
) as HTMLButtonElement;
const btnStreamTab = document.getElementById(
  "btn-stream-tab",
) as HTMLButtonElement;
const btnStreamStop = document.getElementById(
  "btn-stream-stop",
) as HTMLButtonElement;
const streamStatus = document.getElementById("stream-status") as HTMLDivElement;
const streamTranscriptEl = document.getElementById(
  "stream-transcript",
) as HTMLDivElement;

// segmentId → DOM element for verdict updates
const streamSegments: Record<string, HTMLDivElement> = {};
let interimEl: HTMLDivElement | null = null;

function setStreamActive(active: boolean) {
  btnStreamMic.disabled = active;
  btnStreamTab.disabled = active;
  btnStreamStop.disabled = !active;
  streamStatus.textContent = active ? "⏺ Ascultare activă..." : "Inactiv";
}

btnStreamMic.addEventListener("click", () => {
  void chrome.runtime.sendMessage(
    { type: "START_STREAM_MIC" },
    (res: { ok?: boolean; error?: string }) => {
      if (res?.error) {
        streamStatus.textContent = `Eroare: ${res.error}`;
        return;
      }
      setStreamActive(true);
    },
  );
});

btnStreamTab.addEventListener("click", () => {
  void chrome.runtime.sendMessage(
    { type: "START_STREAM_TAB" },
    (res: { ok?: boolean; error?: string }) => {
      if (res?.error) {
        streamStatus.textContent = `Eroare: ${res.error}`;
        return;
      }
      setStreamActive(true);
    },
  );
});

btnStreamStop.addEventListener("click", () => {
  void chrome.runtime.sendMessage({ type: "STOP_STREAM" });
  setStreamActive(false);
});

/**
 * Infers the original WS message type from payload shape.
 * The background relay merges the WS message fields into the relayed object,
 * overwriting the original `type` with the relay action name.
 */
function guessWsType(msg: Record<string, unknown>): string {
  if (msg["segmentId"] && msg["verdict"]) return "result";
  if (msg["segmentId"] && msg["text"]) return "final";
  if (msg["text"] && !msg["segmentId"]) return "interim";
  return "unknown";
}

chrome.runtime.onMessage.addListener((msg: Record<string, unknown>) => {
  if (msg.type === "STREAM_TRANSCRIPT_UPDATE") {
    const text = msg["text"] as string | undefined;
    const segmentId = msg["segmentId"] as string | undefined;
    const wsType = guessWsType(msg);

    if (wsType === "interim" && text !== undefined) {
      if (!interimEl) {
        interimEl = document.createElement("div");
        interimEl.className = "interim-text";
        streamTranscriptEl.appendChild(interimEl);
      }
      interimEl.textContent = text;
    } else if (wsType === "final" && segmentId && text !== undefined) {
      interimEl?.remove();
      interimEl = null;
      const el = document.createElement("div");
      el.className = "seg";
      el.textContent = text;
      streamSegments[segmentId] = el;
      streamTranscriptEl.appendChild(el);
      streamTranscriptEl.scrollTop = streamTranscriptEl.scrollHeight;
    }
  }

  if (msg.type === "STREAM_FACT_RESULT") {
    const segmentId = msg["segmentId"] as string | undefined;
    const verdict = msg["verdict"] as string | undefined;
    if (!segmentId || !verdict) return;
    const el = streamSegments[segmentId];
    if (!el) return;

    const cls =
      verdict === "TRUE"
        ? "verdict-true"
        : verdict === "FALSE"
          ? "verdict-false"
          : verdict === "UNCERTAIN"
            ? "verdict-uncertain"
            : "";
    if (cls) {
      el.className = `seg ${cls}`;
      const badge = document.createElement("span");
      badge.className = `badge badge-${cls.replace("verdict-", "")}`;
      badge.textContent =
        verdict === "TRUE"
          ? "ADEVĂRAT"
          : verdict === "FALSE"
            ? "FALS"
            : "INCERT";
      el.appendChild(badge);
      el.title = (msg["explanation"] as string) ?? "";
    }
    streamTranscriptEl.scrollTop = streamTranscriptEl.scrollHeight;
  }

  if (msg.type === "STREAM_ERROR") {
    streamStatus.textContent = `Eroare: ${(msg["message"] as string) ?? "unknown"}`;
    setStreamActive(false);
  }
});
