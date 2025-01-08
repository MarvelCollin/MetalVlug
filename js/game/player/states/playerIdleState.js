import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../helper/assets.js";
import { DIRECTION } from "../../entities/components/actions.js";

class PlayerIdleState extends PlayerState {
  constructor(player) {
    super(player);
    this.canMove = false;
    this.frameAccumulator = 0;
    this.player.setSprite(Assets.getPlayerMarcoPistolStandIdleNormal());
  }

  async enter() {
    try {
      this.player.resetVelocity();
      this.currentFrame = 0;
      this.frameAccumulator = 0; 
    } catch (error) {
      console.error('Error in PlayerIdleState.enter:', error);
      this.player.setState(this.player.spawnState);
    }
  }

  update(deltaTime) {
  }

  draw() {
    if (this.player.currentSprite && this.player.currentSprite.images) {
      const flip = this.player.direction === DIRECTION.LEFT;
      Drawer.drawToCanvas(
        this.player.currentSprite.images,
        this.player.x,
        this.player.y,
        "idle",
        this.player.currentSprite.delay,
        undefined,
        undefined,
        flip
      );
    }
  }
}

export default PlayerIdleState;

