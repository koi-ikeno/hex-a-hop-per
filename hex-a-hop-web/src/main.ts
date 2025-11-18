import './style.css';

/**
 * Hex-a-Hop Web Edition
 * Main entry point
 */

console.log('Hex-a-Hop Web - Initializing...');

// Get canvas element
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Could not get 2D context');
}

// Set canvas size (will be adjusted based on game requirements)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Test rendering - draw a simple grid to verify setup
function drawTestPattern() {
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw grid
  ctx.strokeStyle = '#16213e';
  ctx.lineWidth = 1;

  const gridSize = 40;
  for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }

  for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Draw title text
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Hex-a-Hop Web', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.fillText('Phase 1: Project Setup Complete', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

  ctx.font = '16px Arial';
  ctx.fillStyle = '#888888';
  ctx.fillText('Canvas 2D Rendering Active', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
}

// Initial render
drawTestPattern();

// Basic game loop (placeholder for now)
let lastTime = 0;
function gameLoop(currentTime: number) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // For now, just keep the test pattern visible
  // In Phase 2, this will be replaced with actual game rendering

  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

console.log('Hex-a-Hop Web - Ready!');
console.log(`Canvas size: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);
