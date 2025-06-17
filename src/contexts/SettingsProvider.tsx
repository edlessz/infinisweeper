import { useState } from "react";
import { SettingsContext } from "./SettingsContext";

interface SettingsProviderProps {
  children: React.ReactNode;
}
export interface SettingsContextValue {
  settings: Settings;
  saveSettings: (settings: Settings) => void;
  settingsDescriptions: Record<keyof Settings, string>;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>({
    classicBackground: localStorage.getItem("classicBackground") === "true",
    disableBorders: localStorage.getItem("disableBorders") === "true",
    disableCameraShake: localStorage.getItem("disableCameraShake") === "true",
    disableParticles: localStorage.getItem("disableParticles") === "true",
  });

  const saveSettings = (settings: Settings) => {
    setSettings(settings);
    for (const [key, value] of Object.entries(settings)) {
      localStorage.setItem(key, String(value));
    }
  };

  return (
    <SettingsContext.Provider
      value={{ settings, saveSettings, settingsDescriptions }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export type Settings = {
  classicBackground: boolean;
  disableBorders: boolean;
  disableParticles: boolean;
  disableCameraShake: boolean;
};

const settingsDescriptions: Record<keyof Settings, string> = {
  classicBackground: "Enable the classic infinisweeper background style.",
  disableBorders: "Disables borders around shown tiles.",
  disableParticles: "Disables particle effects and falling tiles.",
  disableCameraShake:
    "Disable the camera shake effect when large amounts of tiles are revealed.",
};
