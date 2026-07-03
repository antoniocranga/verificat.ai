import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "verificat.xyz",
    icons: {
      16: "/icon-16.png",
      32: "/icon-32.png",
      48: "/icon-48.png",
      128: "/icon-128.png",
    },
    permissions: [
      "sidePanel",
      "storage",
      "activeTab",
      "tabCapture",
      "contextMenus",
      "offscreen",
    ],
    host_permissions: [
      "http://localhost:3000/*",
      "https://api-staging.verificat.xyz/*",
      "https://api.verificat.xyz/*",
      // WebSocket connections for real-time audio streaming
      "ws://localhost:3000/*",
      "wss://api-staging.verificat.xyz/*",
      "wss://api.verificat.xyz/*",
    ],
    side_panel: {
      default_path: "entrypoints/sidepanel/index.html",
    },
    // Expose the AudioWorklet processor script to the offscreen document
    web_accessible_resources: [
      {
        resources: ["entrypoints/offscreen/audio-processor.js"],
        matches: ["<all_urls>"],
      },
    ],
  },
  vite: () => ({
    plugins: [tailwindcss()],
    define: {
      __API_URL__: JSON.stringify(
        process.env.API_URL || "http://localhost:3000",
      ),
    },
  }),
});
