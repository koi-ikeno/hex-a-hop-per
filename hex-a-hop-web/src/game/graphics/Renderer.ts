/**
 * Renderer - Canvas 2D rendering engine
 * Ported from gfx.cpp
 * Phase 6: Performance optimizations with offscreen canvas and dirty rectangles
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

  // Offscreen canvas for level caching
  private levelCache: HTMLCanvasElement | null = null;
  private levelCacheCtx: CanvasRenderingContext2D | null = null;
  private levelCacheDirty: boolean = true;

  // Dirty rectangles for partial rendering
  private dirtyRegions: Rect[] = [];
  private useDirtyRectangles: boolean = true;

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
    _tileIndex: number,
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

  /**
   * Initialize offscreen canvas for level caching
   * Phase 6: Performance optimization
   */
  initLevelCache(width: number, height: number): void {
    if (!this.levelCache) {
      this.levelCache = document.createElement('canvas');
      this.levelCache.width = width;
      this.levelCache.height = height;
      const ctx = this.levelCache.getContext('2d');
      if (!ctx) {
        throw new Error('Could not create offscreen canvas context');
      }
      this.levelCacheCtx = ctx;
      this.levelCacheCtx.imageSmoothingEnabled = false;
      console.log(`Offscreen canvas initialized: ${width}x${height}`);
    }
  }

  /**
   * Mark the level cache as dirty (needs redraw)
   */
  invalidateLevelCache(): void {
    this.levelCacheDirty = true;
  }

  /**
   * Check if level cache needs updating
   */
  isLevelCacheDirty(): boolean {
    return this.levelCacheDirty;
  }

  /**
   * Get level cache context for drawing
   */
  getLevelCacheContext(): CanvasRenderingContext2D | null {
    return this.levelCacheCtx;
  }

  /**
   * Render the cached level to the main canvas
   */
  renderLevelCache(offsetX: number = 0, offsetY: number = 0): void {
    if (!this.levelCache || !this.levelCacheCtx) return;

    this.ctx.drawImage(this.levelCache, offsetX, offsetY);
    this.levelCacheDirty = false;
  }

  /**
   * Mark a region as dirty (needs redraw)
   * Phase 6: Dirty rectangle optimization
   */
  markDirty(x: number, y: number, w: number, h: number): void {
    if (!this.useDirtyRectangles) return;

    // Expand slightly to avoid edge artifacts
    const margin = 2;
    this.dirtyRegions.push({
      x: Math.floor(x - margin),
      y: Math.floor(y - margin),
      w: Math.ceil(w + margin * 2),
      h: Math.ceil(h + margin * 2),
    });
  }

  /**
   * Clear all dirty regions
   */
  clearDirtyRegions(): void {
    this.dirtyRegions = [];
  }

  /**
   * Get all dirty regions
   */
  getDirtyRegions(): Rect[] {
    return this.dirtyRegions;
  }

  /**
   * Check if dirty rectangle optimization is enabled
   */
  isDirtyRectanglesEnabled(): boolean {
    return this.useDirtyRectangles;
  }

  /**
   * Enable/disable dirty rectangle optimization
   */
  setDirtyRectanglesEnabled(enabled: boolean): void {
    this.useDirtyRectangles = enabled;
    console.log(`Dirty rectangles: ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clear specific region
   */
  clearRegion(x: number, y: number, w: number, h: number, color: string = '#1a1a2e'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  /**
   * Save current context state
   */
  save(): void {
    this.ctx.save();
  }

  /**
   * Restore context state
   */
  restore(): void {
    this.ctx.restore();
  }
}
