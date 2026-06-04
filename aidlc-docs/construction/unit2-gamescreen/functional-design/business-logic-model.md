# Business Logic Model — Unit 2: GameScreen

## 1. Per-Frame Game Loop (GameScreen.update)

Order of operations each tick:

```
1. handleInput()          read pointer state → isDown, touchX, touchY (screen coords)
2. ship.update()          physics + fuel FSM
3. jetParticles.update()  fade/shrink existing particles
4. if thrusting → jetParticles.emit()
5. fuelItems.forEach(i => i.update())   glow animation
6. checkCollisions()      ship ↔ platforms, ship ↔ fuel items
7. leftEdgeClip()         prevent ship leaving left of screen
8. updateCamera()         scroll worldContainer; accumulate score
9. checkGameOver()        ship below screen → navigate to ScoreScreen
10. platformGen.step()    spawn new / destroy stale platforms
11. updateHUD()           refresh score label + fuel bar
```

---

## 2. Physics Algorithm (Ship.update, per frame)

Let `Δt = ticker.deltaTime` (PixiJS normalised to 1.0 at 60 fps).

```
IF isPointerDown AND fuel > 0:
    dx = touchX_world - ship.x          // touchX_world = touchX - worldContainer.x
    dy = touchY_world - ship.y
    θ  = atan2(dy, dx)
    θ  = clamp(θ, 0, π)                 // left-half-circle only
    vx -= cos(θ) * thrustPower * Δt
    vy -= sin(θ) * thrustPower * Δt

// Always:
vy += gravity * Δt
vx *= pow(frictionX, Δt)                // frame-rate-independent multiplicative decay
vy *= pow(frictionY, Δt)

ship.x += vx * Δt
ship.y += vy * Δt
```

> Multiplying by `Δt` on every term ensures identical feel at 30, 60, or 120 fps.
> Friction uses `pow(coeff, Δt)` — not `coeff * Δt` — because decay is multiplicative.

---

## 3. Fuel FSM

States: `CONSUMING` | `COOLDOWN` | `CHARGING`

```
State: CONSUMING
  Entry condition: isPointerDown AND fuel > 0
  Each frame:
    fuel -= fuelDecreaseRate * Δt
    fuel  = max(0, fuel)
  Transitions:
    pointer released   → COOLDOWN  (cooldownTimer = cooldownDuration)
    fuel reaches 0     → COOLDOWN  (cooldownTimer = cooldownDuration)

State: COOLDOWN
  Each frame:
    cooldownTimer -= elapsedSec   (ticker.elapsedMS / 1000)
  Transitions:
    isPointerDown pressed → CONSUMING  (timer reset implicitly; fuel consumed)
    cooldownTimer ≤ 0     → CHARGING

State: CHARGING
  Each frame:
    fuel += fuelRecoverRate * Δt
    fuel  = min(fuel, maxFuel)
  Transitions:
    isPointerDown AND fuel > 0 → CONSUMING
```

Key behaviours:
- Charging starts only after a FULL cooldownDuration without a new press.
- Charging can be interrupted mid-recovery by pressing again (no penalty).
- Landing on a platform is NOT required to recharge (spec §3.3).

---

## 4. Camera / Scroll System

```
deadZoneX = screenWidth * cameraDeadZoneRatio   // default 40%

shipScreenX = ship.x + worldContainer.x

IF shipScreenX > deadZoneX:
    scroll     = shipScreenX - deadZoneX
    worldContainer.x -= scroll
    totalScrolled    += scroll             // accumulate for score

score = floor(totalScrolled / pixelsPerMeter)   // pixelsPerMeter = 10
```

Camera only scrolls RIGHT (worldContainer.x only decreases, never increases).

---

## 5. Left-Edge Clip

```
cameraLeft   = -worldContainer.x            // world x of left screen edge
minShipWorldX = cameraLeft + SHIP_HALF_WIDTH

IF ship.x < minShipWorldX:
    ship.x = minShipWorldX
    IF vx < 0: vx = 0
```

No game-over from left-edge contact.

---

## 6. Platform Generation (PlatformGenerator.step)

```
State: nextSpawnWorldX, lastPlatformY, difficulty (= score)

Each frame:
    cameraRightWorldX = -worldContainer.x + screenWidth
    
    WHILE nextSpawnWorldX < cameraRightWorldX + worldBuffer:
        gap = clamp(
            initialGapMin + difficulty * gapGrowthPerMeter + random(-30, +30),
            initialGapMin,
            maxGap
        )
        platformW = random(platformWidthMin, platformWidthMax)
        
        newX = nextSpawnWorldX + gap
        
        yMin = screenHeight * platformYMarginTop
        yMax = screenHeight * (1 - platformYMarginBottom)
        newY = clamp(
            lastPlatformY + random(-screenHeight * 0.25, +screenHeight * 0.25),
            yMin, yMax
        )
        
        spawn Platform at (newX, newY, platformW)
        
        IF random() < itemSpawnChance:
            spawn FuelItem at (newX + platformW/2, newY - 20)
        
        lastPlatformY      = newY
        nextSpawnWorldX    = newX + platformW

Cleanup (per frame):
    FOR EACH platform WHERE (platform.x + platform.platformWidth + worldContainer.x) < 0:
        destroy platform (and any uncollected item on it)
```

Initial state on `reset()`:
- One wide starting platform spanning x=0 to x=screenWidth*0.6, y = screenHeight*0.65
- nextSpawnWorldX = screenWidth * 0.6
- lastPlatformY   = screenHeight * 0.65

---

## 7. Collision Detection

### 7.1 Ship ↔ Platform (landing)

```
FOR EACH platform p:
    // Horizontal overlap
    IF ship.right() > p.x AND ship.left() < p.right():
        // Descending AND crossing top surface
        IF vy > 0 AND ship.bottom() >= p.y AND prevShipBottom < p.y:
            ship.y  = p.y - SHIP_HALF_HEIGHT
            vy = 0
            (vx unchanged — inertia maintained on platform)
```

`prevShipBottom` = ship.bottom() before this frame's position update. Prevents tunnelling.

### 7.2 Ship ↔ FuelItem

```
FOR EACH uncollected fuelItem f:
    dx = ship.x - f.x
    dy = ship.y - f.y
    IF sqrt(dx*dx + dy*dy) < ITEM_PICKUP_RADIUS (= 30):
        f.collect(ship)
            ship.fuel    = min(ship.fuel + initialMaxFuel, ship.maxFuel)
            ship.maxFuel += fuelMaxUpgradeAmount
```

---

## 8. Game-Over Detection

```
IF ship.y > screenHeight + 100:        // 100px grace below screen bottom
    userSettings.lastScore = score
    navigation.showScreen(ScoreScreen)
```

---

## 9. Jet Particle System

### Emit (each thrusting frame)

```
nozzleOffset = -SHIP_HALF_WIDTH   // nozzle is at the left/back of ship
nozzleX = ship.x + cos(θ + π) * SHIP_HALF_WIDTH   // world coords
nozzleY = ship.y + sin(θ + π) * SHIP_HALF_WIDTH

FOR i in 0..3:
    spread = random(-0.4, +0.4) radians
    particleAngle = θ + spread              // towards touch = visually correct exhaust
    speed = random(2, 5)
    spawn particle at (nozzleX, nozzleY) with velocity (cos(particleAngle)*speed, sin(particleAngle)*speed)
    particle.life  = 1.0
    particle.size  = random(2, 5)
```

### Update (each frame)

```
FOR EACH particle p:
    p.x    += p.vx * Δt
    p.y    += p.vy * Δt
    p.life -= 0.04 * Δt
    p.alpha = p.life
    p.scale = p.life
    IF p.life ≤ 0: destroy p
```

Colour gradient per life: `#00e5ff` (full) → `#ff9900` (mid) → transparent.
