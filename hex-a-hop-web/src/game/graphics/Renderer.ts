/**
 * Renderer - Canvas 2D rendering engine
 * Ported from gfx.cpp
 */

import { GFX_SIZE, TILE_H1, Rect } from '../core/HexGrid';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private textures: Map<string, HTMLImageElement>;
  private loadingPromises: Promise<void>[];

  // Scroll offsets for camera movement
  public scrollX: number = 0;
  public scrollY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = ctx;
    this.textures = new Map();
    this.loadingPromises = [];

    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
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
        console.log(`Loaded texture: ${name} (${img.width}x${img.height})`);
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
   * Get a loaded texture
   */
  getTexture(name: string): HTMLImageElement | undefined {
    return this.textures.get(name);
  }

  /**
   * Clear the canvas
   */
  clear(color: string = '#1a1a2e'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw an image from sprite sheet
   * Equivalent to SDL_RenderCopy
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
   * Render a tile from sprite sheet
   * Ported from RenderTile() in hex_puzzzle.cpp line 667
   *
   * @param reflect - Use reflected tile sprite
   * @param tileIndex - Tile type index
   * @param x - Screen X position (before scroll)
   * @param y - Screen Y position (before scroll)
   * @param spriteRect - Source rectangle in sprite sheet
   */
  renderTile(
    reflect: boolean,
    tileIndex: number,
    x: number,
    y: number,
    spriteRect: Rect
  ): void {
    const textureName = reflect ? 'tiles_reflect' : 'tiles';
    const texture = this.textures.get(textureName);

    if (!texture) {
      // Draw placeholder if texture not loaded
      this.ctx.fillStyle = '#ff00ff';
      this.ctx.fillRect(
        x - this.scrollX - GFX_SIZE / 2,
        y - this.scrollY - GFX_SIZE + TILE_H1,
        GFX_SIZE,
        GFX_SIZE
      );
      return;
    }

    // Calculate destination position (adjusted for scroll and tile offset)
    // Based on: dst = {x-scrollX-GFX_SIZE/2, y-scrollY-GFX_SIZE+TILE_H1, 0, 0}
    const dx = x - this.scrollX - GFX_SIZE / 2;
    const dy = y - this.scrollY - GFX_SIZE + TILE_H1;

    this.ctx.drawImage(
      texture,
      spriteRect.x,
      spriteRect.y,
      spriteRect.w,
      spriteRect.h,
      dx,
      dy,
      spriteRect.w,
      spriteRect.h
    );
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
   * Set camera scroll position
   */
  setScroll(x: number, y: number): void {
    this.scrollX = x;
    this.scrollY = y;
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
