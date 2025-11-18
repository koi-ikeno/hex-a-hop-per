/**
 * Player - Manages player position and movement
 */

import { Position, Direction } from '../types/TileTypes';
import { Level } from './Level';
import { HexGrid } from './HexGrid';

export class Player {
  public position: Position;
  public items: number[] = [0, 0]; // Anti-ice, Jump items
  private moveHistory: Position[] = [];

  constructor(startPos: Position) {
    this.position = { ...startPos };
    this.moveHistory = [{ ...startPos }];
  }

  /**
   * Try to move in a direction
   * Returns true if move was successful
   */
  move(direction: Direction, level: Level): boolean {
    if (direction === Direction.NONE || direction < 0 || direction >= 6) {
      return false;
    }

    const newPos = HexGrid.getNeighbor(this.position, direction);

    // Check if new position is valid and walkable
    if (!level.isValid(newPos)) {
      return false;
    }

    if (!level.canWalkOn(newPos)) {
      return false;
    }

    // Save old position for undo
    this.moveHistory.push({ ...this.position });

    // Move to new position
    this.position = newPos;

    // Step on the tile (may cause it to collapse)
    level.stepOnTile(newPos);

    return true;
  }

  /**
   * Undo last move
   */
  undo(level: Level): boolean {
    if (this.moveHistory.length <= 1) {
      return false; // Can't undo initial position
    }

    // Pop current position
    this.moveHistory.pop();

    // Restore previous position
    const prevPos = this.moveHistory[this.moveHistory.length - 1];
    this.position = { ...prevPos };

    // Note: In the real game, we'd need to restore tile states too
    // For now, we'll implement a simple level reset for undo
    return true;
  }

  /**
   * Check if player is dead (standing on collapsed tile or empty space)
   */
  isDead(level: Level): boolean {
    return !level.canWalkOn(this.position);
  }

  /**
   * Get screen position for rendering
   */
  getScreenPosition(): { x: number; y: number } {
    return {
      x: HexGrid.gridToScreenX(this.position.x, this.position.y),
      y: HexGrid.gridToScreenY(this.position.x, this.position.y),
    };
  }

  /**
   * Reset player to starting position
   */
  reset(startPos: Position): void {
    this.position = { ...startPos };
    this.moveHistory = [{ ...startPos }];
    this.items = [0, 0];
  }
}
