# Hex-a-Hop リファクタリング計画

## 概要

このドキュメントは、Hex-a-Hopプロジェクト（Android C++版とWeb TypeScript版）のリファクタリング計画をまとめたものです。コードベース全体を分析し、品質向上とメンテナンス性改善のための具体的な提案を記載しています。

**作成日**: 2025-11-19
**対象**: Android版 (C++) および Web版 (TypeScript)
**総推定工数**: 140-220時間

---

## プロジェクト構造

```
hex-a-hop-per/
├── DemoGame/                     # Android版 (C++/Java/SDL2)
│   └── app/src/main/jni/src/src/ # C++ゲームロジック (3,861行)
└── hex-a-hop-web/                # Web版 (TypeScript/Canvas)
    └── src/                      # TypeScriptソース (Phase 1完了)
```

---

## 🔴 重大な問題（Critical Issues）

### 1. **コードの重複**

#### 1.1 main()関数の完全重複
- **場所**:
  - `gfx.cpp` (251行)
  - `hex_puzzzle.cpp` (251行)
- **問題**: 全く同じコードが2つのファイルに存在
- **影響**: メンテナンス時の修正漏れ、バグ混入のリスク
- **推定工数**: 4-6時間

**対策**:
```cpp
// 提案: main.cppを新規作成し、一箇所にまとめる
// main.cpp
#include "game.h"
#include "gfx.h"

int main(int argc, char* argv[]) {
    // 統一されたmain関数
}
```

#### 1.2 InitScreen()関数の重複
- **場所**:
  - `gfx.cpp` (86行)
  - `hex_puzzzle.cpp` (86行)
- **問題**: ほぼ同一のコードが重複
- **推定工数**: 2-3時間

**対策**: 共通ヘッダーに移動するか、gfx.cppに一本化

#### 1.3 タイル操作ロジックの重複
- **場所**: `hex_puzzzle.cpp`
  - `Swap()` 関数
  - `Replace()` 関数
- **問題**: タイルのイテレーションパターンが繰り返し出現
- **推定工数**: 3-4時間

**対策**: タイルイテレーション用のヘルパー関数を作成

---

### 2. **モノリシックなファイル構造（God Object）**

#### 2.1 hex_puzzzle.cpp - 3,861行の巨大ファイル
- **問題**: 1つのファイルに以下7つの責務が混在
  1. ゲーム状態管理
  2. 入力処理
  3. ゲームロジック
  4. レンダリング
  5. オーディオ制御
  6. ファイルI/O
  7. UI管理

- **影響**:
  - コードの理解が困難
  - テストが書きにくい
  - 並行開発が困難
  - コンパイル時間の増加

- **推定工数**: 40-60時間

**リファクタリング提案**:

```
現在:
hex_puzzzle.cpp (3,861行) - すべての機能

提案:
├── game_state.cpp         # ゲーム状態管理 (400-500行)
├── game_logic.cpp         # ゲームロジック (800-1000行)
├── input_handler.cpp      # 入力処理 (300-400行)
├── level_loader.cpp       # レベル読み込み (400-500行)
├── rendering.cpp          # レンダリング (600-700行)
├── ui_manager.cpp         # UI管理 (500-600行)
└── audio_manager.cpp      # オーディオ (200-300行)
```

---

### 3. **グローバル変数の乱用**

#### 3.1 グローバル変数リスト（22個以上）
```cpp
// hex_puzzzle.cpp より
int scrollX, scrollY;              // スクロール位置
int mapRightBound;                 // マップ境界
// マウス状態
int mouse_x, mouse_y, mouse_oldx, mouse_oldy;
// ウィンドウ状態
int fullscreen, windowed_w, windowed_h;
// その他多数...
```

- **問題**:
  - テストが困難
  - 依存関係が不明確
  - スレッドセーフでない
  - デバッグが困難

- **推定工数**: 20-30時間

**対策**: 依存性注入パターンの適用

```cpp
// 提案: GameContextクラスにまとめる
class GameContext {
public:
    struct ScrollState {
        int x, y;
        int mapRightBound;
    };

    struct MouseState {
        int x, y;
        int oldX, oldY;
    };

    ScrollState scroll;
    MouseState mouse;
    WindowState window;
};

// 各関数に必要なコンテキストを渡す
void UpdateGame(GameContext& ctx);
void RenderScene(const GameContext& ctx);
```

---

### 4. **マジックナンバーの氾濫**

#### 4.1 例（60個以上の未定義定数）
```cpp
// hex_puzzzle.cppより抜粋
if (special == 512) { ... }          // 512とは？
animTimer = 0.3;                     // 0.3秒の意味は？
if (tileInfo[t].height > 20) { ... } // 20の基準は？
```

- **問題**: コードの意図が不明瞭
- **推定工数**: 8-12時間

**対策**: 名前付き定数の導入

```cpp
// constants.h
namespace GameConstants {
    constexpr int SPECIAL_TRAP_ACTIVATED = 512;
    constexpr double DEFAULT_ANIM_DURATION = 0.3;
    constexpr int TILE_HEIGHT_THRESHOLD = 20;
}

// 使用例
if (special == GameConstants::SPECIAL_TRAP_ACTIVATED) { ... }
```

---

### 5. **メガSwitch文**

#### 5.1 ActivateSpecial関数 (hex_puzzzle.cpp:3238-3400)
- **行数**: 162行
- **case数**: 14+
- **ネストレベル**: 最大8階層
- **問題**:
  - 可読性が極めて低い
  - 新しい特殊タイルの追加が困難
  - テストが困難

- **推定工数**: 15-20時間

**対策**: Strategyパターンの適用

```cpp
// 提案: ポリモーフィズムで置き換え
class TileEffect {
public:
    virtual void activate(GameState& state) = 0;
    virtual ~TileEffect() = default;
};

class TrapEffect : public TileEffect {
    void activate(GameState& state) override {
        // トラップの処理
    }
};

class TrampolineEffect : public TileEffect {
    void activate(GameState& state) override {
        // トランポリンの処理
    }
};

// ファクトリーで生成
std::unique_ptr<TileEffect> createEffect(int tileType) {
    switch(tileType) {
        case TRAP: return std::make_unique<TrapEffect>();
        case TRAMPOLINE: return std::make_unique<TrampolineEffect>();
        // ...
    }
}
```

---

## 🟡 中程度の問題（Medium Priority）

### 6. **深いネスト構造**

- **最大ネスト**: 8階層（推奨: 3-4階層）
- **影響**: 認知負荷の増大、バグの混入
- **推定工数**: 12-16時間

**対策**:
- Early returnパターンの適用
- ガード句の導入
- ヘルパー関数への分割

```cpp
// Before (ネスト深い)
void ProcessTile(int x, int y) {
    if (IsValid(x, y)) {
        if (!IsEmpty(x, y)) {
            if (CanActivate(x, y)) {
                // 処理...
            }
        }
    }
}

// After (Early return)
void ProcessTile(int x, int y) {
    if (!IsValid(x, y)) return;
    if (IsEmpty(x, y)) return;
    if (!CanActivate(x, y)) return;

    // 処理...
}
```

---

### 7. **アーキテクチャの問題**

#### 7.1 密結合（Tight Coupling）
- **問題**: ゲームロジックがレンダラーとオーディオに直接依存
- **例**:
```cpp
// ゲームロジック内でレンダリング関数を直接呼び出し
void UpdateGameLogic() {
    // ロジック処理
    RenderTile(x, y);  // ❌ 結合が強すぎる
    PlaySound(SFX_JUMP); // ❌ 結合が強すぎる
}
```

- **推定工数**: 25-35時間

**対策**: MVCパターンの導入

```cpp
// Model: ゲームロジック（純粋な計算）
class GameModel {
    void update(float deltaTime);
    GameState getState() const;
};

// View: レンダリング
class GameView {
    void render(const GameState& state);
};

// Controller: 入力とイベント
class GameController {
    void handleInput(const Input& input);
    void processEvents();
};
```

---

### 8. **デッドコード（Dead Code）**

- **場所**: 多数のコメントアウトされたコード
```cpp
//#define CHEAT
//#define BMP_SUFFIX ".bmp"
// ... 大量のコメントアウト
```

- **問題**: コードの肥大化、混乱の原因
- **推定工数**: 4-6時間

**対策**: 不要なコードを削除、必要なら機能フラグで管理

---

## 🟢 軽微な問題（Low Priority）

### 9. **タイル抽象化の欠如**

- **問題**: タイルがenumとして定義され、振る舞いがない
- **推定工数**: 10-15時間

**対策**: Tileクラスの導入

```cpp
class Tile {
protected:
    Position pos;
    int strength;
    TileType type;

public:
    virtual bool canStepOn() const = 0;
    virtual void onStep(Player& player) = 0;
    virtual void render(Renderer& r) const = 0;
};

class CollapsibleTile : public Tile {
    bool canStepOn() const override { return strength > 0; }
    void onStep(Player& player) override {
        strength--;
        if (strength <= 0) collapse();
    }
};
```

---

### 10. **テストの欠如**

- **現状**: テストフレームワークなし
- **影響**: リファクタリング時の安全性が低い
- **推定工数**: 20-30時間（初期セットアップ + 基本テスト）

**提案**:
1. Google Testの導入（C++）
2. Jest/Vitestの導入（TypeScript）
3. 主要機能の単体テスト作成
4. 統合テストの作成

```cpp
// C++ テスト例
TEST(TileTest, CollapsibleTileReducesStrength) {
    CollapsibleTile tile(Position{0, 0}, 3);
    Player player;

    tile.onStep(player);
    EXPECT_EQ(tile.getStrength(), 2);

    tile.onStep(player);
    tile.onStep(player);
    EXPECT_TRUE(tile.isCollapsed());
}
```

---

## Web版（TypeScript）の考慮事項

### 現状評価
- ✅ **良い点**:
  - クリーンな構造（Phase 1完了）
  - TypeScriptの型安全性
  - モジュール分割が適切
  - GameLoop、Rendererが適切に分離

- ⚠️ **注意点**:
  - C++の問題を継承しないこと
  - Phase 2以降で適切な設計を維持

### 推奨アプローチ

#### 1. C++からの移植方針
```
❌ 避けるべき: C++コードの直訳
✅ 推奨: 設計を改善しながら移植
```

#### 2. 設計パターンの適用

```typescript
// 良い例: Composition over Inheritance
interface TileBehavior {
  onStep(player: Player): void;
  canStepOn(): boolean;
}

class Tile {
  constructor(
    private type: TileType,
    private behavior: TileBehavior
  ) {}

  step(player: Player): void {
    if (this.behavior.canStepOn()) {
      this.behavior.onStep(player);
    }
  }
}

// 振る舞いを組み合わせ可能
class CollapsibleBehavior implements TileBehavior {
  constructor(private strength: number) {}

  canStepOn(): boolean { return this.strength > 0; }

  onStep(player: Player): void {
    this.strength--;
  }
}
```

#### 3. イベント駆動アーキテクチャ

```typescript
// レンダラーとロジックの分離
class GameEngine {
  private eventBus: EventEmitter;

  update(deltaTime: number): void {
    // ゲームロジック
    if (tileCollapsed) {
      this.eventBus.emit('tile:collapsed', { x, y });
    }
  }
}

class GameRenderer {
  constructor(eventBus: EventEmitter) {
    eventBus.on('tile:collapsed', this.renderCollapse.bind(this));
  }

  private renderCollapse(data: {x: number, y: number}): void {
    // アニメーション再生
  }
}
```

#### 4. 状態管理

```typescript
// グローバル変数を避け、状態管理を一元化
interface GameState {
  player: PlayerState;
  tiles: Map<string, Tile>;
  camera: CameraState;
  input: InputState;
}

class StateManager {
  private state: GameState;
  private history: GameState[] = [];

  setState(newState: Partial<GameState>): void {
    this.history.push({...this.state});
    this.state = {...this.state, ...newState};
  }

  undo(): void {
    if (this.history.length > 0) {
      this.state = this.history.pop()!;
    }
  }
}
```

---

## リファクタリング優先順位

### Priority 1 (Critical) - 即座に対応すべき
1. **main()関数の重複を除去** (4-6時間)
   - 影響: 最大
   - 工数: 最小
   - ROI: 非常に高い

2. **hex_puzzzle.cppの分割** (40-60時間)
   - 影響: 最大
   - 工数: 大
   - ROI: 高い
   - 備考: 段階的に実施可能

3. **InitScreen()の重複除去** (2-3時間)
   - 影響: 中
   - 工数: 最小
   - ROI: 高い

### Priority 2 (High) - 近い将来に対応
4. **グローバル変数の整理** (20-30時間)
   - テストフレームワーク導入と並行実施推奨

5. **メガSwitch文のリファクタリング** (15-20時間)
   - Strategyパターン適用

6. **マジックナンバーの定数化** (8-12時間)
   - 段階的に実施可能

### Priority 3 (Medium) - 中期的に対応
7. **深いネストの解消** (12-16時間)

8. **アーキテクチャ改善（MVC導入）** (25-35時間)

9. **デッドコードの除去** (4-6時間)

### Priority 4 (Low) - 長期的に対応
10. **タイル抽象化** (10-15時間)

11. **テストフレームワーク導入** (20-30時間)
    - 最優先で実施すべきとも言える
    - リファクタリングの安全網として重要

---

## 実装ロードマップ

### Phase 1: 基盤整備 (2-3週間)
```
Week 1-2:
├── テストフレームワーク導入
├── CI/CD環境構築
└── コード重複の除去
    ├── main()関数統合
    └── InitScreen()統合

Week 3:
├── マジックナンバーの定数化
└── デッドコード除去
```

### Phase 2: 構造改善 (4-6週間)
```
Week 4-7:
├── hex_puzzzle.cpp分割
│   ├── game_state.cpp
│   ├── game_logic.cpp
│   ├── input_handler.cpp
│   └── level_loader.cpp
└── グローバル変数整理
    └── GameContextクラス導入

Week 8-9:
├── メガSwitch文リファクタリング
└── ネスト解消
```

### Phase 3: アーキテクチャ改善 (3-4週間)
```
Week 10-12:
├── MVCパターン導入
├── タイル抽象化
└── イベント駆動設計

Week 13:
└── 統合テスト・パフォーマンステスト
```

### Web版並行開発
```
Phase 2-3期間中:
├── C++リファクタリング済みの設計をTypeScriptで実装
├── 改善された設計パターンを適用
└── テスト駆動開発で進行
```

---

## メトリクス・KPI

### 改善目標

| 指標 | 現状 | 目標 | 改善率 |
|------|------|------|--------|
| 最大ファイルサイズ | 3,861行 | <800行 | -80% |
| 平均関数サイズ | ~50行 | <30行 | -40% |
| 最大ネスト深度 | 8階層 | ≤4階層 | -50% |
| グローバル変数数 | 22+ | <5 | -77% |
| マジックナンバー | 60+ | <10 | -83% |
| コードカバレッジ | 0% | >70% | +70% |
| コード重複率 | ~15% | <3% | -80% |

### 測定方法

```bash
# 複雑度測定（C++）
lizard DemoGame/app/src/main/jni/src/src/

# コードカバレッジ（C++）
gcov -r hex_puzzzle.cpp

# 重複検出
cpd --minimum-tokens 100 --files DemoGame/app/src/main/jni/src/src/

# TypeScript
npm run test:coverage
npm run lint
```

---

## リスクと対策

### Risk 1: リファクタリングによるバグ混入
- **確率**: 高
- **影響**: 高
- **対策**:
  - テストフレームワークを最優先で導入
  - 段階的リファクタリング
  - 各段階でのテスト実施
  - ペアプログラミング/コードレビュー

### Risk 2: Web版への影響
- **確率**: 中
- **影響**: 中
- **対策**:
  - C++リファクタリング完了後にWeb版移植
  - または、Web版を先行して正しい設計で実装
  - 定期的な同期ミーティング

### Risk 3: 工数超過
- **確率**: 中
- **影響**: 中
- **対策**:
  - 優先順位の明確化
  - 段階的実施（各Phaseで動作確認）
  - 最小実装からスタート

---

## 次のステップ

### 即座に開始可能な作業

1. **テストフレームワーク導入** (1-2日)
   ```bash
   # Google Test (C++)
   git submodule add https://github.com/google/googletest.git

   # Jest/Vitest (TypeScript) - すでにViteで設定済み
   npm install -D vitest @vitest/ui
   ```

2. **main()関数重複の除去** (4-6時間)
   - 新規ファイル `main.cpp` 作成
   - gfx.cpp、hex_puzzzle.cppから削除
   - ビルド確認

3. **定数ヘッダー作成** (2-3時間)
   ```cpp
   // constants.h を新規作成
   namespace GameConstants { ... }
   ```

### 推奨順序

```
1. テスト環境構築 ← 最優先
2. 小規模リファクタリング（main重複除去など）でテスト
3. hex_puzzzle.cpp分割
4. グローバル変数整理
5. アーキテクチャ改善
```

---

## まとめ

### 主な発見

1. **Critical**: 3,861行のモノリシックファイル
2. **Critical**: 251行のコード完全重複（main関数）
3. **High**: 22個以上のグローバル変数
4. **High**: 162行のメガSwitch文
5. **Medium**: 最大8階層の深いネスト

### 期待される効果

- ✅ **保守性の向上**: ファイルサイズ80%削減
- ✅ **テスタビリティ**: カバレッジ0%→70%
- ✅ **可読性**: ネスト深度50%削減
- ✅ **拡張性**: 新機能追加が容易に
- ✅ **品質**: バグ混入リスク低減

### 総工数見積もり

- **最小**: 140時間 (Priority 1-2のみ)
- **推奨**: 180時間 (Priority 1-3まで)
- **完全**: 220時間 (すべて実施)

### 開発体制推奨

- **1人**: 4-6ヶ月（週10時間）
- **2人**: 2-3ヶ月（週20時間）
- **フルタイム**: 1-1.5ヶ月

---

## 参考資料

### デザインパターン
- Strategy Pattern: switch文の置き換え
- MVC Pattern: 責務の分離
- Factory Pattern: オブジェクト生成
- Observer Pattern: イベント駆動

### ツール
- **静的解析**: cppcheck, clang-tidy
- **複雑度測定**: lizard, cccc
- **重複検出**: CPD (Copy-Paste Detector)
- **カバレッジ**: gcov, lcov
- **TypeScript**: ESLint, Prettier, Vitest

### リファクタリング書籍
- "Refactoring" by Martin Fowler
- "Clean Code" by Robert C. Martin
- "Working Effectively with Legacy Code" by Michael Feathers

---

**作成者**: Claude (AI Assistant)
**最終更新**: 2025-11-19
**バージョン**: 1.0
