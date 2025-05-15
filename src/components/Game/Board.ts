import AudioManager from "./AudioManager";
import ImageManager from "./ImageManager";
import PoppedTile from "./PoppedTile";
import PoppedTileManager from "./PoppedTileManager";
import Vector2 from "./Vector2";

type Key = [number, number];
interface Tile {
  number: number; // -1 for mine
  revealed: boolean;
  flagged: boolean;
  flaggedAt?: number;
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
  private PoppedTileManager = new PoppedTileManager();
  private revealQueue: {
    position: Key;
    time: number;
  }[] = [];

  private static getAddress(position: Key): string {
    return `${position[0]},${position[1]}`;
  }
  public static getKey(address: string): Key {
    const [x, y] = address.split(",").map(Number);
    return [x, y];
  }

  private bombChance: number = 0.18;
  private borderThickness: number = 0.1;

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

  public update(): void {
    this.processRevealQueue();
    this.PoppedTileManager.update();
  }

  public render(
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

        if (tile.flagged) {
          const frame = Math.min(
            Math.floor((performance.now() - (tile.flaggedAt ?? 0)) / 20),
            9
          );
          const image = ImageManager.get("flag_animation");
          if (image) ctx.drawImage(image, 0, 81 * frame, 81, 81, x, y, 1, 1);
        } else if (tile.revealed) {
          if (tile.number !== 0) {
            ctx.fillStyle = TEXT_COLORS[tile.number] ?? "#000";
            ctx.fillText(tile.number.toString(), x + 0.5, y + 0.5 + 0.05);
          }

          // draw borders
          ctx.fillStyle = "#86AE3A";

          const revealedNeighbors = {
            left: this.getTile([x - 1, y]).revealed,
            right: this.getTile([x + 1, y]).revealed,
            top: this.getTile([x, y - 1]).revealed,
            bottom: this.getTile([x, y + 1]).revealed,
            topLeft: this.getTile([x - 1, y - 1]).revealed,
            topRight: this.getTile([x + 1, y - 1]).revealed,
            bottomLeft: this.getTile([x - 1, y + 1]).revealed,
            bottomRight: this.getTile([x + 1, y + 1]).revealed,
          };

          if (!revealedNeighbors.left)
            ctx.fillRect(x, y, this.borderThickness, 1);
          if (!revealedNeighbors.right)
            ctx.fillRect(
              x + 1 - this.borderThickness,
              y,
              this.borderThickness,
              1
            );
          if (!revealedNeighbors.top)
            ctx.fillRect(x, y, 1, this.borderThickness);
          if (!revealedNeighbors.bottom)
            ctx.fillRect(
              x,
              y + 1 - this.borderThickness,
              1,
              this.borderThickness
            );

          if (!revealedNeighbors.topLeft)
            ctx.fillRect(x, y, this.borderThickness, this.borderThickness);
          if (!revealedNeighbors.topRight)
            ctx.fillRect(
              x + 1 - this.borderThickness,
              y,
              this.borderThickness,
              this.borderThickness
            );
          if (!revealedNeighbors.bottomLeft)
            ctx.fillRect(
              x,
              y + 1 - this.borderThickness,
              this.borderThickness,
              this.borderThickness
            );
          if (!revealedNeighbors.bottomRight)
            ctx.fillRect(
              x + 1 - this.borderThickness,
              y + 1 - this.borderThickness,
              this.borderThickness,
              this.borderThickness
            );
        }
      }
    }

    this.PoppedTileManager.render(ctx);

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
    const poppedTile = new PoppedTile(
      { x: position[0], y: position[1] },
      this.getTileColor(position, tile)
    );
    this.updateTile(position, { revealed: true });
    this.PoppedTileManager.add(poppedTile);

    const soundNum = Math.max(tile.number, 1);
    if (tile.number >= 0) AudioManager.play(`blip_${soundNum}`);

    // if tile is 0, reveal surrounding tiles
    if (tile.number === 0)
      for (let x = position[0] - 1; x <= position[0] + 1; x++) {
        for (let y = position[1] - 1; y <= position[1] + 1; y++) {
          if (x === position[0] && y === position[1]) continue;
          if (
            this.revealQueue.some(
              (item) => item.position[0] === x && item.position[1] === y
            )
          )
            continue;
          this.revealQueue.push({
            position: [x, y],
            time: performance.now() + 100,
          });
        }
      }
  }

  public toggleFlag(position: Key): void {
    const tile = this.getTile(position);
    if (tile.revealed) return;

    this.updateTile(position, {
      flagged: !tile.flagged,
      flaggedAt: performance.now(),
    });
    AudioManager.play(!tile.flagged ? "flag_down" : "flag_up");
    if (tile.flagged) {
      const image = ImageManager.get("flag");
      const poppedTile = new PoppedTile(
        { x: position[0], y: position[1] },
        "#FF0000",
        image ?? undefined
      );
      this.PoppedTileManager.add(poppedTile);
    }
  }

  public getFirstZero(remainder: number): Key | null {
    for (const [address, tile] of this.board.entries()) {
      const [x, y] = Board.getKey(address);
      if (tile.number === 0 && (x + y) % 2 == remainder && x > 0 && y > 0)
        return [x, y];
    }
    return null;
  }

  public processRevealQueue(): void {
    const now = performance.now();

    this.revealQueue.forEach((tile) => {
      if (tile.time <= now) this.attemptReveal(tile.position);
    });

    this.revealQueue = this.revealQueue.filter((tile) => tile.time > now);
  }
}
