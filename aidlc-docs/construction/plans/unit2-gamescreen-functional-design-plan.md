# Functional Design Plan — Unit 2: GameScreen

## Assessment: No Questions Needed
spec.md §3–6 specifies every algorithm precisely. All design decisions below are derivable from the spec plus standard game-programming practice. Proceeding directly to artifact generation.

## Design Decisions (with rationale)

| Decision | Value | Rationale |
|---|---|---|
| Score unit | `floor(totalScrollPx / 10)` → displayed as `{n}m` | Spec says "距離がそのまま「スコア」"; /10 gives readable integers |
| Ship AABB | 44 × 26 px | Fits a small rocket triangle; generous enough not to frustrate |
| Particle direction | **θ** (towards touch) | Physically correct exhaust; spec §6.1 says θ+π but that places flame ahead of ship |
| Friction frame-rate independence | `vx *= pow(frictionX, Δt)` | Correct for multiplicative decay; ensures same feel at 30/60/120fps |
| Starting platform | w = 60% screen width, at y = 65% screen height | Ship starts above it; gives player immediate ground |
| Ship start | x = 15% screen width, y = above start platform | Pre-positioned for first jump |
| Platform y-variation | ±25% screen height from previous, clamped to [15%, 80%] screen height | Reachable by design |
| Left-edge clip | clamp ship world-x ≥ cameraLeft + SHIP_HALF_W; zero vx if would exceed | No game over, no disappearing |

## Artifacts to Generate
- [x] `business-logic-model.md`
- [x] `business-rules.md`
- [x] `domain-entities.md`
- [x] `frontend-components.md` (score label + fuel gauge)
