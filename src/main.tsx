import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { StoreProvider } from "./state/store";
// Self-hosted fonts (no external requests at runtime): DM Serif Display for
// headings, Plus Jakarta Sans variable for UI text, Caveat for margin notes.
import "@fontsource/dm-serif-display/400.css";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/600.css";
import "./styles.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("missing #root");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
