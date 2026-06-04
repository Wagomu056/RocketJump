# Business Rules — Unit 2: GameScreen

## Physics Rules

| Rule ID | Rule |
|---------|------|
| PHY-01 | Jet angle θ = atan2(touchY_world − shipY, touchX_world − shipX), **clamped to [0, π]**. No thrust outside this range. |
| PHY-02 | Thrust applies only when pointer is held **AND** `fuel > 0`. |
| PHY-03 | Gravity and friction apply **every frame regardless** of pointer state or fuel level. |
| PHY-04 | Friction uses `pow(coeff, Δt)` (multiplicative, frame-rate independent). |
| PHY-05 | Touch coordinates are converted from screen space to world space before angle calculation: `touchX_world = touchX - worldContainer.x`. |

## Fuel Rules

| Rule ID | Rule |
|---------|------|
| FUL-01 | Fuel range: `[0, maxFuel]`. Cannot go negative or above `maxFuel`. |
| FUL-02 | Cooldown timer starts fresh at `cooldownDuration` seconds when leaving CONSUMING state. |
| FUL-03 | Any pointer press during COOLDOWN immediately cancels cooldown and enters CONSUMING (even if fuel is near 0). |
| FUL-04 | Recharging requires no landing — ship may be mid-air. |
| FUL-05 | `fuelMaxUpgradeAmount` is added to `maxFuel` per item pickup, with no upper cap on `maxFuel`. |

## Camera Rules

| Rule ID | Rule |
|---------|------|
| CAM-01 | Camera scrolls **right only** — `worldContainer.x` decreases monotonically. |
| CAM-02 | Dead-zone boundary = `screenWidth × 0.4` from left edge. Camera tracks when ship exceeds this. |
| CAM-03 | Score = `floor(totalScrolled / 10)` pixels → displayed as `{n}m`. |

## Platform Rules

| Rule ID | Rule |
|---------|------|
| PLT-01 | New platforms are generated **ahead of the camera** by `worldBuffer` pixels — player never sees gaps appear. |
| PLT-02 | Gap between platforms widens with score: `gap = clamp(base + score × gapGrowth, minGap, maxGap)` + ±30 px random. |
| PLT-03 | Platform y-position varies ±25% of screen height from the previous platform, clamped to visible margins. |
| PLT-04 | Platforms scrolled **fully off the left edge** are immediately destroyed to release memory. |
| PLT-05 | Any FuelItem on a destroyed platform is also destroyed, even if uncollected. |

## Collision Rules

| Rule ID | Rule |
|---------|------|
| COL-01 | Landing is valid only when `vy > 0` (descending) AND the ship's bottom crosses the platform's top surface this frame. |
| COL-02 | On landing: `vy = 0` and ship snapped to `platformTop − SHIP_HALF_HEIGHT`. `vx` is preserved (inertia maintained). |
| COL-03 | Ship slides off a platform edge freely — no friction from platforms. |
| COL-04 | Landing with `fuel = 0` is valid. The ship sits still until the fuel FSM transitions to CHARGING. |
| COL-05 | Item pickup uses circular distance `< 30 px` (not AABB) for a forgiving feel. |
| COL-06 | An item can only be collected once (`collected` flag). |

## Game-Over Rule

| Rule ID | Rule |
|---------|------|
| GOV-01 | Game over triggers when `ship.y > screenHeight + 100`. The 100 px grace prevents instant game-over on the screen edge. |
| GOV-02 | On game-over: `userSettings.lastScore = score` then `navigation.showScreen(ScoreScreen)`. |

## Left-Edge Clip Rule

| Rule ID | Rule |
|---------|------|
| LEC-01 | If `ship.x < cameraLeft + SHIP_HALF_WIDTH`, clamp `ship.x` and zero `vx` (if `vx < 0`). No game-over. |

## Particle Rules

| Rule ID | Rule |
|---------|------|
| PAR-01 | Particles emit only on frames where `isPointerDown AND fuel > 0`. |
| PAR-02 | Emit 3–5 particles per thrust frame. |
| PAR-03 | Particle direction = θ (toward touch point) ± random spread of ±0.4 rad. |
| PAR-04 | `life` decreases by `0.04 × Δt` per frame. Particle destroyed when `life ≤ 0`. |
| PAR-05 | All particles cleared on `GameScreen.reset()`. |
