# Services

This is a single-player browser game with no backend. "Services" here means the runtime orchestration layer — how the screens, engine plugins, and helpers coordinate.

---

## Navigation Service (engine-provided)

**Provider**: `engine().navigation` (NavigationPlugin — existing, unchanged)

**Responsibilities**:
- Screen lifecycle management (`showScreen`, `presentPopup`, `dismissPopup`).
- Ticker registration: when a screen has `update(ticker)`, the engine auto-registers it while shown and removes it when hidden.
- Pooling: screens are reused via `BigPool`; `reset()` must restore state.

**Flows driven by navigation**:

```
LoadScreen → TitleScreen         (main.ts at startup)
TitleScreen →[START]→ GameScreen
GameScreen  →[fall]→ ScoreScreen
ScoreScreen →[RETRY]→ GameScreen
ScoreScreen →[TITLE]→ TitleScreen
GameScreen  →[blur]→ PausePopup  (overlay; GameScreen paused)
```

---

## High Score Service (thin wrapper in userSettings)

**Provider**: `src/app/utils/userSettings.ts` (extension of existing module)

**Responsibilities**:
- Read/write the `highScore` value in `localStorage` via `engine/utils/storage.ts`.
- `TitleScreen` reads on `reset()` to display current best.
- `ScoreScreen.show()` compares run score, writes if beaten, shows celebration text.

---

## Input Service (inline in GameScreen)

**Provider**: Pointer events on `engine().app.stage` (or the `worldContainer`), managed within `GameScreen`.

**Responsibilities**:
- Capture `pointerdown`, `pointermove`, `pointerup`/`pointercancel` to track `isPointerDown`, `pointerX`, `pointerY`.
- Registered in `GameScreen.show()` / removed in `GameScreen.hide()`.
- No separate class needed; the state is private to `GameScreen`.

---

## Render/Physics Loop (engine-provided ticker)

**Provider**: PixiJS `Ticker` via engine (auto-registered for screens with `update`).

**Flow per frame**:
1. Engine ticker calls `GameScreen.update(ticker)`.
2. `GameScreen` calls `ship.update(ticker, pointerActive, angle)` → physics + fuel FSM.
3. `GameScreen` calls `jetParticles.update(ticker)` → fade/shrink particles; if thrusting, `jetParticles.emit(...)`.
4. `GameScreen` calls `platform.update?` / `fuelItem.update(ticker)` (animation only).
5. `GameScreen.checkCollisions()` → AABB ship ↔ platforms and items.
6. `GameScreen.updateCamera(Δx)` → shift `worldContainer.x`.
7. `GameScreen.checkGameOver()` → if ship below screen, navigate to `ScoreScreen`.
8. `GameScreen.updateScoreUI()` + `updateFuelUI()`.
9. `PlatformGenerator.generate(...)` / `collectStale(...)` → add/destroy platform nodes.

---

## Asset Service (engine-provided, minimal)

All screens declare `static assetBundles = []` — no assets to load. The engine's LoadScreen handles the initial load; no additional loading is needed for any game screen.
