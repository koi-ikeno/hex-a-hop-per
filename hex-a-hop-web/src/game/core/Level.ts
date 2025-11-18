/**
 * Level - Manages the game level grid and state
 */

import { TileType, Position } from '../types/TileTypes';

export const MAP_SIZE = 100; // Based on hex_puzzzle.cpp

export interface TileData {
  type: TileType;
  strength: number; // How many times the tile can be stepped on before collapsing
  item: number; // Item on this tile (0 = none, 1 = anti-ice, 2 = jump)
  flags: number; // Bitfield for various states
}

export interface LevelData {
  name: string;
  width: number;
  height: number;
  playerStartX: number;
  playerStartY: number;
  tiles: TileData[][];
}

/**
 * Level class - manages tile grid and game state
 */
export class Level {
  public name: string;
  public width: number;
  public height: number;
  public playerStart: Position;
  public tiles: TileData[][];

  // Statistics
  public greenTilesRemaining: number = 0;
  public totalGreenTiles: number = 0;

  constructor(levelData: LevelData) {
    this.name = levelData.name;
    this.width = levelData.width;
    this.height = levelData.height;
    this.playerStart = {
      x: levelData.playerStartX,
      y: levelData.playerStartY,
    };

    // Deep copy tiles
    this.tiles = levelData.tiles.map(row =>
      row.map(tile => ({ ...tile }))
    );

    this.countGreenTiles();
  }

  /**
   * Count collapsable green tiles
   */
  private countGreenTiles(): void {
    this.totalGreenTiles = 0;
    this.greenTilesRemaining = 0;

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const tile = this.tiles[i][j];
        if (this.isGreenTile(tile.type) && tile.type !== TileType.EMPTY) {
          this.totalGreenTiles++;
          if (tile.strength > 0) {
            this.greenTilesRemaining++;
          }
        }
      }
    }
  }

  /**
   * Check if a tile type is a "green" collapsable tile
   */
  private isGreenTile(type: TileType): boolean {
    return (
      type === TileType.COLLAPSABLE ||
      type === TileType.COLLAPSABLE2 ||
      type === TileType.COLLAPSABLE3
    );
  }

  /**
   * Get tile at position
   */
  getTile(pos: Position): TileData | null {
    if (pos.x < 0 || pos.x >= this.height || pos.y < 0 || pos.y >= this.width) {
      return null;
    }
    return this.tiles[pos.x][pos.y];
  }

  /**
   * Check if a position is valid (within bounds)
   */
  isValid(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.height && pos.y >= 0 && pos.y < this.width;
  }

  /**
   * Check if a tile can be walked on
   */
  canWalkOn(pos: Position): boolean {
    const tile = this.getTile(pos);
    if (!tile) return false;

    // Empty tiles can't be walked on
    if (tile.type === TileType.EMPTY) return false;

    // Tiles with strength 0 or less can't be walked on
    if (tile.strength <= 0 && this.isGreenTile(tile.type)) return false;

    return true;
  }

  /**
   * Step on a tile (reduce strength for collapsable tiles)
   */
  stepOnTile(pos: Position): void {
    const tile = this.getTile(pos);
    if (!tile) return;

    // Collapsable tiles lose strength when stepped on
    if (this.isGreenTile(tile.type)) {
      if (tile.strength > 0) {
        tile.strength--;
        if (tile.strength === 0) {
          this.greenTilesRemaining--;
        }
      }
    }
  }

  /**
   * Check if level is complete (all green tiles collapsed)
   */
  isComplete(): boolean {
    return this.greenTilesRemaining === 0 && this.totalGreenTiles > 0;
  }

  /**
   * Reset level to initial state
   */
  reset(originalData: LevelData): void {
    this.tiles = originalData.tiles.map(row =>
      row.map(tile => ({ ...tile }))
    );
    this.countGreenTiles();
  }
}

/**
 * Level collection - multiple test levels
 */
export const LEVELS: LevelData[] = [];

/**
 * Create a simple hex pattern level (Tutorial)
 */
function createLevel1(): LevelData {
  const width = 15;
  const height = 15;
  const tiles: TileData[][] = createEmptyGrid(width, height);

  const patterns = [
    // Center cluster
    { x: 7, y: 7, type: TileType.NORMAL, strength: 1 },

    // Ring 1 - collapsable tiles
    { x: 8, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 6, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 6, type: TileType.COLLAPSABLE, strength: 1 },
  ];

  patterns.forEach(({ x, y, type, strength }) => {
    tiles[x][y] = { type, strength, item: 0, flags: 0 };
  });

  return {
    name: 'Level 1: First Steps',
    width,
    height,
    playerStartX: 7,
    playerStartY: 7,
    tiles,
  };
}

/**
 * Create a path-based level
 */
function createLevel2(): LevelData {
  const width = 15;
  const height = 15;
  const tiles: TileData[][] = createEmptyGrid(width, height);

  const patterns = [
    // Starting platform
    { x: 5, y: 5, type: TileType.NORMAL, strength: 1 },

    // Path with collapsable tiles
    { x: 6, y: 5, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 5, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 5, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 6, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 8, type: TileType.COLLAPSABLE, strength: 1 },

    // Ending platform
    { x: 9, y: 8, type: TileType.NORMAL, strength: 1 },

    // Some walls
    { x: 7, y: 6, type: TileType.WALL, strength: 1 },
  ];

  patterns.forEach(({ x, y, type, strength }) => {
    tiles[x][y] = { type, strength, item: 0, flags: 0 };
  });

  return {
    name: 'Level 2: The Path',
    width,
    height,
    playerStartX: 5,
    playerStartY: 5,
    tiles,
  };
}

/**
 * Create a more challenging level with 2-hit tiles
 */
function createLevel3(): LevelData {
  const width = 15;
  const height = 15;
  const tiles: TileData[][] = createEmptyGrid(width, height);

  const patterns = [
    // Center hub
    { x: 7, y: 7, type: TileType.NORMAL, strength: 1 },

    // Branch 1 (requires backtracking)
    { x: 8, y: 7, type: TileType.COLLAPSABLE2, strength: 2 },
    { x: 9, y: 7, type: TileType.COLLAPSABLE, strength: 1 },

    // Branch 2
    { x: 7, y: 8, type: TileType.COLLAPSABLE2, strength: 2 },
    { x: 7, y: 9, type: TileType.COLLAPSABLE, strength: 1 },

    // Branch 3
    { x: 6, y: 7, type: TileType.COLLAPSABLE2, strength: 2 },
    { x: 5, y: 7, type: TileType.COLLAPSABLE, strength: 1 },

    // Branch 4
    { x: 7, y: 6, type: TileType.COLLAPSABLE2, strength: 2 },
    { x: 7, y: 5, type: TileType.COLLAPSABLE, strength: 1 },

    // Branch 5
    { x: 8, y: 6, type: TileType.COLLAPSABLE2, strength: 2 },
    { x: 9, y: 5, type: TileType.COLLAPSABLE, strength: 1 },

    // Branch 6
    { x: 6, y: 8, type: TileType.COLLAPSABLE2, strength: 2 },
    { x: 5, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
  ];

  patterns.forEach(({ x, y, type, strength }) => {
    tiles[x][y] = { type, strength, item: 0, flags: 0 };
  });

  return {
    name: 'Level 3: Double Trouble',
    width,
    height,
    playerStartX: 7,
    playerStartY: 7,
    tiles,
  };
}

/**
 * Create a spiral level
 */
function createLevel4(): LevelData {
  const width = 15;
  const height = 15;
  const tiles: TileData[][] = createEmptyGrid(width, height);

  const patterns = [
    // Spiral pattern
    { x: 7, y: 7, type: TileType.NORMAL, strength: 1 },
    { x: 8, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 6, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 6, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 6, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 9, y: 6, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 9, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 9, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 9, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 5, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 5, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
  ];

  patterns.forEach(({ x, y, type, strength }) => {
    tiles[x][y] = { type, strength, item: 0, flags: 0 };
  });

  return {
    name: 'Level 4: Spiral',
    width,
    height,
    playerStartX: 7,
    playerStartY: 7,
    tiles,
  };
}

/**
 * Create a maze-like level with walls
 */
function createLevel5(): LevelData {
  const width = 15;
  const height = 15;
  const tiles: TileData[][] = createEmptyGrid(width, height);

  const patterns = [
    // Start
    { x: 5, y: 5, type: TileType.NORMAL, strength: 1 },

    // Maze path
    { x: 6, y: 5, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 5, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 6, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 9, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 9, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 9, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 8, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 6, y: 7, type: TileType.COLLAPSABLE, strength: 1 },

    // End
    { x: 6, y: 6, type: TileType.NORMAL, strength: 1 },

    // Walls to create maze
    { x: 8, y: 5, type: TileType.WALL, strength: 1 },
    { x: 8, y: 6, type: TileType.WALL, strength: 1 },
    { x: 8, y: 8, type: TileType.WALL, strength: 1 },
    { x: 7, y: 8, type: TileType.WALL, strength: 1 },
    { x: 10, y: 7, type: TileType.WALL, strength: 1 },
    { x: 10, y: 8, type: TileType.WALL, strength: 1 },
  ];

  patterns.forEach(({ x, y, type, strength }) => {
    tiles[x][y] = { type, strength, item: 0, flags: 0 };
  });

  return {
    name: 'Level 5: Maze Runner',
    width,
    height,
    playerStartX: 5,
    playerStartY: 5,
    tiles,
  };
}

/**
 * Helper: Create empty grid
 */
function createEmptyGrid(width: number, height: number): TileData[][] {
  const tiles: TileData[][] = [];
  for (let i = 0; i < height; i++) {
    tiles[i] = [];
    for (let j = 0; j < width; j++) {
      tiles[i][j] = {
        type: TileType.EMPTY,
        strength: 0,
        item: 0,
        flags: 0,
      };
    }
  }
  return tiles;
}

// Initialize level collection
LEVELS.push(createLevel1());
LEVELS.push(createLevel2());
LEVELS.push(createLevel3());
LEVELS.push(createLevel4());
LEVELS.push(createLevel5());

/**
 * Get level by index
 */
export function getLevel(index: number): LevelData | null {
  if (index < 0 || index >= LEVELS.length) {
    return null;
  }
  return LEVELS[index];
}

/**
 * Get total number of levels
 */
export function getTotalLevels(): number {
  return LEVELS.length;
}

/**
 * Legacy function for backward compatibility
 */
export function createTestLevel(): LevelData {
  return LEVELS[0];
}
