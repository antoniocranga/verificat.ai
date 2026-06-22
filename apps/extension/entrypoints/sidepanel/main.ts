import {
  getConsentStatus,
  setConsentStatus,
  startTabCapture,
  startMicCapture,
} from "../../utils/audio-capture";

console.log("Verificat Side Panel Loaded");

const consentTab = document.getElementById("consent-tab") as HTMLInputElement;
const consentMic = document.getElementById("consent-mic") as HTMLInputElement;
const btnTab = document.getElementById("btn-tab-record") as HTMLButtonElement;
const btnMic = document.getElementById("btn-mic-record") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;

let activeStream: MediaStream | null = null;

function updateConsent() {
  setConsentStatus({
    tabConsent: consentTab.checked,
    micConsent: consentMic.checked,
  }).catch((err) => {
    statusDiv.textContent = `Eroare salvare acord: ${String(err)}`;
  });
}

consentTab.addEventListener("change", () => {
  updateConsent();
});
consentMic.addEventListener("change", () => {
  updateConsent();
});

// Initialize checkbox state from storage
getConsentStatus()
  .then((consent) => {
    consentTab.checked = consent.tabConsent;
    consentMic.checked = consent.micConsent;
  })
  .catch((err) => {
    statusDiv.textContent = `Eroare încărcare acord: ${String(err)}`;
  });

btnTab.addEventListener("click", () => {
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
    statusDiv.textContent = "Stare: Oprit";
    btnTab.textContent = "Înregistrează Tab";
    btnMic.textContent = "Înregistrează Mic";
    return;
  }

  statusDiv.textContent = "Stare: Se inițializează capturarea tabului...";
  startTabCapture()
    .then((stream) => {
      activeStream = stream;
      statusDiv.textContent = "Stare: Se capturează tabul audio în mod activ";
      btnTab.textContent = "Oprește Înregistrarea";
    })
    .catch((err) => {
      statusDiv.textContent = `Eroare: ${String(err)}`;
    });
});

btnMic.addEventListener("click", () => {
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
    statusDiv.textContent = "Stare: Oprit";
    btnTab.textContent = "Înregistrează Tab";
    btnMic.textContent = "Înregistrează Mic";
    return;
  }

  statusDiv.textContent = "Stare: Se inițializează capturarea microfonului...";
  startMicCapture()
    .then((stream) => {
      activeStream = stream;
      statusDiv.textContent = "Stare: Se capturează microfonul în mod activ";
      btnMic.textContent = "Oprește Înregistrarea";
    })
    .catch((err) => {
      statusDiv.textContent = `Eroare: ${String(err)}`;
    });
});
