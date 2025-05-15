import PoppedTile from "./PoppedTile";

export default class PoppedTileManager {
  private entities: {
    tile: PoppedTile;
    deathTime: number;
  }[] = [];

  public add(poppedTile: PoppedTile): void {
    this.entities.push({
      tile: poppedTile,
      deathTime: performance.now() + 3000,
    });
  }

  public update(): void {
    this.entities = this.entities.filter(
      (entity) => entity.deathTime > performance.now()
    );
    this.entities.forEach((entity) => {
      entity.tile.update();
    });
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.entities.forEach((entity) => {
      entity.tile.render(ctx);
    });
  }
}
