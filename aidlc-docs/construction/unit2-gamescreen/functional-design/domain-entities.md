# Domain Entities — Unit 2: GameScreen

## Ship

**Role**: The player-controlled entity. Owns physics and fuel state.

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `vx` | number | 0 | Horizontal velocity (world px/frame at 60fps) |
| `vy` | number | 0 | Vertical velocity |
| `fuel` | number | `initialMaxFuel` | Current fuel |
| `maxFuel` | number | `initialMaxFuel` | Current fuel capacity (grows with item pickups) |
| `fuelState` | `FuelState` | `CHARGING` | FSM state |
| `cooldownTimer` | number | 0 | Seconds remaining in cooldown |
| `prevBottomY` | number | — | Ship bottom Y at start of frame (tunnelling prevention) |

Constants (not stored in state):
- `SHIP_HALF_WIDTH = 22` px (half of 44 px bounding box)
- `SHIP_HALF_HEIGHT = 13` px (half of 26 px bounding box)
- Nozzle offset: `(-SHIP_HALF_WIDTH, 0)` in ship-local space (back-left)

**Geometry helpers:**
- `left()` = `x − SHIP_HALF_WIDTH`
- `right()` = `x + SHIP_HALF_WIDTH`
- `top()` = `y − SHIP_HALF_HEIGHT`
- `bottom()` = `y + SHIP_HALF_HEIGHT`

**Visual** (PIXI.Graphics): Rocket silhouette pointing right. Body: filled cyan `#00e5ff` polygon. When thrusting: nozzle end has a glow (particles emitted here).

---

## Platform

**Role**: A floating island the ship can land on.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | World x of LEFT edge |
| `y` | number | World y of TOP surface (landing surface) |
| `platformWidth` | number | Width in px |
| `platformHeight` | const 20 | Visual block thickness |

**Geometry helpers:**
- `right()` = `x + platformWidth`
- `getTopY()` = `y` (landing surface)

**Visual** (PIXI.Graphics):
- Body: `#1a1a24` rounded rect (x, y, platformWidth, platformHeight, radius=4)
- Top line: 4 px thick `#39ff14` stroke along the top edge

---

## FuelItem

**Role**: A collectible that refuels the ship and grows max fuel.

| Field | Type | Description |
|-------|------|-------------|
| `x`, `y` | number | World position (center) |
| `collected` | boolean | True after pickup; stops physics and rendering |
| `pulseTime` | number | Elapsed time for glow animation |

Constants:
- `ITEM_RADIUS = 12` px (drawn as diamond)
- `PICKUP_RADIUS = 30` px (collection distance)

**Visual** (PIXI.Graphics): Diamond shape `#ff007f`, pulsing alpha 0.6–1.0.

---

## Particle

**Role**: One jet-exhaust particle. Managed entirely by `JetParticleSystem`.

| Field | Type | Description |
|-------|------|-------------|
| `x`, `y` | number | World position |
| `vx`, `vy` | number | Velocity |
| `life` | number | 1.0 → 0.0; alpha and scale tied to this |
| `size` | number | Initial radius (2–5 px) |
| `gfx` | Graphics | The PIXI.Graphics circle for this particle |

---

## Starfield

**Role**: Decorative parallax background layer.

| Field | Type | Description |
|-------|------|-------------|
| `parallaxFactor` | const 0.2 | Stars scroll at 20% of world speed |

Contains N static star Graphics objects (`circle`, radius 1–3, white with 0.3–1.0 alpha) placed randomly across 3× the screen width. On `scroll(dx)`, stars shift by `dx × 0.2`.

---

## GameScreen Internal State

| Field | Type | Description |
|-------|------|-------------|
| `worldContainer` | Container | Parent of all world-space objects (ship, platforms, items, particles) |
| `hudContainer` | Container | Screen-space overlay (score label, fuel bar) — NOT inside worldContainer |
| `score` | number | `floor(totalScrolled / 10)` |
| `totalScrolled` | number | Cumulative px the world has scrolled right |
| `isPointerDown` | boolean | — |
| `pointerX`, `pointerY` | number | Screen-space touch/mouse position |
| `platforms` | Platform[] | All live platforms |
| `fuelItems` | FuelItem[] | All live items |
| `paused` | boolean | Set by `pause()` / `resume()` |
| `screenWidth`, `screenHeight` | number | Updated in `resize()` |
