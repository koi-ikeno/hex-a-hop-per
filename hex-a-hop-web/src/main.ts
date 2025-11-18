import './style.css';
import { Renderer } from './game/graphics/Renderer';
import { GameLoop } from './game/core/GameLoop';
import { HexGrid, SCREEN_W, SCREEN_H, GFX_SIZE, TILE_H1 } from './game/core/HexGrid';
import { Level, createTestLevel } from './game/core/Level';
import { Player } from './game/core/Player';
import { InputHandler } from './game/core/InputHandler';
import { Direction } from './game/types/TileTypes';

/**
 * Hex-a-Hop Web Edition
 * Main entry point - Phase 3
 */

console.log('Hex-a-Hop Web - Initializing Phase 3...');

// Get canvas element
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

// Set canvas size to match game resolution
canvas.width = SCREEN_W;
canvas.height = SCREEN_H;

// Create renderer
const renderer = new Renderer(canvas);

// Game state
let isLoaded = false;
let level: Level;
let levelData = createTestLevel();
let player: Player;
let inputHandler: InputHandler;
let gameWon = false;
let gameLost = false;
let moves = 0;

/**
 * Initialize game - load assets
 */
async function init() {
  console.log('Loading assets...');

  try {
    // Load tile sprite sheets
    await renderer.loadTexture('tiles', '/assets/images/tiles.png');
    await renderer.loadTexture('tiles_reflect', '/assets/images/tiles_reflect.png');
    await renderer.loadTexture('title', '/assets/images/title.png');

    await renderer.waitForTextures();

    console.log('Assets loaded successfully!');

    // Create level and player
    level = new Level(levelData);
    player = new Player(level.playerStart);

    // Setup input handling
    inputHandler = new InputHandler();
    inputHandler.setMoveCallback(handleMove);
    inputHandler.setUndoCallback(handleUndo);
    inputHandler.setResetCallback(handleReset);

    // Center camera on player
    updateCamera();

    isLoaded = true;
  } catch (error) {
    console.error('Failed to load assets:', error);
  }
}

/**
 * Handle player movement
 */
function handleMove(direction: Direction): void {
  if (gameWon || gameLost) return;

  const moved = player.move(direction, level);
  if (moved) {
    moves++;

    // Check win condition
    if (level.isComplete()) {
      gameWon = true;
      console.log(`Victory! Completed in ${moves} moves!`);
    }

    // Check death
    if (player.isDead(level)) {
      gameLost = true;
      console.log('Game over - fell through!');
    }

    updateCamera();
  }
}

/**
 * Handle undo
 */
function handleUndo(): void {
  if (gameWon || gameLost) return;

  // For now, just reset the level instead of proper undo
  // (Proper undo would require storing full game state history)
  handleReset();
}

/**
 * Handle reset
 */
function handleReset(): void {
  level.reset(levelData);
  player.reset(level.playerStart);
  gameWon = false;
  gameLost = false;
  moves = 0;
  updateCamera();
  console.log('Level reset');
}

/**
 * Update camera to follow player
 */
function updateCamera(): void {
  const playerScreen = player.getScreenPosition();
  renderer.setScroll(
    playerScreen.x - SCREEN_W / 2,
    playerScreen.y - SCREEN_H / 2
  );
}

/**
 * Update game state
 */
function update(deltaTime: number) {
  // Game logic updates here
  // For now, everything is event-driven from input
}

/**
 * Render the game
 */
function render() {
  // Clear screen
  renderer.clear('#1a1a2e');

  if (!isLoaded) {
    // Show loading message
    renderer.drawText(
      'Loading assets...',
      SCREEN_W / 2,
      SCREEN_H / 2,
      'bold 24px Arial',
      '#ffffff',
      'center'
    );
    return;
  }

  // Render level tiles
  for (let i = 0; i < level.height; i++) {
    for (let j = 0; j < level.width; j++) {
      const tile = level.tiles[i][j];
      if (tile.type === 0) continue; // Skip empty tiles

      const screenX = HexGrid.gridToScreenX(i, j);
      const screenY = HexGrid.gridToScreenY(i, j);
      const spriteRect = HexGrid.getTileSpriteRect(tile.type);

      // Dim tiles that have collapsed
      const ctx = renderer.getContext();
      if (tile.strength <= 0 && tile.type >= 2 && tile.type <= 4) {
        ctx.globalAlpha = 0.3;
      }

      renderer.renderTile(false, tile.type, screenX, screenY, spriteRect);

      ctx.globalAlpha = 1.0;
    }
  }

  // Render player (using a simple colored hex for now)
  const playerScreen = player.getScreenPosition();
  const ctx = renderer.getContext();

  // Draw player as a bright hex
  ctx.fillStyle = gameLost ? '#ff0000' : gameWon ? '#00ff00' : '#ffff00';
  ctx.beginPath();
  const px = playerScreen.x - renderer.scrollX;
  const py = playerScreen.y - renderer.scrollY;

  // Simple hexagon
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = px + Math.cos(angle) * 12;
    const y = py + Math.sin(angle) * 12;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Draw UI overlay
  renderer.drawText(
    'Hex-a-Hop Web - Phase 3',
    10,
    20,
    'bold 20px Arial',
    '#00ff88',
    'left'
  );

  renderer.drawText(
    level.name,
    10,
    45,
    '16px Arial',
    '#ffffff',
    'left'
  );

  renderer.drawText(
    `Moves: ${moves} | Green tiles: ${level.greenTilesRemaining}/${level.totalGreenTiles}`,
    10,
    70,
    '16px Arial',
    '#ffffff',
    'left'
  );

  // Game status
  if (gameWon) {
    renderer.drawText(
      `VICTORY! Completed in ${moves} moves!`,
      SCREEN_W / 2,
      SCREEN_H / 2,
      'bold 32px Arial',
      '#00ff00',
      'center'
    );
    renderer.drawText(
      'Press R to restart',
      SCREEN_W / 2,
      SCREEN_H / 2 + 40,
      '20px Arial',
      '#ffffff',
      'center'
    );
  } else if (gameLost) {
    renderer.drawText(
      'GAME OVER',
      SCREEN_W / 2,
      SCREEN_H / 2,
      'bold 32px Arial',
      '#ff0000',
      'center'
    );
    renderer.drawText(
      'Press R to restart',
      SCREEN_W / 2,
      SCREEN_H / 2 + 40,
      '20px Arial',
      '#ffffff',
      'center'
    );
  }

  // Instructions
  renderer.drawText(
    'Controls: QWEASDZXC or Arrow Keys | R: Reset | U: Undo',
    SCREEN_W / 2,
    SCREEN_H - 10,
    '14px Arial',
    '#888888',
    'center'
  );
}

// Create game loop
const gameLoop = new GameLoop(update, render);

// Start initialization and game loop
init().then(() => {
  console.log('Starting game loop...');
  gameLoop.start();
  console.log('Hex-a-Hop Web - Phase 3 Ready!');
  console.log('Level:', level.name);
  console.log('Objective: Step on all green tiles to win!');
});
