import "./Viewport.css";
import { useEffect, useRef, useState } from "react";
import Game, { GameStats } from "../Game";
import { useView } from "../../../contexts/useView";
import subtexts from "../subtexts.json";
import Menubar from "../Menubar/Menubar";
import SweepedDialog from "../SweepedDialog/SweepedDialog";

interface ViewportProps {
  game: Game;
  newGame: (() => void) | null;
}

export default function Viewport({ game, newGame }: ViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [subtext, setSubtext] = useState("");
  const { setView } = useView()!;

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
    const canvas = canvasRef.current!;
    const viewport = canvas.parentElement!;

    game.canvas = canvas;
    game.addEventListeners();
    game.setHooks({
      getGameActive: () => gameActiveRef.current,
      setGameActive,
      getStats: () => statsRef.current,
      setStats,
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
      const { width, height } = viewport.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      game.updateSize();
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
        game.update(FIXED_TIMESTEP / 1000);
        accumulator -= FIXED_TIMESTEP;
      }

      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  }, [game]);

  return (
    <div className="Viewport">
      <canvas ref={canvasRef}></canvas>
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
