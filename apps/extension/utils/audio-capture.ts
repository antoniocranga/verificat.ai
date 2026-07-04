export async function startTabCapture(): Promise<{
  stop: () => Promise<void>;
}> {
  return new Promise((resolve, reject) => {
    console.log("[SidePanel] Sending UI_START_STREAM_TAB");
    chrome.runtime.sendMessage(
      { type: "UI_START_STREAM_TAB" },
      (response: { ok?: boolean; error?: string }) => {
        if (chrome.runtime.lastError || response?.error) {
          reject(
            new Error(
              response?.error ||
                chrome.runtime.lastError?.message ||
                "Eroare la pornirea capturii din filă.",
            ),
          );
          return;
        }
        resolve({
          stop: async () => {
            return new Promise((res, rej) => {
              chrome.runtime.sendMessage(
                { type: "UI_STOP_STREAM" },
                (stopRes: { ok?: boolean; error?: string }) => {
                  if (chrome.runtime.lastError || stopRes?.error) {
                    rej(
                      new Error(
                        stopRes?.error ||
                          chrome.runtime.lastError?.message ||
                          "Eroare la oprire.",
                      ),
                    );
                    return;
                  }
                  res();
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
  stop: () => Promise<void>;
}> {
  return new Promise((resolve, reject) => {
    console.log("[SidePanel] Sending UI_START_STREAM_MIC");
    chrome.runtime.sendMessage(
      { type: "UI_START_STREAM_MIC" },
      (response: { ok?: boolean; error?: string }) => {
        if (chrome.runtime.lastError || response?.error) {
          reject(
            new Error(
              response?.error ||
                chrome.runtime.lastError?.message ||
                "Eroare la pornirea microfonului.",
            ),
          );
          return;
        }
        resolve({
          stop: async () => {
            return new Promise((res, rej) => {
              chrome.runtime.sendMessage(
                { type: "UI_STOP_STREAM" },
                (stopRes: { ok?: boolean; error?: string }) => {
                  if (chrome.runtime.lastError || stopRes?.error) {
                    rej(
                      new Error(
                        stopRes?.error ||
                          chrome.runtime.lastError?.message ||
                          "Eroare la oprire.",
                      ),
                    );
                    return;
                  }
                  res();
                },
              );
            });
          },
        });
      },
    );
  });
}
