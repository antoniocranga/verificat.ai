/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export interface ConsentStatus {
  tabConsent: boolean;
  micConsent: boolean;
}

export async function getConsentStatus(): Promise<ConsentStatus> {
  const data = await storage.getItem<ConsentStatus>("local:consent_status");
  return data || { tabConsent: false, micConsent: false };
}

export async function setConsentStatus(status: ConsentStatus): Promise<void> {
  await storage.setItem("local:consent_status", status);
}

export async function startTabCapture(): Promise<MediaStream> {
  const consent = await getConsentStatus();
  if (!consent.tabConsent) {
    throw new Error("Lipsea acordul utilizatorului pentru capturarea tabului.");
  }

  return new Promise((resolve, reject) => {
    const captureProvider =
      (browser as any).tabCapture ||
      (typeof chrome !== "undefined" ? chrome.tabCapture : null);
    if (!captureProvider) {
      return reject(
        new Error(
          "Interfața de captură a tabului nu este disponibilă în acest navigator.",
        ),
      );
    }

    captureProvider.capture(
      { audio: true, video: false },
      (stream: MediaStream | null) => {
        if (!stream) {
          return reject(
            new Error("Capturarea tabului a eșuat sau a fost refuzată."),
          );
        }
        resolve(stream);
      },
    );
  });
}

export async function startMicCapture(): Promise<MediaStream> {
  const consent = await getConsentStatus();
  if (!consent.micConsent) {
    throw new Error(
      "Lipsea acordul utilizatorului pentru accesarea microfonului.",
    );
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    return stream;
  } catch (err) {
    throw new Error(`Accesarea microfonului a eșuat: ${String(err)}`);
  }
}
