import { createContext, useContext } from "react";
import { SettingsContextValue } from "./SettingsProvider";

export const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export const useSettings = () => useContext(SettingsContext);
