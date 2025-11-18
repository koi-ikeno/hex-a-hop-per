# Hex-a-Hop Web Edition

A web browser port of the Hex-a-Hop puzzle game, built with pure TypeScript and Canvas 2D.

## Project Overview

This is a TypeScript port of the Android version of Hex-a-Hop, migrating from C++/Java to modern web technologies.

### Original Project
- **Source**: Android port of hex-a-hop
- **License**: GPL
- **Original Technologies**: C++, SDL2, Java (Android)

### Web Port Technologies
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas 2D
- **Build Tool**: Vite
- **Target**: Modern web browsers

## Project Structure

```
hex-a-hop-web/
├── src/
│   ├── main.ts              # Entry point
│   ├── style.css            # Global styles
│   └── game/
│       ├── core/            # Game logic
│       │   └── GameLoop.ts
│       ├── graphics/        # Rendering
│       │   └── Renderer.ts
│       ├── audio/           # Sound management (Phase 4)
│       ├── ui/              # UI components (Phase 4)
│       └── types/           # TypeScript definitions
│           ├── TileTypes.ts
│           └── GameState.ts
├── public/
│   └── assets/
│       ├── images/          # PNG textures
│       ├── audio/           # OGG sound effects
│       ├── fonts/           # TTF fonts
│       └── levels/          # Level data (Phase 3)
└── index.html
```

## Development Status

### Phase 1: Project Setup ✅
- [x] Vite project initialization
- [x] Directory structure
- [x] Asset migration
- [x] Basic TypeScript configuration
- [x] Canvas setup with test pattern

### Phase 2: Rendering Foundation ✅ (Current)
- [x] Type definitions from C++ headers (TileTypes, constants)
- [x] Renderer class with sprite sheet support
- [x] Game loop with fixed timestep
- [x] Texture loading system
- [x] Hex grid coordinate system
- [x] Tile rendering from sprite sheets
- [x] Test pattern with 13 different tile types

### Phase 3: Core Game Logic (Planned)
- [ ] Level data loader
- [ ] Tile system
- [ ] Player movement
- [ ] Game mechanics (collapse, flags, win conditions)

### Phase 4: Audio & UI (Planned)
- [ ] Sound manager (Web Audio API)
- [ ] Menu system
- [ ] Text rendering
- [ ] Mobile controls

### Phase 5: Level Integration (Planned)
- [ ] All levels loading
- [ ] Progress saving (LocalStorage)
- [ ] Level map screen

### Phase 6: Polish (Planned)
- [ ] i18n support
- [ ] Mobile optimization
- [ ] Performance tuning

### Phase 7: Deployment (Planned)
- [ ] Production build
- [ ] Hosting setup

## Getting Started

### Prerequisites
- Node.js 18+ (or compatible npm environment)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

The dev server will start at `http://localhost:3000` (configurable in vite.config.ts).

## Architecture Notes

### Porting Strategy

**C++ to TypeScript Mapping**:
- `hex_puzzzle.cpp` → `src/game/core/HexPuzzle.ts`
- `gfx.cpp` → `src/game/graphics/Renderer.ts`
- `sfx.cpp` → `src/game/audio/SoundManager.ts`
- `text.cpp` → `src/game/graphics/TextRenderer.ts`

**SDL2 to Web API Mapping**:
- `SDL_Window/SDL_Renderer` → HTML5 Canvas
- `SDL_LoadTexture` → `new Image()` + async loading
- `SDL_RenderCopy` → `ctx.drawImage()`
- `SDL_mixer` → Web Audio API

### Key Design Decisions

1. **Pure Canvas 2D** (no Phaser/PixiJS)
   - Simpler, lighter weight
   - Direct control over rendering
   - Easier to port C++ logic 1:1

2. **Type Safety**
   - Strict TypeScript configuration
   - Type definitions match C++ structures

3. **Modular Architecture**
   - Separate concerns (core, graphics, audio, ui)
   - Easy to test and maintain

## Assets

All assets (images, audio, fonts) are copied from the Android version:
- **Images**: PNG format (tiles, map, UI)
- **Audio**: OGG format (sound effects, music)
- **Fonts**: TTF format (m5x7, visitor1, font.ttf)

## License

This project inherits the GPL license from the original Hex-a-Hop project.

## Credits

- Original Hex-a-Hop game by Tom Beaumont
- Android port by koisignal
- Web port: In progress

## Next Steps

See `../plan_web.md` for the detailed migration plan.

Current focus: **Phase 1 - Project Setup** ✅
Next phase: **Phase 2 - Rendering Foundation**
