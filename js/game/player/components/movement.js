import { DIRECTION } from "../../entities/components/actions.js";

class Movement {
    constructor(player) {
        this.player = player;
    }

    move(direction) {
        this.player.direction = direction;
        this.player.velocityX =
          direction === DIRECTION.LEFT
            ? -this.player.speed
            : direction === DIRECTION.RIGHT
            ? this.player.speed
            : 0;
    }

    jump() {
        // Increment jump height and apply jump force if not exceeding maxJumpHeight
        if (this.player.grounded && this.player.currentJumpHeight < this.player.maxJumpHeight) {
            this.player.velocityY = this.player.jumpForce;
            this.player.grounded = false;
            this.player.currentJumpHeight += Math.abs(this.player.jumpForce);
        }
    }

    update() {
        if (this.player.state?.canMove) {
            this.player.x += this.player.velocityX;
        }

        if (!this.player.grounded) {
            if (this.player.currentJumpHeight < this.player.maxJumpHeight) {
                this.player.velocityY += this.player.gravity;
                this.player.currentJumpHeight += this.player.gravity;
            } else {
                this.player.velocityY = Math.min(this.player.velocityY + this.player.gravity, this.player.terminalVelocity);
            }
            this.player.y += this.player.velocityY;
        } else {
            this.player.velocityY = 0;
            this.player.currentJumpHeight = 0; 
        }

    }
}

export default Movement;
