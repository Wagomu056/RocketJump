# Unit 3: Item System — Functional Design

## Business Logic Model

### Item Type System

The item system introduces two specialized item types, each with distinct spawning rules and effects:

#### Item Type 1: Ground Item (`GROUND_ITEM`)
- **Size Scaling**: 1.0 (base size)
- **Spawn Frequency**: Medium (0.4 probability per platform)
- **Effect Magnitude**: Low (restores 10 fuel max capacity per collection)
- **Spawn Location**: Only on platform surfaces (sitting on top of platforms)
- **Visual**: Same appearance as base item (neon pink diamond), but smaller
- **Collision Detection**: Standard AABB with size 1.0x multiplier

#### Item Type 2: Air Item (`AIR_ITEM`)
- **Size Scaling**: 1.5 (50% larger)
- **Spawn Frequency**: Medium (0.4 probability per air gap)
- **Effect Magnitude**: Large (restores 25 fuel max capacity per collection)
- **Spawn Location**: Floating in air between platforms (random position within vertical span)
- **Visual**: Same appearance as base item (neon pink diamond), but larger
- **Collision Detection**: Standard AABB with size 1.5x multiplier (scaled collision radius)

### Item Mechanics

1. **Spawning**:
   - Ground items spawn on newly generated platforms with configurable probability
   - Air items spawn in the empty space between consecutive platforms
   - Both types are placed randomly within their spawn zone

2. **Collection**:
   - When ship's collision radius overlaps item center, item is collected
   - Collected item is hidden and removed from active game
   - Ship receives effect (fuel max increase) immediately

3. **Physics**:
   - Items are static (no movement or physics)
   - Items have a position `(x, y)` in world coordinates
   - Collision detection uses a circular pickup radius scaled by size

### Game Parameters (Tunable)

All item properties are defined in `GAME_PARAMS.items`:

```typescript
items: {
  groundItem: {
    size: 1.0,              // Size multiplier (affects visual scale and collision)
    spawnFrequency: 0.4,    // Probability [0-1] of spawning on each platform
    effectAmount: 10,       // Fuel max increase value
  },
  airItem: {
    size: 1.5,              // Size multiplier
    spawnFrequency: 0.4,    // Probability [0-1] of spawning in each air gap
    effectAmount: 25,       // Fuel max increase value
  },
  pickupRadius: 30,         // Base collision detection radius (multiplied by item size)
}
```

### Data Flow

1. **Platform Generation** → Ground items spawned based on platform
2. **Gap Generation** → Air items spawned between platforms
3. **Game Loop (update)** → Items pulse/animate
4. **Collision Detection** → Check ship vs all active items
5. **Collection** → Apply effect, hide item

### Integration Points

- `PlatformGenerator`: Extended to spawn ground items on new platforms
- `GameScreen`: Extended with air item spawning logic in gap generation
- `Ship`: Extended method `addMaxFuel(amount)` already exists, will be reused
- Game Loop: Item update called each frame

### Business Rules

1. Each ground item increases max fuel by its configured `effectAmount`
2. Each air item increases max fuel by its configured `effectAmount`
3. Air items can be collected mid-air (no platform requirement)
4. Ground items can only be collected when standing on platform or passing over it
5. Size difference scales both visual representation and collision detection equally
6. Items are destroyed after collection or when off-screen

---

## Entity Models

### Item Base Class Structure

```
Item (abstract base)
  ├── x, y: world coordinates
  ├── size: 1.0 | 1.5
  ├── collected: boolean
  ├── pulseTime: number (for animation)
  └── methods:
      ├── draw(): void (render based on size)
      ├── update(ticker): void (pulse animation)
      └── collect(ship): void (apply effect)
```

### Specialized Items

- `GroundItem extends Item`: Ground-specific spawning logic
- `AirItem extends Item`: Air-specific spawning logic

Both share the same visual style and update mechanism, differing only in:
- Size
- Collection effect magnitude
- Spawning location/conditions

---

## Domain Rules

1. **Size determines both visual and collision scale** uniformly
2. **Ground items** spawn during platform generation
3. **Air items** spawn in computed air gaps
4. **Collection effect** is immediate and permanent
5. **Spawn frequencies** are independent probabilities per location
6. **All parameters are centralized** in `GAME_PARAMS.items` for easy tuning

