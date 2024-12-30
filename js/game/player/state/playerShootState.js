import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../assets.js';

class PlayerShootState extends PlayerState {
    async enter() {
        if (!this.shootImages) {
            this.shootImages = await Drawer.loadImage(Assets.getPlayerMarcoShoot());
        }
        this.currentFrame = 0;
        this.frameTimer = Date.now();
    }

    handleInput(input) {
        if (input === 'idle') {
            this.player.setState(this.player.idleState);
        } else if (input === 'runLeft' || input === 'runRight') {
            this.player.setState(this.player.runState);
        } else if (input === 'shoot') {
            this.currentFrame = 0;
            this.frameTimer = Date.now();
        }
    }

    update() {
        if (this.shootImages) {
            const now = Date.now();
            if (now - this.frameTimer >= this.shootImages.delay) {
                this.currentFrame++;
                this.frameTimer = now;
                if (this.currentFrame >= this.shootImages.images.length) {
                    this.player.setState(this.player.idleState);
                }
            }
        }
    }

    draw() {
        if (this.shootImages) {
            Drawer.drawToCanvas(this.shootImages.images, this.player.x, this.player.y, 'shoot', this.shootImages.delay);
        }
    }
}

export default PlayerShootState;
