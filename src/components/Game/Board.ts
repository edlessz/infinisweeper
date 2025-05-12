import Vector2 from "./Vector2";

type Key = [number, number];
interface Tile {
  number: number; // -1 for mine
  hidden: boolean;
  flagged: boolean;
}

export default class Board {
  public board: Map<string, Tile> = new Map();

  private static getAddress(position: Key): string {
    return `${position[0]},${position[1]}`;
  }

  protected generate(position: Key): Tile {
    const tile: Tile = {
      number: Math.random() < 0.18 ? -1 : 0,
      hidden: true,
      flagged: false,
    };
    this.board.set(Board.getAddress(position), tile);
    return this.getTile(position);
  }

  public getTile(position: Key): Tile {
    const tile = this.board.get(Board.getAddress(position));
    if (!tile) return this.generate(position);
    return tile;
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    [boundTopLeft, boundBottomRight]: [Vector2, Vector2]
  ): number {
    for (let x = Math.floor(boundTopLeft.x); x < boundBottomRight.x; x++) {
      for (let y = Math.floor(boundTopLeft.y); y < boundBottomRight.y; y++) {
        const tile = this.getTile([x, y]);
        ctx.fillStyle = tile.number === -1 ? "#000" : "#fff";
        if (x === 0 && y === 0) ctx.fillStyle = "#f00";
        ctx.fillRect(x, y, 1, 1);
      }
    }

    const xCount = Math.floor(boundBottomRight.x) - Math.floor(boundTopLeft.x);
    const yCount = Math.floor(boundBottomRight.y) - Math.floor(boundTopLeft.y);
    return xCount * yCount;
  }
}
