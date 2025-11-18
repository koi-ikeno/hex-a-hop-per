/**
 * HexGrid3D - 3D hexagonal grid system
 * Converts 2D hex grid to 3D world coordinates
 */

import * as THREE from 'three';
import { Position, Direction } from '../types/types';

/**
 * Hexagonal grid constants for 3D world
 */
export class HexGrid3D {
  // Hex tile size in 3D space
  static readonly HEX_SIZE = 1.0;
  static readonly HEX_HEIGHT = 0.3; // Thickness of tiles

  // Calculated dimensions
  static readonly HEX_WIDTH = HexGrid3D.HEX_SIZE * 2;
  static readonly HEX_HORIZ_SPACING = HexGrid3D.HEX_SIZE * 1.5;
  static readonly HEX_VERT_SPACING = HexGrid3D.HEX_SIZE * Math.sqrt(3);

  // Layer height (for multi-layer levels)
  static readonly LAYER_HEIGHT = 2.0;

  /**
   * Convert grid coordinates to 3D world position
   * @param gridX - Grid X coordinate
   * @param gridY - Grid Y coordinate
   * @param layer - Vertical layer (default 0)
   * @returns 3D position vector
   */
  static gridToWorld3D(gridX: number, gridY: number, layer: number = 0): THREE.Vector3 {
    // Hex grid offset layout (odd rows offset)
    const x = gridX * HexGrid3D.HEX_HORIZ_SPACING;
    const z = gridY * HexGrid3D.HEX_VERT_SPACING +
              (gridX % 2) * HexGrid3D.HEX_VERT_SPACING / 2;
    const y = layer * HexGrid3D.LAYER_HEIGHT;

    return new THREE.Vector3(x, y, z);
  }

  /**
   * Convert 3D world position to grid coordinates
   * @param worldPos - World position
   * @returns Grid position (rounded to nearest hex)
   */
  static worldToGrid3D(worldPos: THREE.Vector3): Position {
    // Approximate inverse (for raycasting)
    const gridX = Math.round(worldPos.x / HexGrid3D.HEX_HORIZ_SPACING);

    // Adjust for offset
    const offset = (gridX % 2) * HexGrid3D.HEX_VERT_SPACING / 2;
    const gridY = Math.round((worldPos.z - offset) / HexGrid3D.HEX_VERT_SPACING);

    return { x: gridX, y: gridY };
  }

  /**
   * Get neighbor position in given direction
   * @param pos - Current position
   * @param direction - Direction (0-5)
   * @returns Neighbor position
   */
  static getNeighbor(pos: Position, direction: Direction): Position {
    if (direction === Direction.NONE || direction < 0 || direction >= 6) {
      return pos;
    }

    // Hex directions depend on whether row is even or odd
    const isEvenRow = pos.x % 2 === 0;

    const neighbors = isEvenRow ? [
      { x: 1, y: 0 },   // DIR_0: Right
      { x: 0, y: 1 },   // DIR_1: Down-Right
      { x: -1, y: 1 },  // DIR_2: Down-Left
      { x: -1, y: 0 },  // DIR_3: Left
      { x: -1, y: -1 }, // DIR_4: Up-Left
      { x: 0, y: -1 },  // DIR_5: Up-Right
    ] : [
      { x: 1, y: 0 },   // DIR_0: Right
      { x: 1, y: 1 },   // DIR_1: Down-Right
      { x: 0, y: 1 },   // DIR_2: Down-Left
      { x: -1, y: 0 },  // DIR_3: Left
      { x: 0, y: -1 },  // DIR_4: Up-Left
      { x: 1, y: -1 },  // DIR_5: Up-Right
    ];

    return {
      x: pos.x + neighbors[direction].x,
      y: pos.y + neighbors[direction].y,
    };
  }

  /**
   * Get all 6 neighbors of a position
   * @param pos - Current position
   * @returns Array of 6 neighbor positions
   */
  static getAllNeighbors(pos: Position): Position[] {
    const neighbors: Position[] = [];
    for (let dir = 0; dir < 6; dir++) {
      neighbors.push(HexGrid3D.getNeighbor(pos, dir));
    }
    return neighbors;
  }

  /**
   * Calculate distance between two grid positions
   * @param pos1 - First position
   * @param pos2 - Second position
   * @returns Hex distance
   */
  static hexDistance(pos1: Position, pos2: Position): number {
    // Convert to cube coordinates for distance calculation
    const cube1 = HexGrid3D.offsetToCube(pos1);
    const cube2 = HexGrid3D.offsetToCube(pos2);

    return Math.max(
      Math.abs(cube1.x - cube2.x),
      Math.abs(cube1.y - cube2.y),
      Math.abs(cube1.z - cube2.z)
    );
  }

  /**
   * Convert offset coordinates to cube coordinates
   * @param pos - Offset position
   * @returns Cube coordinates
   */
  private static offsetToCube(pos: Position): { x: number; y: number; z: number } {
    const x = pos.x;
    const z = pos.y - (pos.x - (pos.x % 2)) / 2;
    const y = -x - z;
    return { x, y, z };
  }

  /**
   * Check if position is valid in grid
   * @param pos - Grid position
   * @param width - Grid width
   * @param height - Grid height
   * @returns True if valid
   */
  static isValidPosition(pos: Position, width: number, height: number): boolean {
    return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
  }

  /**
   * Get direction from one position to another
   * @param from - Start position
   * @param to - End position
   * @returns Direction (0-5) or -1 if not adjacent
   */
  static getDirection(from: Position, to: Position): Direction {
    for (let dir = 0; dir < 6; dir++) {
      const neighbor = HexGrid3D.getNeighbor(from, dir);
      if (neighbor.x === to.x && neighbor.y === to.y) {
        return dir as Direction;
      }
    }
    return Direction.NONE;
  }
}
