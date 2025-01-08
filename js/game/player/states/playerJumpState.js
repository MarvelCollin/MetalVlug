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

  async enter(sprite) {
    this.player.setSprite(sprite);
    this.canMove = true;
    this.currentFrame = 0;
    this.frameAccumulator = 0;
    this.frameTimer = Date.now();
    this.jumpForce = -16;
    this.player.velocityY = this.jumpForce;
    this.player.grounded = false;
    this.isShooting = false;

    if (
      !this.player.currentInputs.has("a") &&
      !this.player.currentInputs.has("d")
    ) {
      this.player.velocityX = 0;
    }

    if (this.player.lastDirection) {
      this.player.setDirection(
        this.player.lastDirection === "runLeft"
          ? DIRECTION.LEFT
          : DIRECTION.RIGHT
      );
    }
  }

  update(deltaTime) {
    if (this.player.currentSprite) {
      this.frameAccumulator += deltaTime;
      if (this.frameAccumulator >= this.player.currentSprite.delay) {
        if (this.player.velocityY < 0) {
          this.currentFrame = 0;
        } else if (this.player.velocityY > 0) {
          this.currentFrame = Math.min(
            4,
            this.player.currentSprite.images.length - 1
          );
        }
        this.frameAccumulator = 0;
      }

      if (this.player.currentInputs.has("a")) {
        this.player.velocityX = -this.player.speed;
      } else if (this.player.currentInputs.has("d")) {
        this.player.velocityX = this.player.speed;
      } else {
        this.player.velocityX = 0;
      }

      if (this.player.grounded) {
        console.log("jatuh");
        this.player.canJump = true;
        console.log(Assets.getPlayerMarcoPistolStandIdleNormal());
        this.player.setState(
          this.player.idleState,
          Assets.getPlayerMarcoPistolStandIdleNormal()
        );
        this.player.inputHandler.updatePlayerFromKeys();
        // this.player.goPreviousState();
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
        "jump",
        this.player.currentSprite.delay,
        undefined,
        undefined,
        flip,
        "ONCE"
      );
    }
  }
}

export default PlayerJumpState;
