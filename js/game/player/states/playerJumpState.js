import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../assets.js';

class PlayerJumpState extends PlayerState {
    async enter() {
        if (!this.jumpImages) {
            this.jumpImages = await Drawer.loadImage(Assets.getJump());
        }
        this.currentFrame = 0;
        this.frameTimer = Date.now();
        this.jumpForce = -22;  
        this.gravity = 0.6;     
        this.velocityY = this.jumpForce;
        this.isJumping = true;
        this.groundLevel = this.player.initialY;
        this.maxJumpHeight = 500; 
    }

    handleInput(input) {
        if (input === 'shoot') {
            this.player.setState(this.player.shootState);
        } else if (input === 'runLeft') {
            this.player.direction = 'LEFT';
            this.player.x -= this.player.speed * 0.8;
        } else if (input === 'runRight') {
            this.player.direction = 'RIGHT';
            this.player.x += this.player.speed * 0.8;
        }
    }

    update() {
        if (!this.isJumping) return;

        const deltaTime = 1/60;
        this.velocityY += this.gravity;

        if (this.player.y <= this.groundLevel - this.maxJumpHeight) {
            this.velocityY = Math.max(this.velocityY, 0);
        }

        this.player.y += this.velocityY;

        if (this.player.y >= this.groundLevel) {
            this.player.y = this.groundLevel;
            this.velocityY = 0;
            this.isJumping = false;
            this.player.grounded = true;
            this.player.setState(this.player.idleState);
        }

        if (this.jumpImages) {
            const now = Date.now();
            if (now - this.frameTimer >= this.jumpImages.delay) {
                if (this.velocityY < 0) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = Math.min(4, this.jumpImages.images.length - 1);
                }
                this.frameTimer = now;
            }
        }
    }

    draw() {
        if (this.jumpImages) {
            Drawer.drawToCanvas(
                this.jumpImages.images,
                this.player.x * this.player.getScaleX(),
                this.player.y * this.player.getScaleY(),
                'jump',
                this.jumpImages.delay
            );
        }
    }
}

export default PlayerJumpState;
