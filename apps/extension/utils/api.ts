import { storage } from "wxt/storage";

const API_BASE = process.env.API_URL || "http://localhost:3000";

interface ConsentStatus {
  tabConsent: boolean;
  micConsent: boolean;
}

async function getConsentStatus(): Promise<ConsentStatus> {
  const data = await storage.getItem<ConsentStatus>("local:consent_status");
  return data || { tabConsent: false, micConsent: false };
}

export async function uploadAudio(audioBlob: Blob): Promise<string> {
  const consent = await getConsentStatus();
  if (!consent.tabConsent && !consent.micConsent) {
    throw new Error("No consent granted for audio capture.");
  }

  const token = await storage.getItem<string>("local:auth_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  headers["Content-Type"] = "audio/webm";

  const res = await fetch(`${API_BASE}/jobs/upload`, {
    method: "POST",
    headers,
    body: audioBlob,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}): ${errBody}`);
  }

  const data = (await res.json()) as { jobId: string };
  return data.jobId;
}
