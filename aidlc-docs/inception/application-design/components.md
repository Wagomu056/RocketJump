# Components

## File Layout (Q1=A)

```
src/app/
  config/
    GameParams.ts         ← GAME_PARAMS constants
  game/
    Ship.ts               ← player ship entity
    Platform.ts           ← floating platform entity
    FuelItem.ts           ← collectible fuel-tank item
    Starfield.ts          ← scrolling star background
    JetParticleSystem.ts  ← nozzle particle FX
    PlatformGenerator.ts  ← procedural platform/item spawner
  screens/
    TitleScreen.ts        ← title + START + high score
    GameScreen.ts         ← main game loop screen
    ScoreScreen.ts        ← end-of-run score + RETRY/TITLE
  popups/
    PausePopup.ts         ← (existing, reused unchanged)
    SettingsPopup.ts      ← (existing, reused unchanged)
  ui/                     ← (existing, reused unchanged)
  utils/
    userSettings.ts       ← extend: add highScore field
  getEngine.ts            ← (existing, unchanged)
src/main.ts               ← modify: wire TitleScreen first
```

---

## Component Descriptions (Q2=A — all entities extend Container)

### Config

#### `GameParams` (`src/app/config/GameParams.ts`)
- **Type**: Plain constant object (not a class).
- **Responsibility**: Single source of truth for all tuning values (physics, fuel, camera, platform generation, item effects) as specified in spec §7. Imported by any module that needs a tuning parameter.

---

### Screens (extend `Container`, implement `AppScreen` interface)

#### `TitleScreen`
- **Responsibility**: Display the game title with glow, the current high score from localStorage, and a START button. On START tap, navigate to `GameScreen`.
- **Lifecycle hooks used**: `show()`, `hide()`, `reset()`, `resize(w, h)`.

#### `GameScreen`
- **Responsibility**: Orchestrate the entire gameplay loop. Owns and updates all game entities: `Starfield`, `Ship`, `PlatformGenerator` (and its `Platform`/`FuelItem` children), `JetParticleSystem`. Manages the world container (for camera scrolling), pointer input, score tracking, fuel UI, and game-over detection. On game-over, passes the final score to `ScoreScreen` and navigates there.
- **Lifecycle hooks used**: `update(ticker)` (auto-registered by engine), `show()`, `hide()`, `pause()`, `resume()`, `reset()`, `blur()`, `resize(w, h)`.
- **Key internal state**: `worldContainer: Container`, `score: number`, `isPointerDown: boolean`, `pointerX/Y: number`.

#### `ScoreScreen`
- **Responsibility**: Display the run's distance score, detect and announce a new high score (updating localStorage), and offer RETRY (→ `GameScreen`) and TITLE (→ `TitleScreen`) buttons.
- **Lifecycle hooks used**: `prepare()` (receives score before `show()`), `show()`, `hide()`, `reset()`, `resize(w, h)`.

---

### Game Entities (extend `Container`, live in `worldContainer` of `GameScreen`)

#### `Ship`
- **Responsibility**: Represent the player's spaceship. Draws itself (cyan `#00e5ff` rocket polygon) using `PIXI.Graphics`. Owns physics state (`vx`, `vy`) and fuel state (`fuel`, `maxFuel`, FSM state + cooldown timer). Exposes an `update` method that takes pointer state and applies thrust, gravity, and friction each frame.
- **Key state**: `vx`, `vy`, `fuel`, `maxFuel`, `fuelState: FuelState`.

#### `Platform`
- **Responsibility**: Represent one floating island. Draws the body (`#1a1a24` rounded rect) and top surface line (`#39ff14`). Exposes bounding-box geometry for collision queries.
- **Key state**: `platformWidth`, `platformHeight` (height of the block, not its y-position).

#### `FuelItem`
- **Responsibility**: Represent a collectible fuel-tank on top of a platform. Draws a glowing shape (`#ff007f`). Tracks `collected` state. Exposes `collect()` which applies the fuel/maxFuel upgrade to the `Ship`.
- **Key state**: `collected: boolean`.

#### `Starfield`
- **Responsibility**: Draw a layer of randomized stars (white dots, varying radius/alpha) behind the platforms. Provides a `scroll(dx)` method so `GameScreen` can drive parallax motion at a slower rate than the world.

#### `JetParticleSystem`
- **Responsibility**: Manage the pool of live jet-exhaust particles. Each particle is a small `PIXI.Graphics` square/circle emitted from the ship's nozzle. Particles shrink and fade each frame; dead ones (alpha ≤ 0) are removed from the stage and the pool.
- **Note**: Renders in the world container so particles move with the world — or in screen space above it; `GameScreen` decides placement.

---

### Helpers (not display objects)

#### `PlatformGenerator`
- **Responsibility**: Stateless-ish helper that tracks how far right platforms have been generated and spawns new `Platform` (and optionally `FuelItem`) objects ahead of the camera, with gap width / platform width scaling by difficulty. Returns newly created objects to `GameScreen` for `addChild`.
- **Key state**: `nextSpawnX: number`, `difficulty: number` (derived from score/distance).
