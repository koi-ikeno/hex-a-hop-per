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
 * Create a simple test level
 */
export function createTestLevel(): LevelData {
  const width = 15;
  const height = 15;

  // Initialize empty grid
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

  // Create a simple hex pattern level
  // Center area with collapsable tiles
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

    // Ring 2 - mix of tiles
    { x: 9, y: 7, type: TileType.NORMAL, strength: 1 },
    { x: 8, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 5, y: 9, type: TileType.NORMAL, strength: 1 },
    { x: 5, y: 7, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 7, y: 5, type: TileType.NORMAL, strength: 1 },
    { x: 9, y: 5, type: TileType.COLLAPSABLE, strength: 1 },

    // Some walls
    { x: 10, y: 7, type: TileType.WALL, strength: 1 },
    { x: 4, y: 7, type: TileType.WALL, strength: 1 },

    // Path to victory
    { x: 9, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 10, y: 8, type: TileType.COLLAPSABLE, strength: 1 },
    { x: 10, y: 9, type: TileType.COLLAPSABLE, strength: 1 },
  ];

  patterns.forEach(({ x, y, type, strength }) => {
    tiles[x][y] = { type, strength, item: 0, flags: 0 };
  });

  return {
    name: 'Test Level - Hex Pattern',
    width,
    height,
    playerStartX: 7,
    playerStartY: 7,
    tiles,
  };
}
