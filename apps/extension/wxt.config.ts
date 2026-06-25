import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Verificat",
    permissions: ["sidePanel", "storage", "activeTab", "tabCapture"],
    host_permissions: ["http://localhost:3000/*"],
    side_panel: {
      default_path: "entrypoints/sidepanel/index.html",
    },
  },
});
