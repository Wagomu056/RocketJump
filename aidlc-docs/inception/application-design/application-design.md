# Application Design — Spaceship Platform Runner

## Summary

A PixiJS v8 asset-less mobile-web game built entirely in `src/app/` on top of the unchanged `src/engine/`. Two units of work: Unit 1 (foundation + screens), Unit 2 (game entities + physics loop).

---

## File Structure

```
src/app/
  config/
    GameParams.ts           ← all GAME_PARAMS tuning constants (spec §7)
  game/
    Ship.ts                 ← player entity: physics state + fuel FSM + drawing
    Platform.ts             ← floating island: geometry + drawing
    FuelItem.ts             ← collectible item: drawing + upgrade effect
    Starfield.ts            ← background star layer + parallax scroll
    JetParticleSystem.ts    ← nozzle particle spawn/fade/destroy
    PlatformGenerator.ts    ← procedural platform + item spawner
  screens/
    TitleScreen.ts          ← title, high score display, START
    GameScreen.ts           ← game loop orchestrator
    ScoreScreen.ts          ← run score, high score update, RETRY/TITLE
  popups/                   ← (existing, unchanged)
  ui/                       ← (existing, unchanged)
  utils/
    userSettings.ts         ← extend: add highScore field
  getEngine.ts              ← (existing, unchanged)
src/main.ts                 ← modify: first screen = TitleScreen
```

---

## Components

### Config
- **GameParams** — plain `const` object; single source for all numeric tuning values.

### Screens (`AppScreen` + `Container`)
- **TitleScreen** — title glow + high score + START button; reads `userSettings.highScore`.
- **GameScreen** — owns and orchestrates all game entities via `update(ticker)`; manages world container, camera, pointer input, score, fuel UI, game-over.
- **ScoreScreen** — receives final distance score; compares + writes high score; RETRY/TITLE navigation.

### Game Entities (all `extend Container`)
- **Ship** — draws itself; owns `vx`, `vy`, `fuel`, `maxFuel`, fuel FSM state. `update()` applies physics each frame.
- **Platform** — draws body + green top line; exposes `getTopY()`, `getLeftX()`, `getRightX()` for AABB.
- **FuelItem** — draws glowing shape; `collect(ship)` upgrades fuel + maxFuel.
- **Starfield** — random stars; `scroll(worldOffsetX)` for parallax.
- **JetParticleSystem** — `emit(x, y, angle)` spawns particles; `update()` fades/removes them.

### Helper
- **PlatformGenerator** — tracks spawn frontier; `generate(cameraRight, score)` returns new Platform/FuelItem objects; `collectStale(cameraLeft)` returns objects ready to destroy.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entity base class | `extends Container` | PixiJS natural pattern; `addChild` / world transforms work automatically |
| Folder layout | `game/` + `screens/` + `config/` | Consistent with existing engine conventions |
| Physics location | Inside `Ship.update()` | Ship owns its state; GameScreen supplies pointer context |
| Camera | `worldContainer.x` shift | One-liner per frame; all entities in worldContainer move together |
| Fuel FSM | Inside `Ship` | Encapsulation; GameScreen just reads `ship.fuelState` for UI |
| Score passing | `ScoreScreen.setScore(n)` + `navigation.showScreen` | Clean; no shared mutable global needed |
| Pause | `GameScreen.blur()` → `presentPopup(PausePopup)` | Reuses existing engine pause flow |

---

## Service Orchestration (abbreviated)

```
Engine ticker
  └─► GameScreen.update()
        ├─ ship.update()          physics + fuel
        ├─ particles.update()     fade/shrink
        ├─ items.update()         glow anim
        ├─ generator.generate()   spawn new platforms
        ├─ generator.collectStale() destroy old platforms
        ├─ checkCollisions()      AABB: land / collect item
        ├─ updateCamera()         worldContainer.x shift
        ├─ checkGameOver()        → ScoreScreen
        └─ updateUI()             score label + fuel gauge

userSettings.highScore: read (TitleScreen) | compare+write (ScoreScreen)
```

---

## References
- `components.md` — full component descriptions
- `component-methods.md` — full method signatures
- `services.md` — navigation, input, and render loop orchestration
- `component-dependency.md` — dependency matrix + data flow diagram
