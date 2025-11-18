# Hex-a-Hop WebXR版 移植計画

## プロジェクト概要

Web版Hex-a-Hopを**WebXR API**を活用してVR/AR対応の3D空間パズルゲームとして再構築する。
2Dの六角形タイルパズルを立体的な3D環境に変換し、没入型のゲーム体験を提供する。

### WebXRとは

**WebXR Device API**は、ブラウザでVR（Virtual Reality）およびAR（Augmented Reality）体験を提供するWeb標準API。

- **対応デバイス**: Meta Quest、PlayStation VR2、HTC Vive、Magic Leap、HoloLens、スマートフォンAR
- **ブラウザサポート**: Chrome、Edge、Firefox Reality、Oculus Browser
- **特徴**: プラグイン不要、Web配信、クロスプラットフォーム

---

## なぜHex-a-HopをWebXRに？

### 1. ゲームメカニクスとVRの親和性

✅ **空間認識パズル**: 六角形グリッドを3D化することで立体的な理解が向上
✅ **物理的インタラクション**: VRコントローラーでタイルを直接タッチ/指す
✅ **新しい視点**: 上空から俯瞰、または等身大で六角タイルの上を歩く感覚
✅ **没入感**: パズルの世界に入り込む体験

### 2. 技術的実現可能性

- 既存の2Dロジックを3D座標系にマッピング可能
- タイルタイプと色の情報は3Dモデルのマテリアルに変換
- プレイヤー移動ロジックはそのまま活用可能

### 3. 差別化要素

- **VR専用レベル**: 多層構造の立体パズル
- **物理エフェクト**: タイル崩壊時の3Dアニメーション
- **マルチプレイヤーVR**: 協力プレイ・対戦モード

---

## 技術スタック選定

### コア技術

#### 選択肢A: **Three.js + WebXR Module** ★★★★★ (推奨)

**利点**:
- 最も成熟したWebGL/WebXRライブラリ
- 豊富なドキュメントとコミュニティ
- 軽量で柔軟性が高い
- TypeScriptサポート

**欠点**:
- VR特化機能は自前実装が必要
- 物理エンジンは別途統合（Cannon.js、Ammo.js）

**推奨度**: ★★★★★

```typescript
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
```

---

#### 選択肢B: **Babylon.js** ★★★★☆

**利点**:
- VR/AR機能が標準搭載
- 物理エンジン統合済み（Cannon.js、Ammo.js、Havok）
- ビジュアルエディタ（Babylon Editor）
- パフォーマンス最適化機能

**欠点**:
- ファイルサイズが大きい
- 学習曲線がやや急

**推奨度**: ★★★★☆

---

#### 選択肢C: **A-Frame** ★★★☆☆

**利点**:
- HTMLベースの宣言的構文
- 初心者に優しい
- 豊富なコンポーネントライブラリ

**欠点**:
- TypeScriptとの統合が弱い
- 複雑なロジックには不向き
- パフォーマンスチューニングが難しい

**推奨度**: ★★★☆☆

---

#### 選択肢D: **Wonderland Engine** ★★☆☆☆

**利点**:
- WebXR専用エンジン
- 高パフォーマンス（WebAssembly）
- ビジュアルエディタ

**欠点**:
- 新しいエンジンで情報が少ない
- 商用利用は有料

**推奨度**: ★★☆☆☆

---

### 推奨スタック

```
フロントエンド: Three.js + TypeScript + Vite
WebXR: Three.js VRButton, XRControllerModelFactory
物理エンジン: Cannon.js (タイル崩壊物理)
UI: Three-mesh-ui (VR空間内UI)
音声: Three.js Audio / Web Audio API (空間オーディオ)
```

---

## ゲームデザイン: 2D→3D変換

### 1. ビジュアル表現

#### タイルの3D化

**2D版**:
- 平面的な六角形スプライト
- 上から見下ろす視点固定

**WebXR版**:
- 3D六角柱（Hexagonal Prism）メッシュ
- 各タイプに応じた3Dモデル/マテリアル
  - **NORMAL（緑タイル）**: エメラルドグリーンの光沢マテリアル
  - **COLLAPSABLE（崩れるタイル）**: ひび割れテクスチャ + パーティクル
  - **WALL（壁）**: 高さのある六角柱（障害物）
  - **TRAMPOLINE**: アニメーション付きの弾性マテリアル

#### プレイヤー表現

**2D版**: 黄色い六角形

**WebXR版**:
- **オプションA**: アバター（3Dキャラクター）
- **オプションB**: 光る球体（抽象的表現）
- **オプションC**: プレイヤー視点カメラ（一人称視点）

### 2. カメラ/視点システム

#### VRモード（没入型）

```
カメラ位置: プレイヤーの頭上3m、俯瞰視点
制御方法: ヘッドトラッキング + コントローラー
利点: 全体を見渡しやすい、戦略的思考
```

#### ARモード（拡張現実）

```
カメラ位置: 現実空間のテーブル上にパズル配置
制御方法: スマートフォン/タブレットカメラ
利点: 実空間との融合、カジュアルプレイ
```

### 3. インタラクション設計

#### コントローラー入力

**Meta Quest / VIVE コントローラー**:
- **レーザーポインター**: タイルを指して選択
- **グリップボタン**: タイルを掴んで移動（編集モード）
- **トリガー**: プレイヤー移動の決定
- **スティック**: カメラ回転・ズーム

```typescript
// 疑似コード
controller.addEventListener('selectstart', (event) => {
  const intersection = raycaster.intersectObjects(tiles);
  if (intersection[0]) {
    const tile = intersection[0].object;
    movePlayerToTile(tile);
  }
});
```

#### ハンドトラッキング（Quest Pro / Quest 3）

- 人差し指でタイルをタップ
- 手のジェスチャーでメニュー操作
- より直感的なインタラクション

#### 視線制御（Gaze-based）

- HMDを向けた方向にレイキャスト
- 一定時間注視で選択（Dwell Time）
- コントローラー不要のアクセシビリティ

### 4. レベルデザインの拡張

#### 平面レベル（既存互換）

```
- 2Dレベルをそのまま3D平面に配置
- 上から俯瞰視点でプレイ
- 既存の全100レベルを移植可能
```

#### 立体レベル（VR専用）

```
- 多層構造のパズル（上下に重なるタイル）
- タワー型パズル（螺旋階段状）
- 浮遊島パズル（空中に浮かぶプラットフォーム）
- 重力パズル（タイルが落下・回転）
```

例：
```
レベル構造:
  Layer 2: [浮遊タイル]
           ↑ ジャンプ
  Layer 1: [通常タイル群]
           ↓ 落下穴
  Layer 0: [ゴールタイル]
```

---

## 段階的実装計画

### Phase 1: プロトタイプ作成（1週間）

**目標**: WebXR環境で1つのレベルが動く最小実装

#### タスク

1. **プロジェクト初期化**
   ```bash
   mkdir hex-a-hop-webxr
   cd hex-a-hop-webxr
   npm create vite@latest . -- --template vanilla-ts
   npm install three @types/three
   npm install cannon-es  # 物理エンジン
   ```

2. **基本シーン構築**
   ```typescript
   // src/main.ts
   import * as THREE from 'three';
   import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

   const scene = new THREE.Scene();
   const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
   const renderer = new THREE.WebGLRenderer({ antialias: true });

   renderer.xr.enabled = true;
   document.body.appendChild(VRButton.createButton(renderer));
   ```

3. **六角タイル生成**
   ```typescript
   // HexTile.ts
   class HexTile {
     mesh: THREE.Mesh;

     constructor(type: TileType, position: THREE.Vector3) {
       const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 6);
       const material = new THREE.MeshStandardMaterial({
         color: getTileColor(type),
       });
       this.mesh = new THREE.Mesh(geometry, material);
       this.mesh.position.copy(position);
     }
   }
   ```

4. **六角グリッド配置**
   ```typescript
   // HexGrid3D.ts
   class HexGrid3D {
     tiles: HexTile[] = [];

     generateGrid(width: number, height: number) {
       for (let x = 0; x < width; x++) {
         for (let y = 0; y < height; y++) {
           const pos = this.gridToWorld3D(x, y);
           const tile = new HexTile(TileType.NORMAL, pos);
           this.tiles.push(tile);
           scene.add(tile.mesh);
         }
       }
     }

     gridToWorld3D(gridX: number, gridY: number): THREE.Vector3 {
       const hexSize = 1.0;
       const x = gridX * hexSize * 1.5;
       const z = gridY * hexSize * Math.sqrt(3) + (gridX % 2) * hexSize * Math.sqrt(3) / 2;
       return new THREE.Vector3(x, 0, z);
     }
   }
   ```

5. **VRコントローラー統合**
   ```typescript
   const controller = renderer.xr.getController(0);
   controller.addEventListener('selectstart', onSelectStart);
   scene.add(controller);

   // レーザーポインター表示
   const geometry = new THREE.BufferGeometry().setFromPoints([
     new THREE.Vector3(0, 0, 0),
     new THREE.Vector3(0, 0, -1)
   ]);
   const line = new THREE.Line(geometry);
   controller.add(line);
   ```

**成果物**: VRヘッドセットで六角グリッドが見える、コントローラーでタイル選択可能

---

### Phase 2: ゲームロジック統合（1週間）

**目標**: 既存の2Dゲームロジックを3D空間に適用

#### タスク

1. **2Dコードの再利用**
   - Web版の`Level.ts`, `Player.ts`を移植
   - 座標系を3D（x, y, z）に拡張
   - タイル状態管理は共通化

2. **プレイヤー移動実装**
   ```typescript
   class Player3D {
     position: THREE.Vector3;
     mesh: THREE.Mesh;

     moveToTile(tile: HexTile): boolean {
       // 2Dロジックを3D座標で再実装
       const canMove = this.level.canWalkOn(tile.gridPos);
       if (canMove) {
         this.animateMovement(tile.mesh.position);
         return true;
       }
       return false;
     }

     animateMovement(target: THREE.Vector3): void {
       // GSAPやTween.jsでスムーズな移動アニメーション
       new TWEEN.Tween(this.position)
         .to(target, 500)
         .easing(TWEEN.Easing.Quadratic.Out)
         .start();
     }
   }
   ```

3. **タイル崩壊アニメーション**
   ```typescript
   class CollapsingTile extends HexTile {
     collapse(): void {
       // パーティクルエフェクト
       const particles = new THREE.Points(
         new THREE.BufferGeometry(),
         new THREE.PointsMaterial({ color: 0x00ff00 })
       );

       // 落下アニメーション
       new TWEEN.Tween(this.mesh.position)
         .to({ y: -10 }, 1000)
         .easing(TWEEN.Easing.Cubic.In)
         .onComplete(() => {
           scene.remove(this.mesh);
         })
         .start();
     }
   }
   ```

4. **勝利/敗北判定**
   - 2Dロジックをそのまま使用
   - VR空間内でUI表示（three-mesh-ui）

**成果物**: VRで実際にパズルゲームがプレイ可能

---

### Phase 3: VR UX最適化（1週間）

**目標**: VR特有の快適性・操作性の向上

#### タスク

1. **空間UI実装**
   ```typescript
   import ThreeMeshUI from 'three-mesh-ui';

   const uiPanel = new ThreeMeshUI.Block({
     width: 1.5,
     height: 0.8,
     backgroundColor: new THREE.Color(0x000000),
     backgroundOpacity: 0.7,
   });

   const text = new ThreeMeshUI.Text({
     content: "Level 1: First Steps",
     fontSize: 0.1,
   });

   uiPanel.add(text);
   scene.add(uiPanel);
   ```

2. **空間オーディオ**
   ```typescript
   const listener = new THREE.AudioListener();
   camera.add(listener);

   const sound = new THREE.PositionalAudio(listener);
   const audioLoader = new THREE.AudioLoader();
   audioLoader.load('/sounds/collapse.ogg', (buffer) => {
     sound.setBuffer(buffer);
     sound.setRefDistance(2);
   });

   // タイルに音源を配置
   tile.mesh.add(sound);
   sound.play(); // タイル崩壊時
   ```

3. **快適性対策**
   - **VR酔い軽減**: カメラ移動はテレポート方式、スナップターン
   - **視覚疲労軽減**: コントラスト調整、UI距離最適化
   - **パフォーマンス**: 90fps維持（Quest 2）、72fps（Quest 1）

4. **ハンドトラッキング対応**
   ```typescript
   const handModel = new XRHandModelFactory().createHandModel(hand, 'mesh');
   scene.add(handModel);

   // ピンチジェスチャー検出
   hand.addEventListener('pinchstart', (event) => {
     const tile = detectTileAtHand(event.hand);
     if (tile) selectTile(tile);
   });
   ```

**成果物**: 快適なVR体験、長時間プレイ可能

---

### Phase 4: 立体レベル実装（1週間）

**目標**: VR専用の3D構造パズル

#### タスク

1. **多層グリッドシステム**
   ```typescript
   class MultiLayerGrid {
     layers: HexGrid3D[] = [];

     addLayer(y: number): HexGrid3D {
       const grid = new HexGrid3D();
       grid.position.y = y;
       this.layers.push(grid);
       return grid;
     }

     // レベル定義
     loadLevel(data: LevelData) {
       // Layer 0: 地上
       const ground = this.addLayer(0);
       ground.generateFromData(data.layer0);

       // Layer 1: 空中プラットフォーム
       const sky = this.addLayer(5);
       sky.generateFromData(data.layer1);
     }
   }
   ```

2. **ジャンプ/落下メカニクス**
   ```typescript
   class Player3D {
     jump(targetTile: HexTile): void {
       const jumpHeight = 2.0;
       const duration = 800;

       // 放物線軌道でジャンプ
       new TWEEN.Tween(this.position)
         .to({
           x: targetTile.position.x,
           y: targetTile.position.y + jumpHeight,
           z: targetTile.position.z
         }, duration / 2)
         .easing(TWEEN.Easing.Quadratic.Out)
         .chain(
           new TWEEN.Tween(this.position)
             .to({ y: targetTile.position.y }, duration / 2)
             .easing(TWEEN.Easing.Quadratic.In)
         )
         .start();
     }
   }
   ```

3. **物理シミュレーション（Cannon.js）**
   ```typescript
   import * as CANNON from 'cannon-es';

   const world = new CANNON.World();
   world.gravity.set(0, -9.82, 0);

   // タイルに物理ボディ
   const tileBody = new CANNON.Body({
     mass: 1,
     shape: new CANNON.Cylinder(1, 1, 0.2, 6),
   });
   world.addBody(tileBody);

   // アニメーションループで物理更新
   world.step(1/60);
   tile.mesh.position.copy(tileBody.position);
   tile.mesh.quaternion.copy(tileBody.quaternion);
   ```

4. **VR専用レベル設計**
   - レベル1: チュートリアル（平面）
   - レベル2: 階段パズル（2層構造）
   - レベル3: タワー（螺旋状）
   - レベル4: 浮遊島群（ジャンプパズル）
   - レベル5: 重力反転（上下逆さま）

**成果物**: VRならではの立体パズル体験

---

### Phase 5: マルチプレイヤー（オプション、2週間）

**目標**: 複数人で協力・対戦プレイ

#### 技術

- **WebRTC**: P2P通信（低レイテンシ）
- **WebSocket**: サーバー経由同期（多人数）
- **ライブラリ**: colyseus, Socket.io, Croquet

#### 実装例

```typescript
import { Room, Client } from "colyseus.js";

const client = new Client("ws://localhost:2567");
const room = await client.joinOrCreate("hexahop_room");

// プレイヤー位置同期
room.onStateChange((state) => {
  state.players.forEach((player, sessionId) => {
    updatePlayerAvatar(sessionId, player.position);
  });
});

// 移動を送信
room.send("move", { direction: Direction.DIR_0 });
```

**成果物**: 最大4人での協力パズル解決

---

## ディレクトリ構造

```
hex-a-hop-webxr/
├── src/
│   ├── main.ts                  # エントリーポイント
│   ├── core/
│   │   ├── Scene3D.ts           # Three.jsシーン管理
│   │   ├── VRManager.ts         # WebXR初期化・制御
│   │   ├── HexGrid3D.ts         # 3D六角グリッドシステム
│   │   ├── Level3D.ts           # 3Dレベルデータ
│   │   └── Player3D.ts          # 3Dプレイヤー
│   ├── models/
│   │   ├── HexTile.ts           # 六角タイル3Dモデル
│   │   ├── TileFactory.ts       # タイプ別タイル生成
│   │   └── PlayerAvatar.ts      # プレイヤーモデル
│   ├── physics/
│   │   ├── PhysicsWorld.ts      # Cannon.js統合
│   │   └── TilePhysics.ts       # タイル物理挙動
│   ├── input/
│   │   ├── VRController.ts      # コントローラー入力
│   │   ├── HandTracking.ts      # ハンドトラッキング
│   │   └── GazeControl.ts       # 視線制御
│   ├── ui/
│   │   ├── VRMenuSystem.ts      # 3D UI（three-mesh-ui）
│   │   ├── HUD.ts               # ヘッドアップディスプレイ
│   │   └── LevelSelector3D.ts   # 3Dレベル選択
│   ├── audio/
│   │   ├── SpatialAudio.ts      # 空間オーディオ
│   │   └── SoundManager3D.ts    # サウンド管理
│   ├── effects/
│   │   ├── ParticleSystem.ts    # パーティクルエフェクト
│   │   ├── TileCollapse.ts      # 崩壊アニメーション
│   │   └── Lighting.ts          # ライティング・シャドウ
│   ├── utils/
│   │   ├── TweenManager.ts      # アニメーション管理
│   │   └── PerformanceMonitor3D.ts # VRパフォーマンス測定
│   └── types/
│       └── types.ts             # TypeScript型定義
├── public/
│   ├── models/                  # 3Dモデル（GLTF/GLB）
│   ├── textures/                # テクスチャ
│   └── sounds/                  # 空間オーディオ用音声
├── levels/
│   ├── flat/                    # 2D互換レベル
│   └── volumetric/              # 3D専用レベル
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## 技術的課題とリスク

### 1. パフォーマンス最適化

**課題**:
- VRは90fps必須（Questは72fps）
- 2DのCanvas2Dより遥かに高負荷
- 多数の3Dオブジェクトと物理演算

**対策**:
- **LOD（Level of Detail）**: 距離に応じてモデル詳細度変更
- **インスタンシング**: 同じタイルを効率的に描画
  ```typescript
  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
  ```
- **オクルージョンカリング**: 見えないオブジェクトは描画しない
- **テクスチャアトラス**: テクスチャ切り替えコスト削減
- **物理演算の最適化**: Sleep状態の活用

### 2. デバイス互換性

**課題**:
- Meta Quest 2 (Snapdragon XR2)
- Quest 3 (Snapdragon XR2 Gen 2)
- PSVR2 (PS5)
- PC VR (高性能GPU)

**対策**:
- デバイス検出して品質設定自動調整
- グラフィック設定オプション（Low/Medium/High）
- Progressive Enhancement（基本機能→高度機能）

### 3. VR酔い対策

**課題**:
- カメラ移動による視覚と前庭感覚の不一致
- フレームレート低下

**対策**:
- **テレポート移動**: スムーズ移動ではなく瞬間移動
- **ビネッティング**: 移動時に視野周辺を暗くする
- **固定参照点**: グリッド線やホライゾンライン表示
- **フレームレート保証**: 90fps厳守、動的品質調整

### 4. インタラクション設計

**課題**:
- 六角形タイルの小さな選択範囲
- 遠いタイルへのアクセス
- 複数レイヤーの視認性

**対策**:
- レーザーポインターの太さ調整
- ズーム機能（カメラ移動）
- レイヤー透明度切り替え
- ハプティックフィードバック強化

### 5. 開発環境

**課題**:
- VRヘッドセットなしでの開発
- デバッグの難しさ

**対策**:
- **Emulation API**: Chromeの WebXR Emulator Extension
- **デスクトップフォールバック**: VR非対応時は3Dマウス操作
- **リモートデバッグ**: Questからワイヤレスデバッグ

---

## デバイス対応表

| デバイス | VRモード | ARモード | ハンドトラッキング | 推奨品質 |
|---------|---------|---------|------------------|---------|
| Meta Quest 3 | ✅ | ✅ | ✅ | High |
| Meta Quest 2 | ✅ | ❌ | ✅ | Medium |
| Meta Quest Pro | ✅ | ✅ | ✅ | High |
| PSVR2 | ✅ | ❌ | ❌ | High |
| HTC Vive / Index | ✅ | ❌ | ❌ | High |
| PC VR (SteamVR) | ✅ | ❌ | Varies | High |
| iOS Safari (ARKit) | ❌ | ✅ | ✅ | Medium |
| Android Chrome (ARCore) | ❌ | ✅ | ❌ | Medium |

---

## コスト・工数見積もり

### 開発工数

| フェーズ | 期間 | 人月 |
|---------|-----|-----|
| Phase 1: プロトタイプ | 1週間 | 0.25 |
| Phase 2: ゲームロジック | 1週間 | 0.25 |
| Phase 3: VR UX最適化 | 1週間 | 0.25 |
| Phase 4: 立体レベル | 1週間 | 0.25 |
| Phase 5: マルチプレイヤー（オプション） | 2週間 | 0.5 |
| テスト・調整 | 1週間 | 0.25 |
| **合計** | **5-7週間** | **1.25-1.75人月** |

### 必要なハードウェア（開発用）

- Meta Quest 2/3: ¥50,000 - ¥75,000
- 開発用PC（VR Ready）: ¥150,000 - ¥300,000

---

## 既存Web版との比較

| 項目 | Web版 (Canvas2D) | WebXR版 (Three.js) |
|-----|------------------|-------------------|
| 開発期間 | 6-7週間 | 5-7週間 |
| コード行数 | 3,321行 | 推定 4,000-5,000行 |
| デバイス | PC・スマホ・タブレット | VRヘッドセット・AR対応デバイス |
| 操作方法 | キーボード・タッチ | コントローラー・ハンド・視線 |
| 視点 | 2D俯瞰固定 | 3D自由視点 |
| レベル互換性 | 100% (全レベル) | 100% + VR専用レベル |
| パフォーマンス要件 | 60fps @ 1080p | 90fps @ 両眼1832x1920 |
| ユーザー体験 | カジュアル | 没入型 |
| アクセシビリティ | 高（誰でもアクセス可能） | 中（VR機器必要） |

---

## 実装優先順位

### MVP（Minimum Viable Product）

1. ✅ 基本シーン + VRサポート
2. ✅ 六角グリッド3D表示
3. ✅ コントローラー入力
4. ✅ 1レベルプレイ可能
5. ✅ 勝利/敗北判定

### フェーズ2

1. 全レベル移植（平面）
2. 空間UI
3. 空間オーディオ
4. パフォーマンス最適化

### フェーズ3

1. 立体レベル
2. ハンドトラッキング
3. ARモード

### オプション

1. マルチプレイヤー
2. レベルエディタVR
3. ランキング・リーダーボード

---

## 参考リンク・リソース

### WebXR仕様

- [WebXR Device API - W3C](https://www.w3.org/TR/webxr/)
- [WebXR Samples - Immersive Web](https://immersive-web.github.io/webxr-samples/)

### Three.js + WebXR

- [Three.js WebXR Documentation](https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content)
- [Three.js VR Examples](https://threejs.org/examples/?q=webxr)

### ライブラリ

- [Three.js](https://threejs.org/)
- [Cannon.js (Physics)](https://github.com/pmndrs/cannon-es)
- [three-mesh-ui (VR UI)](https://github.com/felixmariotto/three-mesh-ui)
- [Tween.js (Animation)](https://github.com/tweenjs/tween.js/)

### デバッグツール

- [WebXR Emulator Extension](https://github.com/MozillaReality/WebXR-emulator-extension)
- [Meta Quest Developer Hub](https://developer.oculus.com/downloads/package/oculus-developer-hub-mac/)

---

## 次のステップ

### 即座に実行可能

```bash
# プロジェクト作成
mkdir hex-a-hop-webxr
cd hex-a-hop-webxr
npm create vite@latest . -- --template vanilla-ts
npm install three @types/three cannon-es tween.js

# 開発サーバー起動（HTTPSが必要）
npm run dev -- --host --https
```

### 推奨の開発フロー

1. **Week 1**: Three.js基礎習得 + プロトタイプ
2. **Week 2**: ゲームロジック移植
3. **Week 3**: VR UX改善
4. **Week 4**: レベル追加 + テスト
5. **Week 5**: 公開準備・最適化

---

## まとめ

**Hex-a-HopのWebXR移植は技術的に実現可能であり、VRの没入感を活かした新しいパズル体験を提供できる。**

### 主な利点

✅ **新しい体験**: 2Dパズルを3D空間で立体的に楽しめる
✅ **技術実現性**: Three.js + WebXRは成熟した技術スタック
✅ **コード再利用**: 既存のゲームロジックを活用可能
✅ **拡張性**: VR専用レベル、マルチプレイヤーなど発展の余地

### 推奨アプローチ

**Three.js + TypeScript + Cannon.js**で段階的に実装し、まずは既存レベルの3D化に集中。
その後VR専用レベルやマルチプレイヤーなど高度な機能を追加していく。

**開発開始時期**: Web版完成後すぐに着手可能。
**最初のプレイアブル版**: 4週間以内に実現可能。
