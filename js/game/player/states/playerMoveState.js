import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../helper/assets.js";
import { ctx } from "../../ctx.js";
import { DIRECTION } from "../../entities/components/actions.js";

class PlayerMoveState extends PlayerState {
  constructor(player) {
    super(player);
    this.canMove = true;
    this.frameAccumulator = 0;
    this.currentFrame = 0;
  }

  async enter() {
    this.player.setSprite(Assets.getPlayerMarcoPistolStandRun());
    this.currentFrame = 0;
    this.frameAccumulator = 0;
  }

  update(deltaTime) {
    if (this.player.currentSprite) {
      this.frameAccumulator += deltaTime;
      if (this.frameAccumulator >= this.player.currentSprite.delay) {
        this.currentFrame =
          (this.currentFrame + 1) % this.player.currentSprite.images.length;
        this.frameAccumulator = 0;
      }
    }
  }

  draw() {
    if (this.player.currentSprite) {
      const flip = this.player.direction === DIRECTION.LEFT;
      Drawer.drawToCanvas(
        this.player.currentSprite.images,
        this.player.x,
        this.player.y,
        "run",
        this.player.currentSprite.delay,
        undefined,
        undefined,
        flip
      );
    }
  }
}

export default PlayerMoveState;
