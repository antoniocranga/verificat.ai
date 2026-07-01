import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@verificat/ui/tokens.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
