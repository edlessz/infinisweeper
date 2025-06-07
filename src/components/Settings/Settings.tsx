import "../../stylesheets/Menu.css";
import "./Settings.css";
import { useDb } from "../../contexts/useDb";
import { useView, Views } from "../../contexts/useView";
import MenuBackground from "../MenuBackground/MenuBackground";
import { useState } from "react";
import { useSettings } from "../../contexts/useSettings";

export default function Settings() {
  const { setView } = useView()!;
  const { updateName, user, name } = useDb()!;
  const { settings, saveSettings } = useSettings()!;

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
  const discard = () => {
    setView(Views.MENU);
  };

  return (
    <div className="Settings Menu">
      <MenuBackground />
      <h1>Settings</h1>
      <div className="table ed-form">
        <span>Display Name:</span>
        <input
          type="text"
          defaultValue={user ? nameField : ""}
          onChange={(e) => setNameField(e.target.value)}
          disabled={!user}
          placeholder={user ? "Enter Display Name" : "Please Sign In!"}
        ></input>
        <span>Classic Background:</span>
        <input
          type="checkbox"
          checked={localSettings.classicBackground}
          onChange={(e) =>
            setLocalSetting("classicBackground", e.target.checked)
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
