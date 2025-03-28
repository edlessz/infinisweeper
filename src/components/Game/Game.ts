import Board from "./Board";
import Camera from "./Camera";
import Vector2 from "./Vector2";

export default class Game {
  public Board: Board;
  public camera: Camera;
  public size: Vector2 = {
    x: 0,
    y: 0,
  };
  constructor() {
    this.Board = new Board();
    this.camera = new Camera(32);
  }
  public update(ctx: CanvasRenderingContext2D): void {
    const [boundTopLeft, boundBottomRight] = this.camera.getBounds(this.size);

    ctx.scale(this.camera.ppu, this.camera.ppu);
    ctx.translate(-this.camera.position.x, -this.camera.position.y);

    for (let x = Math.floor(boundTopLeft.x); x < boundBottomRight.x; x++) {
      for (let y = Math.floor(boundTopLeft.y); y < boundBottomRight.y; y++) {
        const tile = this.Board.getTile([x, y]);
        ctx.fillStyle = tile.number === -1 ? "#000" : "#fff";
        ctx.fillRect(x, y, 1, 1);
      }
    }

    this.camera.position.x += 0.1;
    this.camera.position.y += 0.1;
  }
  public setSize(size: Vector2): void {
    this.size = size;
  }
}
