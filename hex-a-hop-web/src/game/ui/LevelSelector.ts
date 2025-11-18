/**
 * LevelSelector - Level selection screen UI
 */

import { ProgressManager, LevelProgress } from '../core/ProgressManager';
import { getTotalLevels } from '../core/Level';

export type LevelSelectCallback = (levelIndex: number) => void;

interface LevelButton {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  unlocked: boolean;
  progress: LevelProgress | null;
}

/**
 * Level selection screen
 */
export class LevelSelector {
  private canvas: HTMLCanvasElement;
  private progressManager: ProgressManager;
  private buttons: LevelButton[] = [];
  private onSelect: LevelSelectCallback | null = null;
  private hoveredButton: number = -1;
  private visible: boolean = false;

  constructor(canvas: HTMLCanvasElement, progressManager: ProgressManager) {
    this.canvas = canvas;
    this.progressManager = progressManager;
    this.setupButtons();
    this.setupEvents();
  }

  /**
   * Setup level selection buttons
   */
  private setupButtons(): void {
    const totalLevels = getTotalLevels();
    const buttonWidth = 100;
    const buttonHeight = 80;
    const padding = 20;
    const buttonsPerRow = 4;

    this.buttons = [];

    for (let i = 0; i < totalLevels; i++) {
      const row = Math.floor(i / buttonsPerRow);
      const col = i % buttonsPerRow;

      const x =
        this.canvas.width / 2 -
        (buttonsPerRow * (buttonWidth + padding)) / 2 +
        col * (buttonWidth + padding) +
        padding;
      const y = 150 + row * (buttonHeight + padding);

      this.buttons.push({
        index: i,
        x,
        y,
        width: buttonWidth,
        height: buttonHeight,
        unlocked: this.progressManager.isLevelUnlocked(i),
        progress: this.progressManager.getLevelProgress(i),
      });
    }
  }

  /**
   * Setup mouse/touch events
   */
  private setupEvents(): void {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
  }

  /**
   * Handle click event
   */
  private handleClick(e: MouseEvent): void {
    if (!this.visible) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const button = this.getButtonAt(x, y);
    if (button && button.unlocked && this.onSelect) {
      this.onSelect(button.index);
    }
  }

  /**
   * Handle mouse move event
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.visible) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const button = this.getButtonAt(x, y);
    this.hoveredButton = button ? button.index : -1;
  }

  /**
   * Handle touch event
   */
  private handleTouch(e: TouchEvent): void {
    if (!this.visible) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const button = this.getButtonAt(x, y);
    if (button && button.unlocked && this.onSelect) {
      this.onSelect(button.index);
    }
  }

  /**
   * Get button at position
   */
  private getButtonAt(x: number, y: number): LevelButton | null {
    for (const button of this.buttons) {
      if (
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height
      ) {
        return button;
      }
    }
    return null;
  }

  /**
   * Render level selector
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;

    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Select Level', this.canvas.width / 2, 80);

    // Stats
    const completion = this.progressManager.getCompletionPercentage(
      getTotalLevels()
    );
    const totalStars = this.progressManager.getTotalStars();
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText(
      `Progress: ${completion}% | Stars: ${totalStars}`,
      this.canvas.width / 2,
      120
    );

    // Level buttons
    for (const button of this.buttons) {
      const isHovered = button.index === this.hoveredButton;

      // Button background
      if (!button.unlocked) {
        ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(0, 200, 100, 0.8)';
      } else if (button.progress?.completed) {
        ctx.fillStyle = 'rgba(0, 150, 100, 0.6)';
      } else {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
      }

      // Rounded rectangle
      this.drawRoundedRect(
        ctx,
        button.x,
        button.y,
        button.width,
        button.height,
        10
      );
      ctx.fill();

      // Border
      ctx.strokeStyle = isHovered ? '#00ff88' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Level number
      ctx.fillStyle = button.unlocked ? 'white' : '#666666';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        (button.index + 1).toString(),
        button.x + button.width / 2,
        button.y + 25
      );

      if (button.unlocked) {
        // Stars
        if (button.progress && button.progress.stars > 0) {
          const starY = button.y + 45;
          const starSpacing = 20;
          const startX =
            button.x + button.width / 2 - ((button.progress.stars - 1) * starSpacing) / 2;

          for (let i = 0; i < button.progress.stars; i++) {
            ctx.fillStyle = '#ffdd00';
            ctx.font = '16px Arial';
            ctx.fillText('★', startX + i * starSpacing, starY);
          }
        }

        // Best moves (if completed)
        if (button.progress?.completed) {
          ctx.fillStyle = '#aaaaaa';
          ctx.font = '12px Arial';
          ctx.fillText(
            `${button.progress.bestMoves} moves`,
            button.x + button.width / 2,
            button.y + button.height - 10
          );
        }
      } else {
        // Locked icon
        ctx.fillStyle = '#666666';
        ctx.font = '24px Arial';
        ctx.fillText('🔒', button.x + button.width / 2, button.y + 50);
      }
    }

    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Click a level to play | ESC to close',
      this.canvas.width / 2,
      this.canvas.height - 30
    );

    ctx.restore();
  }

  /**
   * Draw rounded rectangle
   */
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  /**
   * Set select callback
   */
  setSelectCallback(callback: LevelSelectCallback): void {
    this.onSelect = callback;
  }

  /**
   * Show level selector
   */
  show(): void {
    this.visible = true;
    this.setupButtons(); // Refresh button states
  }

  /**
   * Hide level selector
   */
  hide(): void {
    this.visible = false;
    this.hoveredButton = -1;
  }

  /**
   * Check if visible
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Toggle visibility
   */
  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }
}
