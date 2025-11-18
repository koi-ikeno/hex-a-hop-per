/**
 * HexTile - 3D hexagonal tile model
 */

import * as THREE from 'three';
import { TileType, Position, HexTile3D } from '../types/types';
import { HexGrid3D } from '../core/HexGrid3D';

/**
 * Tile color palette
 */
const TILE_COLORS: Record<number, number> = {
  [TileType.EMPTY]: 0x000000,
  [TileType.NORMAL]: 0x00ff88,       // Green
  [TileType.COLLAPSABLE]: 0x88ff00,   // Yellow-green
  [TileType.COLLAPSABLE2]: 0xffaa00,  // Orange
  [TileType.COLLAPSABLE3]: 0xff5500,  // Red-orange
  [TileType.WALL]: 0x444444,          // Dark gray
  [TileType.TRAMPOLINE]: 0xff00ff,    // Magenta
};

/**
 * Create a 3D hexagonal tile
 */
export class HexTile {
  /**
   * Create tile mesh
   * @param type - Tile type
   * @param gridPos - Grid position
   * @param layer - Vertical layer
   * @returns HexTile3D object
   */
  static create(type: TileType, gridPos: Position, layer: number = 0): HexTile3D {
    const worldPos = HexGrid3D.gridToWorld3D(gridPos.x, gridPos.y, layer);

    // Create hexagonal cylinder (6 segments)
    const geometry = new THREE.CylinderGeometry(
      HexGrid3D.HEX_SIZE,        // Top radius
      HexGrid3D.HEX_SIZE,        // Bottom radius
      HexGrid3D.HEX_HEIGHT,      // Height
      6,                         // Radial segments (hexagon)
      1                          // Height segments
    );

    // Rotate to align flat-top (Three.js cylinders are vertical by default)
    geometry.rotateY(Math.PI / 6);

    // Material based on tile type
    const color = TILE_COLORS[type] || 0x888888;
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.7,
      emissive: color,
      emissiveIntensity: 0.1,
    });

    // Special materials for different types
    if (type === TileType.WALL) {
      material.metalness = 0.8;
      material.roughness = 0.2;
      geometry.scale(1, 3, 1); // Taller walls
    } else if (type === TileType.TRAMPOLINE) {
      material.roughness = 0.3;
      material.emissiveIntensity = 0.3;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(worldPos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Determine if this is a "green" tile (must be stepped on)
    const isGreen = [
      TileType.NORMAL,
      TileType.COLLAPSABLE,
      TileType.COLLAPSABLE2,
      TileType.COLLAPSABLE3,
    ].includes(type);

    // Set strength based on type
    let strength = 1;
    if (type === TileType.COLLAPSABLE2) strength = 2;
    if (type === TileType.COLLAPSABLE3) strength = 3;
    if (type === TileType.WALL || type === TileType.NORMAL) strength = 999; // Permanent

    return {
      mesh,
      type,
      gridPos,
      strength,
      isGreen,
      isStepped: false,
    };
  }

  /**
   * Update tile appearance when stepped on
   * @param tile - Tile to update
   */
  static stepOn(tile: HexTile3D): void {
    tile.isStepped = true;

    // Reduce strength
    if (tile.strength < 999) {
      tile.strength--;
    }

    // Visual feedback
    const material = tile.mesh.material as THREE.MeshStandardMaterial;

    if (tile.strength === 0) {
      // Collapsed - dim and lower
      material.opacity = 0.3;
      material.transparent = true;
      material.emissiveIntensity = 0;
      tile.mesh.position.y -= HexGrid3D.HEX_HEIGHT * 0.5;
    } else if (tile.strength < 999) {
      // Partially damaged - change color
      material.emissiveIntensity = 0.2;
      const strengthRatio = tile.strength / 3;
      material.color.lerp(new THREE.Color(0xff0000), 1 - strengthRatio);
    }
  }

  /**
   * Highlight tile (for selection)
   * @param tile - Tile to highlight
   * @param highlight - True to highlight, false to unhighlight
   */
  static setHighlight(tile: HexTile3D, highlight: boolean): void {
    const material = tile.mesh.material as THREE.MeshStandardMaterial;

    if (highlight) {
      material.emissiveIntensity = 0.5;
    } else {
      material.emissiveIntensity = tile.isStepped ? 0 : 0.1;
    }
  }

  /**
   * Animate tile collapse
   * @param tile - Tile to collapse
   * @param scene - Scene to remove from
   * @param duration - Animation duration in ms
   */
  static async collapse(tile: HexTile3D, scene: THREE.Scene, duration: number = 1000): Promise<void> {
    const startY = tile.mesh.position.y;
    const endY = startY - 10;
    const startTime = Date.now();

    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: Cubic.In
        const eased = progress * progress * progress;

        tile.mesh.position.y = startY + (endY - startY) * eased;

        const material = tile.mesh.material as THREE.MeshStandardMaterial;
        material.opacity = 1 - progress;
        material.transparent = true;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          scene.remove(tile.mesh);
          tile.mesh.geometry.dispose();
          (tile.mesh.material as THREE.Material).dispose();
          resolve();
        }
      };

      animate();
    });
  }
}
