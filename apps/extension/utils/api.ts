import { storage } from "wxt/storage";

declare const __API_URL__: string | undefined;
const API_BASE =
  typeof __API_URL__ !== "undefined" ? __API_URL__ : "http://localhost:3000";
const SESSION_KEY = "local:verification_job_id";

export async function verifyText(text: string): Promise<string> {
  const token = await storage.getItem<string>("local:auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/jobs/verify-text`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Trimiterea textului a eșuat (${res.status}): ${errBody}`);
  }

  const data = (await res.json()) as { jobId: string };
  return data.jobId;
}

export async function uploadAudio(audioBlob: Blob): Promise<string> {
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
    throw new Error(`Încărcarea a eșuat (${res.status}): ${errBody}`);
  }

  const data = (await res.json()) as { jobId: string };
  return data.jobId;
}

export async function resumePendingJob(): Promise<void> {
  const jobId = await storage.getItem<string>(SESSION_KEY);
  if (!jobId) return;

  void chrome.runtime.sendMessage({ type: "VERIFICATION_RESUMING", jobId });
  await consumeVerdictStream(
    jobId,
    (_p: ProgressPayload) => {},
    (result) => {
      void chrome.runtime.sendMessage({
        type: "VERIFICATION_COMPLETED",
        result,
      });
      void storage.removeItem(SESSION_KEY);
    },
    () => {
      void storage.removeItem(SESSION_KEY);
    },
  );
}

interface ProgressPayload {
  stage: string;
  progress: number;
  claim?: string;
}

export async function consumeVerdictStream(
  jobId: string,
  onProgress: (payload: ProgressPayload) => void,
  onCompleted: (result: unknown) => void,
  onFailed: (reason: string) => void,
): Promise<void> {
  const token = await storage.getItem<string>("local:auth_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();

  chrome.runtime.onMessage.addListener((msg: { type: string }) => {
    if (msg.type === "CANCEL_VERIFICATION") {
      controller.abort();
    }
  });

  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/stream`, {
      headers,
      signal: controller.signal,
    });
    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("Corp de răspuns gol pentru stream-ul SSE");
    }
    const decoder = new TextDecoder();
    let buffer = "";
    let lastEventType = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          lastEventType = line.slice(7);
          continue;
        }
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (lastEventType === "progress") {
            try {
              const parsed = JSON.parse(data) as ProgressPayload;
              onProgress(parsed);
            } catch {
              // non-JSON progress data — skip
            }
            continue;
          }
          if (lastEventType === "completed") {
            try {
              onCompleted(JSON.parse(data));
            } catch {
              onCompleted(data);
            }
            return;
          }
          if (lastEventType === "failed") {
            onFailed(data);
            return;
          }
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      onFailed("Anulat de utilizator");
    } else {
      onFailed(String(err));
    }
  }
}

export function captureAndVerifyMic(): Promise<void> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const audioBlob = new Blob(chunks, { type: "audio/webm" });

          try {
            const jobId = await uploadAudio(audioBlob);
            await storage.setItem(SESSION_KEY, jobId);
            void chrome.runtime.sendMessage({
              type: "VERIFICATION_STARTED",
              jobId,
            });

            await consumeVerdictStream(
              jobId,
              (p) => {
                void chrome.runtime.sendMessage({
                  type: "VERIFICATION_PROGRESS",
                  stage: p.stage,
                  progress: p.progress,
                  claim: p.claim,
                });
              },
              (result) => {
                void chrome.runtime.sendMessage({
                  type: "VERIFICATION_COMPLETED",
                  result,
                });
              },
              (reason) => {
                void chrome.runtime.sendMessage({
                  type: "VERIFICATION_FAILED",
                  reason,
                });
              },
            );
            resolve();
          } catch (err) {
            void chrome.runtime.sendMessage({
              type: "VERIFICATION_FAILED",
              reason: String(err),
            });
            resolve();
          }
        };

        recorder.start(1000);

        chrome.runtime.onMessage.addListener((msg: { type: string }) => {
          if (msg.type === "STOP_CAPTURE") {
            if (recorder.state === "recording") recorder.stop();
          }
        });

        void chrome.runtime.sendMessage({
          type: "CAPTURE_STARTED",
          captureType: "mic",
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          reject(err);
        } else {
          reject(new Error(String(err)));
        }
      });
  });
}
