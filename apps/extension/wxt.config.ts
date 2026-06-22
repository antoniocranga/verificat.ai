import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Verificat",
    // permissions:
    // - sidePanel: for side panel UI
    // - storage: for saving consent status locally
    // - activeTab: to access current tab audio stream
    // - tabCapture: to capture tab audio
    permissions: ["sidePanel", "storage", "activeTab", "tabCapture"],
    side_panel: {
      default_path: "entrypoints/sidepanel/index.html",
    },
  },
});
