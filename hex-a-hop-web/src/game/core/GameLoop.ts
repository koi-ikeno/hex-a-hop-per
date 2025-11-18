/**
 * Game Loop - Main game loop implementation
 * Handles update and render cycles
 */

export class GameLoop {
  private running: boolean = false;
  private lastTime: number = 0;
  private fps: number = 60;
  private frameTime: number = 1000 / this.fps;
  private accumulator: number = 0;

  private updateCallback: (deltaTime: number) => void;
  private renderCallback: () => void;

  constructor(
    updateCallback: (deltaTime: number) => void,
    renderCallback: () => void
  ) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.running) {
      console.warn('GameLoop is already running');
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    console.log('GameLoop started');
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.running = false;
    console.log('GameLoop stopped');
  }

  /**
   * Main loop - uses fixed timestep for updates
   */
  private loop(currentTime: number): void {
    if (!this.running) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Accumulate time
    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= this.frameTime) {
      this.updateCallback(this.frameTime / 1000); // Convert to seconds
      this.accumulator -= this.frameTime;
    }

    // Render
    this.renderCallback();

    // Continue loop
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Check if loop is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Set target FPS
   */
  setFPS(fps: number): void {
    this.fps = fps;
    this.frameTime = 1000 / fps;
  }
}
