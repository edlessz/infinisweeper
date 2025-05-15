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
  public gameStarted: boolean = false;

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

  public update(deltaTime: number): void {
    void deltaTime;
    this.Board.update();
  }
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.scale(this.camera.ppu, this.camera.ppu);
    ctx.translate(-this.camera.position.x, -this.camera.position.y);

    this.Board.render(ctx, this.camera.getBounds(this.size));
  }

  public pan = (): void => {
    let mouseMoved = false;
    const mouseMove = (event: MouseEvent) => {
      if (mouseMoved) {
        this.camera.position.x -= event.movementX / this.camera.ppu;
        this.camera.position.y -= event.movementY / this.camera.ppu;
      }
      if (Math.abs(event.movementX) > 2 || Math.abs(event.movementY) > 2)
        mouseMoved = true;
    };
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener(
      "mouseup",
      (mouseUpEvent) => {
        window.removeEventListener("mousemove", mouseMove);
        if (!mouseMoved) this.mouseClick(mouseUpEvent);
      },
      { once: true }
    );
  };
  public zoom = (event: WheelEvent): void => this.camera.increasePpu(1, event);
  public mouseClick = (event: MouseEvent): void => {
    event.preventDefault();

    let mouse = this.camera.toWorldSpace({
      x: event.clientX,
      y: event.clientY,
    });

    if (event.button === 0) {
      if (!this.gameStarted) this.findFirstClick(mouse);
      mouse = this.camera.toWorldSpace({
        x: event.clientX,
        y: event.clientY,
      });
      this.Board.attemptReveal([Math.floor(mouse.x), Math.floor(mouse.y)]);
      this.gameStarted = true;
    }
    if (event.button === 2 && this.gameStarted)
      this.Board.toggleFlag([Math.floor(mouse.x), Math.floor(mouse.y)]);
  };
  public cancelContextMenu = (event: MouseEvent): void =>
    event.preventDefault();

  public findFirstClick(mouse: Vector2): void {
    const firstZero = this.Board.getFirstZero(
      (Math.floor(mouse.x) + Math.floor(mouse.y)) % 2
    );
    if (firstZero) {
      const tileOffset = {
        x: mouse.x % 1,
        y: mouse.y % 1,
      };
      // move camera so that mouse is on top of the first zero
      const offset = {
        x: firstZero[0] - mouse.x + tileOffset.x,
        y: firstZero[1] - mouse.y + tileOffset.y,
      };

      this.camera.position.x += offset.x;
      this.camera.position.y += offset.y;
    }
  }

  public addEventListeners(): void {
    if (!this.canvas) return;
    this.canvas.addEventListener("mousedown", this.pan);
    this.canvas.addEventListener("wheel", this.zoom);
    this.canvas.addEventListener("contextmenu", this.cancelContextMenu);
  }
  public removeEventListeners(): void {
    if (!this.canvas) return;
    this.canvas.removeEventListener("mousedown", this.pan);
    this.canvas.removeEventListener("wheel", this.zoom);
    this.canvas.removeEventListener("contextmenu", this.cancelContextMenu);
  }
}
