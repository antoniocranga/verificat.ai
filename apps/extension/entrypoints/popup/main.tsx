import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@verificat/ui";
import { App } from "./App";
import "../../globals.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>,
  );
}
