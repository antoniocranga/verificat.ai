const CONSENT_KEY = 'local:privacy_consent';

const consentScreen = document.getElementById("consent-screen")!;
const mainUi = document.getElementById("main-ui")!;
const btnAcceptConsent = document.getElementById("btn-accept-consent") as HTMLButtonElement;
const statusDot = document.getElementById("status-dot") as HTMLSpanElement;
const statusText = document.getElementById("status-text") as HTMLSpanElement;
const btnStart = document.getElementById("btn-start") as HTMLButtonElement;
const btnStop = document.getElementById("btn-stop") as HTMLButtonElement;
const btnOpen = document.getElementById("btn-open") as HTMLButtonElement;

function setStatus(color: string, text: string) {
  statusDot.className = `dot dot-${color}`;
  statusText.textContent = text;
}

chrome.storage.local.get([CONSENT_KEY], (result) => {
  if (result[CONSENT_KEY]) {
    consentScreen.style.display = 'none';
    mainUi.style.display = 'block';
    chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response) => {
      if (response?.ready) {
        setStatus("green", "Pregătit");
      }
    });
  }
});

btnAcceptConsent.addEventListener("click", () => {
  chrome.storage.local.set({ [CONSENT_KEY]: true }, () => {
    consentScreen.style.display = 'none';
    mainUi.style.display = 'block';
    setStatus("green", "Pregătit");
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "CAPTURE_STARTED") {
    setStatus("yellow", "Se ascultă...");
    btnStart.style.display = "none";
    btnStop.style.display = "block";
  }
  if (msg.type === "VERIFICATION_STARTED") {
    setStatus("yellow", "Se verifică...");
  }
  if (msg.type === "VERIFICATION_PROGRESS") {
    setStatus("yellow", "Se procesează...");
  }
  if (msg.type === "VERIFICATION_COMPLETED") {
    setStatus("green", "Verdict primit");
    btnStart.style.display = "block";
    btnStart.textContent = "Noua Ascultare";
    btnStop.style.display = "none";
  }
  if (msg.type === "VERIFICATION_FAILED") {
    setStatus("red", `Eroare: ${msg.reason}`);
    btnStart.style.display = "block";
    btnStart.textContent = "Incearca din Nou";
    btnStop.style.display = "none";
  }
});

btnStart.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "START_MIC_CAPTURE" }, (response) => {
    if (response?.error) {
      setStatus("red", response.error);
    }
  });
});

btnStop.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
  setStatus("gray", "Oprit");
  btnStart.style.display = "block";
  btnStart.textContent = "Incepe Ascultarea";
  btnStop.style.display = "none";
});

btnOpen.addEventListener("click", () => {
  chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId) {
      chrome.sidePanel?.open({ tabId }).catch(() => {});
    }
  });
});
