# Application Design Plan

## Design Checklist
- [ ] Generate components.md
- [ ] Generate component-methods.md
- [ ] Generate services.md
- [ ] Generate component-dependency.md
- [ ] Generate application-design.md (consolidated)
- [ ] Validate design completeness

---

## Design Decisions Requiring Input

spec.md defines physics, fuel, visuals, and game rules in detail. Only two architecture decisions are left open that the spec does not address.

---

## Question 1: src/app/ フォルダ構成
ゲームのソースコードをどのように `src/app/` 以下に配置しますか？

A) **フラット＋screens/** — ゲームエンティティ（Ship, Platform, FuelItem, Starfield, JetParticleSystem）は `src/app/game/` サブディレクトリに、画面は `src/app/screens/` に配置。定数は `src/app/config/GameParams.ts`。（推奨 — エンジンの既存構成と一致）
B) **すべて screens/ 以下** — GameScreen の子モジュールとして `src/app/screens/game/` にエンティティを配置。
C) **フラット** — `src/app/` 直下にすべて置く（小規模ならシンプル）
X) Other（[Answer]: の後に記述）

[Answer]: A

---

## Question 2: ゲームエンティティの設計方針
Ship / Platform / FuelItem / Starfield / JetParticleSystem などのゲームオブジェクトをどのように実装しますか？

A) **PIXI.Container サブクラス** — 各エンティティが `extends Container` を持ち、描画 (`PIXI.Graphics`) と状態（位置・速度）を自己管理。GameScreen からステージへ直接 `addChild(ship)` できる。（推奨 — PixiJS の自然なパターン）
B) **データクラス + 個別 Graphics** — エンティティは純粋なデータ（位置・速度）を持つクラスで、描画は GameScreen が別途 `PIXI.Graphics` を管理。
X) Other（[Answer]: の後に記述）

[Answer]: A

---

## Fixed Design Decisions (no input needed)

以下は spec.md とエンジンアーキテクチャから自動的に決定されます。

| 決定事項 | 方針 |
|---|---|
| 物理演算 | spec §3 の式をそのまま実装。`GAME_PARAMS` 定数オブジェクト一箇所で管理。 |
| ゲームループ | GameScreen の `update(ticker)` メソッド → エンジンが自動的に ticker に登録/解除。 |
| カメラ | World コンテナ（`PIXI.Container`）を左シフトしてスクロール。ship.x > 40% 幅でシフト量を計算。 |
| 燃料 FSM | 3ステート: `CONSUMING` / `COOLDOWN` / `CHARGING`。GameScreen.update() 内で管理。 |
| プラットフォーム生成 | GameScreen 内の `PlatformGenerator` ヘルパークラス（または単純な関数）で実装。 |
| 当たり判定 | AABB。GameScreen.update() 内でシンプルに実装。 |
| ハイスコア永続化 | `userSettings.ts` に `highScore` フィールドを追加。`engine/utils/storage.ts` を利用。 |
| 画面ナビゲーション | `engine().navigation.showScreen()` でTitleScreen / GameScreen / ScoreScreen を切り替え。 |
| アセット | なし（`PIXI.Graphics` のみ）。`static assetBundles = []` で空バンドル。 |
| ポーズ | `GameScreen.blur()` で `navigation.presentPopup(PausePopup)` を呼ぶ。既存の PausePopup を流用。 |
