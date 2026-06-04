import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Graphics, Text } from "pixi.js";

import { engine } from "../getEngine";
import { userSettings } from "../utils/userSettings";

import { GameScreen } from "./GameScreen";

export class TitleScreen extends Container {
  public static assetBundles: string[] = [];

  private titleText: Text;
  private subtitleText: Text;
  private highScoreLabel: Text;
  private startButton: Container;

  constructor() {
    super();

    this.titleText = new Text({
      text: "ROCKET JUMP",
      style: {
        fontFamily: "Arial Black, Arial",
        fontSize: 64,
        fontWeight: "bold",
        fill: "#00e5ff",
        dropShadow: {
          color: "#00e5ff",
          blur: 30,
          distance: 0,
          alpha: 0.9,
          angle: 0,
        },
      },
      anchor: 0.5,
    });
    this.addChild(this.titleText);

    this.subtitleText = new Text({
      text: "PLATFORM RUNNER",
      style: {
        fontFamily: "Arial",
        fontSize: 20,
        fill: "#aaaacc",
        letterSpacing: 6,
      },
      anchor: 0.5,
    });
    this.addChild(this.subtitleText);

    this.highScoreLabel = new Text({
      text: "BEST: 0m",
      style: {
        fontFamily: "Arial",
        fontSize: 22,
        fill: "#39ff14",
      },
      anchor: 0.5,
    });
    this.addChild(this.highScoreLabel);

    this.startButton = this.makeButton("START");
    this.startButton.on("pointerdown", () => {
      void engine().navigation.showScreen(GameScreen);
    });
    this.addChild(this.startButton);
  }

  private makeButton(label: string): Container {
    const btn = new Container();
    const w = 240;
    const h = 64;
    const bg = new Graphics()
      .roundRect(-w / 2, -h / 2, w, h, 8)
      .fill({ color: 0x00e5ff, alpha: 0.12 })
      .stroke({ color: 0x00e5ff, width: 2 });
    const txt = new Text({
      text: label,
      style: {
        fontFamily: "Arial",
        fontSize: 28,
        fontWeight: "bold",
        fill: "#00e5ff",
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
    this.highScoreLabel.text = `BEST: ${userSettings.getHighScore()}m`;
    await animate(this, { alpha: 1 } as ObjectTarget<this>, {
      duration: 0.5,
      ease: "easeOut",
    });
  }

  public async hide(): Promise<void> {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, { duration: 0.25 });
  }

  public reset(): void {
    this.highScoreLabel.text = `BEST: ${userSettings.getHighScore()}m`;
  }

  public resize(width: number, height: number): void {
    const cx = width / 2;
    const cy = height / 2;
    // Scale title so it fits within 88% of screen width
    const maxW = width * 0.88;
    const titleW = this.titleText.width || maxW;
    this.titleText.scale.set(Math.min(1, maxW / titleW));
    this.titleText.position.set(cx, cy - 140);
    this.subtitleText.position.set(cx, cy - 75);
    this.highScoreLabel.position.set(cx, cy - 20);
    this.startButton.position.set(cx, cy + 60);
  }
}
