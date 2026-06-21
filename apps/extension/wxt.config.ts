import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Verificat",
    permissions: ["sidePanel", "storage"],
    side_panel: {
      default_path: "entrypoints/sidepanel/index.html",
    },
  },
});
