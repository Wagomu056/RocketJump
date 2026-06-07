import type { ItemParams } from "./Item";
import { Item } from "./Item";

export class AirItem extends Item {
  constructor(
    worldX: number,
    worldY: number,
    params: ItemParams,
    pickupRadius: number,
  ) {
    super(worldX, worldY, params, pickupRadius);
  }
}
