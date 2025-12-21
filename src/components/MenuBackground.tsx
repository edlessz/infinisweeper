import { makeNoise2D } from "fast-simplex-noise";
import { useEffect, useRef } from "react";
import { ImageManager } from "@/components/Game/ImageManager";
import { useSettings } from "@/contexts/SettingsContext";

export default function MenuBackground() {
	const { settings } = useSettings();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const noise = useRef(makeNoise2D(() => Math.random()));
	const ppu = 64;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		window.addEventListener("resize", resize);
		resize();

		let animationFrameId: number;

		const render = () => {
			ctx.resetTransform();
			ctx.fillStyle = "#4AC0FD";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			const scroll = performance.now() / 1000;

			if (settings.classicBackground) {
				const offsetX = Math.floor(scroll * ppu) % ppu;
				const offsetY = Math.floor(scroll * ppu) % ppu;

				const cols = Math.ceil(canvas.width / ppu) + 2;
				const rows = Math.ceil(canvas.height / ppu) + 2;

				for (let x = 0; x < cols; x++) {
					for (let y = 0; y < rows; y++) {
						ctx.fillStyle = (x + y) % 2 === 0 ? "#AAD650" : "#A2D048";
						ctx.fillRect(x * ppu - offsetX, y * ppu - offsetY, ppu, ppu);
					}
				}
			} else {
				ctx.scale(ppu, ppu);
				ctx.translate(-scroll, 0);

				for (
					let x = Math.floor(scroll);
					x < scroll + Math.ceil(canvas.width / ppu);
					x++
				) {
					const normalizedNoise = noise.current(x / 15, 0) * 0.5 + 0.5;
					const yy = normalizedNoise * 5;
					for (let y = 1; y <= yy + 1; y++) {
						ctx.fillStyle = (x + y) % 2 === 0 ? "#AAD650" : "#A2D048";
						ctx.fillRect(x, canvas.height / ppu - y, 1.01, 1);
					}
					if (noise.current(x, x * 3.32) < -0.6) {
						const flag = ImageManager.get("flag_floor");
						if (flag) {
							const flagHeight = canvas.height / ppu - Math.floor(yy) - 2;
							ctx.drawImage(flag, x, flagHeight, 1, 1);
						}
					}
				}
			}

			animationFrameId = requestAnimationFrame(render);
		};

		render();

		return () => {
			window.removeEventListener("resize", resize);
			cancelAnimationFrame(animationFrameId);
		};
	}, [settings.classicBackground]);

	return <canvas ref={canvasRef} className="absolute inset-0 -z-10" />;
}
