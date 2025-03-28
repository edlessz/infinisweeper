import { useEffect, useRef, useState } from "react";
import Game from "./Game";
import Vector2 from "./Vector2";

interface ViewportProps {
  Game: Game;
  style?: React.CSSProperties;
}

export default function Viewport({ Game, style }: ViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef(null as number | null);

  const [size, setSize] = useState({
    x: window.innerWidth,
    y: window.innerHeight,
  } as Vector2);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") ?? null;

    const update = () => {
      animationRef.current = requestAnimationFrame(update);
      ctx?.resetTransform();
      ctx?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
      Game.update(ctx!);
    };
    update();

    return () => cancelAnimationFrame(animationRef.current as number);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSize({ x: window.innerWidth, y: window.innerHeight });
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        Game.setSize(size);
      }
    };

    handleResize(); // Set initial size

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Cleanup on unmount
  }, []);

  return <canvas ref={canvasRef} style={style}></canvas>;
}
