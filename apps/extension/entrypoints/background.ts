import { storage } from "wxt/storage";
import {
  verifyText,
  consumeVerdictStream,
  resumePendingJob,
} from "../utils/api";

// ─── Offscreen document helpers ───────────────────────────────────────────────
const OFFSCREEN_URL = chrome.runtime.getURL("entrypoints/offscreen/index.html");

async function ensureOffscreen(): Promise<void> {
  // Chrome 116+ supports hasDocument(); guard for older builds
  const hasDoc =
    typeof chrome.offscreen?.hasDocument === "function"
      ? await chrome.offscreen.hasDocument()
      : false;
  if (!hasDoc) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [
        chrome.offscreen.Reason.USER_MEDIA,
        chrome.offscreen.Reason.AUDIO_PLAYBACK,
      ],
      justification: "Capture audio for real-time fact-checking",
    });
  }
}

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
    (
      msg: { type: string; tabId?: number; streamId?: string },
      _sender,
      sendResponse,
    ) => {
      // ── Existing tab-stream ID helper ──────────────────────────────────
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

      // ── Real-time streaming controls (new) ─────────────────────────────

      if (msg.type === "START_STREAM_MIC") {
        ensureOffscreen()
          .then(() => chrome.runtime.sendMessage({ type: "START_STREAM_MIC" }))
          .then(() => sendResponse({ ok: true }))
          .catch((err: unknown) => sendResponse({ error: String(err) }));
        return true;
      }

      if (msg.type === "START_STREAM_TAB") {
        // getMediaStreamId must be called from the service worker, not offscreen
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0]?.id;
          if (!tabId) {
            sendResponse({ error: "No active tab found" });
            return;
          }
          chrome.tabCapture.getMediaStreamId(
            { targetTabId: tabId },
            (streamId) => {
              if (!streamId || chrome.runtime.lastError) {
                sendResponse({
                  error:
                    chrome.runtime.lastError?.message ?? "No streamId returned",
                });
                return;
              }
              ensureOffscreen()
                .then(() =>
                  chrome.runtime.sendMessage({
                    type: "START_STREAM_TAB",
                    streamId,
                  }),
                )
                .then(() => sendResponse({ ok: true }))
                .catch((err: unknown) => sendResponse({ error: String(err) }));
            },
          );
        });
        return true;
      }

      if (msg.type === "STOP_STREAM") {
        void chrome.runtime.sendMessage({ type: "STOP_STREAM" });
        sendResponse({ ok: true });
      }

      // ── Relay streaming results: offscreen → popup / content scripts ────
      if (
        msg.type === "STREAM_FACT_RESULT" ||
        msg.type === "STREAM_TRANSCRIPT_UPDATE" ||
        msg.type === "STREAM_ERROR"
      ) {
        // Relay to popup / side panel (no receivers = silent fail)
        void chrome.runtime.sendMessage(msg).catch(() => undefined);
        // Relay to content scripts in all tabs for overlay display
        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, msg).catch(() => undefined);
            }
          }
        });
      }
    },
  );

  void resumePendingJob();
});
