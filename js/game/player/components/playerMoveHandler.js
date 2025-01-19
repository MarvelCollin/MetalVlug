import { DIRECTION, ACTION } from "../../entities/components/actions.js";

class PlayerMoveHandler {
  constructor(player) {
    this.player = player;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.dashSpeed = 20; // Add dash speed
    this.isDashing = false;
    this.dashDuration = 350; // milliseconds
    this.dashStartTime = 0;
  }

  move(direction) {
    if (direction === DIRECTION.LEFT) {
      this.velocityX = -this.player.speed;
      this.player.lastDirection = DIRECTION.LEFT;
    } else if (direction === DIRECTION.RIGHT) {
      this.velocityX = this.player.speed;
      this.player.lastDirection = DIRECTION.RIGHT;
    }
  }

  jump() {
    if (this.player.grounded && !this.isJumping) {
      this.isJumping = true;
      this.player.currentJumpHeight = 0;
      this.player.grounded = false;
      this.player.actions.add(ACTION.JUMP);
      this.velocityY = this.player.jumpForce;
    }
  }

  dash() {
    if (!this.isDashing) {
      this.isDashing = true;
      this.dashStartTime = Date.now();
      const dashMultiplier = this.player.lastDirection === DIRECTION.LEFT ? -1 : 1;
      this.velocityX = this.dashSpeed * dashMultiplier;
    }
  }

  applyGravity() {
    if (!this.player.grounded) {
      this.velocityY += this.player.gravity;
      if (this.velocityY > this.player.terminalVelocity) {
        this.velocityY = this.player.terminalVelocity;
      }
      this.player.y += this.velocityY;
    }
  }

  applyMovement() {
    this.player.x += this.velocityX;
  }

  resetVelocity() {
    this.velocityX = 0;
  }

  resetOnLanding() {
    if (this.player.grounded) {
      this.isJumping = false;
      this.player.currentJumpHeight = 0;
    }
  }

  update() {
    if (this.isDashing) {
      if (Date.now() - this.dashStartTime >= this.dashDuration) {
        this.isDashing = false;
        this.player.actions.delete(ACTION.DASH);
        this.velocityX = 0;
      }
    }

    if (!this.player.isShooting) {
      this.player.actions.delete(ACTION.SHOOT);
    }

    if (this.player.actions.has(ACTION.JUMP)) {
      this.player.y += this.velocityY;
      this.velocityY += this.player.gravity;

      this.player.currentJumpHeight += Math.abs(this.velocityY);
      if (this.player.currentJumpHeight >= this.player.maxJumpHeight) {
        this.isJumping = false;
        this.player.actions.delete(ACTION.JUMP);
      }
    } else if (!this.player.grounded) {
      this.applyGravity();
    }

    this.applyMovement();

    if (this.player.grounded && !this.player.actions.has(ACTION.JUMP)) {
      this.velocityY = 0;
      this.isJumping = false;
    }
  }
}

export default PlayerMoveHandler;
