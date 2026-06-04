# Unit Test Execution

## Status: No Automated Test Runner Configured

This project has no test runner configured (confirmed in CLAUDE.md and package.json). The Property-Based Testing extension was explicitly disabled during Requirements Analysis (PBT = No).

## What the Build Provides Instead

TypeScript strict mode (`strict: true`, `noUnusedLocals`, `noUnusedParameters`) and ESLint provide static analysis:

```bash
# Type-check all source files (the closest equivalent to unit tests)
npx tsc --noEmit

# Lint + Prettier check
npm run lint

# Both together (as part of build)
npm run build
```

Both pass with zero errors or warnings (confirmed).

## Manual Logic Verification

Physics formulas, fuel FSM, and collision logic were verified during the runtime verification session (Build and Test stage). See `build-and-test-summary.md` for observed results.

## Future Test Setup

To add automated tests, install a test runner (e.g., Vitest) and create unit tests for:
- `Ship` fuel FSM state transitions
- `PlatformGenerator.step()` gap/difficulty formulas
- `GameScreen.checkCollisions()` AABB logic
- Score calculation (`totalScrolled / pixelsPerMeter`)
