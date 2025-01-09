import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../helper/assets.js";
import { DIRECTION } from "../../entities/components/actions.js";

class PlayerIdleState extends PlayerState {
  constructor(player) {
    super(player);
    this.canMove = true;
    this.frameAccumulator = 0;
  }
  
  async enter(sprite) {
    this.player.resetVelocity();
    this.currentFrame = 0;
    this.frameAccumulator = 0; 
    this.player.isShooting = false;
    if (sprite) {
        await this.player.setSprite(sprite);
    } else {
        await this.player.setSprite(Assets.getPlayerMarcoPistolStandIdleNormal());
    }
  }
  
  update() {
    this.player.inputHandler.handleJump(this.player.currentInputs, Assets.getPlayerMarcoPistolJumpIdle());
    
    if(this.player.grounded) {
      this.player.inputHandler.handleMove(this.player.currentInputs, Assets.getPlayerMarcoPistolStandRun());
    }

    this.player.inputHandler.handleShoot(
      this.player.currentInputs,
      Assets.getPlayerMarcoPistolStandShoot()
    );
  }
  
  draw() {
    if (this.player.currentSprite && this.player.currentSprite.images) {
      const flip = this.player.direction === DIRECTION.LEFT;
      Drawer.drawToCanvas(
        this.player.currentSprite.images,
        this.player.x,
        this.player.y,
        this.player.currentSprite.delay,
        undefined,
        undefined,
        flip
      );
    }
  }
}

export default PlayerIdleState;

