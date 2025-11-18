/**
 * Hex-a-Hop WebXR
 * Main entry point
 * Supports both desktop 3D and VR modes
 */

import * as THREE from 'three';
import { Scene3D } from './core/Scene3D';
import { HexGrid3D } from './core/HexGrid3D';
import { HexTile } from './models/HexTile';
import { getLevel3D } from './core/Level3D';
import { HexTile3D, Position, GameState } from './types/types';

console.log('Hex-a-Hop WebXR - Initializing...');

// Game state
let scene3D: Scene3D;
let tiles: HexTile3D[] = [];
let playerMesh: THREE.Mesh | null = null;
let playerPosition: Position = { x: 0, y: 0 };
let gameState: GameState = {
  currentLevel: 0,
  moves: 0,
  tilesRemaining: 0,
  totalTiles: 0,
  isComplete: false,
  isFailed: false,
};

let hoveredTile: HexTile3D | null = null;
let isLoaded = false;

/**
 * Initialize the game
 */
async function init() {
  console.log('Setting up scene...');

  // Hide loading screen
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');

  // Show UI panels
  const infoPanel = document.getElementById('info-panel');
  const controlsHelp = document.getElementById('controls-help');
  if (infoPanel) infoPanel.classList.remove('hidden');
  if (controlsHelp) controlsHelp.classList.remove('hidden');

  // Create 3D scene
  const app = document.getElementById('app');
  if (!app) {
    throw new Error('App container not found');
  }

  scene3D = new Scene3D(app);

  // Load first level
  loadLevel(0);

  // Setup input handlers
  setupInputHandlers();

  // Start animation loop
  scene3D.startAnimationLoop(animate);

  isLoaded = true;
  console.log('Hex-a-Hop WebXR ready!');
  console.log('Controls: Click tiles to move, drag to rotate camera, scroll to zoom');
}

/**
 * Load a level
 */
function loadLevel(levelIndex: number) {
  console.log(`Loading level ${levelIndex}...`);

  const levelData = getLevel3D(levelIndex);
  if (!levelData) {
    console.error('Level not found:', levelIndex);
    return;
  }

  // Clear existing tiles and player
  tiles.forEach(tile => scene3D.scene.remove(tile.mesh));
  tiles = [];
  if (playerMesh) {
    scene3D.scene.remove(playerMesh);
  }

  // Reset game state
  gameState = {
    currentLevel: levelIndex,
    moves: 0,
    tilesRemaining: 0,
    totalTiles: 0,
    isComplete: false,
    isFailed: false,
  };

  // Create tiles
  levelData.tiles.forEach(tileData => {
    const tile = HexTile.create(tileData.type, tileData.position, 0);
    tiles.push(tile);
    scene3D.scene.add(tile.mesh);

    if (tile.isGreen) {
      gameState.totalTiles++;
      gameState.tilesRemaining++;
    }
  });

  // Create player
  playerPosition = { ...levelData.playerStart };
  createPlayer();

  // Update camera to focus on level center - bird's eye view
  const centerX = levelData.width / 2;
  const centerY = levelData.height / 2;
  const centerPos = HexGrid3D.gridToWorld3D(centerX, centerY, 0);

  // Position camera directly above the level center
  scene3D.camera.position.set(centerPos.x, 25, centerPos.z + 8);
  scene3D.camera.lookAt(centerPos);

  // Update OrbitControls target to level center
  if (scene3D.orbitControls) {
    scene3D.orbitControls.target.copy(centerPos);
    scene3D.orbitControls.update();
  }

  updateUI();
  console.log(`Level loaded: ${levelData.name} (${tiles.length} tiles)`);
}

/**
 * Create player representation
 */
function createPlayer() {
  // Simple glowing sphere for player
  const geometry = new THREE.SphereGeometry(0.5, 16, 16);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 0.8,
    metalness: 0.5,
    roughness: 0.3,
  });

  playerMesh = new THREE.Mesh(geometry, material);

  const worldPos = HexGrid3D.gridToWorld3D(playerPosition.x, playerPosition.y, 0);
  playerMesh.position.set(worldPos.x, worldPos.y + 1, worldPos.z);

  scene3D.scene.add(playerMesh);
}

/**
 * Setup input handlers
 */
function setupInputHandlers() {
  const canvas = scene3D.renderer.domElement;

  // Mouse move - for hover effects
  canvas.addEventListener('mousemove', (event) => {
    scene3D.updateMousePosition(event.clientX, event.clientY);

    if (!isLoaded || gameState.isComplete || gameState.isFailed) return;

    // Raycast to tiles
    const tileMeshes = tiles.map(t => t.mesh);
    const intersection = scene3D.raycastFromMouse(tileMeshes);

    // Unhighlight previous
    if (hoveredTile) {
      HexTile.setHighlight(hoveredTile, false);
    }

    if (intersection) {
      const clickedMesh = intersection.object as THREE.Mesh;
      hoveredTile = tiles.find(t => t.mesh === clickedMesh) || null;

      if (hoveredTile) {
        HexTile.setHighlight(hoveredTile, true);
      }
    } else {
      hoveredTile = null;
    }
  });

  // Mouse click - move player
  canvas.addEventListener('click', (event) => {
    if (!isLoaded || gameState.isComplete || gameState.isFailed) return;

    scene3D.updateMousePosition(event.clientX, event.clientY);

    const tileMeshes = tiles.map(t => t.mesh);
    const intersection = scene3D.raycastFromMouse(tileMeshes);

    if (intersection) {
      const clickedMesh = intersection.object as THREE.Mesh;
      const clickedTile = tiles.find(t => t.mesh === clickedMesh);

      if (clickedTile) {
        handleTileClick(clickedTile);
      }
    }
  });

  // Keyboard
  window.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
      loadLevel(gameState.currentLevel); // Reset
    }
  });
}

/**
 * Handle tile click
 */
function handleTileClick(tile: HexTile3D) {
  // Check if tile is adjacent to player
  const neighbors = HexGrid3D.getAllNeighbors(playerPosition);
  const isAdjacent = neighbors.some(n => n.x === tile.gridPos.x && n.y === tile.gridPos.y);

  if (!isAdjacent) {
    console.log('Tile not adjacent to player');
    return;
  }

  // Check if can walk on tile
  if (tile.strength <= 0) {
    console.log('Tile collapsed - cannot walk');
    gameState.isFailed = true;
    updateUI();
    return;
  }

  // Move player
  playerPosition = { ...tile.gridPos };
  const worldPos = HexGrid3D.gridToWorld3D(playerPosition.x, playerPosition.y, 0);
  if (playerMesh) {
    playerMesh.position.set(worldPos.x, worldPos.y + 1, worldPos.z);
  }

  // Step on tile
  HexTile.stepOn(tile);
  gameState.moves++;

  if (tile.isGreen && !tile.isStepped) {
    gameState.tilesRemaining--;
  }

  // Check if player fell through
  if (tile.strength === 0) {
    console.log('Player fell through collapsed tile!');
    gameState.isFailed = true;
  }

  // Check win condition
  if (gameState.tilesRemaining === 0 && !gameState.isFailed) {
    gameState.isComplete = true;
    console.log('Level complete!');
  }

  updateUI();
}

/**
 * Update UI
 */
function updateUI() {
  const levelInfo = document.getElementById('level-info');
  const statsInfo = document.getElementById('stats-info');

  if (levelInfo) {
    const levelData = getLevel3D(gameState.currentLevel);
    levelInfo.textContent = `Level ${gameState.currentLevel + 1}: ${levelData?.name || 'Unknown'}`;
  }

  if (statsInfo) {
    statsInfo.textContent = `Moves: ${gameState.moves} | Tiles: ${gameState.tilesRemaining}/${gameState.totalTiles}`;
  }

  if (gameState.isComplete) {
    if (statsInfo) {
      statsInfo.textContent += ' | ✅ COMPLETE!';
      statsInfo.style.color = '#00ff88';
    }
  } else if (gameState.isFailed) {
    if (statsInfo) {
      statsInfo.textContent += ' | ❌ FAILED - Press R to restart';
      statsInfo.style.color = '#ff4444';
    }
  }
}

/**
 * Animation loop
 */
function animate() {
  // Update controls (orbit controls in desktop mode)
  scene3D.updateControls();

  // Render scene
  scene3D.render();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
