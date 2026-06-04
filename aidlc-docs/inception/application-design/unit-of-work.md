# Unit of Work Definitions

## Unit 1: Foundation + Screens

**Purpose**: Establish the game's configuration, persistence, and non-gameplay screens. Must be complete before Unit 2 can reference navigation targets or GAME_PARAMS.

**Functional Design**: SKIP (straightforward screen navigation + constant module)
**NFR Requirements**: SKIP
**NFR Design**: SKIP
**Infrastructure Design**: SKIP
**Code Generation**: EXECUTE

### Files — Create
| File | Role |
|------|------|
| `src/app/config/GameParams.ts` | Centralised GAME_PARAMS constant (spec §7 values) |
| `src/app/screens/TitleScreen.ts` | Title + high score display + START navigation |
| `src/app/screens/ScoreScreen.ts` | Run score display + high score update + RETRY / TITLE |

### Files — Modify
| File | Change |
|------|--------|
| `src/app/utils/userSettings.ts` | Add `highScore: number` (get/set via storage) |
| `src/main.ts` | Wire `TitleScreen` as first screen instead of `MainScreen` |

### Files — Delete (demo code)
| File |
|------|
| `src/app/screens/main/MainScreen.ts` |
| `src/app/screens/main/Bouncer.ts` |
| `src/app/screens/main/Logo.ts` |

---

## Unit 2: GameScreen

**Purpose**: The entire gameplay loop — physics, fuel, camera, procedural platforms, collision, jet particles, neon visuals, and game-over detection. Depends on Unit 1 for `GAME_PARAMS`, `userSettings.highScore`, and navigation targets (TitleScreen, ScoreScreen).

**Functional Design**: EXECUTE (complex physics FSM + platform generation + AABB)
**NFR Requirements**: SKIP
**NFR Design**: SKIP
**Infrastructure Design**: SKIP
**Code Generation**: EXECUTE

### Files — Create
| File | Role |
|------|------|
| `src/app/game/Ship.ts` | Player entity: vx/vy physics + fuel FSM + cyan drawing |
| `src/app/game/Platform.ts` | Floating island: neon-green top line + AABB geometry |
| `src/app/game/FuelItem.ts` | Collectible: glow drawing + fuel/maxFuel upgrade |
| `src/app/game/Starfield.ts` | Background stars + parallax scroll |
| `src/app/game/JetParticleSystem.ts` | Nozzle particle spawn / fade / remove |
| `src/app/game/PlatformGenerator.ts` | Procedural platform + item spawner |
| `src/app/screens/GameScreen.ts` | Game loop orchestrator |
