import "./Viewport.css";
import { useEffect, useRef } from "react";
import Game from "../Game";
import { Home, SaveIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

interface ViewportProps {
  Game: Game;
}

export default function Viewport({ Game }: ViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const viewport = canvas.parentElement!;

    Game.canvas = canvas;
    Game.addEventListeners();

    const resize = () => {
      const { width, height } = viewport.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      Game.updateSize();
    };
    window.addEventListener("resize", resize);
    resize();

    const ctx = canvas.getContext("2d");
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
        Game.update(FIXED_TIMESTEP / 1000);
        accumulator -= FIXED_TIMESTEP;
      }

      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Game.render(ctx);

      renderId = requestAnimationFrame(render);
    };
    renderId = requestAnimationFrame(render);

    // On cleanup
    return () => {
      window.removeEventListener("resize", resize);
      Game.removeEventListeners();
      Game.canvas = null;
      cancelAnimationFrame(renderId);
    };
  }, [Game]);

  const saveGame = () => {
    const saveData = Game.getSaveData();
    if (!saveData) return;
    localStorage.setItem("savedGame", JSON.stringify(saveData));
  };

  return (
    <div className="Viewport">
      <canvas ref={canvasRef}></canvas>
      <div className="overlay">
        <button className="circleBtn" disabled>
          <Home size={16} />
        </button>
        <button className="circleBtn">
          <SaveIcon size={16} onClick={() => saveGame()} />
        </button>
        <button
          className="circleBtn"
          style={{ marginLeft: "auto" }}
          onClick={() => Game.zoom(1)}
        >
          <ZoomInIcon size={16} />
        </button>
        <button className="circleBtn" onClick={() => Game.zoom(-1)}>
          <ZoomOutIcon size={16} />
        </button>
      </div>
    </div>
  );
}
