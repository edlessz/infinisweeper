import "../../stylesheets/Menu.css";
import "./Settings.css";
import { useDb } from "../../contexts/DbContext";
import { useView, Views } from "../../contexts/ViewContext";
import MenuBackground from "../MenuBackground/MenuBackground";
import { useState } from "react";
import { useSettings } from "../../contexts/SettingsContext";

export default function Settings() {
  const { setView } = useView()!;
  const { updateName, user, name } = useDb()!;
  const { settings, saveSettings, settingsDescriptions } = useSettings()!;

  const [nameField, setNameField] = useState<string>(name ?? "");
  const [localSettings, setLocalSettings] = useState(settings);
  const setLocalSetting = (key: keyof typeof localSettings, value: any) => {
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
    } catch (error: any) {
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
      console.error(error);
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
        ></input>

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
        ></input>

        <div>
          <span>Disable Borders:</span>
          <div>{settingsDescriptions.disableBorders}</div>
        </div>
        <input
          type="checkbox"
          checked={localSettings.disableBorders}
          onChange={(e) => setLocalSetting("disableBorders", e.target.checked)}
        ></input>

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
        ></input>

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
        ></input>
      </div>
      <div className="button-container">
        <button onClick={save}>Save & Return</button>
        <button onClick={discard}>Discard & Return</button>
      </div>
    </div>
  );
}
