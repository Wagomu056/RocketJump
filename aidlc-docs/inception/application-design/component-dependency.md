# Component Dependencies

## Dependency Matrix

| Component | Depends On |
|-----------|-----------|
| `main.ts` | `TitleScreen`, `engine()` |
| `TitleScreen` | `engine().navigation`, `userSettings`, `GAME_PARAMS`, UI (`Button`, `Label`) |
| `GameScreen` | `engine().navigation`, `userSettings`, `GAME_PARAMS`, `Ship`, `Platform`, `FuelItem`, `Starfield`, `JetParticleSystem`, `PlatformGenerator`, `PausePopup`, UI |
| `ScoreScreen` | `engine().navigation`, `userSettings`, `GAME_PARAMS`, UI (`Button`, `Label`) |
| `Ship` | `GAME_PARAMS` |
| `Platform` | _(none — pure display object)_ |
| `FuelItem` | `Ship` (to apply upgrade in `collect()`) |
| `Starfield` | _(none)_ |
| `JetParticleSystem` | _(none)_ |
| `PlatformGenerator` | `Platform`, `FuelItem`, `GAME_PARAMS` |
| `userSettings` | `engine/utils/storage.ts` |
| `GAME_PARAMS` | _(none — plain constant)_ |

---

## Communication Patterns

### Screen → Screen (via Navigation Service)
All transitions go through `engine().navigation.showScreen(Ctor)`. Screens never import each other directly.

```
TitleScreen  ──[navigation]──►  GameScreen
GameScreen   ──[navigation]──►  ScoreScreen
ScoreScreen  ──[navigation]──►  GameScreen (RETRY)
ScoreScreen  ──[navigation]──►  TitleScreen (TITLE)
GameScreen   ──[navigation]──►  PausePopup (blur)
```

### Score Passing (GameScreen → ScoreScreen)
`GameScreen` cannot call `ScoreScreen` directly before navigation, so it passes the score via `navigation.showScreen(ScoreScreen, { score })` — or, simpler: stores the last score in a module-level singleton / on `userSettings` as `lastScore`, then `ScoreScreen.prepare()` or `ScoreScreen.show()` reads it. (**Chosen approach**: call `scoresScreen.setScore(distance)` via the navigation `prepare` callback if supported, or store on `userSettings` as a transient field.)

### GameScreen → Entities (direct ownership)
`GameScreen` owns all entity instances. It calls `update()` on them each frame and reads geometry for collision. Entities do not hold references back to `GameScreen`.

### FuelItem → Ship (upgrade on collect)
`FuelItem.collect(ship)` directly modifies `ship.fuel` and `ship.maxFuel`. `GameScreen` calls this when overlap detected; this is the only cross-entity reference.

---

## Data Flow Diagram

```
[Pointer Events]
       |
       v
[GameScreen.update()]
       |
       +──► Ship.update(ticker, pointerActive, angle)
       |         |── physics (vx, vy, position)
       |         └── fuel FSM (consuming/cooldown/charging)
       |
       +──► JetParticleSystem.update() / emit()
       |
       +──► FuelItem.update() (glow anim)
       |
       +──► PlatformGenerator.generate() ──► addChild(Platform, FuelItem) to worldContainer
       |
       +──► PlatformGenerator.collectStale() ──► destroy(Platform)
       |
       +──► checkCollisions()
       |         |── ship bottom ↔ platform top → ship.land()
       |         └── ship AABB ↔ fuelItem → fuelItem.collect(ship)
       |
       +──► updateCamera() ──► worldContainer.x shift + Starfield.scroll()
       |
       +──► checkGameOver() ──► navigation.showScreen(ScoreScreen)
       |
       +──► updateScoreUI() + updateFuelUI()

[userSettings.highScore] ◄──── ScoreScreen (read + write)
                         ──────► TitleScreen (read)
```

---

## Layer Diagram

```
src/engine/  (STABLE — never modified)
    CreationEngine
    NavigationPlugin / AudioPlugin / ResizePlugin
    storage.ts

src/app/  (ALL game work)
    config/
        GameParams.ts           (leaf — no deps)
    utils/
        userSettings.ts         (storage.ts)
    game/
        Ship.ts                 (GameParams)
        Platform.ts             (none)
        FuelItem.ts             (Ship)
        Starfield.ts            (none)
        JetParticleSystem.ts    (none)
        PlatformGenerator.ts    (Platform, FuelItem, GameParams)
    screens/
        TitleScreen.ts          (navigation, userSettings, GameParams, ui/)
        GameScreen.ts           (navigation, userSettings, GameParams, game/*, ui/, PausePopup)
        ScoreScreen.ts          (navigation, userSettings, ui/)
    main.ts                     (engine, TitleScreen, LoadScreen)
```
