# Hex-a-Hop Web移植計画

## プロジェクト概要

Android版Hex-a-HopをブラウザベースのWebアプリケーションとして移植する。
C++/Javaコードベースを段階的にTypeScriptへ書き換え、モダンなWeb技術スタックを活用する。

### 現状分析

- **コア言語**: C++ (約5,114行)
- **プラットフォーム層**: Java (Android)
- **グラフィックス**: SDL2 + OpenGL ES
- **音声**: SDL2_mixer
- **テキスト**: SDL2_ttf
- **主要ファイル**:
  - `hex_puzzzle.cpp` (88KB): ゲームロジック
  - `gfx.cpp` (10KB): グラフィックス処理
  - `sfx.cpp` (6.5KB): サウンド管理
  - `text.cpp` (12KB): テキストレンダリング
  - `i18n.cpp` (1.4KB): 国際化

---

## 技術スタック選定

### フロントエンド

#### コア技術
- **TypeScript**: 型安全性を確保しながらC++ロジックを移植
- **HTML5 Canvas / WebGL**: レンダリングエンジン
- **Web Audio API**: サウンド再生

#### フレームワーク選択肢

**選択肢A: ピュアTypeScript + Canvas2D**
- 利点: シンプル、軽量、学習コスト低
- 欠点: パフォーマンス上限、拡張性
- 推奨度: ★★★★☆

**選択肢B: Phaser 3**
- 利点: ゲームエンジン機能一式、タイル処理、アニメーション
- 欠点: 学習コスト、バンドルサイズ
- 推奨度: ★★★★★ **（推奨）**

**選択肢C: PixiJS**
- 利点: 高速WebGLレンダリング、軽量
- 欠点: ゲームロジックは自前実装
- 推奨度: ★★★☆☆

**選択肢D: Three.js**
- 利点: 3D表現可能
- 欠点: 2Dゲームにはオーバースペック
- 推奨度: ★☆☆☆☆

#### ビルドツール
- **Vite**: 高速開発サーバー、最適化ビルド
- **pnpm / npm**: パッケージ管理

### アセット処理
- **PNG画像**: そのまま使用可能
- **OGG音声**: Web Audio APIで再生可能（ブラウザ互換性確認要）
- **TTFフォント**: CSS @font-face または Canvas fillText

---

## 段階的移植計画

### Phase 1: プロジェクトセットアップ（1-2日）

**目標**: Web開発環境の構築

#### タスク
1. プロジェクト初期化
   ```bash
   npm create vite@latest hex-a-hop-web -- --template vanilla-ts
   cd hex-a-hop-web
   npm install
   npm install phaser  # Phaser選択時
   ```

2. ディレクトリ構造設計
   ```
   hex-a-hop-web/
   ├── src/
   │   ├── main.ts              # エントリーポイント
   │   ├── game/
   │   │   ├── core/            # ゲームコアロジック
   │   │   ├── graphics/        # レンダリング
   │   │   ├── audio/           # サウンド管理
   │   │   ├── ui/              # UI/メニュー
   │   │   └── types/           # 型定義
   │   ├── assets/              # アセット参照
   │   └── utils/               # ユーティリティ
   ├── public/
   │   ├── assets/
   │   │   ├── images/          # PNG画像
   │   │   ├── audio/           # OGG音声
   │   │   └── fonts/           # TTFフォント
   │   └── levels/              # レベルデータ
   ├── index.html
   ├── tsconfig.json
   ├── vite.config.ts
   └── package.json
   ```

3. アセット移行
   - `DemoGame/app/src/main/assets/res/` → `public/assets/` へコピー
   - パス参照を更新

4. 開発環境確認
   - ローカルサーバー起動テスト
   - ホットリロード動作確認

**成果物**: 空のプロジェクトが localhost で起動する

---

### Phase 2: 基盤システム移植（3-5日）

**目標**: ゲームループとレンダリング基盤の構築

#### 2.1 型定義・定数の移植

**ソースファイル**: `tiletypes.h`, `config.h`, `state.h`

```typescript
// src/game/types/TileTypes.ts
export enum TileType {
  GREEN = 0,
  GREEN1,
  GREEN2,
  GREEN3,
  // ... C++の定数を移植
}

// src/game/types/GameState.ts
export interface GameState {
  level: number;
  score: number;
  moves: number;
  // ... 状態管理
}
```

#### 2.2 グラフィックスエンジン移植

**ソースファイル**: `gfx.cpp` (10KB)

```typescript
// src/game/graphics/Renderer.ts
export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private textures: Map<string, HTMLImageElement>;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.textures = new Map();
  }

  async loadTexture(name: string, path: string): Promise<void> {
    // SDL_LoadTexture相当
  }

  renderTile(type: TileType, x: number, y: number): void {
    // RenderTile関数の移植
  }

  clear(): void {
    // 画面クリア
  }

  present(): void {
    // SDL_RenderPresent相当（Canvasでは不要）
  }
}
```

#### 2.3 ゲームループ

```typescript
// src/game/core/GameLoop.ts
export class GameLoop {
  private lastTime = 0;
  private running = false;

  start(): void {
    this.running = true;
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    if (this.running) {
      requestAnimationFrame(this.loop.bind(this));
    }
  }

  private update(dt: number): void {
    // ゲームロジック更新
  }

  private render(): void {
    // 描画
  }
}
```

**成果物**: 画面に何か（テストパターン、タイル1つ等）が表示される

---

### Phase 3: コアゲームロジック移植（7-10日）

**目標**: パズルゲームのメカニクスを実装

#### 3.1 レベルデータ処理

**ソースファイル**: `packfile.h`, `level_list.h`

```typescript
// src/game/core/LevelLoader.ts
export interface LevelData {
  name: string;
  width: number;
  height: number;
  tiles: TileType[][];
  playerStart: { x: number; y: number };
}

export class LevelLoader {
  async loadLevel(path: string): Promise<LevelData> {
    // .levファイルのパース
    // PackFileシステムの移植
  }
}
```

#### 3.2 ゲームメカニクス

**ソースファイル**: `hex_puzzzle.cpp` (88KB) - 最も重要

**主要クラス/関数の移植**:

```typescript
// src/game/core/HexPuzzle.ts
export class HexPuzzle {
  private level: LevelData;
  private playerPos: { x: number; y: number };
  private tiles: Tile[][];
  private moveHistory: Move[];

  // プレイヤー移動ロジック
  movePlayer(direction: Direction): boolean {
    // C++のmove関数を移植
    // タイルの破壊、フラグ条件、勝利条件等
  }

  // タイル相互作用
  private updateTile(x: number, y: number): void {
    // タイルの状態変化（崩壊、変形等）
  }

  // アンドゥ機能
  undo(): void {
    // moveHistoryから復元
  }

  // 勝利判定
  checkWinCondition(): boolean {
    // すべてのグリーンタイルが消えたか
  }
}

// src/game/core/Tile.ts
export class Tile {
  type: TileType;
  strength: number; // タイルの耐久値
  flags: number;

  collapse(): void {
    // タイル崩壊処理
  }
}
```

**重点移植箇所**:
1. ヘックスグリッド座標系
2. プレイヤー移動とタイル判定
3. タイルの種類別挙動（崩壊、変形、テレポート等）
4. フラグ/スコアリングシステム
5. セーブ/ロード機能

**成果物**: 1つのレベルがプレイ可能（移動、勝利判定）

---

### Phase 4: サウンド・UI実装（3-5日）

#### 4.1 サウンドシステム

**ソースファイル**: `sfx.cpp` (6.5KB)

```typescript
// src/game/audio/SoundManager.ts
export class SoundManager {
  private sounds: Map<string, AudioBuffer>;
  private audioContext: AudioContext;

  async loadSound(name: string, path: string): Promise<void> {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.sounds.set(name, audioBuffer);
  }

  playSound(name: string): void {
    // Web Audio APIで再生
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds.get(name)!;
    source.connect(this.audioContext.destination);
    source.start();
  }

  playMusic(name: string, loop: boolean = true): void {
    // BGM再生（ループ対応）
  }
}
```

**音声ファイル**:
- sound-collapse.ogg
- sound-death.ogg
- sound-win.ogg
- 他15種類

#### 4.2 テキストレンダリング

**ソースファイル**: `text.cpp` (12KB)

```typescript
// src/game/graphics/TextRenderer.ts
export class TextRenderer {
  private ctx: CanvasRenderingContext2D;
  private fontFamily: string;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    // フォント読み込み
  }

  drawText(text: string, x: number, y: number, size: number): void {
    this.ctx.font = `${size}px ${this.fontFamily}`;
    this.ctx.fillText(text, x, y);
  }
}
```

#### 4.3 UI/メニューシステム

**ソースファイル**: `menus.h`

```typescript
// src/game/ui/MenuSystem.ts
export class MenuSystem {
  // タイトル画面
  showTitleScreen(): void {}

  // レベル選択画面
  showLevelSelect(): void {}

  // 設定画面
  showSettings(): void {}

  // ヒントボタン
  showHint(stageId: number): void {}
}
```

**HTML UI要素**:
- タッチ/マウス入力ボタン（上下左右、アンドゥ、メニュー）
- スコア表示
- レベル選択マップ

**成果物**: 音声が鳴り、メニュー操作ができる

---

### Phase 5: レベル統合・ゲーム進行（2-3日）

#### 5.1 全レベルの読み込み

- PackFileシステムからすべてのレベルを抽出
- レベル一覧の生成
- 進行状況の保存（LocalStorage使用）

```typescript
// src/game/core/ProgressManager.ts
export class ProgressManager {
  saveProgress(levelId: string, score: number): void {
    const progress = JSON.parse(localStorage.getItem('hexahop_progress') || '{}');
    progress[levelId] = { score, completed: true };
    localStorage.setItem('hexahop_progress', JSON.stringify(progress));
  }

  loadProgress(): Record<string, { score: number; completed: boolean }> {
    return JSON.parse(localStorage.getItem('hexahop_progress') || '{}');
  }
}
```

#### 5.2 マップ画面

- レベルマップの表示（map.png使用）
- 解放済みレベルのハイライト
- レベル選択とロード

**成果物**: すべてのレベルがプレイ可能

---

### Phase 6: 国際化・ポリッシュ（2-3日）

#### 6.1 多言語対応

**ソースファイル**: `i18n.cpp`

```typescript
// src/game/i18n/Localization.ts
export class Localization {
  private locale: string;
  private translations: Record<string, Record<string, string>>;

  setLocale(locale: string): void {
    this.locale = locale;
  }

  t(key: string): string {
    return this.translations[this.locale]?.[key] || key;
  }
}
```

#### 6.2 モバイル対応

- タッチイベント処理
- レスポンシブデザイン（縦画面/横画面）
- 仮想ゲームパッド（Android版と同等）

#### 6.3 パフォーマンス最適化

- 画像のスプライトシート化
- 音声の遅延読み込み
- レンダリング最適化（dirty rectangle等）

**成果物**: 完成したゲーム、多言語対応、モバイルでプレイ可能

---

### Phase 7: デプロイ・公開（1-2日）

#### 7.1 本番ビルド

```bash
npm run build
# dist/にビルド成果物が生成される
```

#### 7.2 ホスティング選択肢

- **GitHub Pages**: 無料、簡単
- **Netlify**: 無料、CI/CD統合
- **Vercel**: 無料、高速CDN
- **Cloudflare Pages**: 無料、グローバルCDN

#### 7.3 PWA化（オプション）

- Service Worker実装
- オフラインプレイ対応
- ホーム画面追加可能

**成果物**: 公開URL、誰でもアクセス可能

---

## 主要モジュールの移植方針

### 優先度マトリックス

| モジュール | 難易度 | 重要度 | 優先順位 | 見積時間 |
|-----------|-------|-------|---------|---------|
| 型定義 | 低 | 高 | 1 | 0.5日 |
| レンダリング基盤 | 中 | 高 | 1 | 2日 |
| ゲームループ | 低 | 高 | 1 | 0.5日 |
| レベルローダー | 中 | 高 | 2 | 2日 |
| ゲームロジック | 高 | 高 | 2 | 7日 |
| サウンド | 低 | 中 | 3 | 1日 |
| UI/メニュー | 中 | 中 | 3 | 3日 |
| 国際化 | 低 | 低 | 4 | 1日 |
| モバイル対応 | 中 | 中 | 4 | 2日 |

### 詳細移植ガイドライン

#### hex_puzzzle.cpp → HexPuzzle.ts

**重要な関数/ロジック**:

1. **座標系変換**
   - C++のヘックスグリッド計算をそのまま移植
   - `RenderTile`関数の座標計算ロジック

2. **タイル種別の挙動**
   - `tiletypes.h`の定数をenumに変換
   - 各タイプの`update`/`interact`ロジック

3. **状態管理**
   - C++のグローバル変数 → TypeScriptのクラスフィールド
   - ポインタ → 参照/配列インデックス

4. **ファイルI/O**
   - `fopen`/`fread` → `fetch` API
   - バイナリ読み込み → `ArrayBuffer`/`DataView`

#### gfx.cpp → Renderer.ts

**SDL2 API対応表**:

| SDL2 | Web API |
|------|---------|
| SDL_CreateWindow | `<canvas>` element |
| SDL_CreateRenderer | `canvas.getContext('2d')` または WebGL |
| SDL_LoadTexture | `new Image(); img.src = ...` |
| SDL_RenderCopy | `ctx.drawImage()` |
| SDL_RenderPresent | （不要、自動更新） |

#### sfx.cpp → SoundManager.ts

**SDL2_mixer API対応表**:

| SDL2_mixer | Web Audio API |
|------------|---------------|
| Mix_LoadWAV | `fetch` + `decodeAudioData` |
| Mix_PlayChannel | `AudioBufferSourceNode.start()` |
| Mix_PlayMusic | `AudioBufferSourceNode` + loop |
| Mix_VolumeMusic | `GainNode.gain.value` |

---

## アセット処理

### 画像アセット

**既存ファイル**:
- `tiles.png`: タイルスプライト
- `tiles_reflect.png`: 反射エフェクト
- `map.png`: レベルマップ背景
- `title.png`: タイトル画面
- `gradient.png`: グラデーション効果
- アイコン各種

**処理方針**:
1. そのまま`public/assets/images/`に配置
2. Canvasで直接読み込み・描画
3. 必要に応じてスプライトシート化（Phaser使用時は自動対応）

### 音声アセット

**既存ファイル**: 18個のOGGファイル

**ブラウザ互換性**:
- OGG: Chrome, Firefox, Edge対応（Safari非対応）
- MP3: 全ブラウザ対応

**対応策**:
1. OGGをそのまま使用（Safari用にMP3も用意、またはFFmpeg変換）
2. または WebM形式を検討

**変換コマンド例**:
```bash
for file in *.ogg; do
  ffmpeg -i "$file" "${file%.ogg}.mp3"
done
```

### フォントアセット

**既存ファイル**:
- font.ttf
- visitor1.ttf
- m5x7.ttf

**使用方法**:
```css
@font-face {
  font-family: 'HexAHopFont';
  src: url('/assets/fonts/font.ttf') format('truetype');
}
```

### レベルデータ

**形式**: `.lev`ファイル（バイナリまたはテキスト）

**処理**:
1. PackFileからレベル抽出
2. JSONまたは独自形式でパース
3. `fetch`で非同期読み込み

---

## 課題とリスク

### 技術的課題

#### 1. C++特有の機能の移植

**課題**:
- ポインタ操作 → TypeScriptの参照/インデックス
- メモリ管理 → GCに委譲（基本的に問題なし）
- ビット演算 → そのまま移植可能

**対応**: C++ロジックを丁寧に読み解き、等価なTS実装に変換

#### 2. パフォーマンス

**懸念**:
- Canvas2Dの描画速度（特にモバイル）
- 大量のタイル描画時のフレームレート

**対応**:
- WebGL使用（Phaser等）
- ダーティーレクタングル
- オフスクリーンCanvas活用

#### 3. レベルデータのパース

**課題**:
- バイナリ`.lev`ファイルのフォーマット解析
- PackFileシステムの理解

**対応**:
- C++コードを読んでフォーマット仕様を理解
- `ArrayBuffer`/`DataView`でバイナリ読み込み
- 必要に応じてレベルをJSON化

#### 4. ブラウザ互換性

**懸念箇所**:
- 音声フォーマット（OGG vs MP3）
- Canvas API の実装差異
- モバイルブラウザの制約

**対応**:
- 音声のフォールバック実装
- クロスブラウザテスト
- Can I Use でAPI確認

### プロジェクト管理リスク

#### 1. スコープクリープ

**リスク**: 追加機能の誘惑（オンライン対戦、レベルエディタ等）

**対応**: Phase 1-6に集中、Phase 7完了後に検討

#### 2. 時間見積もりの甘さ

**リスク**: 特にPhase 3（ゲームロジック）が長引く可能性

**対応**:
- 小さくリリース、イテレーション
- MVP（最小限の1レベル）を早期に完成

#### 3. アセット権利関係

**確認事項**:
- 音声/BGMの置き換え済み（README記載）
- GPLライセンス適用（オープンソース）
- 画像の著作権確認

**対応**: LICENSEファイルを確認、適切にクレジット表記

---

## マイルストーン

### M1: プロトタイプ（Week 1-2）

**目標**: 画面にタイルが表示され、プレイヤーが移動できる

- [ ] プロジェクトセットアップ
- [ ] レンダリングエンジン基礎
- [ ] 1つのレベル読み込み
- [ ] 基本移動ロジック

### M2: コア機能（Week 3-4）

**目標**: ゲームとして遊べる

- [ ] 全タイプのタイル挙動実装
- [ ] 勝利/敗北判定
- [ ] サウンド統合
- [ ] UI/メニュー基礎

### M3: フルゲーム（Week 5-6）

**目標**: すべてのレベルがプレイ可能

- [ ] 全レベル読み込み
- [ ] レベルマップ画面
- [ ] 進行状況保存
- [ ] モバイル対応

### M4: ポリッシュ・公開（Week 7）

**目標**: 本番環境にデプロイ

- [ ] バグ修正
- [ ] パフォーマンス最適化
- [ ] クロスブラウザテスト
- [ ] デプロイ・公開

---

## WASM化の検討（将来）

TypeScript実装完了後、パフォーマンスがボトルネックになった場合に検討:

### WASM化候補

1. **ゲームロジック計算部分**
   - タイル更新処理
   - 経路探索（もしAI実装する場合）

2. **レベルデータパース**
   - バイナリ処理が多い部分

### 移植方法

**選択肢A**: C++コードを直接WASM化
- Emscripten使用
- 既存コードを活用

**選択肢B**: Rust/AssemblyScriptで再実装
- モダンなツールチェーン
- TS型定義との連携

**判断基準**:
- Canvas2D/WebGLで60FPSが維持できるか
- モバイルでのパフォーマンス
- 実装コストvs効果

---

## 付録

### 参考リンク

- [Phaser 3 公式ドキュメント](https://photonstorm.github.io/phaser3-docs/)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Vite ドキュメント](https://vitejs.dev/)

### コマンド集

```bash
# プロジェクト作成
npm create vite@latest hex-a-hop-web -- --template vanilla-ts
cd hex-a-hop-web
npm install

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# プレビュー
npm run preview

# 音声変換（必要な場合）
ffmpeg -i input.ogg output.mp3
```

### 推奨VSCode拡張機能

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Error Lens

---

## まとめ

**推奨アプローチ**:
1. **Phaser 3 + TypeScript + Vite** で段階的に移植
2. Phase 1-6を順次実施（約6-7週間）
3. MVP優先、早期プロトタイプ
4. WASM化は後回し（必要性を確認してから）

**成功の鍵**:
- C++コードの丁寧な読解
- 小さく動くものを作り続ける
- 定期的なテストプレイ
- パフォーマンス測定

**最初の一歩**:
```bash
npm create vite@latest hex-a-hop-web -- --template vanilla-ts
```

このコマンドからスタートしましょう！
