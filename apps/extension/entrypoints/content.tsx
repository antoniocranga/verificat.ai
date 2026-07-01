import { defineContentScript } from "wxt/sandbox";
import React from "react";
import { createRoot } from "react-dom/client";
import { OverlayApp } from "../components/OverlayApp";
import "@verificat/ui/tokens.css";

export default defineContentScript({
  matches: ["*://*.youtube.com/*", "*://*.twitch.tv/*", "*://*.vimeo.com/*"],
  main() {
    const OVERLAY_ID = "verificat-verdict-overlay";

    function getOrCreateOverlay(): HTMLDivElement {
      let host = document.getElementById(OVERLAY_ID) as HTMLDivElement;
      if (!host) {
        host = document.createElement("div");
        host.id = OVERLAY_ID;
        host.style.cssText = `
          all: initial;
          position: fixed;
          bottom: 80px;
          right: 16px;
          z-index: 2147483647;
          pointer-events: auto;
        `;
        const shadow = host.attachShadow({ mode: "closed" });

        // Add font
        const fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.href = chrome.runtime.getURL("/tokens.css");
        shadow.appendChild(fontLink);

        const rootDiv = document.createElement("div");
        rootDiv.style.all = "initial"; // Reset styles for the root
        shadow.appendChild(rootDiv);

        createRoot(rootDiv).render(<OverlayApp />);
        document.body.appendChild(host);
      }
      return host;
    }

    // Ensure the overlay exists to listen to state
    getOrCreateOverlay();
  },
});
