# Code Generation Plan — Unit 2: GameScreen

## Unit Context
- **Dependencies**: Unit 1 (GAME_PARAMS, userSettings, TitleScreen, ScoreScreen)
- **Source directory**: `src/app/game/` (new entities), `src/app/screens/GameScreen.ts` (replace stub)
- **Functional design**: `aidlc-docs/construction/unit2-gamescreen/functional-design/`

## Requirements Covered
FR-2.x through FR-8.x, NFR-1 through NFR-5

## Key Implementation Notes
- All entities `extend Container` (Q2=A)
- Ship has no rotation — always points right; nozzle at left center
- Fuel FSM: CONSUMING → COOLDOWN → CHARGING; COOLDOWN→CONSUMING requires `fuel > 0`
- Friction: `vx *= Math.pow(frictionX, Δt)` for frame-rate independence
- Particles: draw once, transform via `.scale`/`.alpha` each frame (no per-frame `clear()`)
- Fuel gauge: small Graphics, acceptable to `clear()` + redraw each frame (14×140 px)
- Pointer events registered on `engine().stage` in `show()`, removed in `hide()`
- GameScreen `show()` calls `initGame()` using current screen dimensions
- Score: `Math.floor(totalScrolled / 10)` displayed as `"{n}m"`
- `void` prefix on all fire-and-forget navigation calls

## Generation Steps

### Step 1: Add `pixelsPerMeter` to `src/app/config/GameParams.ts`
- [ ] Add `pixelsPerMeter: 10` constant (score = totalScrolled / pixelsPerMeter)

### Step 2: Create `src/app/game/Ship.ts`
- [ ] `FuelState` union type: `'consuming' | 'cooldown' | 'charging'`
- [ ] Public state: `vx`, `vy`, `fuel`, `maxFuel`, `fuelState`, `prevBottom`
- [ ] Private state: `cooldownTimer`, `_lastJetAngle`, `_isThrusting`
- [ ] `draw()`: cyan rocket polygon (5-point, pointing right) + nozzle circle glow
- [ ] `update(ticker, isDown, touchXWorld, touchYWorld)`: FSM + physics (spec §3.2)
- [ ] `land(platformTopY)`: snap + zero vy
- [ ] `addMaxFuel(amount)`: grow capacity + partial refuel
- [ ] Geometry helpers: `left()`, `right()`, `top()`, `bottom()`
- [ ] Getters: `isThrusting`, `lastJetAngle`

### Step 3: Create `src/app/game/Platform.ts`
- [ ] Constructor `(x, y, width)`: set position, draw body + top line
- [ ] `draw()`: dark rounded rect body + 4 px green top
- [ ] Geometry: `right()` = `x + platformWidth`; `getTopY()` = `y`

### Step 4: Create `src/app/game/FuelItem.ts`
- [ ] Constructor `(x, y)`: draw outer glow diamond + inner diamond
- [ ] `update(ticker)`: pulse alpha (0.65 ↔ 1.0)
- [ ] `collect(ship)`: set `collected=true`, `ship.addMaxFuel(amount)`, refuel

### Step 5: Create `src/app/game/Starfield.ts`
- [ ] Constructor `(screenW, screenH, count=60)`: scatter `count` circles across 2× screen width
- [ ] `scroll(dx)`: `this.x -= dx * 0.2`; wrap stars that exit left back to right
- [ ] `resize(w, h)`: recreate stars for new dimensions

### Step 6: Create `src/app/game/JetParticleSystem.ts`
- [ ] Internal `Particle` interface: `{x, y, vx, vy, life, gfx: Graphics}`
- [ ] `emit(nx, ny, angle, count)`: spawn particles; draw circle once; add to container
- [ ] `update(ticker)`: move + scale + alpha; destroy at `life ≤ 0`
- [ ] `clear()`: destroy all particles

### Step 7: Create `src/app/game/PlatformGenerator.ts`
- [ ] Constructor `(initialRightX, initialY, screenW, screenH)`
- [ ] `step(worldX, screenW, score)`: while `nextSpawnX < cameraRight + worldBuffer`, spawn platforms + items; return new objects
- [ ] Gap formula: `clamp(initialGapMin + score × gapGrowthPerMeter + rand(±30), initialGapMin, maxGap)`
- [ ] Y formula: `clamp(prevY + rand(±0.25×screenH), topMargin, bottomMargin)`

### Step 8: Replace `src/app/screens/GameScreen.ts` (stub → full)
- [ ] Fields: `worldContainer`, `hudContainer`, `ship`, `starfield`, `particles`, `platformGen`, `platforms[]`, `fuelItems[]`, input state, score state, paused flag
- [ ] HUD: `scoreLabel` (Text), `fuelGaugeGfx` (Graphics)
- [ ] `prepare()`: no-op (pointer events registered in show)
- [ ] `show()`: fade in + call `initGame()`
- [ ] `hide()`: fade out + remove pointer events
- [ ] `reset()`: destroy all entities + clear containers
- [ ] `resize(w, h)`: save dims + reposition HUD
- [ ] `pause()` / `resume()` / `blur()` / `focus()`
- [ ] `update(ticker)`: 9-step game loop per functional design
- [ ] Private helpers: `initGame()`, `checkCollisions()`, `updateHUD()`, pointer event handlers

### Step 9: Run `tsc --noEmit` + `eslint .`
- [ ] Fix any type errors or lint issues

### Step 10: Create documentation summary
- [ ] `aidlc-docs/construction/unit2-gamescreen/code/summary.md`
