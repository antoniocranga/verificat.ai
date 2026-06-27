/**
 * Offscreen document — handles both batch recording (existing) and real-time
 * streaming (new) audio capture modes.
 *
 * BATCH MODE  (existing): MediaRecorder → base64 blob → background script
 * STREAM MODE (new):      AudioWorklet PCM → WebSocket → NestJS /audio gateway
 *
 * Chrome MV3 allows only ONE offscreen document at a time. Both modes share
 * this document to respect that constraint.
 */

// ─── Batch mode state (preserved from original) ───────────────────────────
let recorder: MediaRecorder | null = null;
let batchStream: MediaStream | null = null;
let chunks: Blob[] = [];

// ─── Streaming mode state (new) ───────────────────────────────────────────
let ws: WebSocket | null = null;
let audioCtx: AudioContext | null = null;
let streamingMediaStream: MediaStream | null = null;
let workletNode: AudioWorkletNode | null = null;

// Injected at build time via wxt.config.ts → vite.define
declare const __API_URL__: string;
const WS_URL = `${__API_URL__.replace(/^http/, "ws")}/audio`;

// ─────────────────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (
    msg: {
      type: string;
      target?: "mic" | "tab";
      streamId?: string;
    },
    _sender,
    sendResponse,
  ) => {
    // ── Batch mode messages (unchanged) ───────────────────────────────────
    if (msg.type === "START_OFFSCREEN_RECORDING") {
      startBatchRecording(msg.target ?? "mic", msg.streamId)
        .then(() => sendResponse({ ok: true }))
        .catch((err: unknown) => sendResponse({ error: String(err) }));
      return true;
    }

    if (msg.type === "STOP_OFFSCREEN_RECORDING") {
      stopBatchRecording()
        .then((base64) => sendResponse({ data: base64 }))
        .catch((err: unknown) => sendResponse({ error: String(err) }));
      return true;
    }

    // ── Streaming mode messages (new) ─────────────────────────────────────
    if (msg.type === "START_STREAM_MIC") {
      startStreaming("mic", null)
        .then(() => sendResponse({ ok: true }))
        .catch((err: unknown) => {
          console.error("[offscreen] Mic stream start failed:", err);
          sendResponse({ error: String(err) });
        });
      return true;
    }

    if (msg.type === "START_STREAM_TAB") {
      if (!msg.streamId) {
        sendResponse({ error: "streamId is required for tab capture" });
        return true;
      }
      startStreaming("tab", msg.streamId)
        .then(() => sendResponse({ ok: true }))
        .catch((err: unknown) => {
          console.error("[offscreen] Tab stream start failed:", err);
          sendResponse({ error: String(err) });
        });
      return true;
    }

    if (msg.type === "STOP_STREAM") {
      stopStreaming();
      sendResponse({ ok: true });
    }
  },
);

// ─── Batch recording (original logic, unchanged) ──────────────────────────

async function startBatchRecording(
  target: "mic" | "tab",
  streamId?: string,
): Promise<void> {
  if (recorder) throw new Error("Deja se înregistrează.");

  chunks = [];

  if (target === "tab" && streamId) {
    batchStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      } as unknown as MediaTrackConstraints,
      video: false,
    });
  } else if (target === "mic") {
    batchStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  } else {
    throw new Error("Parametri de înregistrare invalizi.");
  }

  recorder = new MediaRecorder(batchStream, { mimeType: "audio/webm" });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.start(1000);
}

function stopBatchRecording(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!recorder || !batchStream) {
      reject(new Error("Nicio înregistrare activă."));
      return;
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      chunks = [];
      recorder = null;
      batchStream?.getTracks().forEach((t) => t.stop());
      batchStream = null;

      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Eroare la citirea blob-ului."));
      reader.readAsDataURL(blob);
    };

    recorder.stop();
  });
}

// ─── Streaming mode (new) ─────────────────────────────────────────────────

async function startStreaming(
  source: "mic" | "tab",
  streamId: string | null,
): Promise<void> {
  stopStreaming(); // clean up any existing stream session

  // Acquire media stream
  if (source === "mic") {
    streamingMediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  } else {
    if (!streamId) throw new Error("streamId required for tab capture");
    streamingMediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      } as unknown as MediaTrackConstraints,
      video: false,
    });
  }

  // Build AudioContext at 16kHz for Deepgram compatibility
  audioCtx = new AudioContext({ sampleRate: 16000 });
  await audioCtx.audioWorklet.addModule(
    chrome.runtime.getURL("offscreen/audio-processor.js"),
  );

  const mediaSource = audioCtx.createMediaStreamSource(streamingMediaStream);
  workletNode = new AudioWorkletNode(audioCtx, "pcm-extractor");

  // Open WebSocket before connecting audio graph so we don't lose early frames
  ws = new WebSocket(WS_URL);
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    console.log("[offscreen] WebSocket connected to", WS_URL);
    // Wire PCM output → WebSocket send
    if (workletNode) {
      workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(e.data);
        }
      };
    }
    mediaSource.connect(workletNode!);
  };

  ws.onmessage = (event: MessageEvent<string>) => {
    try {
      const msg = JSON.parse(event.data) as {
        type: string;
        [key: string]: unknown;
      };
      // Relay to background script which distributes to popup + content scripts
      void chrome.runtime.sendMessage({
        ...msg,
        type:
          msg.type === "result"
            ? "STREAM_FACT_RESULT"
            : "STREAM_TRANSCRIPT_UPDATE",
      });
    } catch {
      // Ignore malformed server messages
    }
  };

  ws.onerror = (e) => {
    console.error("[offscreen] WebSocket error", e);
    void chrome.runtime.sendMessage({
      type: "STREAM_ERROR",
      message: "WebSocket error",
    });
  };

  ws.onclose = () => {
    console.log("[offscreen] WebSocket closed");
    // Do not auto-reconnect here; reconnection is managed by the popup/background
  };
}

function stopStreaming(): void {
  workletNode?.disconnect();
  workletNode = null;
  ws?.close();
  ws = null;
  streamingMediaStream?.getTracks().forEach((t) => t.stop());
  streamingMediaStream = null;
  void audioCtx?.close();
  audioCtx = null;
}
