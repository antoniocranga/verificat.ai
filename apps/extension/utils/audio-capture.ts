let creating: Promise<void> | null = null;

async function ensureOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) return;

  if (creating) {
    await creating;
    return;
  }

  creating = chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: [chrome.offscreen.Reason.USER_MEDIA],
    justification: "Recording audio for verification",
  });

  await creating;
  creating = null;
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

export async function startTabCapture(): Promise<{
  stop: () => Promise<Blob>;
}> {
  await ensureOffscreenDocument();

  const streamId = await new Promise<string>((resolve, reject) => {
    if (typeof chrome.tabCapture?.getMediaStreamId === "function") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0 || !tabs[0].id) {
          reject(new Error("Nu s-a găsit fila activă."));
          return;
        }
        chrome.tabCapture.getMediaStreamId(
          { targetTabId: tabs[0].id },
          (id) => {
            if (chrome.runtime.lastError || !id) {
              reject(
                new Error(
                  chrome.runtime.lastError?.message ||
                    "Nu s-a putut obține fluxul filei.",
                ),
              );
            } else {
              resolve(id);
            }
          },
        );
      });
    } else {
      chrome.runtime.sendMessage(
        { type: "GET_TAB_STREAM_ID" },
        (res: { error?: string; streamId?: string }) => {
          if (chrome.runtime.lastError || res?.error) {
            reject(
              new Error(
                res?.error ||
                  chrome.runtime.lastError?.message ||
                  "Eroare la GET_TAB_STREAM_ID",
              ),
            );
          } else if (res?.streamId) {
            resolve(res.streamId);
          } else {
            reject(new Error("Eroare necunoscută."));
          }
        },
      );
    }
  });

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "START_OFFSCREEN_RECORDING", target: "tab", streamId },
      (response: { error?: string }) => {
        if (chrome.runtime.lastError || response?.error) {
          reject(
            new Error(
              response?.error ||
                chrome.runtime.lastError?.message ||
                "Eroare necunoscută.",
            ),
          );
          return;
        }
        resolve({
          stop: async () => {
            return new Promise((res, rej) => {
              chrome.runtime.sendMessage(
                { type: "STOP_OFFSCREEN_RECORDING" },
                (stopResponse: { error?: string; data: string }) => {
                  if (chrome.runtime.lastError || stopResponse?.error) {
                    rej(
                      new Error(
                        stopResponse?.error ||
                          chrome.runtime.lastError?.message ||
                          "Eroare la oprirea înregistrării.",
                      ),
                    );
                    return;
                  }
                  res(base64ToBlob(stopResponse.data, "audio/webm"));
                },
              );
            });
          },
        });
      },
    );
  });
}

export async function startMicCapture(): Promise<{
  stop: () => Promise<Blob>;
}> {
  await ensureOffscreenDocument();

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "START_OFFSCREEN_RECORDING", target: "mic" },
      (response: { error?: string }) => {
        if (chrome.runtime.lastError || response?.error) {
          reject(
            new Error(
              response?.error ||
                chrome.runtime.lastError?.message ||
                "Eroare necunoscută.",
            ),
          );
          return;
        }
        resolve({
          stop: async () => {
            return new Promise((res, rej) => {
              chrome.runtime.sendMessage(
                { type: "STOP_OFFSCREEN_RECORDING" },
                (stopResponse: { error?: string; data: string }) => {
                  if (chrome.runtime.lastError || stopResponse?.error) {
                    rej(
                      new Error(
                        stopResponse?.error ||
                          chrome.runtime.lastError?.message ||
                          "Eroare la oprirea înregistrării.",
                      ),
                    );
                    return;
                  }
                  res(base64ToBlob(stopResponse.data, "audio/webm"));
                },
              );
            });
          },
        });
      },
    );
  });
}
