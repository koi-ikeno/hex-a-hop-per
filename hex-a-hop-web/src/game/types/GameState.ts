/**
 * Game State - Ported from state.h
 * Manages the overall game state
 */

import { Position } from './TileTypes';

export interface GameState {
  // Current level info
  currentLevel: number;
  levelName: string;

  // Player state
  playerPosition: Position;

  // Game progress
  score: number;
  moves: number;
  flags: number;  // Flags collected

  // Game status
  isWon: boolean;
  isLost: boolean;
  isPaused: boolean;

  // History for undo
  moveHistory: GameStateSnapshot[];
}

export interface GameStateSnapshot {
  playerPosition: Position;
  moves: number;
  // Will add more fields as we port the game logic
}

export interface LevelData {
  name: string;
  width: number;
  height: number;
  playerStart: Position;
  // Tile data will be added in Phase 3
}

export enum GameMode {
  TITLE,
  LEVEL_SELECT,
  PLAYING,
  PAUSED,
  WON,
  LOST,
}
