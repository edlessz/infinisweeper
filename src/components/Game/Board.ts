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

  protected generate(position: Key): void {
    const tile: Tile = {
      number: Math.random() < 0.18 ? -1 : 0,
      hidden: true,
      flagged: false,
    };
    this.board.set(Board.getAddress(position), tile);
  }

  public getTile(position: Key): Tile {
    const tile = this.board.get(Board.getAddress(position));
    if (!tile) {
      this.generate(position);
      return this.getTile(position);
    }
    return tile;
  }
}
