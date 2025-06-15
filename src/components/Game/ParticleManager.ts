import ImageManager from "./ImageManager";
import Particle from "./Particle";
import Vector2 from "./Vector2";

export default class ParticleManager {
  private entities: {
    particle: Particle;
    deathTime: number;
  }[] = [];

  public add(particle: Particle): void {
    this.entities.push({
      particle,
      deathTime: performance.now() + 3000,
    });
  }

  public update(): void {
    this.entities = this.entities.filter(
      (entity) => entity.deathTime > performance.now(),
    );
    this.entities.forEach((entity) => {
      entity.particle.update();
    });
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.entities.forEach((entity) => {
      entity.particle.render(ctx);
    });
  }

  public clear(): void {
    this.entities = [];
  }

  public explode(x: number, y: number): void {
    for (let i = 0; i < 250; i++) {
      const colors = ["red", "yellow", "orange"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const particle = new Particle(
        { x: x + Math.random(), y: y + Math.random() },
        randomColor,
      );

      const size = Math.random() * 0.25 + 0.25; // Random size between 0.25 and 0.5
      const direction = Math.random() * 2 * Math.PI; // Random direction in radians
      const speed = Math.random() * 0.5;
      particle.size = { x: size, y: size };
      particle.velocity = {
        x: Math.cos(direction) * speed,
        y: Math.sin(direction) * speed,
      };
      this.add(particle);
    }
  }

  public popFlag(position: Vector2): void {
    const image = ImageManager.get("flag");
    this.add(new Particle(position, "#f00", image));
  }
}
