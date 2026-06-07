import type { ItemParams } from "./Item";
import { Item } from "./Item";

export interface DistantItemParams extends ItemParams {
  minShipHeights: number; // Minimum distance below platforms in ship heights
  maxShipHeights: number; // Maximum distance below platforms in ship heights
}

export class DistantItem extends Item {
  constructor(
    worldX: number,
    worldY: number,
    params: DistantItemParams,
    pickupRadius: number,
  ) {
    super(worldX, worldY, params, pickupRadius);
  }
}
