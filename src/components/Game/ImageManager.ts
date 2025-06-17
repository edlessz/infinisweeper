const images: Record<string, HTMLImageElement> = {};

export const ImageManager = {
  loadImages(imagePaths: Record<string, string>): void {
    for (const key in images) {
      delete images[key]; // clear previous images
    }
    for (const [name, path] of Object.entries(imagePaths)) {
      const image = new Image();
      image.src = path;
      images[name] = image;
    }
  },

  get(name: string): HTMLImageElement | null {
    return images[name] ?? null;
  },
};
