import { createContext, useContext } from "react";

export enum Views {
  MENU = "menu",
  GAME = "game",
  SCORES = "scores",
  SETTINGS = "settings",
}

export const ViewContext = createContext({
  view: Views.MENU,
  setView: (view: Views) => {
    void view;
  },
});

export const useView = () => useContext(ViewContext);
