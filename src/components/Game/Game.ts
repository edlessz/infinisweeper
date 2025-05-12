import Board from "./Board";
import Camera from "./Camera";
import Vector2 from "./Vector2";

export default class Game {
  public Board: Board;
  public camera: Camera;
  public canvas: HTMLCanvasElement | null = null;
  public readonly size: Vector2 = {
    x: 0,
    y: 0,
  };

  public updateSize(): void {
    if (!this.canvas) return;
    const { width, height } = this.canvas.getBoundingClientRect();
    this.size.x = width;
    this.size.y = height;
  }

  constructor() {
    this.Board = new Board();
    this.camera = new Camera(32);
  }

  public update(ctx: CanvasRenderingContext2D): void {
    ctx.scale(this.camera.ppu, this.camera.ppu);
    ctx.translate(-this.camera.position.x, -this.camera.position.y);

    this.Board.draw(ctx, this.camera.getBounds(this.size));
  }

  public pan = (): void => {
    const mouseMove = (event: MouseEvent) => {
      this.camera.position.x -= event.movementX / this.camera.ppu;
      this.camera.position.y -= event.movementY / this.camera.ppu;
    };
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener(
      "mouseup",
      () => {
        window.removeEventListener("mousemove", mouseMove);
      },
      { once: true }
    );
  };
  public zoom = (event: WheelEvent): void => this.camera.increasePpu(1, event);

  public addEventListeners(): void {
    if (!this.canvas) return;
    this.canvas.addEventListener("mousedown", this.pan);
    this.canvas.addEventListener("wheel", this.zoom);
  }
  public removeEventListeners(): void {
    if (!this.canvas) return;
    this.canvas.removeEventListener("mousedown", this.pan);
    this.canvas.removeEventListener("wheel", this.zoom);
  }
}
