export function startTabCapture(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "START_TAB_CAPTURE" },
      (response: { ok?: boolean; error?: string }) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else if (response?.ok) {
          resolve();
        } else {
          reject(new Error("Capturarea filei nu a răspuns."));
        }
      },
    );
  });
}

export function startMicCapture(): Promise<{
  recorder: MediaRecorder;
  stream: MediaStream;
  stop: () => void;
}> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });

        resolve({
          recorder,
          stream,
          stop: () => {
            if (recorder.state === "recording") recorder.stop();
          },
        });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          reject(new Error("Accesul la microfon a fost refuzat."));
        } else if (
          err instanceof DOMException &&
          err.name === "NotFoundError"
        ) {
          reject(new Error("Nu s-a găsit niciun microfon."));
        } else {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
  });
}

export function collectChunks(recorder: MediaRecorder): {
  chunks: Blob[];
  onStop: Promise<Blob>;
} {
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const onStop = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: "audio/webm" }));
    };
  });

  return { chunks, onStop };
}
