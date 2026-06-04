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

  constructor() {
    super();
    this.fuel = GAME_PARAMS.initialMaxFuel;
    this.maxFuel = GAME_PARAMS.initialMaxFuel;
    this.draw();
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
          let theta = Math.atan2(dy, dx);
          theta = Math.max(0, Math.min(Math.PI, theta));
          this._lastJetAngle = theta;

          this.vx -= Math.cos(theta) * GAME_PARAMS.thrustPower * dt;
          this.vy -= Math.sin(theta) * GAME_PARAMS.thrustPower * dt;

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
  }
}
