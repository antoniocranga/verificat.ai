let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let chunks: Blob[] = [];

chrome.runtime.onMessage.addListener(
  (
    msg: { type: string; target: "mic" | "tab"; streamId?: string },
    _sender,
    sendResponse,
  ) => {
    if (msg.type === "START_OFFSCREEN_RECORDING") {
      startRecording(msg.target, msg.streamId)
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ error: String(err) }));
      return true;
    }

    if (msg.type === "STOP_OFFSCREEN_RECORDING") {
      stopRecording()
        .then((base64) => sendResponse({ data: base64 }))
        .catch((err) => sendResponse({ error: String(err) }));
      return true;
    }
  },
);

async function startRecording(target: "mic" | "tab", streamId?: string) {
  if (recorder) {
    throw new Error("Deja se înregistrează.");
  }

  chunks = [];

  if (target === "tab" && streamId) {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      } as unknown as MediaTrackConstraints,
      video: false,
    });
  } else if (target === "mic") {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  } else {
    throw new Error("Parametri de înregistrare invalizi.");
  }

  recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.start(1000);
}

function stopRecording(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!recorder || !stream) {
      reject(new Error("Nicio înregistrare activă."));
      return;
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      chunks = [];
      recorder = null;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        stream = null;
      }

      // Convert Blob to Base64 to send over chrome.runtime.sendMessage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = () => reject(new Error("Eroare la citirea blob-ului."));
      reader.readAsDataURL(blob);
    };

    recorder.stop();
  });
}
