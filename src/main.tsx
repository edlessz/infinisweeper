import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DbProvider } from "./contexts/DbProvider.tsx";
import { SettingsProvider } from "./contexts/SettingsProvider.tsx";
import { Views } from "./contexts/ViewContext.ts";
import { ViewProvider } from "./contexts/ViewProvider.tsx";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <DbProvider>
      <ViewProvider defaultView={Views.MENU}>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </ViewProvider>
    </DbProvider>
  </StrictMode>,
);
