# Unit 4: Life System — Requirement Verification Questions

Your specification is very clear! A few clarifying questions to ensure we get the details right:

## Functional Requirements Clarification

**Q1: Initial Health & Damage Tiers**
- What should the initial/maximum health be?
- What are reasonable default values for:
  - Small damage threshold (minimum fall speed to trigger small damage)?
  - Small damage amount (HP deducted)?
  - Large damage threshold (higher fall speed)?
  - Large damage amount (HP deducted)?

Example answers: Max health: 100, Small threshold: 300px/s, Small damage: 25, Large threshold: 500px/s, Large damage: 50

[Answer]: 一旦Example valuesでお願いします。調整したいのでパラメータ化お願いします。

---

**Q2: Flashing Duration**
- How long should the ship flash when taking damage?
- Should it flash for a fixed duration (e.g., 1 second)?
- Should the flash frequency (blinks per second) be different for small vs large damage?

Example: Small damage: 0.6s total / 6 blinks, Large damage: 1.2s total / 8 blinks

[Answer]: Example valuesでお願いします。調整したいのでパラメータ化お願いします。

---

**Q3: Smoke Particle Effects**
- How many smoke particles per frame at 25% health threshold?
- How many smoke particles per frame at 10% health threshold?
- Should smoke spawn from a specific point on the ship, or around it?

Example: 25% = 1-2 particles/frame, 10% = 3-5 particles/frame, spawn from ship center

[Answer]: 宇宙船の中心からでOKです．その他の値はExampleでお願いします。調整したいのでパラメータ化お願いします。

---

**Q4: Game Over Behavior**
- When health reaches 0:
  - Should the explosion animation play before transitioning to GameOverScreen?
  - How long should the explosion last (if any)?
  - Should there be a brief pause/delay before showing the game over screen?

Example: Play 0.5s explosion animation, then transition to GameOverScreen

[Answer]: 例の通りでOK

---

**Q5: Health UI Visual Design**
- Should the health bar be:
  - A horizontal bar (like fuel gauge)?
  - A text display (e.g., "100/100")?
  - Both?
- What color should the health bar be? (e.g., green, cyan, white)
- Should it change color as health decreases (e.g., yellow at 50%, red at 25%)?

[Answer]: horizontal barで。色は緑、黄色、赤でお願いします。テキストは不要です。
---

## Summary

Once answered, these details will be incorporated into the Life System implementation. The core mechanics you specified (2-tier damage, white/red flashing, smoke at thresholds, explosion on death) are clear and ready to implement.

---

**Next**: Please fill in all [Answer]: fields above, then respond with "Done" or "Ready to proceed" when ready.
