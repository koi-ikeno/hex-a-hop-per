/**
 * Hex Grid System - Ported from hex_puzzzle.cpp
 * Handles hex grid coordinate conversions and constants
 */

import { Position } from '../types/TileTypes';

/*
    Hex tile layout (from hex_puzzzle.cpp):

     |--|     |--|   TILE_W1
     |----------|   TILE_W2
        |-------|   TILE_WL
     |------------|  TILE_W3

        *-----*  -      -
       /       \ |TILE_H1|TILE_H2
      /         \|      |
     *           *-      |
      \         /        |
       \       /         |
        *-----*          -

    WL = sqrt(h1*h1 + w1*w1)
    w1 = sin60 * wL
*/

// Tile dimensions (from hex_puzzzle.cpp lines 264-271)
export const TILE_W1 = 18;
export const TILE_W3 = 64;
export const GFX_SIZE = TILE_W3;
export const TILE_W2 = TILE_W3 - TILE_W1; // 46
export const TILE_H1 = TILE_W1; // 18
export const TILE_HUP = 22; // extra visible height of wall
export const TILE_H2 = TILE_H1 * 2; // 36
export const TILE_WL = TILE_W2 - TILE_W1; // 28
export const TILE_H_LIFT_UP = 26;
export const TILE_H_REFLECT_OFFSET = 24;
export const TILE_HUP2 = TILE_H_LIFT_UP;

// Font spacing
export const FONT_SPACING = 26;
export const FONT_X_SPACING = -1;

// Screen dimensions (from video.h)
export const SCREEN_W = 800;
export const SCREEN_H = 432;

// Sprite sheet constants
export const SPRITE_COLS = 10; // tiles per row in sprite sheet
export const SPRITE_ROWS = 7; // rows in sprite sheet
export const MAX_TILES = 70; // max tile types

/**
 * Rectangle for sprite sheet rendering
 */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Hex Grid coordinate conversion utilities
 */
export class HexGrid {
  /**
   * Convert grid coordinates to screen X position
   * Based on getScreenX() in hex_puzzzle.cpp
   */
  static gridToScreenX(gridX: number, gridY: number): number {
    return gridX * TILE_H1 + gridY * TILE_H2;
  }

  /**
   * Convert grid coordinates to screen Y position
   * Based on getScreenY() in hex_puzzzle.cpp
   */
  static gridToScreenY(_gridX: number, gridY: number): number {
    return gridY * TILE_WL;
  }

  /**
   * Convert screen coordinates to grid position
   * Based on hex_puzzzle.cpp lines 376-396
   */
  static screenToGrid(screenX: number, screenY: number): Position {
    let x = screenX;
    let y = screenY;

    y += TILE_H1;

    const tx = Math.floor(y / TILE_H2);
    y -= tx * TILE_H1;

    const ty = Math.floor(x / TILE_WL);
    x -= ty * TILE_WL;

    // Handle hex edges
    if (x < TILE_W1 && y < TILE_H1) {
      if (x * TILE_H1 + y * TILE_W1 < TILE_H1 * TILE_W1) {
        return { x: tx - 1, y: ty };
      }
    }
    if (x < TILE_W1 && y > TILE_H1) {
      if (x * TILE_H1 + (TILE_H2 - y) * TILE_W1 < TILE_H1 * TILE_W1) {
        return { x: tx, y: ty };
      }
    }

    return { x: tx, y: ty + 1 };
  }

  /**
   * Get sprite sheet source rectangle for a tile
   * Based on MakeTileInfo() in hex_puzzzle.cpp line 323
   */
  static getTileSpriteRect(tileIndex: number, _gridX: number = 0, _gridY: number = 0): Rect {
    return {
      x: (tileIndex % SPRITE_COLS) * GFX_SIZE,
      y: Math.floor(tileIndex / SPRITE_COLS) * GFX_SIZE,
      w: GFX_SIZE,
      h: GFX_SIZE,
    };
  }

  /**
   * Get direction from one grid position to another
   */
  static getDirection(from: Position, to: Position): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // 6 directions in hex grid
    if (dx === 1 && dy === 0) return 0;
    if (dx === 0 && dy === 1) return 1;
    if (dx === -1 && dy === 1) return 2;
    if (dx === -1 && dy === 0) return 3;
    if (dx === 0 && dy === -1) return 4;
    if (dx === 1 && dy === -1) return 5;

    return -1; // invalid direction
  }

  /**
   * Get neighbor position in a given direction
   */
  static getNeighbor(pos: Position, direction: number): Position {
    const neighbors = [
      { x: 1, y: 0 }, // DIR_0
      { x: 0, y: 1 }, // DIR_1
      { x: -1, y: 1 }, // DIR_2
      { x: -1, y: 0 }, // DIR_3
      { x: 0, y: -1 }, // DIR_4
      { x: 1, y: -1 }, // DIR_5
    ];

    if (direction < 0 || direction >= 6) {
      return pos;
    }

    return {
      x: pos.x + neighbors[direction].x,
      y: pos.y + neighbors[direction].y,
    };
  }
}
