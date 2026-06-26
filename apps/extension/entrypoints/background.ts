import { storage } from "wxt/storage";
import {
  uploadAudio,
  verifyText,
  consumeVerdictStream,
  resumePendingJob,
} from "../utils/api";

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "verify-selection",
      title: "Verifică cu verificat.xyz",
      contexts: ["selection"],
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const text = info.selectionText;
    if (!text || text.trim().length === 0) return;

    if (tab?.id) {
      void chrome.sidePanel.open({ tabId: tab.id });
    }

    void (async () => {
      try {
        const jobId = await verifyText(text.trim());
        await storage.setItem("local:verification_job_id", jobId);
        void chrome.runtime.sendMessage({
          type: "VERIFICATION_STARTED",
          jobId,
          source: "text",
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
      } catch (err) {
        void chrome.runtime.sendMessage({
          type: "VERIFICATION_FAILED",
          reason: String(err),
        });
      }
    })();
  });

  let activeTabRecorder: MediaRecorder | null = null;
  let activeTabStream: MediaStream | null = null;

  chrome.runtime.onMessage.addListener(
    (msg: { type: string }, _sender, sendResponse) => {
      if (msg.type === "START_TAB_CAPTURE") {
        if (activeTabRecorder) {
          sendResponse({ error: "Captura audio este deja activă." });
          return;
        }

        const browserTc = (
          browser as unknown as { tabCapture?: typeof chrome.tabCapture }
        ).tabCapture;
        const tc =
          typeof browserTc?.capture === "function"
            ? browserTc
            : chrome.tabCapture;

        if (!tc?.capture) {
          sendResponse({
            error:
              "Captura audio a filei nu este disponibilă în acest navigator.",
          });
          return;
        }

        tc.capture(
          { audio: true, video: false },
          (stream: MediaStream | null) => {
            if (!stream) {
              sendResponse({
                error: "Capturarea audio a filei a eșuat sau a fost refuzată.",
              });
              return;
            }

            activeTabStream = stream;
            const recorder = new MediaRecorder(stream, {
              mimeType: "audio/webm",
            });
            activeTabRecorder = recorder;
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
              activeTabRecorder = null;
              if (activeTabStream) {
                activeTabStream.getTracks().forEach((t) => t.stop());
                activeTabStream = null;
              }
              const audioBlob = new Blob(chunks, { type: "audio/webm" });

              void (async () => {
                try {
                  const jobId = await uploadAudio(audioBlob);
                  await storage.setItem("local:verification_job_id", jobId);
                  void chrome.runtime.sendMessage({
                    type: "VERIFICATION_STARTED",
                    jobId,
                    source: "audio",
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
                } catch (err) {
                  void chrome.runtime.sendMessage({
                    type: "VERIFICATION_FAILED",
                    reason: String(err),
                  });
                }
              })();
            };

            void chrome.runtime.sendMessage({
              type: "CAPTURE_STARTED",
              captureType: "tab",
            });
            sendResponse({ ok: true });
          },
        );
        return true;
      }

      if (msg.type === "STOP_TAB_CAPTURE") {
        if (activeTabRecorder && activeTabRecorder.state === "recording") {
          activeTabRecorder.stop();
          sendResponse({ ok: true });
        } else {
          sendResponse({ error: "Nicio captură audio activă." });
        }
        return;
      }

      if (msg.type === "GET_STATUS") {
        sendResponse({ ready: true });
      }
    },
  );

  void resumePendingJob();
});
