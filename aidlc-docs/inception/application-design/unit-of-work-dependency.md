# Unit of Work — Dependency Matrix

## Inter-Unit Dependencies

| Unit | Depends On | Nature |
|------|-----------|--------|
| Unit 1: Foundation + Screens | `src/engine/` (stable, unchanged) | Uses NavigationPlugin, storage |
| Unit 2: GameScreen | Unit 1 (`GAME_PARAMS`, `userSettings.highScore`, `TitleScreen`, `ScoreScreen`) | Build-time import + navigation target |

**Constraint**: Unit 1 must be completed and compiling before Unit 2 is started.

## File-Level Dependency Graph

```
src/engine/                          (untouched)
    storage.ts
    navigation/
    ...

Unit 1
    GameParams.ts          ← no deps
    userSettings.ts        ← storage.ts
    TitleScreen.ts         ← GameParams, userSettings, engine().navigation, ui/
    ScoreScreen.ts         ← userSettings, engine().navigation, ui/
    main.ts                ← engine, TitleScreen, LoadScreen

Unit 2 (depends on Unit 1)
    Ship.ts                ← GameParams
    Platform.ts            ← (none)
    FuelItem.ts            ← Ship
    Starfield.ts           ← (none)
    JetParticleSystem.ts   ← (none)
    PlatformGenerator.ts   ← Platform, FuelItem, GameParams
    GameScreen.ts          ← all of game/, GameParams, userSettings,
                             engine().navigation, TitleScreen*, ScoreScreen*,
                             PausePopup, ui/
                             (* via navigation.showScreen — import for type only)
```

## Update Strategy
- **Sequential**: Complete Unit 1 (compile + build-clean) → then Unit 2.
- **Rollback**: If Unit 2 fails to compile, Unit 1 is already stable and the engine is untouched.
- **Testing checkpoint**: After Unit 1 — `npm run build` must pass with TitleScreen and ScoreScreen navigable (even with an empty/stub GameScreen).
