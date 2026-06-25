type PopupMessage =
  | { type: "CAPTURE_STARTED" }
  | { type: "VERIFICATION_STARTED" }
  | { type: "VERIFICATION_PROGRESS"; stage: string }
  | { type: "VERIFICATION_COMPLETED" }
  | { type: "VERIFICATION_FAILED" }
  | { type: "GET_STATUS" };

type StatusResponse = { ready?: boolean };

const CONSENT_KEY = "local:privacy_consent";

const consentScreen = document.getElementById("consent-screen")!;
const mainUi = document.getElementById("main-ui")!;
const btnAcceptConsent = document.getElementById(
  "btn-accept-consent",
) as HTMLButtonElement;
const statusText = document.getElementById("status-text") as HTMLSpanElement;
const btnStart = document.getElementById("btn-start") as HTMLButtonElement;
const btnStop = document.getElementById("btn-stop") as HTMLButtonElement;
const btnOpen = document.getElementById("btn-open") as HTMLButtonElement;

function setStatus(text: string) {
  statusText.textContent = text;
}

chrome.storage.local.get([CONSENT_KEY], (result: Record<string, unknown>) => {
  if (result[CONSENT_KEY]) {
    consentScreen.style.display = "none";
    mainUi.style.display = "block";
    chrome.runtime.sendMessage(
      { type: "GET_STATUS" },
      (response: StatusResponse) => {
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

chrome.runtime.onMessage.addListener((msg: PopupMessage) => {
  if (msg.type === "CAPTURE_STARTED") {
    setStatus("Se ascultă...");
    btnStart.style.display = "none";
    btnStop.style.display = "block";
  }
  if (msg.type === "VERIFICATION_STARTED") {
    setStatus("Se verifică...");
  }
  if (msg.type === "VERIFICATION_PROGRESS") {
    setStatus("Se procesează...");
  }
  if (msg.type === "VERIFICATION_COMPLETED") {
    setStatus("Verdict primit");
    btnStart.style.display = "block";
    btnStart.textContent = "Noua Ascultare";
    btnStop.style.display = "none";
  }
  if (msg.type === "VERIFICATION_FAILED") {
    setStatus("Eroare");
    btnStart.style.display = "block";
    btnStart.textContent = "Incearca din Nou";
    btnStop.style.display = "none";
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
  setStatus("Oprit");
  btnStart.style.display = "block";
  btnStart.textContent = "Incepe Ascultarea";
  btnStop.style.display = "none";
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
