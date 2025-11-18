/**
 * GameUI - Game user interface overlay
 */

export enum GameState {
  PLAYING,
  PAUSED,
  WON,
  LOST,
}

export interface UIConfig {
  showStats: boolean;
  showControls: boolean;
  showDebug: boolean;
}

/**
 * Game UI overlay system
 */
export class GameUI {
  private config: UIConfig;

  constructor(config: Partial<UIConfig> = {}) {
    this.config = {
      showStats: true,
      showControls: true,
      showDebug: false,
      ...config,
    };
  }

  /**
   * Render game stats
   */
  renderStats(
    ctx: CanvasRenderingContext2D,
    stats: {
      levelName: string;
      moves: number;
      tilesRemaining: number;
      totalTiles: number;
    }
  ): void {
    if (!this.config.showStats) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(5, 5, 300, 85);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Hex-a-Hop Web', 15, 25);

    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(stats.levelName, 15, 45);
    ctx.fillText(
      `Moves: ${stats.moves} | Tiles: ${stats.tilesRemaining}/${stats.totalTiles}`,
      15,
      65
    );

    ctx.restore();
  }

  /**
   * Render controls help
   */
  renderControls(
    ctx: CanvasRenderingContext2D,
    y: number,
    showMobileHint: boolean
  ): void {
    if (!this.config.showControls) return;

    ctx.save();
    ctx.fillStyle = '#888888';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    if (showMobileHint) {
      ctx.fillText('Use on-screen controls to move', ctx.canvas.width / 2, y);
    } else {
      ctx.fillText(
        'Controls: QWEASDZXC or Arrow Keys | R: Reset | U: Undo',
        ctx.canvas.width / 2,
        y
      );
    }

    ctx.restore();
  }

  /**
   * Render victory screen
   */
  renderVictory(ctx: CanvasRenderingContext2D, moves: number): void {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    ctx.save();

    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Victory message
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VICTORY!', centerX, centerY - 40);

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Completed in ${moves} moves!`, centerX, centerY + 10);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('Press R to play again', centerX, centerY + 50);

    ctx.restore();
  }

  /**
   * Render game over screen
   */
  renderGameOver(ctx: CanvasRenderingContext2D): void {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    ctx.save();

    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Game over message
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', centerX, centerY - 20);

    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText('Press R to try again', centerX, centerY + 30);

    ctx.restore();
  }

  /**
   * Render pause screen
   */
  renderPause(ctx: CanvasRenderingContext2D): void {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', centerX, centerY);

    ctx.restore();
  }

  /**
   * Set config option
   */
  setConfig(key: keyof UIConfig, value: boolean): void {
    this.config[key] = value;
  }
}
