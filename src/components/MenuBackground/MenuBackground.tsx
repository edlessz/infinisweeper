import "./MenuBackground.css";
import { useEffect, useRef } from "react";
import { makeNoise2D } from "fast-simplex-noise";
import ImageManager from "../Game/ImageManager";

export default function MenuBackground() {
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.scale(ppu, ppu);
      const scroll = performance.now() / 1000;
      ctx.translate(-scroll, 0);

      for (
        let x = Math.floor(scroll);
        x < scroll + Math.ceil(canvas.width / ppu);
        x++
      ) {
        ctx.fillStyle = "#000";
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

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}
