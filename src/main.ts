import { AUTO, Game, Scale } from "phaser";
import { FIXED_FPS, VIEW_H, VIEW_W } from "./config/display";
import { PHYSICS } from "./config/tuning";
import { BootScene } from "./game/scenes/BootScene";
import { TitleScene } from "./game/scenes/TitleScene";
import { MissionScene } from "./game/scenes/MissionScene";
import { HudScene } from "./game/scenes/HudScene";
import { PauseScene } from "./game/scenes/PauseScene";

export const game = new Game({
  type: AUTO,
  parent: "game",
  width: VIEW_W,
  height: VIEW_H,
  backgroundColor: "#1b1626",
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH },
  input: { gamepad: true },
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: PHYSICS.gravity }, fixedStep: true, fps: FIXED_FPS, debug: new URLSearchParams(location.search).has("debug") },
  },
  scene: [BootScene, TitleScene, MissionScene, HudScene, PauseScene],
});

if (import.meta.env.DEV) (window as unknown as { __game: Game }).__game = game;
