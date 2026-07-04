import { defineContentScript } from "wxt/sandbox";
import React from "react";
import { createRoot } from "react-dom/client";
import { OverlayApp } from "../components/OverlayApp";
import tokensCss from "@verificat/ui/tokens.css?raw";

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

        const style = document.createElement("style");
        style.textContent = tokensCss;
        shadow.appendChild(style);

        const rootDiv = document.createElement("div");
        rootDiv.style.all = "initial";
        shadow.appendChild(rootDiv);

        createRoot(rootDiv).render(<OverlayApp />);
        document.body.appendChild(host);
      }
      return host;
    }

    getOrCreateOverlay();
  },
});
