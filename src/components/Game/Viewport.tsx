import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import type { GameStats } from "../../engine/Game";
import Game from "../../engine/Game";
import { Menubar, type MenubarRef } from "./Menubar";
import { SweepedDialog } from "./SweepedDialog";

interface ViewportProps {
	game: Game;
	newGame: (() => void) | null;
}

export const Viewport = ({ game, newGame }: ViewportProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const menubarRef = useRef<MenubarRef>(null);
	const [subtext, setSubtext] = useState("");
	const [subtexts, setSubtexts] = useState<string[]>([]);
	const { settings } = useSettings();

	const [stats, setStats] = useState<GameStats>({
		flags: 0,
		revealed: 0,
	});
	const statsRef = useRef(stats);
	useEffect(() => {
		statsRef.current = stats;
	}, [stats]);
	const [gameActive, setGameActive] = useState(true);
	const gameActiveRef = useRef(gameActive);
	useEffect(() => {
		gameActiveRef.current = gameActive;
	}, [gameActive]);
	const [dialogVisible, setDialogVisible] = useState(false);
	const dialogVisibleRef = useRef(dialogVisible);
	useEffect(() => {
		dialogVisibleRef.current = dialogVisible;
	}, [dialogVisible]);

	// Fetch subtexts from public folder
	useEffect(() => {
		fetch("subtexts.json")
			.then((response) => response.json())
			.then((data: string[]) => setSubtexts(data))
			.catch((error) => console.error("Failed to load subtexts:", error));
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		const viewport = canvas?.parentElement ?? null;

		game.canvas = canvas;
		game.settings = settings; // Inject settings directly
		game.addEventListeners();
		game.setHooks({
			setStats,
			setGameActive: (active: boolean) => {
				setGameActive(active);
				// When game becomes inactive, randomize subtext (UI concern)
				if (!active && subtexts.length > 0) {
					setSubtext(subtexts[Math.floor(Math.random() * subtexts.length)]);
				}
			},
			setDialogVisible,
		});

		setDialogVisible(false);
		setGameActive(true);

		const resize = () => {
			if (!viewport || !canvas) return;

			const { width, height } = viewport.getBoundingClientRect();
			canvas.width = width;
			canvas.height = height;

			game.updateSize();
		};
		window.addEventListener("resize", resize);
		resize();

		const ctx = canvas?.getContext("2d") ?? null;
		if (!ctx) throw new Error("Failed to get canvas context.");

		// Main loop
		const FIXED_TIMESTEP = 1000 / 60; // 60 FPS
		let accumulator = 0;
		let lastTime = performance.now();
		let renderId: number;
		const render = () => {
			const delta = performance.now() - lastTime;
			lastTime = performance.now();
			accumulator += delta;
			while (accumulator >= FIXED_TIMESTEP) {
				game.update(FIXED_TIMESTEP / 1000);
				accumulator -= FIXED_TIMESTEP;
			}

			ctx.resetTransform();
			ctx.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
			game.render(ctx);

			renderId = requestAnimationFrame(render);
		};
		renderId = requestAnimationFrame(render);

		// On cleanup
		return () => {
			window.removeEventListener("resize", resize);
			game.removeEventListeners();
			game.canvas = null;
			cancelAnimationFrame(renderId);
		};
	}, [game, settings, subtexts]);

	// Autosave interval logic
	useEffect(() => {
		const intervalSeconds = parseInt(settings.autosaveInterval || "0", 10);
		if (intervalSeconds === 0) return; // Autosave disabled

		const intervalId = setInterval(() => {
			// Guards: only save if game is active and started
			if (!game.gameActive || !game.gameStarted) return;

			const saveData = game.getSaveData();
			if (saveData) {
				localStorage.setItem(Game.savedGameKey, JSON.stringify(saveData));
				// Show visual indicator
				menubarRef.current?.showAutosaveIndicator();
			}
		}, intervalSeconds * 1000);

		return () => clearInterval(intervalId);
	}, [game, settings.autosaveInterval]);

	// Emergency save on page close
	useEffect(() => {
		const handleBeforeUnload = () => {
			if (game?.gameActive && game?.gameStarted) {
				const saveData = game.getSaveData();
				if (saveData) {
					localStorage.setItem(Game.savedGameKey, JSON.stringify(saveData));
				}
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [game]);

	return (
		<div className="w-full h-full relative overflow-hidden">
			<canvas ref={canvasRef} className="absolute inset-0 touch-none" />
			<Menubar
				ref={menubarRef}
				gameActive={gameActive}
				game={game}
				stats={stats}
			/>
			<SweepedDialog
				dialogVisible={dialogVisible}
				subtext={subtext}
				stats={stats}
				newGame={newGame}
			/>
		</div>
	);
};
