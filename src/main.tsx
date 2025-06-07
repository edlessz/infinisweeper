import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Views } from "./contexts/useView.ts";
import { ViewProvider } from "./contexts/ViewProvider.tsx";
import { DbProvider } from "./contexts/DbProvider.tsx";
import { SettingsProvider } from "./contexts/SettingsProvider.tsx";

createRoot(document.getElementById("root")!).render(
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
