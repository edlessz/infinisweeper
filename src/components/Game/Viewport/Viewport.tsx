import "./Viewport.css";
import { useEffect, useRef, useState } from "react";
import Game, { GameStats } from "../Game";
import { Home, SaveIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useView, Views } from "../../../contexts/useView";

interface ViewportProps {
  Game: Game;
}

export default function Viewport({ Game }: ViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saveText, setSaveText] = useState("");
  const { setView } = useView();

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

  useEffect(() => {
    const canvas = canvasRef.current!;
    const viewport = canvas.parentElement!;

    Game.canvas = canvas;
    Game.addEventListeners();
    Game.setHooks({
      getGameActive: () => gameActiveRef.current,
      setGameActive,
      getStats: () => statsRef.current,
      setStats,
    });

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

  const saveTextTimeout = useRef<number | null>(null);
  const saveTextRef = useRef<HTMLSpanElement>(null);
  const saveGame = () => {
    setSaveText("Saving...");
    const saveData = Game.getSaveData();
    if (!saveData) return;
    localStorage.setItem("savedGame", JSON.stringify(saveData));
    setSaveText("Saved!");

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
    <div className="Viewport">
      <canvas ref={canvasRef}></canvas>
      <div className="overlay">
        <div>
          <button className="circleBtn" onClick={() => setView(Views.MENU)}>
            <Home size={16} />
          </button>
          <button
            className="circleBtn"
            onClick={() => gameActive && saveGame()}
            disabled={!gameActive}
          >
            <SaveIcon size={16} />
          </button>
          <span ref={saveTextRef}>{saveText}</span>
        </div>
        <div className="overlay-center">
          <span>
            <img src="./images/shovel.png"></img> {stats.revealed}
          </span>
          <span>
            <img src="./images/flag.png"></img> {stats.flags}
          </span>
        </div>
        <div className="overlay-right">
          <button className="circleBtn" onClick={() => Game.zoom(1)}>
            <ZoomInIcon size={16} />
          </button>
          <button className="circleBtn" onClick={() => Game.zoom(-1)}>
            <ZoomOutIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
