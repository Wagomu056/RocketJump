import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

import { GAME_PARAMS } from "../config/GameParams";

export type FuelState = "consuming" | "cooldown" | "charging";

export const SHIP_HALF_W = 18;
export const SHIP_HALF_H = 11;
export const SHIP_LEG_BOTTOM = 22; // local y of leg-tip contact point
const NOZZLE_LOCAL_X = -14; // left edge of circular body (r=14)

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

    // --- Rear fins (red, drawn behind body) ---
    g.poly([-10, -8, -20, -18, -10, -18]).fill(0xef4444);
    g.poly([-10, 8, -20, 18, -10, 18]).fill(0xef4444);

    // --- Landing legs (gray, behind body) ---
    // Front leg (spreads nose-ward and down)
    g.moveTo(6, 11)
      .lineTo(15, 22)
      .lineTo(22, 22)
      .stroke({ color: 0x94a3b8, width: 3.5, cap: "round", join: "round" });
    // Rear leg (spreads tail-ward and down)
    g.moveTo(-3, 11)
      .lineTo(-11, 22)
      .lineTo(-18, 22)
      .stroke({ color: 0x94a3b8, width: 3.5, cap: "round", join: "round" });

    // --- Main body (white sphere, like SVG) ---
    g.circle(0, 0, 14).fill(0xf8fafc).stroke({ color: 0xc4d5e8, width: 1.5 });

    // Lower-body shading
    g.ellipse(0, 4, 13, 7).fill({ color: 0xb0c4d8, alpha: 0.4 });

    // --- Porthole window (blue, front of rocket) ---
    g.circle(7, -2, 5.5).fill(0x38bdf8).stroke({ color: 0x334155, width: 2 });
    // Window reflection highlight
    g.circle(5.5, -3.5, 2).fill({ color: 0xffffff, alpha: 0.6 });

    // --- Engine nozzle glow (left edge) ---
    g.circle(NOZZLE_LOCAL_X, 0, 4.5).fill({ color: 0xff8c00, alpha: 0.7 });
    g.circle(NOZZLE_LOCAL_X, 0, 2.5).fill({ color: 0xffee00, alpha: 0.9 });

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
    this.y = platformTopY - SHIP_LEG_BOTTOM;
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

    // Snapshot leg-tip bottom before movement (tunnelling prevention)
    this.prevBottom = this.y + SHIP_LEG_BOTTOM;

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
