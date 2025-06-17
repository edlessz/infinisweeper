import { createContext, use } from "react";
import type { SettingsContextValue } from "./SettingsProvider";

export const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

export const useSettings = (): SettingsContextValue => {
  const context = use(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
