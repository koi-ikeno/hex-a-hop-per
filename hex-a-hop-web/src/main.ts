import './style.css';
import { Renderer } from './game/graphics/Renderer';
import { GameLoop } from './game/core/GameLoop';
import { HexGrid, SCREEN_W, SCREEN_H } from './game/core/HexGrid';
import { Level, getLevel, getTotalLevels, LevelData } from './game/core/Level';
import { Player } from './game/core/Player';
import { InputHandler } from './game/core/InputHandler';
import { SoundManager } from './game/audio/SoundManager';
import { TouchControls } from './game/ui/TouchControls';
import { GameUI } from './game/ui/GameUI';
import { ProgressManager } from './game/core/ProgressManager';
import { LevelSelector } from './game/ui/LevelSelector';
import { Direction } from './game/types/TileTypes';
import { PerformanceMonitor } from './game/utils/PerformanceMonitor';

/**
 * Hex-a-Hop Web Edition
 * Main entry point - Phase 6: Performance Optimization
 */

console.log('Hex-a-Hop Web - Initializing Phase 6 (Performance)...');

// Get canvas element
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

// Set canvas size to match game resolution
canvas.width = SCREEN_W;
canvas.height = SCREEN_H;

// Create systems
const renderer = new Renderer(canvas);
const soundManager = new SoundManager();
const gameUI = new GameUI();
const touchControls = new TouchControls(canvas);
const progressManager = new ProgressManager();
const levelSelector = new LevelSelector(canvas, progressManager);
const perfMonitor = new PerformanceMonitor();

// Game state
let isLoaded = false;
let level: Level;
let levelData: LevelData | null = null;
let player: Player;
let inputHandler: InputHandler;
let gameWon = false;
let gameLost = false;
let moves = 0;
let startTime = 0;
let soundsLoaded = false;
let currentLevelIndex = 0;
let showPerformanceOverlay = false; // Toggle with 'P' key

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

    // Load sounds
    // Phase 6: Preload essential sounds, lazy load others for faster startup
    console.log('Loading essential sounds...');
    await soundManager.loadSound('collapse', '/assets/audio/sound-collapse.ogg', false);
    await soundManager.loadSound('death', '/assets/audio/sound-death.ogg', false);
    await soundManager.loadSound('win', '/assets/audio/sound-win.ogg', false);

    // Register less-frequently used sounds for lazy loading
    await soundManager.loadSound('trampoline', '/assets/audio/sound-trampoline.ogg', true);

    await soundManager.waitForSounds();
    soundsLoaded = true;
    console.log(`Sounds loaded: ${soundManager.getLoadedCount()}/${soundManager.getRegisteredCount()}`);

    // Apply saved sound setting
    soundManager.setSoundEnabled(progressManager.isSoundEnabled());

    console.log('Assets loaded successfully!');

    // Setup input handling
    inputHandler = new InputHandler();
    inputHandler.setMoveCallback(handleMove);
    inputHandler.setUndoCallback(handleUndo);
    inputHandler.setResetCallback(handleReset);

    // Setup touch controls
    touchControls.setMoveCallback(handleMove);
    touchControls.setUndoCallback(handleUndo);
    touchControls.setResetCallback(handleReset);

    // Setup level selector
    levelSelector.setSelectCallback(loadLevel);

    // Setup keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        levelSelector.toggle();
      } else if (e.key === 'l' || e.key === 'L') {
        levelSelector.show();
      } else if (e.key === 'n' || e.key === 'N') {
        // Next level
        if (gameWon && currentLevelIndex < getTotalLevels() - 1) {
          loadLevel(currentLevelIndex + 1);
        }
      } else if (e.key === 'p' || e.key === 'P') {
        // Toggle performance overlay
        showPerformanceOverlay = !showPerformanceOverlay;
        console.log('Performance overlay:', showPerformanceOverlay ? 'ON' : 'OFF');
      }
    });

    // Enable audio context on first user interaction
    canvas.addEventListener('click', () => {
      soundManager.resumeContext();
    }, { once: true });

    isLoaded = true;

    // Load the last played level or first level
    const startLevel = progressManager.getCurrentLevel();
    loadLevel(Math.min(startLevel, getTotalLevels() - 1));

    // Show level selector initially
    levelSelector.show();
  } catch (error) {
    console.error('Failed to load assets:', error);
  }
}

/**
 * Load a level
 */
function loadLevel(levelIndex: number): void {
  levelData = getLevel(levelIndex);
  if (!levelData) {
    console.error('Level not found:', levelIndex);
    return;
  }

  currentLevelIndex = levelIndex;
  level = new Level(levelData);
  player = new Player(level.playerStart);
  gameWon = false;
  gameLost = false;
  moves = 0;
  startTime = Date.now();

  // Hide level selector
  levelSelector.hide();

  // Initialize level cache (large enough for entire level)
  const cacheWidth = level.width * 100 + 200;
  const cacheHeight = level.height * 100 + 200;
  renderer.initLevelCache(cacheWidth, cacheHeight);
  renderer.invalidateLevelCache();

  // Update camera
  updateCamera();

  // Record attempt
  progressManager.recordAttempt(levelIndex);

  console.log(`Level ${levelIndex + 1} loaded:`, level.name);
}

/**
 * Handle player movement
 */
function handleMove(direction: Direction): void {
  if (gameWon || gameLost || !levelData) return;
  if (levelSelector.isVisible()) return;

  const moved = player.move(direction, level);
  if (moved) {
    moves++;

    // Invalidate level cache (tiles changed)
    renderer.invalidateLevelCache();

    // Play step sound
    if (soundsLoaded && soundManager.isSoundEnabled()) {
      soundManager.playSound('collapse', 0.3);
    }

    // Check win condition
    if (level.isComplete()) {
      gameWon = true;
      const time = Math.floor((Date.now() - startTime) / 1000);

      // Save progress
      progressManager.completeLevel(
        currentLevelIndex,
        moves,
        time,
        level.totalGreenTiles
      );

      if (soundsLoaded && soundManager.isSoundEnabled()) {
        soundManager.playSound('win');
      }

      const levelProgress = progressManager.getLevelProgress(currentLevelIndex);
      console.log(`Victory! Completed in ${moves} moves, ${time}s`);
      console.log(`Stars: ${levelProgress?.stars || 0}`);
    }

    // Check death
    if (player.isDead(level)) {
      gameLost = true;
      if (soundsLoaded && soundManager.isSoundEnabled()) {
        soundManager.playSound('death');
      }
      console.log('Game over - fell through!');
    }

    updateCamera();
  }
}

/**
 * Handle undo
 */
function handleUndo(): void {
  if (gameWon || gameLost || !levelData) return;
  if (levelSelector.isVisible()) return;

  // For now, just reset the level instead of proper undo
  handleReset();
}

/**
 * Handle reset
 */
function handleReset(): void {
  if (!levelData) return;
  if (levelSelector.isVisible()) return;

  level.reset(levelData);
  player.reset(level.playerStart);
  gameWon = false;
  gameLost = false;
  moves = 0;
  startTime = Date.now();
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
function update(_deltaTime: number) {
  // Game logic updates here
  // For now, everything is event-driven from input
}

/**
 * Render level tiles to offscreen cache
 * Phase 6: Performance optimization
 */
function renderLevelToCache(): void {
  const cacheCtx = renderer.getLevelCacheContext();
  if (!cacheCtx || !level) return;

  // Clear cache
  cacheCtx.fillStyle = '#1a1a2e';
  cacheCtx.fillRect(0, 0, cacheCtx.canvas.width, cacheCtx.canvas.height);

  // Render all tiles to cache
  for (let i = 0; i < level.height; i++) {
    for (let j = 0; j < level.width; j++) {
      const tile = level.tiles[i][j];
      if (tile.type === 0) continue; // Skip empty tiles

      const screenX = HexGrid.gridToScreenX(i, j);
      const screenY = HexGrid.gridToScreenY(i, j);
      const spriteRect = HexGrid.getTileSpriteRect(tile.type);

      // Get texture
      const textureName = 'tiles';
      const texture = renderer.getTexture(textureName);
      if (!texture) continue;

      // Calculate position in cache (no scroll offset)
      const dx = screenX - 64 / 2;
      const dy = screenY - 64 + 18;

      // Dim tiles that have collapsed
      if (tile.strength <= 0 && tile.type >= 2 && tile.type <= 4) {
        cacheCtx.globalAlpha = 0.3;
      }

      cacheCtx.drawImage(
        texture,
        spriteRect.x,
        spriteRect.y,
        spriteRect.w,
        spriteRect.h,
        dx,
        dy,
        spriteRect.w,
        spriteRect.h
      );

      cacheCtx.globalAlpha = 1.0;
    }
  }
}

/**
 * Render the game
 * Phase 6: Optimized rendering with offscreen cache
 */
function render() {
  // Update performance metrics
  perfMonitor.update();

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

  const ctx = renderer.getContext();

  // Render level selector if visible
  if (levelSelector.isVisible()) {
    levelSelector.render(ctx);

    // Performance overlay even on level selector
    if (showPerformanceOverlay) {
      perfMonitor.renderOverlay(ctx, 10, 10);
    }
    return;
  }

  // Render level (if loaded)
  if (level) {
    // Update level cache if dirty
    if (renderer.isLevelCacheDirty()) {
      renderLevelToCache();
    }

    // Render cached level (with scroll offset)
    renderer.renderLevelCache(-renderer.scrollX, -renderer.scrollY);

    // Render player (dynamic element)
    const playerScreen = player.getScreenPosition();

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
  }

  // Render UI
  if (level) {
    gameUI.renderStats(ctx, {
      levelName: `${currentLevelIndex + 1}/${getTotalLevels()}: ${level.name}`,
      moves,
      tilesRemaining: level.greenTilesRemaining,
      totalTiles: level.totalGreenTiles,
    });

    // Show stars on victory
    if (gameWon) {
      const levelProgress = progressManager.getLevelProgress(currentLevelIndex);
      gameUI.renderVictory(ctx, moves);

      // Show stars
      if (levelProgress) {
        ctx.fillStyle = '#ffdd00';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        const stars = '★'.repeat(levelProgress.stars);
        ctx.fillText(stars, SCREEN_W / 2, SCREEN_H / 2 + 60);
      }

      // Next level prompt
      if (currentLevelIndex < getTotalLevels() - 1) {
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '16px Arial';
        ctx.fillText(
          'Press N for next level | L for level select',
          SCREEN_W / 2,
          SCREEN_H / 2 + 100
        );
      }
    } else if (gameLost) {
      gameUI.renderGameOver(ctx);
    }

    // Render controls help
    gameUI.renderControls(ctx, SCREEN_H - 30, touchControls.isEnabled());

    // Additional help
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('L: Level Select | ESC: Menu | P: Performance', SCREEN_W / 2, SCREEN_H - 10);
  }

  // Render touch controls
  if (!levelSelector.isVisible()) {
    touchControls.render(ctx);
  }

  // Performance overlay (Phase 6)
  if (showPerformanceOverlay) {
    perfMonitor.renderOverlay(ctx, 10, 10);
  }
}

// Create game loop
const gameLoop = new GameLoop(update, render);

// Start initialization and game loop
init().then(() => {
  console.log('Starting game loop...');
  gameLoop.start();
  console.log('Hex-a-Hop Web - Phase 6 Ready! (Performance Optimized)');
  console.log(`Total levels: ${getTotalLevels()}`);
  console.log('Sound:', soundsLoaded ? 'enabled' : 'disabled');
  console.log('Touch controls:', touchControls.isEnabled() ? 'enabled' : 'disabled');
  console.log('Progress:', progressManager.getCompletionPercentage(getTotalLevels()) + '%');
  console.log('Performance: Press P to toggle FPS overlay');
  console.log('Optimizations: Offscreen canvas caching enabled');
});
