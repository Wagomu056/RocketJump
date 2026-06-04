# Unit of Work Plan

## Assessment: No Questions Needed
All decomposition decisions are fully resolved by the application design (Q1=A, Q2=A) and the execution plan. No user input required — proceeding directly to generation.

## Decomposition Approach
- **Strategy**: Sequential (Unit 1 first → Unit 2 depends on it)
- **Model**: Monorepo single-package; logical modules within one TypeScript project
- **Solo developer**: No team alignment concerns

## Planned Artifacts
- [x] `unit-of-work.md` — unit definitions and file lists
- [x] `unit-of-work-dependency.md` — dependency matrix
- [x] `unit-of-work-story-map.md` — feature → unit mapping
- [x] Validate unit boundaries

## Unit Summary

### Unit 1: Foundation + Screens
**Files to create / modify:**
- `src/app/config/GameParams.ts` (create)
- `src/app/utils/userSettings.ts` (modify — add highScore)
- `src/main.ts` (modify — wire TitleScreen)
- `src/app/screens/TitleScreen.ts` (create)
- `src/app/screens/ScoreScreen.ts` (create)

**Files to delete (demo):**
- `src/app/screens/main/MainScreen.ts`
- `src/app/screens/main/Bouncer.ts`
- `src/app/screens/main/Logo.ts`

### Unit 2: GameScreen
**Files to create:**
- `src/app/game/Ship.ts`
- `src/app/game/Platform.ts`
- `src/app/game/FuelItem.ts`
- `src/app/game/Starfield.ts`
- `src/app/game/JetParticleSystem.ts`
- `src/app/game/PlatformGenerator.ts`
- `src/app/screens/GameScreen.ts`
