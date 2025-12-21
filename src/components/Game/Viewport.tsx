import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import type Game from "./Game";
import type { GameStats } from "./Game";
import Menubar from "./Menubar";
import SweepedDialog from "./SweepedDialog";
import subtexts from "./subtexts.json";

interface ViewportProps {
	game: Game;
	newGame: (() => void) | null;
}

export default function Viewport({ game, newGame }: ViewportProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [subtext, setSubtext] = useState("");
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

	useEffect(() => {
		const canvas = canvasRef.current;
		const viewport = canvas?.parentElement ?? null;

		game.canvas = canvas;
		game.addEventListeners();
		game.setHooks({
			getGameActive: () => gameActiveRef.current,
			setGameActive,
			getStats: () => statsRef.current,
			setStats,
			getSettings: () => settings,
			getDialogVisible: () => dialogVisibleRef.current,
			setDialogVisible,
			randomizeSubtext: () => {
				const subtextsTyped: string[] = subtexts as string[];
				setSubtext(
					subtextsTyped[Math.floor(Math.random() * subtextsTyped.length)],
				);
			},
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
	}, [game, settings]);

	return (
		<div className="w-full h-full relative overflow-hidden">
			<canvas ref={canvasRef} className="absolute inset-0 touch-none" />
			<Menubar gameActive={gameActive} game={game} stats={stats} />
			<SweepedDialog
				dialogVisible={dialogVisible}
				subtext={subtext}
				stats={stats}
				newGame={newGame}
			/>
		</div>
	);
}
