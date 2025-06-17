import "../../stylesheets/Menu.css";
import "./Settings.css";
import { useState } from "react";
import { useDb } from "../../contexts/DbContext";
import { useSettings } from "../../contexts/SettingsContext";
import { Views, useView } from "../../contexts/ViewContext";
import MenuBackground from "../MenuBackground/MenuBackground";

export default function Settings() {
  const { setView } = useView();
  const { updateName, user, name } = useDb();
  const { settings, saveSettings, settingsDescriptions } = useSettings();

  const [nameField, setNameField] = useState<string>(name ?? "");
  const [localSettings, setLocalSettings] = useState(settings);
  const setLocalSetting = (key: keyof typeof localSettings, value: boolean) => {
    setLocalSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      return newSettings;
    });
  };

  const save = async () => {
    try {
      await updateName(nameField);
      await saveSettings(localSettings);
      setView(Views.MENU);
    } catch (error: unknown) {
      switch (error.code) {
        case "23505":
          alert("Display name already exists. Please choose another.");
          break;
        case "23514":
          alert("Display name cannot be empty.");
          break;
        default:
          alert("An unexpected error occurred. Please try again.");
      }
    }
  };
  const discard = () => setView(Views.MENU);
  return (
    <div className="Settings Menu">
      <MenuBackground />
      <h1>Settings</h1>
      <div className="table ed-form">
        <div>
          <span>Display Name:</span>
          <div>Your username on the scoreboards.</div>
        </div>
        <input
          type="text"
          defaultValue={user ? nameField : ""}
          onChange={(e) => setNameField(e.target.value)}
          disabled={!user}
          placeholder={user ? "Enter Display Name" : "Please Sign In!"}
        />
        <div>
          <span>Classic Background:</span>
          <div>{settingsDescriptions.classicBackground}</div>
        </div>
        <input
          type="checkbox"
          checked={localSettings.classicBackground}
          onChange={(e) =>
            setLocalSetting("classicBackground", e.target.checked)
          }
        />
        <div>
          <span>Disable Borders:</span>
          <div>{settingsDescriptions.disableBorders}</div>
        </div>
        <input
          type="checkbox"
          checked={localSettings.disableBorders}
          onChange={(e) => setLocalSetting("disableBorders", e.target.checked)}
        />
        <div>
          <span>Disable Camera Shake:</span>
          <div>{settingsDescriptions.disableCameraShake}</div>
        </div>
        <input
          type="checkbox"
          checked={localSettings.disableCameraShake}
          onChange={(e) =>
            setLocalSetting("disableCameraShake", e.target.checked)
          }
        />
        <div>
          <span>Disable Particles:</span>
          <div>{settingsDescriptions.disableParticles}</div>
        </div>
        <input
          type="checkbox"
          checked={localSettings.disableParticles}
          onChange={(e) =>
            setLocalSetting("disableParticles", e.target.checked)
          }
        />
      </div>
      <div className="button-container">
        <button type="button" onClick={save}>
          Save & Return
        </button>
        <button type="button" onClick={discard}>
          Discard & Return
        </button>
      </div>
    </div>
  );
}
