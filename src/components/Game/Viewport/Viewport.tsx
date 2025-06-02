import "./Viewport.css";
import { useEffect, useRef, useState } from "react";
import Game, { GameStats } from "../Game";
import {
  CopyIcon,
  Home,
  SaveIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useView, Views } from "../../../contexts/useView";
import Dialog from "../../Dialog/Dialog";
import subtexts from "../subtexts.json";

interface ViewportProps {
  game: Game;
  newGame: (() => void) | null;
}

export default function Viewport({ game, newGame }: ViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saveText, setSaveText] = useState("");
  const [subtext, setSubtext] = useState("");
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

  const getShareContent = (): string => {
    const points = stats.revealed
      .toString()
      .split("")
      .map(
        (n) =>
          ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"][
            parseInt(n)
          ],
      )
      .join("");
    return `I just scored ${points} points in Infinisweeper! Can you beat me? ${window.location.href}`;
  };
  const getFacebookShareLink = () =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(getShareContent())}`;
  const getXShareLink = () =>
    `https://x.com/intent/tweet?text=${encodeURIComponent(getShareContent())}`;
  const copyShare = () => {
    const shareContent = getShareContent();
    navigator.clipboard
      .writeText(shareContent)
      .then(() => {
        alert("Copied score to clipboard!");
      })
      .catch((err) => {
        alert("Failed to copy score.");
        console.error("Failed to copy share content:", err);
      });
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
          <button className="circleBtn" onClick={() => game.zoom(1)}>
            <ZoomInIcon size={16} />
          </button>
          <button className="circleBtn" onClick={() => game.zoom(-1)}>
            <ZoomOutIcon size={16} />
          </button>
        </div>
      </div>
      <Dialog visible={dialogVisible} className="sweeped-dialog">
        <div>
          <h1>You've been sweeped!</h1>
          <span className="subtext">{subtext}</span>
        </div>
        <div>
          <span className="score">{stats.revealed} Points</span>
          <div className="share-buttons">
            <a
              href={getFacebookShareLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                height="32"
                width="32"
                src="https://cdn.simpleicons.org/facebook"
                alt="Share on Facebook"
              />
            </a>
            <a href={getXShareLink()} target="_blank" rel="noopener noreferrer">
              <img
                height="32"
                width="32"
                src="https://cdn.simpleicons.org/x"
                alt="Share on X"
              />
            </a>
            <CopyIcon width={32} height={32} onClick={copyShare}></CopyIcon>
          </div>
        </div>
        <div className="button-container">
          {newGame && <button onClick={newGame}>New Game</button>}
          <button onClick={() => setView(Views.MENU)}>Main Menu</button>
        </div>
      </Dialog>
    </div>
  );
}
