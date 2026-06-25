import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Verificat",
    permissions: ["sidePanel", "storage", "activeTab", "tabCapture"],
    host_permissions: [
      "http://localhost:3000/*",
      "https://staging.verificat.xyz/*",
      "https://api.verificat.xyz/*",
    ],
    side_panel: {
      default_path: "entrypoints/sidepanel/index.html",
    },
  },
});
