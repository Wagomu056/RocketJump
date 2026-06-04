import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

import { GAME_PARAMS } from "../config/GameParams";

export type FuelState = "consuming" | "cooldown" | "charging";

export const SHIP_HALF_W = 18;
export const SHIP_HALF_H = 11;
const NOZZLE_LOCAL_X = -16;

export class Ship extends Container {
  public vx = 0;
  public vy = 0;
  public fuel: number;
  public maxFuel: number;
  public fuelState: FuelState = "charging";
  public prevBottom = 0;

  private cooldownTimer = 0;
  private _lastJetAngle = Math.PI / 2;
  private _isThrusting = false;
  private gaugeGfx: Graphics;

  // Vertical fuel gauge dimensions (in ship-local coords)
  private static readonly GAUGE_X = SHIP_HALF_W + 5;
  private static readonly GAUGE_H = 48;
  private static readonly GAUGE_W = 6;

  constructor() {
    super();
    this.fuel = GAME_PARAMS.initialMaxFuel;
    this.maxFuel = GAME_PARAMS.initialMaxFuel;
    this.draw();
    this.gaugeGfx = new Graphics();
    this.addChild(this.gaugeGfx);
    this.updateFuelGauge();
  }

  private draw(): void {
    const g = new Graphics();
    // Body: rocket polygon pointing right, centered at (0,0)
    g.poly([20, 0, -8, -11, -16, -4, -16, 4, -8, 11])
      .fill(0x00e5ff)
      .stroke({ color: 0x0099bb, width: 1 });
    // Nozzle glow dot
    g.circle(NOZZLE_LOCAL_X, 0, 4).fill({ color: 0x00ffff, alpha: 0.6 });
    this.addChild(g);
  }

  public get isThrusting(): boolean {
    return this._isThrusting;
  }

  public get lastJetAngle(): number {
    return this._lastJetAngle;
  }

  public get nozzleX(): number {
    return this.x + NOZZLE_LOCAL_X;
  }

  public get nozzleY(): number {
    return this.y;
  }

  public left(): number {
    return this.x - SHIP_HALF_W;
  }
  public right(): number {
    return this.x + SHIP_HALF_W;
  }
  public top(): number {
    return this.y - SHIP_HALF_H;
  }
  public bottom(): number {
    return this.y + SHIP_HALF_H;
  }

  public land(platformTopY: number): void {
    this.y = platformTopY - SHIP_HALF_H;
    this.vy = 0;
  }

  public addMaxFuel(amount: number): void {
    this.maxFuel += amount;
    this.fuel = Math.min(this.fuel + GAME_PARAMS.initialMaxFuel, this.maxFuel);
  }

  public update(
    ticker: Ticker,
    isDown: boolean,
    touchXWorld: number,
    touchYWorld: number,
  ): void {
    const dt = ticker.deltaTime;
    const elapsedSec = ticker.elapsedMS / 1000;

    // Snapshot bottom before movement (tunnelling prevention)
    this.prevBottom = this.bottom();

    this._isThrusting = false;

    switch (this.fuelState) {
      case "consuming": {
        if (isDown && this.fuel > 0) {
          this._isThrusting = true;
          this.fuel = Math.max(
            0,
            this.fuel - GAME_PARAMS.fuelDecreaseRate * dt,
          );

          const dx = touchXWorld - this.x;
          const dy = touchYWorld - this.y;

          // Spec angle α: 0 = straight up, π/2 = left, π = straight down (CCW).
          // Computed as atan2(-dx, -dy) in screen coords (y-down).
          const minAlpha = (GAME_PARAMS.jetAngleMinDeg * Math.PI) / 180;
          const maxAlpha = (GAME_PARAMS.jetAngleMaxDeg * Math.PI) / 180;

          let specAlpha =
            dx === 0 && dy === 0 ? maxAlpha : Math.atan2(-dx, -dy);

          // Clamp to [minAlpha, maxAlpha] — snap to nearest boundary.
          if (specAlpha < minAlpha || specAlpha > maxAlpha) {
            const angDist = (d: number) => {
              const m = Math.abs(d) % (2 * Math.PI);
              return m > Math.PI ? 2 * Math.PI - m : m;
            };
            specAlpha =
              angDist(specAlpha - minAlpha) <= angDist(specAlpha - maxAlpha)
                ? minAlpha
                : maxAlpha;
          }

          // Screen-space jet angle for the particle system
          this._lastJetAngle = Math.atan2(
            -Math.cos(specAlpha),
            -Math.sin(specAlpha),
          );

          // Apply thrust (ship accelerates opposite to jet direction)
          this.vx += Math.sin(specAlpha) * GAME_PARAMS.thrustPower * dt;
          this.vy += Math.cos(specAlpha) * GAME_PARAMS.thrustPower * dt;

          if (this.fuel === 0) {
            this.fuelState = "cooldown";
            this.cooldownTimer = GAME_PARAMS.cooldownDuration;
          }
        } else {
          this.fuelState = "cooldown";
          this.cooldownTimer = GAME_PARAMS.cooldownDuration;
        }
        break;
      }

      case "cooldown": {
        this.cooldownTimer -= elapsedSec;
        if (isDown && this.fuel > 0) {
          this.fuelState = "consuming";
        } else if (this.cooldownTimer <= 0) {
          this.fuelState = "charging";
        }
        break;
      }

      case "charging": {
        this.fuel = Math.min(
          this.maxFuel,
          this.fuel + GAME_PARAMS.fuelRecoverRate * dt,
        );
        if (isDown && this.fuel > 0) {
          this.fuelState = "consuming";
        }
        break;
      }
    }

    // Physics (frame-rate independent)
    this.vy += GAME_PARAMS.gravity * dt;
    this.vx *= Math.pow(GAME_PARAMS.frictionX, dt);
    this.vy *= Math.pow(GAME_PARAMS.frictionY, dt);

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  /** Redraw the vertical fuel gauge to the right of the ship. */
  public updateFuelGauge(): void {
    const ratio = this.maxFuel > 0 ? Math.min(this.fuel / this.maxFuel, 1) : 0;
    const x = Ship.GAUGE_X;
    const h = Ship.GAUGE_H;
    const w = Ship.GAUGE_W;
    const topY = -h / 2;

    const g = this.gaugeGfx;
    g.clear();
    // Track background
    g.roundRect(x, topY, w, h, 2).fill({ color: 0x333355, alpha: 0.8 });
    // Fill from bottom up
    if (ratio > 0) {
      const fillH = h * ratio;
      const fillColor = ratio > 0.25 ? 0x00e5ff : 0xff3300;
      g.roundRect(x, topY + h - fillH, w, fillH, 2).fill(fillColor);
    }
    // Border
    g.roundRect(x, topY, w, h, 2).stroke({ color: 0x8888aa, width: 1 });
  }

  public resetState(): void {
    this.vx = 0;
    this.vy = 0;
    this.fuel = GAME_PARAMS.initialMaxFuel;
    this.maxFuel = GAME_PARAMS.initialMaxFuel;
    this.fuelState = "charging";
    this.cooldownTimer = 0;
    this._isThrusting = false;
    this._lastJetAngle = Math.PI / 2;
    this.prevBottom = 0;
    this.updateFuelGauge();
  }
}
