import { createContext, useContext } from "react";
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

export const useView = () => useContext(ViewContext);
