# Hex-a-Hop WebXR

3D/VR version of Hex-a-Hop puzzle game using Three.js and WebXR API.

## Features

✅ **Bird's Eye View**: Strategic top-down perspective for puzzle solving
✅ **Desktop 3D Mode**: Play in browser with mouse/keyboard
✅ **VR Mode**: Immersive overhead VR experience with WebXR
✅ **3D Hexagonal Grid**: Beautiful 3D hex tiles
✅ **Dual-Mode Support**: Seamless switching between desktop and VR
✅ **Three.js Powered**: Modern WebGL graphics
✅ **Progressive Enhancement**: Works without VR hardware

## Controls

### Desktop Mode (Bird's Eye View)
- **Mouse Drag**: Rotate camera around game board
- **Right Click + Drag**: Pan camera to move view
- **Mouse Scroll**: Zoom in/out
- **Left Click**: Select tile to move player
- **R Key**: Reset level

### VR Mode (Overhead View)
- **Position**: You'll be positioned high above the game board
- **VR Controllers**: Point at tiles to select (planned)
- **Trigger**: Confirm move (planned)
- **Natural Position**: Look down at the puzzle like a tabletop game

## Quick Start

```bash
# Install dependencies
npm install

# Development server (desktop mode)
npm run dev

# Development with HTTPS (required for WebXR)
npm run dev:https

# Production build
npm run build
```

## Project Structure

```
hex-a-hop-webxr/
├── src/
│   ├── main.ts              # Entry point
│   ├── core/
│   │   ├── Scene3D.ts       # Scene manager (desktop + VR)
│   │   ├── HexGrid3D.ts     # 3D hex grid system
│   │   └── Level3D.ts       # Level data
│   ├── models/
│   │   └── HexTile.ts       # 3D tile models
│   ├── types/
│   │   └── types.ts         # TypeScript types
│   └── utils/               # Utilities (planned)
├── index.html
├── package.json
└── README.md
```

## Technology Stack

- **Three.js**: 3D graphics engine
- **WebXR Device API**: VR/AR support
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **Cannon.js**: Physics (planned)

## Browser Support

### Desktop 3D Mode
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari

### VR Mode (WebXR)
- ✅ Meta Quest Browser
- ✅ Chrome/Edge (with VR headset)
- ✅ Firefox Reality

## Development Status

**Phase 1: Prototype** ✅ COMPLETE
- [x] Project setup
- [x] Three.js scene with desktop controls
- [x] 3D hexagonal grid system
- [x] Basic tile 3D models
- [x] Desktop raycasting and selection
- [x] WebXR VR button integration
- [x] 3 test levels

**Phase 2: Game Logic** (Next)
- [ ] Player movement animation
- [ ] Tile collapse animations
- [ ] Win/lose conditions
- [ ] All tile types
- [ ] Sound effects

**Phase 3: VR UX** (Planned)
- [ ] VR controller raycasting
- [ ] Hand tracking support
- [ ] Spatial audio
- [ ] VR comfort features

**Phase 4: Advanced** (Future)
- [ ] Multi-layer volumetric levels
- [ ] Physics simulation
- [ ] Multiplayer support

## Testing

### Desktop Browser
1. Run `npm run dev`
2. Open http://localhost:3001
3. Use mouse to rotate, click tiles to move

### VR Testing
1. Run `npm run dev:https` (HTTPS required)
2. Access from VR browser (e.g., Meta Quest)
3. Click "ENTER VR" button
4. Use controllers to point and select tiles

### Debug Tools
- Chrome DevTools for desktop
- Quest Developer Hub for VR debugging
- WebXR Emulator Extension (Chrome)

## Performance

- **Target**: 60 FPS (desktop), 72-90 FPS (VR)
- **Optimization**: LOD, instancing, culling (planned)
- **Tested on**: Quest 2, Quest 3, Desktop Chrome

## Differences from 2D Version

| Feature | 2D Web | WebXR |
|---------|--------|-------|
| Graphics | Canvas2D | WebGL/Three.js |
| View | Fixed 2D | Free 3D camera |
| Input | Keyboard/Touch | Mouse/VR Controllers |
| Levels | Flat only | Flat + Volumetric |
| Immersion | Low | High (VR) |

## License

Same as parent Hex-a-Hop project (GPL-3.0)

## Links

- [Three.js Docs](https://threejs.org/docs/)
- [WebXR Spec](https://www.w3.org/TR/webxr/)
- [Parent Project](../hex-a-hop-web/)
- [Planning Doc](../plan_webxr.md)
