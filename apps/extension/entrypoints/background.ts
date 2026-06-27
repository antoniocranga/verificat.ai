import { storage } from "wxt/storage";
import {
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

  chrome.runtime.onMessage.addListener(
    (msg: { type: string }, _sender, sendResponse) => {
      if (msg.type === "GET_TAB_STREAM_ID") {
        try {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
              return;
            }
            if (!tabs || tabs.length === 0 || !tabs[0].id) {
              sendResponse({ error: "Nu s-a găsit fila activă." });
              return;
            }

            if (typeof chrome.tabCapture?.getMediaStreamId !== "function") {
              sendResponse({
                error:
                  "API-ul chrome.tabCapture.getMediaStreamId nu este disponibil.",
              });
              return;
            }

            try {
              chrome.tabCapture.getMediaStreamId(
                { targetTabId: tabs[0].id },
                (streamId) => {
                  if (chrome.runtime.lastError) {
                    sendResponse({ error: chrome.runtime.lastError.message });
                  } else if (!streamId) {
                    sendResponse({
                      error: "Nu s-a putut obține ID-ul fluxului.",
                    });
                  } else {
                    sendResponse({ streamId });
                  }
                },
              );
            } catch (err) {
              sendResponse({
                error: err instanceof Error ? err.message : String(err),
              });
            }
          });
        } catch (err) {
          sendResponse({
            error: err instanceof Error ? err.message : String(err),
          });
        }
        return true;
      }

      if (msg.type === "GET_STATUS") {
        sendResponse({ ready: true });
      }
    },
  );

  void resumePendingJob();
});
