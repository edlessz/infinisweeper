import Vector2 from "./Vector2";

export default class PoppedTile {
  private velocity: Vector2 = { x: (Math.random() * 2 - 1) / 20, y: 0 };
  private angle: number = 0;
  constructor(
    public position: Vector2,
    public color: string
  ) {}

  public update(): void {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y += 0.01; // Gravity
    this.angle += this.velocity.y; // Rotation
  }
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.translate(this.position.x + 0.5, this.position.y + 0.5);
    ctx.rotate(this.angle);
    ctx.fillRect(-0.5, -0.5, 1, 1);
    ctx.restore();
  }
}
