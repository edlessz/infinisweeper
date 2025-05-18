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

  public zoomInPosition(position: Vector2, amount: number): void {
    const worldBefore = this.toWorldSpace(position);

    this.ppu += amount;
    this.ppu = Math.max(
      this.ppuBounds.min,
      Math.min(this.ppu, this.ppuBounds.max)
    );

    const worldAfter = this.toWorldSpace(position);
    const dx = worldAfter.x - worldBefore.x;
    const dy = worldAfter.y - worldBefore.y;
    this.position.x -= dx;
    this.position.y -= dy;
  }

  public shake(shakiness: number): void {
    this.position.x += (Math.random() - 0.5) * shakiness;
    this.position.y += (Math.random() - 0.5) * shakiness;
  }
}
