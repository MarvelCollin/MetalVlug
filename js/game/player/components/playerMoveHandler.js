import { DIRECTION, ACTION } from "../../entities/components/actions.js";

class PlayerMoveHandler {
    constructor(player) {
        this.player = player;
        this.velocityX = 0;
        this.velocityY = 0; 
        this.isJumping = false; 
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
        if (this.isJumping) {
            this.player.y += this.velocityY; 
            this.velocityY += this.player.gravity;

            this.player.currentJumpHeight += Math.abs(this.velocityY);
            if (this.player.currentJumpHeight >= this.player.maxJumpHeight) {
                this.isJumping = false; 
            }
        } else {
            this.applyGravity(); 
        }

        this.applyMovement(); 

    }
}

export default PlayerMoveHandler;
