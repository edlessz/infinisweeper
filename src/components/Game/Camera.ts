import Vector2 from "./Vector2";

export default class Camera {
  public position: Vector2 = { x: 0, y: 0 };
  public ppu: number = 32;

  public readonly ppuBounds = {
    min: 16,
    max: 128,
  };

  public constructor(ppu: number) {
    this.ppu = ppu;
  }
  public getBounds(size: Vector2): [Vector2, Vector2] {
    return [
      {
        x: this.position.x,
        y: this.position.y,
      },
      {
        x: this.position.x + size.x / this.ppu,
        y: this.position.y + size.y / this.ppu,
      },
    ];
  }
  public toWorldSpace(position: Vector2): Vector2 {
    return {
      x: this.position.x + position.x / this.ppu,
      y: this.position.y + position.y / this.ppu,
    };
  }
  public increasePpu(amount: number, event?: WheelEvent): void {
    if (!event) {
      this.ppu += amount;
      this.ppu = Math.max(
        this.ppuBounds.min,
        Math.min(this.ppu, this.ppuBounds.max)
      );
      return;
    }

    event.preventDefault();
    const canvas = event.target as HTMLCanvasElement;

    const rect = canvas.getBoundingClientRect();
    const mouse = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const worldBefore = this.toWorldSpace(mouse);

    const zoomAmount = event.deltaY < 0 ? 1 : -1;
    this.ppu += zoomAmount * amount;
    this.ppu = Math.max(
      this.ppuBounds.min,
      Math.min(this.ppu, this.ppuBounds.max)
    );

    const worldAfter = this.toWorldSpace(mouse);
    const dx = worldAfter.x - worldBefore.x;
    const dy = worldAfter.y - worldBefore.y;
    this.position.x -= dx;
    this.position.y -= dy;
  }
}
