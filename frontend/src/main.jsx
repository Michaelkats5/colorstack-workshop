// ============================================================
// PHASE 2 — State + Trigger
// File: frontend/src/main.jsx
// ============================================================
// What this file does in plain English:
// Entry point for React. It mounts App into the root element.
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
