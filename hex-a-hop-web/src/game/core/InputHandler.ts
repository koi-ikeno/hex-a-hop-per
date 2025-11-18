/**
 * InputHandler - Manages keyboard and touch input
 */

import { Direction } from '../types/TileTypes';

export type InputCallback = (direction: Direction) => void;
export type UndoCallback = () => void;
export type ResetCallback = () => void;

/**
 * Hex grid key mapping
 *
 *    Q   W
 *   A   S   D
 *
 * Q = Up-Left (DIR_5)
 * W = Up-Right (DIR_0)
 * A = Left (DIR_4)
 * D = Right (DIR_1)
 * S = Down (actually two directions based on context)
 */
export class InputHandler {
  private onMove: InputCallback | null = null;
  private onUndo: UndoCallback | null = null;
  private onReset: ResetCallback | null = null;
  private pressedKeys: Set<string> = new Set();

  constructor() {
    this.setupKeyboard();
  }

  /**
   * Set movement callback
   */
  setMoveCallback(callback: InputCallback): void {
    this.onMove = callback;
  }

  /**
   * Set undo callback
   */
  setUndoCallback(callback: UndoCallback): void {
    this.onUndo = callback;
  }

  /**
   * Set reset callback
   */
  setResetCallback(callback: ResetCallback): void {
    this.onReset = callback;
  }

  /**
   * Setup keyboard event listeners
   */
  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  /**
   * Handle key down event
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent repeated events while key is held
    if (this.pressedKeys.has(e.key)) {
      return;
    }
    this.pressedKeys.add(e.key);

    const direction = this.keyToDirection(e.key);
    if (direction !== Direction.NONE) {
      e.preventDefault();
      if (this.onMove) {
        this.onMove(direction);
      }
      return;
    }

    // Special keys
    if (e.key === 'u' || e.key === 'U' || e.key === 'Backspace') {
      e.preventDefault();
      if (this.onUndo) {
        this.onUndo();
      }
      return;
    }

    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      if (this.onReset) {
        this.onReset();
      }
      return;
    }
  }

  /**
   * Handle key up event
   */
  private handleKeyUp(e: KeyboardEvent): void {
    this.pressedKeys.delete(e.key);
  }

  /**
   * Map keyboard key to hex direction
   *
   * Hex grid layout:
   *      DIR_5  DIR_0
   *   DIR_4  X  DIR_1
   *      DIR_3  DIR_2
   *
   * Key mapping:
   *    Q(5)  W(0)  E
   *  A(4) S    D(1)
   *    Z(3)  X(2)  C
   */
  private keyToDirection(key: string): Direction {
    switch (key.toLowerCase()) {
      // Arrow keys
      case 'arrowright':
      case 'd':
        return Direction.DIR_1; // Right

      case 'arrowleft':
      case 'a':
        return Direction.DIR_4; // Left

      case 'arrowup':
      case 'w':
        return Direction.DIR_0; // Up-Right

      case 'q':
        return Direction.DIR_5; // Up-Left

      case 'arrowdown':
      case 'x':
        return Direction.DIR_2; // Down-Right

      case 'z':
        return Direction.DIR_3; // Down-Left

      // Alternative: S for down (we'll use DIR_2 by default)
      case 's':
        return Direction.DIR_2;

      // E and C as alternatives
      case 'e':
        return Direction.DIR_0;

      case 'c':
        return Direction.DIR_1;

      default:
        return Direction.NONE;
    }
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    window.removeEventListener('keydown', (e) => this.handleKeyDown(e));
    window.removeEventListener('keyup', (e) => this.handleKeyUp(e));
  }
}
