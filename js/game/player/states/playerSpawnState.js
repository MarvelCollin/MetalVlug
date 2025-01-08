import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../helper/assets.js";
import { canvas } from "../../ctx.js";
import PlayerIdleState from "./playerIdleState.js";

class PlayerSpawnState extends PlayerState {
  constructor(player) {
    super(player);
  }

  async enter() {
    this.player.setDirection(null);
    this.player.resetVelocity();
    this.player.y = 300;
    this.player.setSprite(Assets.getPlayerMarcoPistolSpawn());
  }

  update() {
    if (this.player.currentSprite) {
      const currentFrame = Drawer.currentFrames["spawn"];
      if (currentFrame >= this.player.currentSprite.images.length - 1) {
        console.log("a");
        this.player.setState(this.player.idleState);
        this.player.setSprite(Assets.getPlayerMarcoPistolStandIdleNormal());
      }
    }
  }

  draw() {
    if (this.player.currentSprite) {
      Drawer.drawToCanvas(
        this.player.currentSprite.images,
        this.player.x * this.player.getScaleX(),
        this.player.y,
        "spawn",
        this.player.currentSprite.delay
      );
    }
  }
}

export default PlayerSpawnState;
