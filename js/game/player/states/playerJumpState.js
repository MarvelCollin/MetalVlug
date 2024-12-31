import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../assets.js';

class PlayerJumpState extends PlayerState {
    async enter() {
        try {
            this.jumpImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolJumpIdle());
            this.currentFrame = 0;
            this.frameTimer = Date.now();
            this.jumpForce = -22;  
            this.player.velocityY = this.jumpForce;  
            this.player.grounded = false;          
        } catch (error) {
            console.error('Failed to load jump state assets:', error);
        }
    }

    handleInput(input) {
        if (input === 'shoot') {
            const bulletState = new PlayerShootState(this.player);
            bulletState.previousState = this; 
            this.player.setState(bulletState);
        } else if (input === 'runLeft') {
            this.player.setDirection(Direction.LEFT);
        } else if (input === 'runRight') {
            this.player.setDirection(Direction.RIGHT);
        }
    }

    update() {
        if (this.jumpImages) {
            const now = Date.now();
            if (now - this.frameTimer >= this.jumpImages.delay) {
                if (this.player.velocityY < 0) {
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
