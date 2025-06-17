import { createContext, use } from "react";
import type { ViewContextValue } from "./ViewProvider";

export enum Views {
  MENU = "menu",
  GAME = "game",
  SCOREBOARD = "scoreboard",
  SETTINGS = "settings",
  CHANGELOG = "changelog",
}

export const ViewContext = createContext<ViewContextValue | undefined>(
  undefined,
);

export const useView = (): ViewContextValue => {
  const context = use(ViewContext);
  if (!context) throw new Error("useView must be used within a ViewProvider");
  return context;
};
