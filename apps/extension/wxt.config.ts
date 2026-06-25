import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Verificat",
    permissions: [
      "sidePanel",
      "storage",
      "activeTab",
      "tabCapture",
      "contextMenus",
    ],
    host_permissions: [
      "http://localhost:3000/*",
      "https://api-staging.verificat.xyz/*",
      "https://api.verificat.xyz/*",
    ],
    side_panel: {
      default_path: "entrypoints/sidepanel/index.html",
    },
  },
  vite: () => ({
    define: {
      __API_URL__: JSON.stringify(
        process.env.API_URL || "http://localhost:3000",
      ),
    },
  }),
});
