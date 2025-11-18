/**
 * Performance Monitor - Tracks FPS and frame times
 * Phase 6: Performance Optimization
 */

export class PerformanceMonitor {
  private frames: number = 0;
  private lastFpsUpdate: number = 0;
  private fps: number = 0;
  private frameTime: number = 0;
  private frameTimes: number[] = [];
  private maxFrameSamples: number = 60;

  // Performance thresholds
  private readonly TARGET_FPS = 60;

  constructor() {
    this.lastFpsUpdate = performance.now();
  }

  /**
   * Update performance metrics
   * Call this once per frame
   */
  update(): void {
    const now = performance.now();
    const delta = now - this.lastFpsUpdate;

    this.frames++;

    // Calculate frame time
    if (this.frameTimes.length > 0) {
      const lastFrameTime = now - this.frameTimes[this.frameTimes.length - 1];
      this.frameTime = lastFrameTime;
    }

    this.frameTimes.push(now);
    if (this.frameTimes.length > this.maxFrameSamples) {
      this.frameTimes.shift();
    }

    // Update FPS once per second
    if (delta >= 1000) {
      this.fps = Math.round((this.frames * 1000) / delta);
      this.frames = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Get current frame time in milliseconds
   */
  getFrameTime(): number {
    return this.frameTime;
  }

  /**
   * Get average frame time over recent frames
   */
  getAverageFrameTime(): number {
    if (this.frameTimes.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < this.frameTimes.length; i++) {
      total += this.frameTimes[i] - this.frameTimes[i - 1];
    }
    return total / (this.frameTimes.length - 1);
  }

  /**
   * Check if performance is below target
   */
  isBelowTarget(): boolean {
    return this.fps < this.TARGET_FPS * 0.9; // 90% of target
  }

  /**
   * Get performance status string
   */
  getStatus(): string {
    if (this.fps >= this.TARGET_FPS * 0.95) return 'excellent';
    if (this.fps >= this.TARGET_FPS * 0.8) return 'good';
    if (this.fps >= this.TARGET_FPS * 0.6) return 'fair';
    return 'poor';
  }

  /**
   * Render performance overlay
   */
  renderOverlay(ctx: CanvasRenderingContext2D, x: number = 10, y: number = 10): void {
    const fps = this.getFPS();
    const frameTime = this.getAverageFrameTime().toFixed(2);
    const status = this.getStatus();

    // Determine color based on performance
    let color = '#00ff00'; // Green
    if (fps < this.TARGET_FPS * 0.8) color = '#ffff00'; // Yellow
    if (fps < this.TARGET_FPS * 0.6) color = '#ff0000'; // Red

    ctx.save();
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 5, y - 15, 150, 45);

    // FPS
    ctx.fillStyle = color;
    ctx.fillText(`FPS: ${fps}`, x, y);

    // Frame time
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`Frame: ${frameTime}ms`, x, y + 15);

    // Status
    ctx.fillStyle = color;
    ctx.fillText(`Status: ${status}`, x, y + 30);

    ctx.restore();
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.frames = 0;
    this.fps = 0;
    this.frameTime = 0;
    this.frameTimes = [];
    this.lastFpsUpdate = performance.now();
  }
}
