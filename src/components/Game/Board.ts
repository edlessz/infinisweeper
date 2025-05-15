import Vector2 from "./Vector2";

type Key = [number, number];
interface Tile {
  number: number; // -1 for mine
  revealed: boolean;
  flagged: boolean;
}

const TEXT_COLORS: Record<number, string> = {
  1: "#1977D3",
  2: "#3B8E3F",
  3: "#D53734",
  4: "#7A1EA2",
  5: "#FF8F00",
  6: "#159AA4",
  7: "#434343",
  8: "#A99D93",
};

export default class Board {
  private board: Map<string, Tile> = new Map();

  private static getAddress(position: Key): string {
    return `${position[0]},${position[1]}`;
  }

  private bombChance: number = 0.18;
  constructor(bombChance?: number) {
    this.bombChance = bombChance ?? this.bombChance;
  }

  protected generate(position: Key): Tile {
    if (this.board.has(Board.getAddress(position)))
      return this.board.get(Board.getAddress(position))!;

    const tile: Tile = {
      number: Math.random() < this.bombChance ? -1 : 0,
      revealed: false,
      flagged: false,
    };
    this.board.set(Board.getAddress(position), tile);

    const [x, y] = position;
    for (let xx = x - 1; xx <= x + 1; xx++) {
      for (let yy = y - 1; yy <= y + 1; yy++) {
        if (xx === x && yy === y) continue; // skip the current tile
        const address = Board.getAddress([xx, yy]);
        const neighbor = this.board.get(address);

        // if tile is bomb, update the surrounding tiles
        // if tile is empty, count surrounding bombs
        if (tile.number === -1) {
          if (!neighbor || neighbor.number === -1) continue;
          this.updateTile([xx, yy], {
            number: neighbor.number + 1,
          });
        } else if (neighbor?.number === -1) tile.number++;
      }
    }

    return tile;
  }

  private getTile(position: Key): Tile {
    const tile = this.board.get(Board.getAddress(position));
    if (!tile) return this.generate(position);
    return tile;
  }

  private updateTile(position: Key, tile: Partial<Tile>): void {
    const existingTile = this.getTile(position);
    this.board.set(Board.getAddress(position), { ...existingTile, ...tile });
  }

  private getTileColor(position: Key, tile: Tile): string {
    const [x, y] = position;

    if (!tile.revealed) return (x + y) % 2 === 0 ? "#AAD650" : "#A2D048";
    return (x + y) % 2 === 0 ? "#E4C29E" : "#D7B998";
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    [boundTopLeft, boundBottomRight]: [Vector2, Vector2]
  ): number {
    ctx.font = "0.75px 'Roboto'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let x = Math.floor(boundTopLeft.x); x < boundBottomRight.x; x++) {
      for (let y = Math.floor(boundTopLeft.y); y < boundBottomRight.y; y++) {
        const tile = this.getTile([x, y]);
        ctx.fillStyle = this.getTileColor([x, y], tile);
        ctx.fillRect(x, y, 1, 1);

        if (tile.revealed) {
          ctx.fillStyle = TEXT_COLORS[tile.number] ?? "#000";
          ctx.fillText(tile.number.toString(), x + 0.5, y + 0.5 + 0.05);
        }
      }
    }

    const xCount = Math.floor(boundBottomRight.x) - Math.floor(boundTopLeft.x);
    const yCount = Math.floor(boundBottomRight.y) - Math.floor(boundTopLeft.y);
    return xCount * yCount;
  }

  public attemptReveal(position: Key): void {
    const tile = this.getTile(position);
    if (tile.revealed || tile.flagged) return;

    // generate surrounding tiles
    for (let x = position[0] - 2; x <= position[0] + 2; x++) {
      for (let y = position[1] - 2; y <= position[1] + 2; y++) {
        if (x === position[0] && y === position[1]) continue; // skip the current tile
        this.generate([x, y]);
      }
    }

    // reveal tile
    this.updateTile(position, { revealed: true });

    // if tile is 0, reveal surrounding tiles
    if (tile.number === 0)
      setTimeout(() => {
        for (let x = position[0] - 1; x <= position[0] + 1; x++) {
          for (let y = position[1] - 1; y <= position[1] + 1; y++) {
            if (x === position[0] && y === position[1]) continue;
            this.attemptReveal([x, y]);
          }
        }
      }, 100);
  }
}
