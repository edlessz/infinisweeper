import type Vector2 from "./Vector2";

export default class Particle {
  public velocity: Vector2 = { x: (Math.random() * 2 - 1) / 20, y: 0 };
  public size: Vector2 = { x: 1, y: 1 };
  private angle = 0;
  constructor(
    public position: Vector2,
    public color: string,
    public image: HTMLImageElement | null = null,
  ) {}

  public update(): void {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y += 0.01; // Gravity
    this.angle += this.velocity.y; // Rotation
  }
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(
      this.position.x + this.size.x / 2,
      this.position.y + this.size.y / 2,
    );
    ctx.rotate(this.angle);
    if (this.image) {
      ctx.drawImage(
        this.image,
        -this.size.x / 2,
        -this.size.y / 2,
        this.size.x,
        this.size.y,
      );
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(
        -this.size.x / 2,
        -this.size.y / 2,
        this.size.x,
        this.size.y,
      );
    }
    ctx.restore();
  }
}
