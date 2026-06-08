# Unit 4: Life System — Requirements

## Intent Analysis

**Request Type**: New Feature (Life System with Health Management)

**Scope**: GameScreen enhancements with parametric configuration for damage mechanics, visual effects, UI layout changes

**Complexity**: Moderate (multi-layered system with damage mechanics, visual feedback, particle effects, UI repositioning)

**Clarity**: Very High (user provided detailed specifications for all mechanics)

---

## Functional Requirements

### FR1: Damage System on Landing
- **Trigger**: Player lands (collides with platform) while falling at significant velocity
- **Mechanism**: Two-tier damage system based on landing velocity
  - **Small Damage Tier**: Velocity ≥ 300px/s → Deduct 25 HP
  - **Large Damage Tier**: Velocity ≥ 500px/s → Deduct 50 HP
  - **All thresholds and damage amounts must be configurable parameters** (stored in GAME_PARAMS)
  - Landing at lower velocities causes no damage
  
### FR2: Player Health Management
- **Initial Health**: 100 HP (maximum)
- **Health Display**: Horizontal progress bar positioned on the right side of screen
- **Bar Color Gradient**:
  - Green (100% - 51% health)
  - Yellow (50% - 26% health)
  - Red (25% - 1% health)
- **Game Over**: When health reaches 0 HP
  - Trigger ship explosion animation (0.5s)
  - Transition to GameOverScreen (same flow as falling off screen)
  - Reuse existing game over handling mechanism

### FR3: Visual Feedback on Damage
- **Flashing on Small Damage**: 
  - Color: Pure white flash
  - Duration: 0.6 seconds total
  - Blink frequency: ~6 blinks (flash on/off)
- **Flashing on Large Damage**:
  - Color: Red flash
  - Duration: 1.2 seconds total
  - Blink frequency: ~8 blinks (flash on/off)
- **Timing**: Configurable flash duration and frequency parameters in GAME_PARAMS

### FR4: Smoke Particle Effects (Health-Based)
- **At 25% Health or Below**: Light smoke emission
  - 1-2 smoke particles per frame
  - Spawn point: Ship center
  - Configurable particle count in GAME_PARAMS
- **At 10% Health or Below**: Heavy smoke emission
  - 3-5 smoke particles per frame
  - Spawn point: Ship center
  - Configurable particle count in GAME_PARAMS
- **Particle Characteristics**: Reuse existing smoke particle system (similar to fuel burn effects)

### FR5: UI Layout Reorganization
- **Jet Fuel Meter**: Move from current position to **left side** of screen
- **Health Bar**: Position on **right side** of screen
- **Mutual Exclusivity**: Fuel and health bars positioned on opposite sides for clear visual separation
- **Maintain Visual Consistency**: Both bars use same styling (horizontal bar format, consistent dimensions)

---

## Non-Functional Requirements

### NFR1: Performance
- Damage calculation: Occur once per platform collision (not per-frame)
- Flashing animation: Use efficiently (frame-based, not time-based intervals)
- Particle emissions: Maintained within existing performance budget
- No impact to frame rate during normal gameplay

### NFR2: Parameterization
- All numerical values must be configurable:
  - Damage thresholds (small, large)
  - Damage amounts (small, large)
  - Health capacity (max HP)
  - Flashing duration (small, large)
  - Smoke particle counts (25%, 10%)
  - Smoke thresholds (25%, 10%)
- All parameters stored in `GAME_PARAMS` for easy tuning

### NFR3: Reusability
- Reuse existing particle system for smoke effects
- Reuse existing game over flow (same as falling off screen)
- Follow established screen lifecycle hooks for updates

### NFR4: Code Quality
- TypeScript strict mode compliance
- No unused variables/parameters
- ESLint + Prettier formatting compliance
- Type-safe implementation

---

## User Scenarios

### Scenario 1: Gentle Landing
- Player lands on platform at 200px/s
- **Expected**: No damage, no visual feedback, health unchanged
- **Confirmation**: Health bar remains full (100 HP)

### Scenario 2: Small Damage Landing
- Player lands on platform at 350px/s
- **Expected**: Small damage (25 HP), white flash (0.6s), health bar updates
- **Confirmation**: Health bar shows 75 HP, white flashing visible for 0.6s

### Scenario 3: Large Damage Landing
- Player lands on platform at 600px/s
- **Expected**: Large damage (50 HP), red flash (1.2s), health bar updates
- **Confirmation**: Health bar shows 50 HP, red flashing visible for 1.2s

### Scenario 4: Multiple Landings
- Player lands multiple times, taking cumulative damage
- **Expected**: Health decreases incrementally, smoke effects trigger at thresholds
- **Confirmation**: At 25% health (25 HP), light smoke visible; at 10% health (10 HP), heavy smoke visible

### Scenario 5: Death Scenario
- Player's health reaches 0 HP during gameplay
- **Expected**: Ship explosion animation (0.5s), transition to GameOverScreen
- **Confirmation**: Explosion plays, then GameOverScreen displays with retry/title options

### Scenario 6: UI Layout
- Game displays both fuel and health meters
- **Expected**: Fuel meter on left, health bar on right, clear visual separation
- **Confirmation**: Both meters visible, no overlap, easily distinguishable

---

## Integration Points

### GameScreen Updates
- Add health state management (current HP, max HP)
- Add flashing state (active, duration, flash type)
- Add smoke emission logic (frame-based)
- Update collision detection to trigger damage on platform landing
- Modify lifecycle (`update()`) to handle health updates and smoke emission
- Modify UI layer to position health bar and move fuel meter

### GAME_PARAMS Extensions
- Add health system configuration object:
  ```
  health: {
    maxHealth: 100,
    smallDamageThreshold: 300,  // px/s
    smallDamageAmount: 25,
    largeDamageThreshold: 500,  // px/s
    largeDamageAmount: 50
  }
  ```
- Add flashing configuration:
  ```
  flashing: {
    smallDuration: 0.6,  // seconds
    smallBlinks: 6,
    largeDuration: 1.2,
    largeBlinks: 8
  }
  ```
- Add smoke configuration:
  ```
  smoke: {
    lightThreshold: 0.25,      // 25%
    lightParticlesPerFrame: 2,
    heavyThreshold: 0.10,      // 10%
    heavyParticlesPerFrame: 5
  }
  ```

### Explosion Animation
- Reuse or extend existing particle system for explosion effect
- Coordinate with game over transition (0.5s explosion → GameOverScreen)

### Game Over Flow
- Leverage existing game over mechanism (same as falling off screen)
- No new screen required, reuse existing GameOverScreen

---

## Key Decisions

1. **Health as Single Integer**: Simplified management (100 HP max, 0 HP minimum)
2. **Two-Tier Damage**: Rewards careful landing, encourages skill progression
3. **Opposing UI Placement**: Fuel (left) vs Health (right) creates natural visual balance
4. **Gradient Color Bar**: Provides intuitive health status at a glance
5. **Reuse Game Over Flow**: Consistent user experience, no new code paths needed
6. **Full Parameterization**: Enables easy difficulty tuning without code changes

---

## Success Criteria

- [ ] Damage triggers correctly based on landing velocity
- [ ] Health decreases and displays accurately
- [ ] Flashing effects are visible and duration-correct
- [ ] Smoke particles emit at correct thresholds (25%, 10%)
- [ ] UI bars positioned correctly (fuel left, health right)
- [ ] Game over transitions smoothly from 0 HP
- [ ] All parameters in GAME_PARAMS are adjustable
- [ ] Build passes (lint + tsc + vite)
- [ ] No type errors or warnings
- [ ] Manual testing confirms all scenarios work

---

## Summary

Unit 4 implements a complete health system with:
- **Two-tier damage mechanics** (300px/s small, 500px/s large)
- **Visual feedback** (white/red flashing based on damage type)
- **Health-based effects** (smoke at 25% and 10%)
- **UI reorganization** (health bar right, fuel meter left)
- **Game over integration** (explosion → existing game over flow)
- **Full parameterization** (all values tunable via GAME_PARAMS)

The feature is well-scoped, clearly specified, and integrates cleanly with existing GameScreen architecture.
