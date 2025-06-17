import { createContext, use } from "react";
import { SettingsContextValue } from "./SettingsProvider";

export const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export const useSettings = () => use(SettingsContext);
