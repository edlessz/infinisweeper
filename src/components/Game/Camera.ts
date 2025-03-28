import Vector2 from "./Vector2";

export default class Camera {
  public position: Vector2 = { x: 0, y: 0 };
  public ppu: number = 32;
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
}
