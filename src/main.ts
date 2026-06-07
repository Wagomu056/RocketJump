import { setEngine } from "./app/getEngine";
import { LoadScreen } from "./app/screens/LoadScreen";
import { TitleScreen } from "./app/screens/TitleScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";
// import "@esotericsoftware/spine-pixi-v8";

// Disable iOS Safari magnifier and text selection UI on long-press
if (typeof document !== "undefined") {
  const pixiContainer = document.querySelector("#pixi-container");
  const preventTouchUI = (e: TouchEvent) => {
    // Allow events on canvas only, prevent magnifier on everything else
    if (e.target === document.querySelector("canvas")) {
      e.preventDefault();
    }
  };

  // Prevent magnifier on all touch events
  document.addEventListener("touchstart", preventTouchUI, { passive: false });
  document.addEventListener("touchmove", preventTouchUI, { passive: false });
  document.addEventListener("touchend", preventTouchUI, { passive: false });
  document.addEventListener("gesturestart", (e) => {
    e.preventDefault();
  });

  // Prevent context menu
  if (pixiContainer) {
    pixiContainer.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }
}

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Initialize the creation engine instance
  await engine.init({
    background: "#0a0a12",
    resizeOptions: { minWidth: 390, minHeight: 640, letterbox: false },
  });

  // Initialize the user settings
  userSettings.init();

  // Show the load screen
  await engine.navigation.showScreen(LoadScreen);
  // Show the title screen once assets are loaded
  await engine.navigation.showScreen(TitleScreen);
})();
