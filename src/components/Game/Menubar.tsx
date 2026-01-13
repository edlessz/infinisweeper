import { useNavigate } from "@tanstack/react-router";
import { Home, SaveIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Game, { type GameStats } from "../../engine/Game";

interface MenubarProps {
	game: Game;
	gameActive: boolean;
	stats: GameStats;
}

export interface MenubarRef {
	showAutosaveIndicator: () => void;
}

export const Menubar = forwardRef<MenubarRef, MenubarProps>(
	({ gameActive, game, stats }, ref) => {
		const navigate = useNavigate();
		const [statusText, setStatusText] = useState("");
		const [animationKey, setAnimationKey] = useState(0);

		const fadeOutClass = "animate-[fadeOut_2s_ease-in-out_forwards]";

		const statusTextTimeout = useRef<number | null>(null);

		const saveGame = () => {
			setStatusText("Saving...");
			const saveData = game.getSaveData();
			if (saveData) {
				localStorage.setItem(Game.savedGameKey, JSON.stringify(saveData));
				setStatusText("Saved!");
			} else {
				setStatusText("No game to save.");
			}

			setAnimationKey((prev) => prev + 1);

			if (statusTextTimeout.current) clearTimeout(statusTextTimeout.current);
			statusTextTimeout.current = window.setTimeout(() => {
				setStatusText("");
				statusTextTimeout.current = null;
			}, 2000);
		};

		const showAutosaveIndicator = () => {
			setStatusText("Autosaved!");
			setAnimationKey((prev) => prev + 1);

			if (statusTextTimeout.current) clearTimeout(statusTextTimeout.current);
			statusTextTimeout.current = window.setTimeout(() => {
				setStatusText("");
				statusTextTimeout.current = null;
			}, 2000);
		};

		useImperativeHandle(ref, () => ({
			showAutosaveIndicator,
		}));

		return (
			<div className="absolute bottom-0 left-0 w-full p-4 bg-white flex items-center gap-2">
				<div className="flex-1 flex gap-2 items-center justify-start">
					<Button
						type="button"
						size="icon"
						onClick={() => navigate({ to: "/" })}
					>
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
					<span key={animationKey} className={statusText ? fadeOutClass : ""}>
						{statusText}
					</span>
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
	},
);
