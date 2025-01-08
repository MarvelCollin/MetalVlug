import PlayerState from "./playerState.js";
import PlayerShootState from "./playerShootState.js";
import { DIRECTION } from "../../entities/components/actions.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../helper/assets.js";
import PlayerIdleState from "./playerIdleState.js";

class PlayerJumpState extends PlayerState {
  constructor(player) {
    super(player);
    this.frameAccumulator = 0;
  }

  async enter() {
    this.canMove = true;
    this.currentFrame = 0;
    this.frameAccumulator = 0;
    this.frameTimer = Date.now();
    this.jumpForce = -16;
    this.player.velocityY = this.jumpForce;
    this.player.grounded = false;
    this.isShooting = false;

    if (this.player.lastDirection) {
      this.player.setDirection(
        this.player.lastDirection === "runLeft"
          ? DIRECTION.LEFT
          : DIRECTION.RIGHT
      );
    }
  }

  update(deltaTime) {
    if (this.currentSprite) {
      this.frameAccumulator += deltaTime;
      if (this.frameAccumulator >= this.currentSprite.delay) {
        if (this.player.velocityY < 0) {
          this.currentFrame = 0;
        } else if (this.player.velocityY > 0) {
          this.currentFrame = Math.min(4, this.currentSprite.images.length - 1);
        }
        this.frameAccumulator = 0;
      }

      if (this.player.grounded) {
        const currentDirection = this.player.lastDirection;
        this.player.setState(new PlayerIdleState(this.player));
        this.player.canJump = true;
      }
    }
  }

  draw() {
    if (this.currentSprite) {
      const flip = this.player.direction === DIRECTION.LEFT;
      Drawer.drawToCanvas(
        this.currentSprite.images,
        this.player.x,
        this.player.y,
        "jump",
        this.currentSprite.delay,
        undefined,
        undefined,
        flip,
        "ONCE"
      );
    }
  }
}

export default PlayerJumpState;
