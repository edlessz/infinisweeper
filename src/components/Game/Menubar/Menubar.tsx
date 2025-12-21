import "./Menubar.css";
import { Home, SaveIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useView, Views } from "../../../contexts/ViewContext";
import Game, { type GameStats } from "../Game";

interface MenubarProps {
	game: Game;
	gameActive: boolean;
	stats: GameStats;
}

export default function Menubar({ gameActive, game, stats }: MenubarProps) {
	const { setView } = useView();
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
				<button
					type="button"
					className="circle-btn"
					onClick={() => setView(Views.MENU)}
				>
					<Home />
				</button>
				<button
					type="button"
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
					<img src="./images/shovel.png" alt="Tiles Dug" /> {stats.revealed}
				</span>
				<span className="stat">
					<img src="./images/flag.png" alt="Flags" /> {stats.flags}
				</span>
			</div>
			<div>
				<button
					type="button"
					className="circle-btn"
					onClick={() => game.zoom(1)}
				>
					<ZoomInIcon />
				</button>
				<button
					type="button"
					className="circle-btn"
					onClick={() => game.zoom(-1)}
				>
					<ZoomOutIcon />
				</button>
			</div>
		</div>
	);
}
