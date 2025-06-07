import { useState } from "react";
import { SettingsContext } from "./useSettings";

interface SettingsProviderProps {
  children: React.ReactNode;
}
export interface SettingsContextValue {
  settings: Settings;
  saveSettings: (settings: Settings) => void;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>({
    classicBackground: localStorage.getItem("classicBackground") === "true",
  });

  const saveSettings = (settings: Settings) => {
    setSettings(settings);
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, String(value));
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export type Settings = {
  classicBackground: boolean;
};
