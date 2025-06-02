import { createContext, useContext } from "react";
import { ViewContextValue } from "./ViewProvider";

export enum Views {
  MENU = "menu",
  GAME = "game",
  SCORES = "scores",
  SETTINGS = "settings",
}

export const ViewContext = createContext<ViewContextValue | undefined>(
  undefined,
);

export const useView = () => useContext(ViewContext);
