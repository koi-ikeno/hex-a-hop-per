/**
 * Renderer - Canvas 2D rendering engine
 * Ported from gfx.cpp
 */

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private textures: Map<string, HTMLImageElement>;
  private loadingPromises: Promise<void>[];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = ctx;
    this.textures = new Map();
    this.loadingPromises = [];
  }

  /**
   * Load an image texture
   * Equivalent to SDL_LoadTexture
   */
  async loadTexture(name: string, path: string): Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.textures.set(name, img);
        console.log(`Loaded texture: ${name}`);
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load texture: ${path}`));
      };
      img.src = path;
    });

    this.loadingPromises.push(promise);
    return promise;
  }

  /**
   * Wait for all textures to load
   */
  async waitForTextures(): Promise<void> {
    await Promise.all(this.loadingPromises);
    this.loadingPromises = [];
  }

  /**
   * Clear the canvas
   */
  clear(color: string = '#1a1a2e'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw an image
   */
  drawImage(
    textureName: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void {
    const texture = this.textures.get(textureName);
    if (!texture) {
      console.warn(`Texture not found: ${textureName}`);
      return;
    }

    this.ctx.drawImage(texture, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  /**
   * Draw a filled rectangle
   */
  fillRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Draw text
   */
  drawText(
    text: string,
    x: number,
    y: number,
    font: string = '16px Arial',
    color: string = '#ffffff',
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Get rendering context (for advanced drawing)
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get canvas dimensions
   */
  getSize(): { width: number; height: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }
}
