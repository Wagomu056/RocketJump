# Frontend Components — Unit 2: GameScreen HUD

> "Frontend components" for this unit = the in-game HUD overlay drawn in screen space (not world space), consisting of the score label and fuel gauge.

## HUD Layout

```
Screen (top-left origin)
┌─────────────────────────────────┐
│  [SCORE LABEL]       [FUEL BAR] │  ← top strip, y ≈ 24 px
│                                 │
│         game world              │
│                                 │
└─────────────────────────────────┘
```

Both elements live in `hudContainer` which is added to the GameScreen directly (not inside `worldContainer`), so they remain fixed to the screen during scrolling.

---

## Score Label

| Property | Value |
|----------|-------|
| Type | `Text` |
| Position | `(16, 16)` screen-space |
| Anchor | `(0, 0)` (top-left) |
| Style | fontSize 26, fill `#ffffff`, fontFamily `Arial` |
| Content | `"${score}m"` — updated each frame in `updateHUD()` |

---

## Fuel Gauge

| Property | Value |
|----------|-------|
| Type | `Graphics` (redrawn each frame via `clear()` + draw) |
| Position | `(screenWidth − 160, 16)` screen-space (top-right) |
| Width | 140 px |
| Height | 14 px |

**Draw logic** (called in `updateHUD()`):

```
fillRatio = ship.fuel / ship.maxFuel   // 0.0 – 1.0

// Background track
g.roundRect(0, 0, 140, 14, 4).fill({ color: 0x333355, alpha: 0.8 })

// Filled portion
fillColor = (fillRatio > 0.25) ? 0x00e5ff : 0xff3300   // cyan or red-warning
g.roundRect(0, 0, 140 * fillRatio, 14, 4).fill(fillColor)

// Border
g.roundRect(0, 0, 140, 14, 4).stroke({ color: 0x8888aa, width: 1 })
```

> Note: clearing and redrawing a small gauge each frame is acceptable for one Graphics object at this size (see PixiJS v8 Graphics guidance: avoid per-frame clear for complex shapes, but a tiny bar is fine).

---

## Interaction Flow

1. Player presses screen → `isPointerDown = true`, `pointerX/Y` updated
2. `ship.update()` computes thrust from pointer coords
3. `updateHUD()` refreshes score text + redraws fuel bar
4. No separate state manager — all HUD state derived from `ship` and `score` each frame
