# Unit 4: Life System — Code Generation Plan

**Unit Name**: Life System (Health Management, Damage on Landing, Visual Feedback)

**Unit Type**: GameScreen Enhancement with GAME_PARAMS configuration

**Primary Files to Modify**:
- `src/app/config/GameParams.ts` — Health system configuration
- `src/app/screens/GameScreen.ts` — Health state, damage detection, smoke particles, game over
- `src/app/game/Ship.ts` — Flashing animation, fuel meter repositioning

**Unit Context**:
- Depends on: Existing collision detection, particle system, game over flow
- Integrates with: Ship rendering, Platform collision, GameScreen update loop
- No new components needed; all changes within existing architecture

---

## Code Generation Steps

### Step 1: Analyze Existing Integration Points
- [ ] Review GameScreen update loop to find collision detection point
- [ ] Identify where damage should trigger (Platform collision, velocity check)
- [ ] Identify HUD layer for health bar rendering
- [ ] Review Ship class fuel gauge positioning to understand UI layout
- [ ] Confirm particle system can be reused for smoke effects
- [ ] Identify game over transition point (existing ScoreScreen)

**Verification**: Understand how to integrate health state into update() and collision logic

---

### Step 2: Extend GAME_PARAMS with Health Configuration
- [ ] Add `health` object to GAME_PARAMS:
  ```typescript
  health: {
    maxHealth: 100,
    smallDamageThreshold: 300,    // px/s velocity
    smallDamageAmount: 25,
    largeDamageThreshold: 500,    // px/s velocity
    largeDamageAmount: 50,
  }
  ```
- [ ] Add `flashing` object to GAME_PARAMS:
  ```typescript
  flashing: {
    smallDuration: 0.6,            // seconds
    smallBlinks: 6,
    largeDuration: 1.2,
    largeBlinks: 8,
  }
  ```
- [ ] Add `smoke` object to GAME_PARAMS:
  ```typescript
  smoke: {
    lightThreshold: 0.25,          // 25% health
    lightParticlesPerFrame: 2,
    heavyThreshold: 0.10,          // 10% health
    heavyParticlesPerFrame: 5,
  }
  ```

**File**: `src/app/config/GameParams.ts`

**Verification**: All three objects added with correct numeric values

---

### Step 3: Add Health State to GameScreen Constructor
- [ ] Add health state properties:
  ```typescript
  private currentHealth = GAME_PARAMS.health.maxHealth;
  private maxHealth = GAME_PARAMS.health.maxHealth;
  private isFlashing = false;
  private flashingTimer = 0;
  private flashingType: 'small' | 'large' | null = null;
  private flashingStartColor = 0xffffff;
  ```
- [ ] Initialize in constructor

**File**: `src/app/screens/GameScreen.ts`

**Verification**: All properties initialized in constructor

---

### Step 4: Add Health Bar UI to HUD Layer
- [ ] Create health bar Graphics object (horizontal bar)
- [ ] Position on right side of screen (x offset from right edge)
- [ ] Initial color: green (100% health)
- [ ] Add to hudContainer
- [ ] Create method `updateHealthBar()` to:
  - Calculate health percentage
  - Determine color based on percentage:
    - Green (100%-51%)
    - Yellow (50%-26%)
    - Red (25%-1%)
  - Redraw bar with correct dimensions and color

**File**: `src/app/screens/GameScreen.ts`

**Verification**: Health bar visible on right side, colors correct at different health levels

---

### Step 5: Reposition Fuel Meter to Left Side
- [ ] Modify Ship class fuel gauge positioning constants:
  - Move `GAUGE_X` from right side (SHIP_HALF_W + 5) to left side (negative value)
  - Example: `GAUGE_X = -SHIP_HALF_W - 15` (left of ship)
- [ ] Ensure fuel gauge visuals still render correctly at new position

**File**: `src/app/game/Ship.ts`

**Verification**: Fuel gauge renders on left side of ship, not overlapping health bar

---

### Step 6: Add Flashing Animation Logic to GameScreen
- [ ] Create method `applyFlashingEffect()`:
  - Called every frame during flashing
  - Manages flash on/off timing based on blink frequency
  - Sets ship alpha or color based on flash type
  - White flashing for small damage: ship.tint = 0xffffff with alpha oscillation
  - Red flashing for large damage: ship.tint = 0xff4444 with alpha oscillation
  - Duration: check flashing timer, stop when duration exceeded
- [ ] Add to update() loop

**File**: `src/app/screens/GameScreen.ts`

**Verification**: Flashing visible when damage taken, correct colors and duration

---

### Step 7: Add Smoke Particle Emission Logic
- [ ] Create method `emitSmokeParticles()`:
  - Check current health percentage
  - If 25% or below: emit `GAME_PARAMS.smoke.lightParticlesPerFrame` particles per frame
  - If 10% or below: emit `GAME_PARAMS.smoke.heavyParticlesPerFrame` particles per frame
  - Spawn particles from ship center position
  - Reuse existing particle system (particles.spawnSmoke or similar method)
- [ ] Call in update() loop

**File**: `src/app/screens/GameScreen.ts`

**Verification**: Smoke particles appear at correct health thresholds, intensity increases at 10%

---

### Step 8: Add Damage Detection to Collision Logic
- [ ] Locate platform collision detection in update() or collision handler
- [ ] On landing (collision with platform):
  - Check landing velocity: `Math.abs(ship.vy)`
  - If velocity >= `GAME_PARAMS.health.largeDamageThreshold`: apply large damage
    - Deduct `GAME_PARAMS.health.largeDamageAmount` HP
    - Set flashing type to 'large', start flashing animation
  - Else if velocity >= `GAME_PARAMS.health.smallDamageThreshold`: apply small damage
    - Deduct `GAME_PARAMS.health.smallDamageAmount` HP
    - Set flashing type to 'small', start flashing animation
  - Else: no damage
  - Update currentHealth
  - Call `updateHealthBar()` to reflect new health
- [ ] If currentHealth <= 0: trigger game over

**File**: `src/app/screens/GameScreen.ts`

**Verification**: Damage triggers only at correct velocities, health decreases, flashing occurs

---

### Step 9: Add Game Over Condition and Explosion
- [ ] When currentHealth <= 0:
  - Show explosion animation (0.5s duration)
    - Use existing particle system to spawn explosion particles
    - Option: scale and velocity particles upward rapidly
  - Set `this.gameOver = true`
  - After explosion duration (0.5s):
    - Transition to ScoreScreen (reuse existing game over flow)
    - Pass final score to ScoreScreen
  - Use animate() from motion library (already imported)

**File**: `src/app/screens/GameScreen.ts`

**Verification**: Explosion visible at 0 health, game over transition works, reuses existing flow

---

### Step 10: Initialize Health State in initGame()
- [ ] Reset health to max when game starts:
  ```typescript
  this.currentHealth = this.maxHealth;
  this.isFlashing = false;
  this.flashingTimer = 0;
  ```
- [ ] Reset health bar to full

**File**: `src/app/screens/GameScreen.ts`

**Verification**: New game starts with full health, flashing state reset

---

### Step 11: Verify Parameter Integration and Type Safety
- [ ] Ensure all GAME_PARAMS references use correct path:
  - `GAME_PARAMS.health.*`
  - `GAME_PARAMS.flashing.*`
  - `GAME_PARAMS.smoke.*`
- [ ] Verify all numbers in GAME_PARAMS match requirements:
  - maxHealth: 100
  - smallDamageThreshold: 300 px/s
  - smallDamageAmount: 25
  - largeDamageThreshold: 500 px/s
  - largeDamageAmount: 50
  - flashing durations and blinks
  - smoke thresholds and particle counts
- [ ] Check TypeScript strict mode compliance
  - No `any` types
  - All types explicitly declared
  - No unused variables

**Files**: 
- `src/app/config/GameParams.ts`
- `src/app/screens/GameScreen.ts`
- `src/app/game/Ship.ts`

**Verification**: No TypeScript errors when running `tsc`

---

### Step 12: Run ESLint and Prettier
- [ ] Run `npm run lint` to check code style
- [ ] Fix any ESLint violations (indentation, spacing, unused imports)
- [ ] Verify Prettier formatting is correct

**Verification**: ESLint passes with zero violations

---

### Step 13: Build Verification
- [ ] Run `npm run build` to compile TypeScript and build with Vite
- [ ] Verify no errors or warnings
- [ ] Check that all modules compile cleanly (1000+ modules expected)

**Verification**: Build passes successfully, vite build completes without errors

---

### Step 14: Manual Gameplay Testing
- [ ] Start dev server: `npm run dev`
- [ ] Test scenario 1: Gentle landing (low velocity)
  - Land at ~200 px/s
  - Expected: No damage, health unchanged
  - Verify: Health bar still shows 100
- [ ] Test scenario 2: Small damage landing
  - Land at ~350 px/s
  - Expected: Health decreases to 75, white flashing for 0.6s
  - Verify: White flashing visible, health bar updates
- [ ] Test scenario 3: Large damage landing
  - Land at ~600 px/s
  - Expected: Health decreases to 50 (or 25 if already damaged), red flashing for 1.2s
  - Verify: Red flashing visible, health bar updates
- [ ] Test scenario 4: Health bar colors
  - At 100%: Green color
  - At ~75%: Green color
  - At ~50%: Yellow color
  - At ~25%: Red color
  - Verify gradient transitions smoothly
- [ ] Test scenario 5: Smoke particles
  - Play until health reaches 25%
  - Expected: Light smoke visible
  - Play until health reaches 10%
  - Expected: Heavy smoke visible, more particles per frame
  - Verify smoke intensity increases
- [ ] Test scenario 6: Game over
  - Play until health reaches 0
  - Expected: Explosion animation (0.5s), then GameOverScreen
  - Verify explosion plays, game over flow works
- [ ] Test scenario 7: UI positioning
  - Verify health bar on right side, no overlap with score
  - Verify fuel meter on left side, no overlap with health
  - Verify both visible and easily readable
- [ ] Test scenario 8: Parameter adjustment
  - Verify all parameters in GAME_PARAMS can be tweaked
  - Test with different health values, damage thresholds
  - Verify changes take effect immediately on save (Vite hot reload)

**Verification**: All scenarios work correctly, no gameplay regressions, parameters are tunable

---

## Summary

**Total Steps**: 14

**Implementation Areas**:
1. GAME_PARAMS extension (health, flashing, smoke)
2. GameScreen health management and damage detection
3. Flashing animation and smoke particles
4. Health bar UI rendering
5. Fuel meter repositioning
6. Game over explosion and transition

**Key Dependencies**:
- Particle system for smoke effects
- Collision detection for damage trigger
- Existing game over flow for transition
- Animation library (motion) for flashing

**Expected Outcome**:
- Fully functional health system
- Two-tier damage mechanics
- Visual feedback (flashing, smoke)
- Health UI with gradient colors
- Game over on 0 health
- All parameters configurable

