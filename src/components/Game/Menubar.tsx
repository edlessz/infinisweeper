import { useNavigate } from "@tanstack/react-router";
import { Home, SaveIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Game, { type GameStats } from "../../engine/Game";

interface MenubarProps {
	game: Game;
	gameActive: boolean;
	stats: GameStats;
}

export default function Menubar({ gameActive, game, stats }: MenubarProps) {
	const navigate = useNavigate();
	const [saveText, setSaveText] = useState("");

	const fadeOutClass = "animate-[fadeOut_2s_ease-in-out_forwards]";

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
			saveTextRef.current.classList.remove(fadeOutClass);

			requestAnimationFrame(() => {
				void saveTextRef.current?.offsetWidth; // Trigger reflow
				saveTextRef.current?.classList.add(fadeOutClass);
			});
		}

		if (saveTextTimeout.current) clearTimeout(saveTextTimeout.current);
		saveTextTimeout.current = window.setTimeout(() => {
			setSaveText("");
			saveTextTimeout.current = null;
		}, 2000);
	};

	return (
		<div className="absolute bottom-0 left-0 w-full p-4 bg-white flex items-center gap-2">
			<div className="flex-1 flex gap-2 items-center justify-start">
				<Button type="button" size="icon" onClick={() => navigate({ to: "/" })}>
					<Home />
				</Button>
				<Button
					type="button"
					size="icon"
					onClick={() => gameActive && saveGame()}
					disabled={!gameActive}
				>
					<SaveIcon />
				</Button>
				<span ref={saveTextRef}>{saveText}</span>
			</div>
			<div className="flex-1 flex gap-2 items-center justify-center">
				<span className="flex items-center gap-2 font-bold">
					<img
						src="./images/shovel.png"
						alt="Tiles Dug"
						className="w-6 h-6 aspect-square"
					/>{" "}
					{stats.revealed}
				</span>
				<span className="flex items-center gap-2 font-bold">
					<img
						src="./images/flag.png"
						alt="Flags"
						className="w-6 h-6 aspect-square"
					/>{" "}
					{stats.flags}
				</span>
			</div>
			<div className="flex-1 flex gap-2 items-center justify-end">
				<Button type="button" size="icon" onClick={() => game.zoom(1)}>
					<ZoomInIcon />
				</Button>
				<Button type="button" size="icon" onClick={() => game.zoom(-1)}>
					<ZoomOutIcon />
				</Button>
			</div>
		</div>
	);
}
