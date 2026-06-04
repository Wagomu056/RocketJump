# Component Methods

> Note: Detailed business logic (exact physics formulas, FSM transitions, difficulty curves) is defined in Functional Design (Unit 2). This document captures method signatures and high-level purpose.

---

## `GameParams` (config object, not a class)

```typescript
// src/app/config/GameParams.ts
export const GAME_PARAMS = {
  gravity:              number,   // 0.25
  frictionX:            number,   // 0.98
  frictionY:            number,   // 0.99
  thrustPower:          number,   // 0.4
  initialMaxFuel:       number,   // 100
  fuelDecreaseRate:     number,   // 0.5
  fuelRecoverRate:      number,   // 0.8
  cooldownDuration:     number,   // 1.0  (seconds)
  fuelMaxUpgradeAmount: number,   // 15
  cameraDeadZoneRatio:  number,   // 0.4 (40% of screen width)
} as const;
```

---

## `TitleScreen` extends `Container`

```typescript
static assetBundles: string[] = [];  // no assets needed

// AppScreen lifecycle
show(): Promise<void>        // animate in title text, START button, high score label
hide(): Promise<void>        // animate out
reset(): void                // re-read high score from userSettings and refresh label
resize(w: number, h: number): void  // reposition/scale UI elements
```

---

## `GameScreen` extends `Container`

```typescript
static assetBundles: string[] = [];

// AppScreen lifecycle
prepare(): void              // create world container, entities; register pointer events
show(): Promise<void>        // animate in, start game state
hide(): Promise<void>        // animate out; remove pointer events
pause(): void                // stop game loop (ticker auto-pauses on popup)
resume(): void               // resume game loop
reset(): void                // destroy old entities; re-create for a new run
blur(): void                 // present PausePopup via navigation
resize(w: number, h: number): void

// Called every frame by engine ticker (auto-registered)
update(ticker: Ticker): void

// Private helpers (implementation detail, not public API)
private handlePointerEvents(): void    // register pointerdown/move/up on stage
private updateCamera(dx: number): void // shift worldContainer.x
private checkCollisions(): void        // ship ↔ platforms and items
private checkGameOver(): void          // ship below screen bottom → navigate to ScoreScreen
private updateScoreUI(): void
private updateFuelUI(): void
```

---

## `ScoreScreen` extends `Container`

```typescript
static assetBundles: string[] = [];

setScore(distance: number): void  // called by GameScreen before navigation
show(): Promise<void>             // check high score, animate in labels/buttons
hide(): Promise<void>
reset(): void
resize(w: number, h: number): void
```

---

## `Ship` extends `Container`

```typescript
// State (read by GameScreen for collision / camera / UI)
vx: number;
vy: number;
fuel: number;
maxFuel: number;
readonly fuelState: FuelState;   // 'consuming' | 'cooldown' | 'charging'

constructor(maxFuel?: number)

// Called once or when ship shape must be redrawn
draw(): void

// Called every frame by GameScreen.update()
// pointerActive: true if pointer is held AND fuel > 0 can be used
// angle: pre-clamped jet angle θ (0..π) from GameScreen
update(ticker: Ticker, pointerActive: boolean, angle: number): void

// Fuel FSM transitions (called by update internally)
// Exposed for external trigger: GameScreen calls startCooldown() when pointer released
startCooldown(): void

// Collision response
land(platformTopY: number): void   // set vy=0, snap ship top

// Geometry helpers for collision
getBottomY(): number               // y + height/2 (world coords)
getLeftX(): number
getRightX(): number

// Upgrade on item pickup
addMaxFuel(amount: number): void   // maxFuel += amount; fuel refill
```

---

## `Platform` extends `Container`

```typescript
readonly platformWidth: number;   // set in constructor
readonly platformHeight: number;  // visual block height (const ~20px)

constructor(width: number, yPos: number)

draw(): void   // body rect + top green line

// Geometry helpers
getTopY(): number     // world y of the platform's landing surface
getLeftX(): number
getRightX(): number
```

---

## `FuelItem` extends `Container`

```typescript
readonly collected: boolean;

constructor(x: number, y: number)

draw(): void      // glowing pink/yellow shape
update(ticker: Ticker): void   // optional pulsing glow animation

// Apply effect; returns true if item was available (not already collected)
collect(ship: Ship): boolean
```

---

## `Starfield` extends `Container`

```typescript
constructor(screenW: number, screenH: number, starCount?: number)

draw(): void                       // scatter random stars (called once)
scroll(worldOffsetX: number): void // parallax: move stars at fraction of world offset
resize(w: number, h: number): void
```

---

## `JetParticleSystem` extends `Container`

```typescript
// Emit particles from the nozzle this frame
// nozzleX/Y: world position of ship nozzle
// jetAngle: θ (0..π); particles shoot at θ+π with random spread
emit(nozzleX: number, nozzleY: number, jetAngle: number, count?: number): void

// Shrink + fade all live particles; remove dead ones
update(ticker: Ticker): void

// Remove all particles (on reset/game-over)
clear(): void
```

---

## `PlatformGenerator`

```typescript
constructor(startX: number, screenHeight: number)

// Generate platform(s) far enough right to fill the viewport + buffer
// Returns newly created Platform and FuelItem objects (caller adds to world)
generate(cameraRightEdge: number, score: number): { platforms: Platform[]; items: FuelItem[] }

// Called when camera advances: recycle platforms that are fully off-screen left
// Returns platforms safe to destroy
collectStale(cameraLeftEdge: number): Platform[]
```

---

## `userSettings` extension

```typescript
// Add to existing userSettings.ts
get highScore(): number
set highScore(value: number)
```
