import { DIRECTION, ACTION } from "../../entities/components/actions.js";

class PlayerMoveHandler {
    constructor(player) {
        this.player = player;
        this.velocityX = 0; // Add horizontal velocity
        this.velocityY = 0;
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
        if (this.player.grounded && this.player.currentJumpHeight === 0) {
            this.velocityY = -15; // Initial jump velocity
            this.player.grounded = false;
            this.player.currentJumpHeight += Math.abs(this.velocityY);
            this.player.actions.add(ACTION.JUMP);
        }
    }

    applyGravity() {
        if (!this.player.grounded) {
            this.velocityY += this.player.gravity;
            if (this.velocityY > this.player.terminalVelocity) {
                this.velocityY = this.player.terminalVelocity;
            }
            this.player.y += this.velocityY;

            // Check if player has landed (example condition)
            if (this.player.y >= this.player.groundLevel) {
                this.player.y = this.player.groundLevel;
                this.player.grounded = true;
                this.velocityY = 0;
                this.player.actions.delete(ACTION.JUMP);
            } else {
                this.player.grounded = false;
            }
        }
    }

    applyMovement() {
        this.player.x += this.velocityX;
    }

    resetVelocity() {
        this.velocityX = 0; // Reset horizontal velocity
        this.velocityY = 0; // Reset vertical velocity
    }

    update() {
        this.applyGravity();
        this.applyMovement(); // Apply horizontal movement each frame
    }
}

export default PlayerMoveHandler;
