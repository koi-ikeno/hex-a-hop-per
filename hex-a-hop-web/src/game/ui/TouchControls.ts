/**
 * TouchControls - On-screen controls for mobile devices
 */

import { Direction } from '../types/TileTypes';

export type TouchControlCallback = (direction: Direction) => void;
export type TouchButtonCallback = () => void;

interface ControlButton {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  direction?: Direction;
  callback?: TouchButtonCallback;
}

/**
 * Touch-based control system for mobile
 */
export class TouchControls {
  private canvas: HTMLCanvasElement;
  private buttons: ControlButton[] = [];
  private onMove: TouchControlCallback | null = null;
  private onUndo: TouchButtonCallback | null = null;
  private onReset: TouchButtonCallback | null = null;
  private activeButton: string | null = null;
  private enabled: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupButtons();
    this.setupTouchEvents();
    this.checkMobile();
  }

  /**
   * Check if device is mobile and enable controls
   */
  private checkMobile(): void {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    this.enabled = isMobile || isTouchDevice;
    console.log(`Touch controls: ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Setup button positions and layout
   */
  private setupButtons(): void {
    const buttonSize = 60;
    const padding = 15;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Hex directional pad (left side)
    //    Q   W
    //  A   S   D
    //    Z   X

    const dpadX = padding + 30;
    const dpadY = canvasHeight - 200;
    const spacing = buttonSize + 10;

    this.buttons = [
      // Directional buttons (hex layout)
      {
        id: 'up-left',
        x: dpadX,
        y: dpadY - spacing,
        width: buttonSize,
        height: buttonSize,
        label: '↖',
        direction: Direction.DIR_5,
      },
      {
        id: 'up-right',
        x: dpadX + spacing,
        y: dpadY - spacing,
        width: buttonSize,
        height: buttonSize,
        label: '↗',
        direction: Direction.DIR_0,
      },
      {
        id: 'left',
        x: dpadX - spacing / 2,
        y: dpadY,
        width: buttonSize,
        height: buttonSize,
        label: '←',
        direction: Direction.DIR_4,
      },
      {
        id: 'center',
        x: dpadX + spacing / 2,
        y: dpadY,
        width: buttonSize,
        height: buttonSize,
        label: '●',
      },
      {
        id: 'right',
        x: dpadX + spacing * 1.5,
        y: dpadY,
        width: buttonSize,
        height: buttonSize,
        label: '→',
        direction: Direction.DIR_1,
      },
      {
        id: 'down-left',
        x: dpadX,
        y: dpadY + spacing,
        width: buttonSize,
        height: buttonSize,
        label: '↙',
        direction: Direction.DIR_3,
      },
      {
        id: 'down-right',
        x: dpadX + spacing,
        y: dpadY + spacing,
        width: buttonSize,
        height: buttonSize,
        label: '↘',
        direction: Direction.DIR_2,
      },

      // Action buttons (right side)
      {
        id: 'undo',
        x: canvasWidth - padding - buttonSize - 80,
        y: canvasHeight - padding - buttonSize - 10,
        width: buttonSize + 20,
        height: buttonSize,
        label: 'UNDO',
        callback: () => this.onUndo?.(),
      },
      {
        id: 'reset',
        x: canvasWidth - padding - buttonSize,
        y: canvasHeight - padding - buttonSize - 10,
        width: buttonSize,
        height: buttonSize,
        label: 'RST',
        callback: () => this.onReset?.(),
      },
    ];
  }

  /**
   * Setup touch event handlers
   */
  private setupTouchEvents(): void {
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), {
      passive: false,
    });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), {
      passive: false,
    });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), {
      passive: false,
    });
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(e: TouchEvent): void {
    if (!this.enabled) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const button = this.getButtonAt(x, y);
    if (button) {
      this.activeButton = button.id;
      this.handleButtonPress(button);
    }
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (!this.enabled) return;
    e.preventDefault();
    this.activeButton = null;
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(e: TouchEvent): void {
    if (!this.enabled) return;
    e.preventDefault();
  }

  /**
   * Get button at position
   */
  private getButtonAt(x: number, y: number): ControlButton | null {
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
   * Handle button press
   */
  private handleButtonPress(button: ControlButton): void {
    if (button.direction !== undefined && this.onMove) {
      this.onMove(button.direction);
    } else if (button.callback) {
      button.callback();
    }
  }

  /**
   * Set movement callback
   */
  setMoveCallback(callback: TouchControlCallback): void {
    this.onMove = callback;
  }

  /**
   * Set undo callback
   */
  setUndoCallback(callback: TouchButtonCallback): void {
    this.onUndo = callback;
  }

  /**
   * Set reset callback
   */
  setResetCallback(callback: TouchButtonCallback): void {
    this.onReset = callback;
  }

  /**
   * Render controls
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.enabled) return;

    ctx.save();

    for (const button of this.buttons) {
      const isActive = this.activeButton === button.id;

      // Draw button background
      ctx.fillStyle = isActive ? 'rgba(100, 200, 100, 0.6)' : 'rgba(50, 50, 50, 0.5)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;

      // Rounded rectangle
      const radius = 8;
      ctx.beginPath();
      ctx.moveTo(button.x + radius, button.y);
      ctx.lineTo(button.x + button.width - radius, button.y);
      ctx.arcTo(
        button.x + button.width,
        button.y,
        button.x + button.width,
        button.y + radius,
        radius
      );
      ctx.lineTo(button.x + button.width, button.y + button.height - radius);
      ctx.arcTo(
        button.x + button.width,
        button.y + button.height,
        button.x + button.width - radius,
        button.y + button.height,
        radius
      );
      ctx.lineTo(button.x + radius, button.y + button.height);
      ctx.arcTo(
        button.x,
        button.y + button.height,
        button.x,
        button.y + button.height - radius,
        radius
      );
      ctx.lineTo(button.x, button.y + radius);
      ctx.arcTo(button.x, button.y, button.x + radius, button.y, radius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw label
      ctx.fillStyle = 'white';
      ctx.font = button.label.length > 2 ? 'bold 12px Arial' : 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        button.label,
        button.x + button.width / 2,
        button.y + button.height / 2
      );
    }

    ctx.restore();
  }

  /**
   * Enable/disable controls
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if controls are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
