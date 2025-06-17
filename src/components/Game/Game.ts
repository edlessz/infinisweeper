import type { Settings } from "../../contexts/SettingsProvider";
import Board from "./Board";
import Camera from "./Camera";
import type Vector2 from "./Vector2";

export interface SaveData {
  seed: number;
  board: string[];
  camera: {
    position: Vector2;
    ppu: number;
  };
}

export interface GameStats {
  flags: number;
  revealed: number;
}

interface GameHooks {
  getStats: () => GameStats;
  setStats: (stats: GameStats) => void;
  getGameActive: () => boolean;
  setGameActive: (active: boolean) => void;
  getDialogVisible: () => boolean;
  setDialogVisible: (visible: boolean) => void;
  getSettings: () => Settings;
  randomizeSubtext: () => void;
}

export default class Game {
  public Board: Board;
  public camera: Camera;
  public canvas: HTMLCanvasElement | null = null;
  public readonly size: Vector2 = {
    x: 0,
    y: 0,
  };
  public gameStarted = false;

  public static savedGameKey = "infinisweeper.saved-game";

  public updateSize(): void {
    if (!this.canvas) return;
    const { width, height } = this.canvas.getBoundingClientRect();
    this.size.x = width;
    this.size.y = height;
  }

  constructor(savedGame?: SaveData) {
    this.Board = new Board(this, 0.18, savedGame?.seed, savedGame?.board);
    this.camera = new Camera(savedGame?.camera.ppu ?? 32);
    this.camera.position = savedGame?.camera.position ?? {
      x: 0,
      y: 0,
    };
    if (savedGame) this.gameStarted = true;
  }

  public update(deltaTime: number): void {
    void deltaTime;
    this.Board.update();

    if (!this.hooks?.getSettings().disableCameraShake) {
      const revealQueueLength = this.Board.getRevealQueueLength();
      if (revealQueueLength > 10)
        this.camera.shake(this.Board.getRevealQueueLength() * 0.01);
    }
  }
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.scale(this.camera.ppu, this.camera.ppu);
    this.camera.roundToPixel();
    ctx.translate(-this.camera.position.x, -this.camera.position.y);

    this.Board.render(ctx, this.camera.getBounds(this.size));
  }

  public pan = (event: MouseEvent | TouchEvent): void => {
    event.preventDefault();

    if (event instanceof MouseEvent) {
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
        { once: true },
      );
    } else {
      if (event.touches.length !== 1) return;
      const lastTouch: Vector2 = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
      let touchMoved = false;
      const touchStartTime = performance.now();

      const touchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const dx = touch.clientX - lastTouch.x;
        const dy = touch.clientY - lastTouch.y;

        if (touchMoved || Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          this.camera.position.x -= dx / this.camera.ppu;
          this.camera.position.y -= dy / this.camera.ppu;
          lastTouch.x = touch.clientX;
          lastTouch.y = touch.clientY;
          touchMoved = true;
        }
      };

      let timeout: number;
      const triggerTime = 250;
      const touchEnd = (e: TouchEvent) => {
        window.clearTimeout(timeout);
        window.removeEventListener("touchmove", touchMove);
        window.removeEventListener("touchend", touchEnd);
        if (!touchMoved)
          this.mouseClick(e, performance.now() - touchStartTime > triggerTime);
      };

      window.addEventListener("touchmove", touchMove);
      window.addEventListener("touchend", touchEnd, { once: true });
      timeout = window.setTimeout(() => {
        if (!touchMoved) touchEnd(event);
      }, triggerTime);
    }
  };
  public mouseClick = (
    event: MouseEvent | TouchEvent,
    hold?: boolean,
  ): void => {
    event.preventDefault();
    if (!this.hooks?.getGameActive()) return;

    const screenSpace: Vector2 = {
      x:
        event instanceof MouseEvent
          ? event.clientX
          : event.changedTouches[0].clientX,
      y:
        event instanceof MouseEvent
          ? event.clientY
          : event.changedTouches[0].clientY,
    };
    const mouse = this.camera.toWorldSpace(screenSpace);

    const doClick = (eventButton: number, mouse: Vector2) => {
      switch (eventButton) {
        case 0: {
          if (!this.gameStarted) this.findFirstClick(mouse);
          const worldSpaceMouse = this.camera.toWorldSpace(screenSpace);
          this.Board.attemptReveal([
            Math.floor(worldSpaceMouse.x),
            Math.floor(worldSpaceMouse.y),
          ]);
          this.gameStarted = true;
          break;
        }
        case 2:
          if (this.gameStarted)
            this.Board.toggleFlag([Math.floor(mouse.x), Math.floor(mouse.y)]);
          break;
      }
    };

    if (event instanceof MouseEvent) {
      if (event.ctrlKey || event.shiftKey || event.metaKey) doClick(2, mouse);
      else doClick(event.button, mouse);
    } else if (event instanceof TouchEvent) doClick(!hold ? 0 : 2, mouse);
  };
  public wheelZoom = (event: WheelEvent): void => {
    event.preventDefault();
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    this.camera.zoomInPosition(
      {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      event.deltaY < 0 ? 1 : -1,
    );
  };
  public pinchZoom = (event: TouchEvent): void => {
    event.preventDefault();
    if (!this.canvas || event.touches.length !== 2) return;

    const [touch1, touch2] = event.touches;
    const dist = (touch1: Touch, touch2: Touch): number => {
      return Math.sqrt(
        (touch1.clientX - touch2.clientX) ** 2 +
          (touch1.clientY - touch2.clientY) ** 2,
      );
    };
    let initialDistance = dist(touch1, touch2);

    const touchMove = (e: TouchEvent): void => {
      if (e.touches.length !== 2) return;

      const newDistance = dist(e.touches[0], e.touches[1]);
      const zoomAmount = (newDistance - initialDistance) / 10;
      initialDistance = newDistance;

      const middlePoint = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };

      this.camera.zoomInPosition(middlePoint, zoomAmount);
      this.camera.roundToPixel();
    };

    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener(
      "touchend",
      () => window.removeEventListener("touchmove", touchMove),
      { once: true },
    );
  };
  public zoom = (amt: number): void => {
    if (!this.canvas) return;

    this.camera.zoomInPosition(
      {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
      },
      amt,
    );
  };

  public cancelContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    return;
  };

  public findFirstClick(mouse: Vector2): void {
    const firstZero = this.Board.getFirstZero(
      (Math.floor(mouse.x) + Math.floor(mouse.y)) % 2,
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

  public loseGame(): void {
    this.hooks?.setGameActive(false);
    localStorage.removeItem(Game.savedGameKey);
    this.Board.showIncorrectFlags();
    this.hooks?.randomizeSubtext();
    setTimeout(() => {
      this.hooks?.setDialogVisible(true);
    }, 2500);
  }

  public getSaveData(): SaveData | null {
    if (!this.gameStarted) return null;
    return {
      ...this.Board.getSaveData(),
      camera: {
        position: this.camera.position,
        ppu: this.camera.ppu,
      },
    };
  }

  public addEventListeners(): void {
    if (!this.canvas) return;
    this.canvas.addEventListener("touchstart", this.pan);
    this.canvas.addEventListener("mousedown", this.pan);
    this.canvas.addEventListener("touchstart", this.pinchZoom);
    this.canvas.addEventListener("wheel", this.wheelZoom);
    this.canvas.addEventListener("contextmenu", this.cancelContextMenu);
  }
  public removeEventListeners(): void {
    if (!this.canvas) return;
    this.canvas.removeEventListener("touchstart", this.pan);
    this.canvas.removeEventListener("mousedown", this.pan);
    this.canvas.removeEventListener("touchstart", this.pinchZoom);
    this.canvas.removeEventListener("wheel", this.wheelZoom);
    this.canvas.removeEventListener("contextmenu", this.cancelContextMenu);
  }

  public hooks: GameHooks | null = null;
  public setHooks(hooks?: GameHooks): void {
    this.hooks = hooks ?? null;
    this.Board.updateStats();
  }
}
