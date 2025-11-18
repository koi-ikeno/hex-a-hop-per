/**
 * Tile Types - Ported from tiletypes.h
 * Defines all tile types in the Hex-a-Hop game
 */

export enum TileType {
  // Basic tiles
  GREEN = 0,
  GREEN1,
  GREEN2,
  GREEN3,
  GREEN4,

  // Special tiles
  COLLAPSIBLE,
  TRAMPOLINE,
  FLOATING,
  ANTI_ICE,
  ICE,

  // Building blocks
  BUILDER_1,
  BUILDER_2,
  BUILDER_3,

  // Directional
  LIFT_DOWN,
  LIFT_UP,

  // Trap
  TRAP,
  GUN,

  // Empty/special
  EMPTY,
  WALL,

  // Add more as we port from C++
}

export interface Tile {
  type: TileType;
  strength: number;  // How many times can be stepped on
  flags: number;     // Bitfield for various states
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  NONE = 0,
  UP,
  DOWN,
  LEFT,
  RIGHT,
  UP_LEFT,
  UP_RIGHT,
  DOWN_LEFT,
  DOWN_RIGHT,
}
