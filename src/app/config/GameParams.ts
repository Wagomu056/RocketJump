export const GAME_PARAMS = {
  // Physics (spec §7)
  gravity: 0.25,
  frictionX: 0.98,
  frictionY: 0.99,
  thrustPower: 0.4,

  // Fuel system (spec §7)
  initialMaxFuel: 100,
  fuelDecreaseRate: 0.5,
  fuelRecoverRate: 0.8,
  cooldownDuration: 1.0, // seconds

  // Item system
  items: {
    pickupRadius: 30, // Base collision detection radius (multiplied by item size)
    groundItem: {
      size: 0.5, // Size multiplier for visuals and collision
      spawnFrequency: 0.5, // Probability [0-1] of spawning on each platform
      effectAmount: 5, // Fuel max increase value
    },
    airItem: {
      size: 1.0, // Size multiplier for visuals and collision
      spawnFrequency: 0.2, // Probability [0-1] of spawning in each air gap
      effectAmount: 15, // Fuel max increase value
    },
    distantItem: {
      size: 2.5, // Size multiplier for visuals and collision (extra large)
      spawnFrequency: 0.1, // Probability [0-1] of spawning in each air gap (rare)
      effectAmount: 50, // Fuel max increase value (very large reward)
      minShipHeights: 6.0, // Minimum distance below platforms in ship heights
      maxShipHeights: 10.0, // Maximum distance below platforms in ship heights
    },
  },

  // Camera
  cameraDeadZoneRatio: 0.4, // ship must be within left 40% of screen

  // Platform generation
  initialGapMin: 150,
  initialGapMax: 250,
  gapGrowthPerMeter: 0.05, // gap widens with distance
  maxGap: 450,
  platformWidthMin: 60,
  platformWidthMax: 200,
  platformHeight: 20,
  platformYMarginTop: 0.15, // fraction of screen height from top
  platformYMarginBottom: 0.2, // fraction of screen height from bottom
  itemSpawnChance: 0.3,
  worldBuffer: 600, // px ahead of camera to keep populated
  pixelsPerMeter: 10, // score = floor(totalScrolled / pixelsPerMeter)

  // Jet angle limits (spec angle system: 0° = straight up, CCW to 180° = straight down)
  jetAngleMinDeg: 170, // minimum angle — 0 = straight up (clamped when touch is upper side)
  jetAngleMaxDeg: 170, // maximum angle — 180 = straight down (clamped when touch is lower side)
} as const;
