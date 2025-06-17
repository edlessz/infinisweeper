import "../../stylesheets/Menu.css";
import "./Changelog.css";
import { useEffect, useState } from "react";
import { Views, useView } from "../../contexts/ViewContext";
import MenuBackground from "../MenuBackground/MenuBackground";

export default function Changelog() {
  const { setView } = useView();
  const [changelog, setChangelog] = useState<Changelog[] | null>(null);

  const refreshChangelog = () => {
    fetch("changelog.json")
      .then((response) => response.json())
      .then(setChangelog);
  };
  useEffect(() => {
    refreshChangelog();
  });

  return (
    <div className="Changelog Menu">
      <MenuBackground />
      <h1>Changelog</h1>
      <div className="table changes">
        {changelog ? (
          changelog.map((entry) => (
            <details key={entry.version}>
              <summary>
                <span>{entry.version}</span>
                <span>{entry.date}</span>
              </summary>
              <ul>
                {entry.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </details>
          ))
        ) : (
          <span>Loading...</span>
        )}
      </div>
      <div className="button-container">
        <button type="button" onClick={() => setView(Views.MENU)}>
          Back
        </button>
      </div>
    </div>
  );
}

interface Changelog {
  version: string;
  date: string;
  changes: string[];
}
