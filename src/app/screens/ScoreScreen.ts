import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Graphics, Text } from "pixi.js";

import { engine } from "../getEngine";
import { userSettings } from "../utils/userSettings";

import { GameScreen } from "./GameScreen";
import { TitleScreen } from "./TitleScreen";

export class ScoreScreen extends Container {
  public static assetBundles: string[] = [];

  private scoreLabel: Text;
  private newRecordLabel: Text;
  private retryButton: Container;
  private titleButton: Container;

  constructor() {
    super();

    this.scoreLabel = new Text({
      text: "0m",
      style: {
        fontFamily: "Arial Black, Arial",
        fontSize: 72,
        fontWeight: "bold",
        fill: "#ffffff",
      },
      anchor: 0.5,
    });
    this.addChild(this.scoreLabel);

    this.newRecordLabel = new Text({
      text: "NEW RECORD!",
      style: {
        fontFamily: "Arial",
        fontSize: 28,
        fontWeight: "bold",
        fill: "#ff007f",
        dropShadow: {
          color: "#ff007f",
          blur: 20,
          distance: 0,
          alpha: 0.9,
          angle: 0,
        },
      },
      anchor: 0.5,
    });
    this.newRecordLabel.visible = false;
    this.addChild(this.newRecordLabel);

    this.retryButton = this.makeButton("RETRY", "#39ff14", 0x39ff14);
    this.retryButton.on("pointerdown", () => {
      void engine().navigation.showScreen(GameScreen);
    });
    this.addChild(this.retryButton);

    this.titleButton = this.makeButton("TITLE", "#aaaacc", 0xaaaacc);
    this.titleButton.on("pointerdown", () => {
      void engine().navigation.showScreen(TitleScreen);
    });
    this.addChild(this.titleButton);
  }

  private makeButton(
    label: string,
    textColor: string,
    strokeColor: number,
  ): Container {
    const btn = new Container();
    const w = 220;
    const h = 60;
    const bg = new Graphics()
      .roundRect(-w / 2, -h / 2, w, h, 8)
      .fill({ color: strokeColor, alpha: 0.1 })
      .stroke({ color: strokeColor, width: 2 });
    const txt = new Text({
      text: label,
      style: {
        fontFamily: "Arial",
        fontSize: 26,
        fontWeight: "bold",
        fill: textColor,
      },
      anchor: 0.5,
    });
    btn.addChild(bg, txt);
    btn.eventMode = "static";
    btn.cursor = "pointer";
    return btn;
  }

  public async show(): Promise<void> {
    this.alpha = 0;
    const score = userSettings.lastScore;
    this.scoreLabel.text = `${score}m`;

    const prev = userSettings.getHighScore();
    if (score > prev) {
      userSettings.setHighScore(score);
      this.newRecordLabel.visible = true;
    } else {
      this.newRecordLabel.visible = false;
    }

    await animate(this, { alpha: 1 } as ObjectTarget<this>, {
      duration: 0.5,
      ease: "easeOut",
    });
  }

  public async hide(): Promise<void> {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, { duration: 0.25 });
  }

  public reset(): void {
    this.scoreLabel.text = "0m";
    this.newRecordLabel.visible = false;
  }

  public resize(width: number, height: number): void {
    const cx = width / 2;
    const cy = height / 2;
    this.scoreLabel.position.set(cx, cy - 120);
    this.newRecordLabel.position.set(cx, cy - 40);
    this.retryButton.position.set(cx, cy + 40);
    this.titleButton.position.set(cx, cy + 120);
  }
}
