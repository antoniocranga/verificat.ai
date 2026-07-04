import { storage } from "wxt/storage";
import {
  verifyText,
  consumeVerdictStream,
  resumePendingJob,
} from "../utils/api";

// ─── Offscreen document helpers ───────────────────────────────────────────────
const OFFSCREEN_URL = chrome.runtime.getURL("offscreen.html");

async function ensureOffscreen(): Promise<void> {
  // Chrome 116+ supports hasDocument(); guard for older builds
  const hasDoc =
    typeof chrome.offscreen?.hasDocument === "function"
      ? await chrome.offscreen.hasDocument()
      : false;
  console.log(`[Background] ensureOffscreen: hasDoc before = ${hasDoc}`);
  if (!hasDoc) {
    if (!chrome.offscreen) {
      throw new Error(
        "Browserul dvs. nu suportă funcționalitatea de ascultare în fundal (necesită un browser bazat pe Chromium).",
      );
    }
    try {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_URL,
        reasons: [
          chrome.offscreen.Reason.USER_MEDIA,
          chrome.offscreen.Reason.AUDIO_PLAYBACK,
        ],
        justification: "Capture audio for real-time fact-checking",
      });
      console.log("[Background] ensureOffscreen: createDocument success");
    } catch (err) {
      console.error("[Background] ensureOffscreen: createDocument failed", err);
      throw err;
    }
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

    void (async () => {
      if (tab?.id) {
        try {
          await chrome.sidePanel.open({ tabId: tab.id });
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.error("[Background] Failed to open side panel", err);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const notify = (msg: any) => {
        void chrome.runtime.sendMessage(msg).catch(() => undefined);
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, msg).catch(() => undefined);
        }
      };

      notify({
        type: "VERIFICATION_STARTED",
        source: "text",
      });

      try {
        const jobId = await verifyText(text.trim());
        await storage.setItem("local:verification_job_id", jobId);

        await consumeVerdictStream(
          jobId,
          (p) => {
            notify({
              type: "VERIFICATION_PROGRESS",
              stage: p.stage,
              progress: p.progress,
              claim: p.claim,
            });
          },
          (result) => {
            notify({
              type: "VERIFICATION_COMPLETED",
              result,
            });
          },
          (reason) => {
            notify({
              type: "VERIFICATION_FAILED",
              reason,
            });
          },
        );
      } catch (err) {
        notify({
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
      console.log("[Background] Received message:", JSON.stringify(msg));
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

      if (msg.type === "UI_START_STREAM_MIC") {
        ensureOffscreen()
          .then(() => chrome.runtime.sendMessage({ type: "START_STREAM_MIC" }))
          .then(() => sendResponse({ ok: true }))
          .catch((err: unknown) => sendResponse({ error: String(err) }));
        return true;
      }

      if (msg.type === "UI_START_STREAM_TAB") {
        // getMediaStreamId must be called from the service worker, not offscreen
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0]?.id;
          const url = tabs[0]?.url || "";

          if (!tabId) {
            sendResponse({ error: "Nu s-a găsit fila activă." });
            return;
          }

          if (
            url.startsWith("chrome://") ||
            url.startsWith("chrome-extension://") ||
            url.startsWith("edge://") ||
            url.startsWith("about:") ||
            url.startsWith("https://chrome.google.com/webstore")
          ) {
            sendResponse({ error: "RESTRICTED_PAGE" });
            return;
          }

          chrome.tabCapture.getMediaStreamId(
            { targetTabId: tabId },
            (streamId) => {
              if (!streamId || chrome.runtime.lastError) {
                sendResponse({
                  error:
                    chrome.runtime.lastError?.message ??
                    "Nu s-a putut obține ID-ul fluxului",
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

      if (msg.type === "UI_STOP_STREAM") {
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
