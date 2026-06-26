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
