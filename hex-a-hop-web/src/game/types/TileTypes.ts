/**
 * Tile Types - Ported from tiletypes.h
 * Defines all tile types in the Hex-a-Hop game
 */

// Tile type enum - ported from tiletypes.h X() macro
export enum TileType {
  EMPTY = 0,
  NORMAL,
  COLLAPSABLE,
  COLLAPSE_DOOR,
  TRAMPOLINE,
  SPINNER,
  WALL,
  COLLAPSABLE2,
  COLLAPSE_DOOR2,
  GUN,
  TRAP,
  COLLAPSABLE3,
  BUILDER,
  SWITCH,
  FLOATING_BALL,
  LIFT_DOWN,
  LIFT_UP,
  NumTileTypes,
}

// Tile colors (from tiletypes.h)
export const TileColors: Record<TileType, number> = {
  [TileType.EMPTY]: 0x202060,
  [TileType.NORMAL]: 0x506070,
  [TileType.COLLAPSABLE]: 0x408040,
  [TileType.COLLAPSE_DOOR]: 0xa0f0a0,
  [TileType.TRAMPOLINE]: 0x603060,
  [TileType.SPINNER]: 0x784040,
  [TileType.WALL]: 0x000080,
  [TileType.COLLAPSABLE2]: 0x408080,
  [TileType.COLLAPSE_DOOR2]: 0xa0f0f0,
  [TileType.GUN]: 0xb0a040,
  [TileType.TRAP]: 0x000000,
  [TileType.COLLAPSABLE3]: 0x202020,
  [TileType.BUILDER]: 0x009000,
  [TileType.SWITCH]: 0x004000,
  [TileType.FLOATING_BALL]: 0xa00050,
  [TileType.LIFT_DOWN]: 0x7850a0,
  [TileType.LIFT_UP]: 0x7850a0,
  [TileType.NumTileTypes]: 0x000000,
};

// Tile solid state (from tiletypes.h)
export const TileSolid: Record<TileType, number> = {
  [TileType.EMPTY]: -1,
  [TileType.NORMAL]: 0,
  [TileType.COLLAPSABLE]: 0,
  [TileType.COLLAPSE_DOOR]: 1,
  [TileType.TRAMPOLINE]: 0,
  [TileType.SPINNER]: 0,
  [TileType.WALL]: 1,
  [TileType.COLLAPSABLE2]: 0,
  [TileType.COLLAPSE_DOOR2]: 1,
  [TileType.GUN]: 0,
  [TileType.TRAP]: 0,
  [TileType.COLLAPSABLE3]: 0,
  [TileType.BUILDER]: 0,
  [TileType.SWITCH]: 0,
  [TileType.FLOATING_BALL]: 0,
  [TileType.LIFT_DOWN]: 0,
  [TileType.LIFT_UP]: 1,
  [TileType.NumTileTypes]: 0,
};

export interface Tile {
  type: TileType;
  strength: number; // How many times can be stepped on
  flags: number; // Bitfield for various states
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

// Hex grid directions (6 directions)
export enum Direction {
  NONE = -1,
  DIR_0 = 0,
  DIR_1 = 1,
  DIR_2 = 2,
  DIR_3 = 3,
  DIR_4 = 4,
  DIR_5 = 5,
}

export const MAX_DIR = 6;
