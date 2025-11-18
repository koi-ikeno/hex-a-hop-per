import './style.css';
import { Renderer } from './game/graphics/Renderer';
import { GameLoop } from './game/core/GameLoop';
import { HexGrid, SCREEN_W, SCREEN_H } from './game/core/HexGrid';
import { TileType } from './game/types/TileTypes';

/**
 * Hex-a-Hop Web Edition
 * Main entry point - Phase 2
 */

console.log('Hex-a-Hop Web - Initializing Phase 2...');

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
let testTiles: Array<{ type: TileType; gridX: number; gridY: number }> = [];

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

    // Create test tiles in a hex pattern
    testTiles = [
      // Center tile
      { type: TileType.NORMAL, gridX: 5, gridY: 5 },

      // Ring around center (6 directions)
      { type: TileType.COLLAPSABLE, gridX: 6, gridY: 5 },
      { type: TileType.TRAMPOLINE, gridX: 5, gridY: 6 },
      { type: TileType.WALL, gridX: 4, gridY: 6 },
      { type: TileType.SPINNER, gridX: 4, gridY: 5 },
      { type: TileType.BUILDER, gridX: 5, gridY: 4 },
      { type: TileType.LIFT_UP, gridX: 6, gridY: 4 },

      // Outer ring
      { type: TileType.FLOATING_BALL, gridX: 7, gridY: 5 },
      { type: TileType.GUN, gridX: 6, gridY: 7 },
      { type: TileType.TRAP, gridX: 3, gridY: 7 },
      { type: TileType.SWITCH, gridX: 3, gridY: 5 },
      { type: TileType.COLLAPSE_DOOR, gridX: 5, gridY: 3 },
      { type: TileType.COLLAPSABLE2, gridX: 7, gridY: 3 },
    ];

    // Center the camera on the test pattern
    const centerX = HexGrid.gridToScreenX(5, 5);
    const centerY = HexGrid.gridToScreenY(5, 5);
    renderer.setScroll(centerX - SCREEN_W / 2, centerY - SCREEN_H / 2);

    isLoaded = true;
  } catch (error) {
    console.error('Failed to load assets:', error);
  }
}

/**
 * Update game state
 */
function update(deltaTime: number) {
  // Game logic will go here in Phase 3
  // For now, just a placeholder
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

  // Render test tiles
  for (const tile of testTiles) {
    const screenX = HexGrid.gridToScreenX(tile.gridX, tile.gridY);
    const screenY = HexGrid.gridToScreenY(tile.gridX, tile.gridY);
    const spriteRect = HexGrid.getTileSpriteRect(tile.type);

    renderer.renderTile(false, tile.type, screenX, screenY, spriteRect);
  }

  // Draw UI overlay
  renderer.drawText(
    'Hex-a-Hop Web - Phase 2',
    10,
    20,
    'bold 20px Arial',
    '#00ff88',
    'left'
  );

  renderer.drawText(
    'Rendering System Active',
    10,
    45,
    '16px Arial',
    '#ffffff',
    'left'
  );

  renderer.drawText(
    `Tiles: ${testTiles.length} | Canvas: ${SCREEN_W}x${SCREEN_H}`,
    10,
    SCREEN_H - 10,
    '14px Arial',
    '#888888',
    'left'
  );

  // Instructions
  renderer.drawText(
    'Phase 2 Complete - Hex grid rendering works!',
    SCREEN_W / 2,
    SCREEN_H - 30,
    '16px Arial',
    '#00ff88',
    'center'
  );
}

// Create game loop
const gameLoop = new GameLoop(update, render);

// Start initialization and game loop
init().then(() => {
  console.log('Starting game loop...');
  gameLoop.start();
  console.log('Hex-a-Hop Web - Phase 2 Ready!');
});
