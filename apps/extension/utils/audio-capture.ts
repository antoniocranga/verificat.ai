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
