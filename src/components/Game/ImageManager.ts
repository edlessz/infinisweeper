export default class ImageManager {
  private static images: Record<string, HTMLImageElement> = {};
  public static loadImages(images: Record<string, string>): void {
    this.images = {};
    for (const [name, path] of Object.entries(images)) {
      const image = new Image();
      image.src = path;
      this.images[name] = image;
    }
  }
  public static get(name: string): HTMLImageElement | null {
    if (this.images[name]) return this.images[name];
    return null;
  }
}
