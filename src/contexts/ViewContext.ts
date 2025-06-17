import { createContext, use } from "react";
import { ViewContextValue } from "./ViewProvider";

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

export const useView = () => use(ViewContext);
