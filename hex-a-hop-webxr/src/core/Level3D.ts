/**
 * Level3D - 3D level management
 * Ported from 2D version
 */

import { LevelData, TileData, TileType, Position } from '../types/types';

/**
 * Test level 1 - Tutorial (ported from 2D version)
 */
function createTestLevel1(): LevelData {
  const tiles: TileData[] = [
    // Start tile
    { type: TileType.NORMAL, position: { x: 2, y: 2 }, strength: 999 },

    // Path of collapsable tiles
    { type: TileType.COLLAPSABLE, position: { x: 3, y: 2 }, strength: 1 },
    { type: TileType.COLLAPSABLE, position: { x: 4, y: 2 }, strength: 1 },
    { type: TileType.COLLAPSABLE, position: { x: 4, y: 3 }, strength: 1 },
    { type: TileType.COLLAPSABLE, position: { x: 3, y: 3 }, strength: 1 },
    { type: TileType.COLLAPSABLE, position: { x: 2, y: 3 }, strength: 1 },
  ];

  return {
    name: 'First Steps',
    width: 8,
    height: 8,
    tiles,
    playerStart: { x: 2, y: 2 },
    layers: 1,
  };
}

/**
 * Test level 2 - Simple path
 */
function createTestLevel2(): LevelData {
  const tiles: TileData[] = [
    { type: TileType.NORMAL, position: { x: 1, y: 1 }, strength: 999 },
    { type: TileType.COLLAPSABLE, position: { x: 2, y: 1 }, strength: 1 },
    { type: TileType.COLLAPSABLE, position: { x: 3, y: 1 }, strength: 1 },
    { type: TileType.COLLAPSABLE, position: { x: 3, y: 2 }, strength: 1 },
    { type: TileType.COLLAPSABLE, position: { x: 2, y: 2 }, strength: 1 },
    { type: TileType.COLLAPSABLE, position: { x: 1, y: 2 }, strength: 1 },
    { type: TileType.WALL, position: { x: 2, y: 0 }, strength: 999 },
    { type: TileType.WALL, position: { x: 4, y: 2 }, strength: 999 },
  ];

  return {
    name: 'The Path',
    width: 6,
    height: 4,
    tiles,
    playerStart: { x: 1, y: 1 },
    layers: 1,
  };
}

/**
 * Test level 3 - VR Showcase (multi-layer)
 */
function createTestLevel3VR(): LevelData {
  const tiles: TileData[] = [
    // Ground layer
    { type: TileType.NORMAL, position: { x: 2, y: 2 }, strength: 999 },
    { type: TileType.COLLAPSABLE, position: { x: 3, y: 2 }, strength: 1 },
    { type: TileType.COLLAPSABLE, position: { x: 4, y: 2 }, strength: 1 },

    // Note: Multi-layer support will be added later
  ];

  return {
    name: 'VR Showcase',
    width: 8,
    height: 8,
    tiles,
    playerStart: { x: 2, y: 2 },
    layers: 1, // Will expand to multi-layer
  };
}

/**
 * Level collection
 */
export const LEVELS_3D: LevelData[] = [
  createTestLevel1(),
  createTestLevel2(),
  createTestLevel3VR(),
];

/**
 * Get level by index
 */
export function getLevel3D(index: number): LevelData | null {
  if (index < 0 || index >= LEVELS_3D.length) {
    return null;
  }
  return LEVELS_3D[index];
}

/**
 * Get total number of levels
 */
export function getTotalLevels3D(): number {
  return LEVELS_3D.length;
}
