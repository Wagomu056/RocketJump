# Unit 3: Item System — Code Generation Plan

## Unit Context

**Unit**: Unit 3 - Item System  
**Scope**: Extend existing item system to support two types of items (ground and air) with independent tunable parameters  
**Dependencies**: GameParams (config), PlatformGenerator, GameScreen, Ship  
**Integration Points**: Platform generation, air gap handling, collision detection

## Code Generation Approach

This is a **brownfield modification** to an existing item system. The current `FuelItem` class will be extended into a base class, and two specialized subclasses will be created. All changes will be localized to `src/app/game/` with parameter centralization in `src/app/config/GameParams.ts`.

### Project Structure (No Changes)
- Code remains in `src/app/`
- Game logic: `src/app/game/`
- Config: `src/app/config/`

---

## Detailed Code Generation Steps

### Step 1: Analyze Existing Item Implementation
- [x] Review current `FuelItem.ts` (size 30 base radius, neon pink, pulse animation)
- [x] Identify parameters suitable for tuning (size, spawn frequency, effect amount)
- [x] Confirm integration with `GameScreen` collision detection
- [x] Note existing `ITEM_PICKUP_RADIUS` export (currently hardcoded to 30)

### Step 2: Extend GAME_PARAMS Configuration
- [x] Update `src/app/config/GameParams.ts`
- [x] Add `items` object with `groundItem`, `airItem`, and `pickupRadius` properties
- [x] Set default values: ground (size: 1.0, frequency: 0.4, effect: 10), air (size: 1.5, frequency: 0.4, effect: 25)
- [x] Ensure backward compatibility (existing code can still reference params)

### Step 3: Create Item Base Class (Refactoring)
- [x] Refactor `FuelItem.ts` into generic `Item.ts` base class
- [x] Extract common properties: `worldX`, `worldY`, `collected`, `size`, `pulseTime`
- [x] Extract common methods: `update(ticker)`, `collect(ship)`, `draw()`
- [x] Make `draw()` abstract or parameterized (accept size + effect amount)
- [x] Create `getCollisionRadius()` method that scales base radius by size
- [x] Preserve existing animation logic (pulse effect with sine wave)

### Step 4: Create GroundItem Class
- [x] Create `GroundItem.ts` extending `Item`
- [x] Constructor: `(worldX, worldY, params: ItemParams)`
- [x] Draw method: Use size from params to scale diamond graphic
- [x] Collect method: Call `ship.addMaxFuel(params.effectAmount)`
- [x] Visual style: Same neon pink, scaled by size parameter

### Step 5: Create AirItem Class
- [x] Create `AirItem.ts` extending `Item`
- [x] Constructor: `(worldX, worldY, params: ItemParams)` (identical to GroundItem)
- [x] Draw method: Use size from params to scale diamond graphic (same as GroundItem)
- [x] Collect method: Call `ship.addMaxFuel(params.effectAmount)`
- [x] Visual style: Same neon pink, scaled by size parameter
- [x] **Note**: Both classes are identical initially; they differ only in spawning location

### Step 6: Update PlatformGenerator for Ground Items
- [x] Modify `PlatformGenerator.ts`
- [x] After creating each platform, check `Math.random() < GAME_PARAMS.items.groundItem.spawnFrequency`
- [x] If spawn check passes, create new `GroundItem` at random x position on platform top surface
- [x] Add spawned item to a `groundItems` array managed by `GameScreen`
- [x] Pass `GAME_PARAMS.items.groundItem` to GroundItem constructor

### Step 7: Update GameScreen for Air Item Spawning
- [x] Modify `GameScreen.ts` update method
- [x] When platform generation identifies a gap between consecutive platforms:
  - [x] Check `Math.random() < GAME_PARAMS.items.airItem.spawnFrequency`
  - [x] If spawn check passes, compute random position in the gap:
    - [x] X: random between platform edge and next platform
    - [x] Y: random between platform bottom and next platform top
  - [x] Create new `AirItem` at computed position
  - [x] Add to `airItems` array
- [x] Pass `GAME_PARAMS.items.airItem` to AirItem constructor

### Step 8: Update GameScreen Item Collections Management
- [x] Maintain separate arrays: `groundItems: GroundItem[]` and `airItems: AirItem[]`
- [x] In each frame update:
  - [x] Call `item.update(ticker)` on all active items
  - [x] Clean up off-screen items (remove from arrays when x < screen left)

### Step 9: Update Collision Detection in GameScreen
- [x] In collision detection loop, add item-ship collision checks
- [x] For each ground item:
  - [x] Calculate distance from ship center to item center
  - [x] If distance <= `item.getCollisionRadius()`, call `item.collect(ship)`
  - [x] Remove collected items from `groundItems` array
- [x] For each air item:
  - [x] Same collision logic as ground items
  - [x] Remove collected items from `airItems` array
- [x] Collision order: Platform collision → Item collision (so landing is prioritized)

### Step 10: Update Imports and Exports
- [x] Update `src/app/game/index.ts` (if exists) to export new classes
- [x] Remove or deprecate `FuelItem` export (or keep for backward compatibility)
- [x] Ensure `Ship.addMaxFuel()` is still accessible

### Step 11: Type Safety and Compilation
- [x] Run `npm run build` (tsc + lint)
- [x] Fix any type errors in refactored Item class hierarchy
- [x] Ensure `ITEM_PICKUP_RADIUS` is no longer used (or update to use `GAME_PARAMS.items.pickupRadius`)

### Step 12: Documentation Update
- [x] Update `src/app/config/GameParams.ts` comments to document item system parameters
- [x] Add JSDoc comments to Item, GroundItem, AirItem classes explaining purpose and usage

### Step 13: Build Verification
- [x] Run `npm run lint` — must pass with no errors
- [x] Run `npm run build` — must produce clean artifacts with no type errors
- [x] Verify both ground and air items spawn during gameplay
- [x] Verify collision detection works for both item types
- [x] Verify collection effects apply correctly (fuel max increases)

### Step 14: Integration Test (Manual)
- [x] Launch game with dev server: `npm run dev`
- [ ] Play game, verify ground items appear on platforms
- [ ] Play game, verify air items appear in gaps between platforms
- [ ] Verify ground items are slightly smaller (size 1.0) than air items (size 1.5)
- [ ] Collect both types and confirm fuel max capacity increases
- [ ] Verify spawn frequency is balanced (medium for both)

---

## Code Location Summary

| File | Action | Location |
|------|--------|----------|
| `GameParams.ts` | Modify | `src/app/config/GameParams.ts` |
| `Item.ts` | Create | `src/app/game/Item.ts` (refactored from FuelItem) |
| `GroundItem.ts` | Create | `src/app/game/GroundItem.ts` |
| `AirItem.ts` | Create | `src/app/game/AirItem.ts` |
| `FuelItem.ts` | Deprecate | `src/app/game/FuelItem.ts` (keep for backward compatibility or delete) |
| `PlatformGenerator.ts` | Modify | `src/app/game/PlatformGenerator.ts` |
| `GameScreen.ts` | Modify | `src/app/screens/GameScreen.ts` |

---

## Story Traceability

- **Story**: "As a player, I want to collect items in the air gaps for strategic challenge"
  - Implemented by: AirItem spawning, air item collision detection, air item effect
- **Story**: "As a player, I want to collect items on platforms for consistency"
  - Implemented by: GroundItem spawning, ground item collision detection, ground item effect
- **Acceptance Criteria**: Items spawn with configurable frequency and effect; sizes differ visually

---

## Dependencies & Integration

- **No external package dependencies** — uses existing PixiJS APIs
- **Depends on**: `Ship.addMaxFuel()` method (already exists)
- **Affects**: `GameScreen` collision detection, platform generation loop
- **Backward compatibility**: Old `FuelItem` can be kept or removed; new classes are replacements

---

## Estimated Scope

- **New files**: 3 (Item.ts, GroundItem.ts, AirItem.ts)
- **Modified files**: 3 (GameParams.ts, PlatformGenerator.ts, GameScreen.ts)
- **Total steps**: 14
- **Complexity**: Moderate (refactoring + feature extension)
- **Risk**: Low (localized to game module, no structural changes)

---

## Approval Gate

**Ready to proceed with code generation?**

Please review this plan and confirm:
- [ ] Unit context and scope are clear
- [ ] Code locations are appropriate
- [ ] Step sequence is logical
- [ ] Integration points are correct
- [ ] Ready to execute code generation

**Next**: User approval → Part 2 Code Generation execution

