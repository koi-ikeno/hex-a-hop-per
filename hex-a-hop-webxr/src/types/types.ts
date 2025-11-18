/**
 * Type definitions for Hex-a-Hop WebXR
 */

import * as THREE from 'three';

/**
 * Tile types - ported from 2D version
 */
export enum TileType {
  EMPTY = 0,
  NORMAL = 1,          // Green tile - must step on all
  COLLAPSABLE = 2,     // Collapses after stepping
  COLLAPSE_DOOR = 3,
  TRAMPOLINE = 4,
  SPINNER = 5,
  WALL = 6,            // Obstacle - cannot pass
  COLLAPSABLE2 = 7,    // Requires 2 steps
  COLLAPSE_DOOR2 = 8,
  GUN = 9,
  TRAP = 10,
  COLLAPSABLE3 = 11,   // Requires 3 steps
  BUILDER = 12,
  SWITCH = 13,
  FLOATING_BALL = 14,
  LIFT_DOWN = 15,
  LIFT_UP = 16,
}

/**
 * Grid position (2D hex coordinates)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 3D position with layer
 */
export interface Position3D extends Position {
  layer: number; // Vertical layer (0 = ground level)
}

/**
 * Hex direction (6 directions)
 */
export enum Direction {
  NONE = -1,
  DIR_0 = 0,  // Right
  DIR_1 = 1,  // Down-Right
  DIR_2 = 2,  // Down-Left
  DIR_3 = 3,  // Left
  DIR_4 = 4,  // Up-Left
  DIR_5 = 5,  // Up-Right
}

/**
 * Tile data for level
 */
export interface TileData {
  type: TileType;
  position: Position;
  strength: number; // For collapsable tiles
}

/**
 * Level data structure
 */
export interface LevelData {
  name: string;
  width: number;
  height: number;
  tiles: TileData[];
  playerStart: Position;
  layers?: number; // For 3D levels
}

/**
 * Game state
 */
export interface GameState {
  currentLevel: number;
  moves: number;
  tilesRemaining: number;
  totalTiles: number;
  isComplete: boolean;
  isFailed: boolean;
}

/**
 * Input mode
 */
export enum InputMode {
  DESKTOP = 'desktop',  // Mouse + keyboard
  VR = 'vr',            // VR controllers
  TOUCH = 'touch',      // Mobile touch
}

/**
 * Tile 3D mesh with game data
 */
export interface HexTile3D {
  mesh: THREE.Mesh;
  type: TileType;
  gridPos: Position;
  strength: number;
  isGreen: boolean; // Must be stepped on
  isStepped: boolean;
}

/**
 * Player 3D representation
 */
export interface Player3D {
  mesh: THREE.Mesh;
  position: Position;
  targetPosition?: Position;
  isMoving: boolean;
}

/**
 * VR controller data
 */
export interface VRControllerData {
  controller: THREE.XRTargetRaySpace;
  grip: THREE.XRGripSpace;
  model?: THREE.Object3D;
}
