import { storage } from 'wxt/storage';

interface ConsentStatus {
  tabConsent: boolean;
  micConsent: boolean;
}

interface VerdictStreamEvent {
  type: 'progress' | 'completed' | 'failed';
  data?: string;
  jobId: string;
}

const API_BASE = process.env.PUBLIC_API_URL || 'http://localhost:3000';
const SESSION_KEY = 'local:verification_job_id';

async function getConsentStatus(): Promise<ConsentStatus> {
  const data = await storage.getItem<ConsentStatus>('local:consent_status');
  return data || { tabConsent: false, micConsent: false };
}

async function uploadAudio(audioBlob: Blob): Promise<string> {
  const consent = await getConsentStatus();
  if (!consent.tabConsent && !consent.micConsent) {
    throw new Error('No consent granted for audio capture.');
  }

  const token = await storage.getItem<string>('local:auth_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  headers['Content-Type'] = 'audio/webm';

  const res = await fetch(`${API_BASE}/jobs/upload`, {
    method: 'POST',
    headers,
    body: audioBlob,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Upload failed (${res.status}): ${errBody}`);
  }

  const data = (await res.json()) as { jobId: string };
  await storage.setItem(SESSION_KEY, data.jobId);
  return data.jobId;
}

async function consumeVerdictStream(
  jobId: string,
  onProgress: (stage: string, pct: number) => void,
  onCompleted: (result: unknown) => void,
  onFailed: (reason: string) => void,
): Promise<void> {
  const token = await storage.getItem<string>('local:auth_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'CANCEL_VERIFICATION') {
      controller.abort();
    }
  });

  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/stream`, { headers, signal: controller.signal });
    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('No response body for SSE stream');
    }
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          const eventType = line.slice(7).trim();
          if (eventType === 'completed') {
            continue;
          }
          if (eventType === 'failed') {
            continue;
          }
        }
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6)) as {
              data?: { success?: boolean; claims?: unknown[] };
              type?: string;
            };
            if (parsed.type === 'completed' && parsed.data) {
              onCompleted(parsed.data);
              return;
            }
            if (parsed.type === 'failed') {
              onFailed(typeof parsed.data === 'string' ? parsed.data : 'Job failed');
              return;
            }
          } catch {
            // non-JSON SSE data — skip
          }
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      onFailed('Cancelled by user');
    } else {
      onFailed(String(err));
    }
  }
}

async function captureAndVerify(stream: MediaStream, captureType: 'tab' | 'mic') {
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = async () => {
    stream.getTracks().forEach((t) => t.stop());
    const audioBlob = new Blob(chunks, { type: 'audio/webm' });

    try {
      const jobId = await uploadAudio(audioBlob);
      chrome.runtime.sendMessage({ type: 'VERIFICATION_STARTED', jobId });

      await consumeVerdictStream(
        jobId,
        (stage, pct) => {
          chrome.runtime.sendMessage({ type: 'VERIFICATION_PROGRESS', stage, progress: pct });
        },
        (result) => {
          chrome.runtime.sendMessage({ type: 'VERIFICATION_COMPLETED', result });
        },
        (reason) => {
          chrome.runtime.sendMessage({ type: 'VERIFICATION_FAILED', reason });
        },
      );
    } catch (err) {
      chrome.runtime.sendMessage({ type: 'VERIFICATION_FAILED', reason: String(err) });
    }
  };

  recorder.start(1000);

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'STOP_CAPTURE') {
      if (recorder.state === 'recording') recorder.stop();
    }
  });

  chrome.runtime.sendMessage({ type: 'CAPTURE_STARTED', captureType });
}

async function resumePendingJob(): Promise<void> {
  const jobId = await storage.getItem<string>(SESSION_KEY);
  if (!jobId) return;

  chrome.runtime.sendMessage({ type: 'VERIFICATION_RESUMING', jobId });
  await consumeVerdictStream(
    jobId,
    (stage, pct) => {
      chrome.runtime.sendMessage({ type: 'VERIFICATION_PROGRESS', stage, progress: pct });
    },
    (result) => {
      chrome.runtime.sendMessage({ type: 'VERIFICATION_COMPLETED', result });
      storage.removeItem(SESSION_KEY);
    },
    () => {
      storage.removeItem(SESSION_KEY);
    },
  );
}

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'START_TAB_CAPTURE') {
      const captureProvider =
        (browser as unknown as Record<string, unknown>).tabCapture ||
        (typeof chrome !== 'undefined' ? chrome.tabCapture : null);

      if (!captureProvider) {
        sendResponse({ error: 'Tab capture not available in this browser.' });
        return;
      }

      (captureProvider as { capture: (opts: { audio: boolean; video: boolean }, cb: (stream: MediaStream | null) => void) => void }).capture(
        { audio: true, video: false },
        (stream: MediaStream | null) => {
          if (!stream) {
            sendResponse({ error: 'Tab capture failed or denied.' });
            return;
          }
          captureAndVerify(stream, 'tab');
          sendResponse({ ok: true });
        },
      );
      return true;
    }

    if (msg.type === 'START_MIC_CAPTURE') {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => {
          captureAndVerify(stream, 'mic');
          sendResponse({ ok: true });
        })
        .catch((err) => {
          sendResponse({ error: String(err) });
        });
      return true;
    }

    if (msg.type === 'GET_STATUS') {
      sendResponse({ ready: true });
    }
  });

  resumePendingJob();
});
