import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../helper/assets.js";
import { canvas } from "../../ctx.js";
import PlayerIdleState from "./playerIdleState.js";
import { DIRECTION } from "../../entities/components/actions.js";

class PlayerSpawnState extends PlayerState {
  constructor(player) {
    super(player);
  }

  async enter() {
    this.player.resetVelocity();
    this.player.y = 300;
    this.player.setSprite(Assets.getPlayerMarcoPistolSpawn());
  }

  update() {
    if (this.player.currentSprite) {
      const currentFrame = Drawer.currentFrames["spawn"];
      if (currentFrame >= this.player.currentSprite.images.length - 1) {
        console.log("a");
        this.player.setState(
          this.player.idleState,
          Assets.getPlayerMarcoPistolStandIdleNormal()
        );
      }
    }
  }

  exit() {
    this.player.currentFrame = 0;
    Drawer.currentFrames["spawn"] = 0;
  }
}

export default PlayerSpawnState;
