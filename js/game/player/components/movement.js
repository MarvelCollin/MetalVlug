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
        if (this.player.grounded) {
            this.player.velocityY = this.player.jumpForce;
            this.player.grounded = false;
        }
    }

    update() {
        if (this.player.state?.canMove) {
            this.player.x += this.player.velocityX;
        }

        if (!this.player.grounded) {
            this.player.velocityY = Math.min(this.player.velocityY + this.player.gravity, this.player.terminalVelocity);
            this.player.y += this.player.velocityY;
        } else {
            this.player.velocityY = 0;
        }

    }
}

export default Movement;
