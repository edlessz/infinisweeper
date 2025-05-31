import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Views } from "./contexts/useView.ts";
import { ViewProvider } from "./contexts/ViewProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ViewProvider defaultView={Views.MENU}>
      <App />
    </ViewProvider>
  </StrictMode>,
);
