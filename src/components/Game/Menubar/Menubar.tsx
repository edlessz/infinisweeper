import "./Menubar.css";
import { Home, SaveIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useView, Views } from "../../../contexts/ViewContext";
import { useRef, useState } from "react";
import Game, { GameStats } from "../Game";

interface MenubarProps {
  game: Game;
  gameActive: boolean;
  stats: GameStats;
}

export default function Menubar({ gameActive, game, stats }: MenubarProps) {
  const { setView } = useView()!;
  const [saveText, setSaveText] = useState("");

  const saveTextTimeout = useRef<number | null>(null);
  const saveTextRef = useRef<HTMLSpanElement>(null);
  const saveGame = () => {
    setSaveText("Saving...");
    const saveData = game.getSaveData();
    if (saveData) {
      localStorage.setItem(Game.savedGameKey, JSON.stringify(saveData));
      setSaveText("Saved!");
    } else {
      setSaveText("No game to save.");
    }

    if (saveTextRef.current) {
      saveTextRef.current.classList.remove("fade-out");

      requestAnimationFrame(() => {
        void saveTextRef.current?.offsetWidth; // Trigger reflow
        saveTextRef.current?.classList.add("fade-out");
      });
    }

    if (saveTextTimeout.current) clearTimeout(saveTextTimeout.current);
    saveTextTimeout.current = window.setTimeout(() => {
      setSaveText("");
      saveTextTimeout.current = null;
    }, 2000);
  };

  return (
    <div className="Menubar">
      <div>
        <button className="circle-btn" onClick={() => setView(Views.MENU)}>
          <Home />
        </button>
        <button
          className="circle-btn"
          onClick={() => gameActive && saveGame()}
          disabled={!gameActive}
        >
          <SaveIcon />
        </button>
        <span ref={saveTextRef}>{saveText}</span>
      </div>
      <div>
        <span className="stat">
          <img src="./images/shovel.png"></img> {stats.revealed}
        </span>
        <span className="stat">
          <img src="./images/flag.png"></img> {stats.flags}
        </span>
      </div>
      <div>
        <button className="circle-btn" onClick={() => game.zoom(1)}>
          <ZoomInIcon />
        </button>
        <button className="circle-btn" onClick={() => game.zoom(-1)}>
          <ZoomOutIcon />
        </button>
      </div>
    </div>
  );
}
