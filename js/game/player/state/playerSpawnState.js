import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../assets.js';

class PlayerSpawnState extends PlayerState {
    async enter() {
        if (!this.spawnImages) {
            this.spawnImages = await Drawer.loadImage(Assets.getPlayerMarcoSpawn());
        }
        this.currentFrame = 0;
        this.frameTimer = Date.now();
    }

    handleInput(input) {
        if (input === 'runLeft' || input === 'runRight') {
            this.player.setState(this.player.runState);
        } else if (input === 'shoot') {
            this.player.setState(this.player.shootState);
        }
    }

    update() {
        if (this.spawnImages) {
            const now = Date.now();
            if (now - this.frameTimer >= this.spawnImages.delay) {
                this.currentFrame++;
                this.frameTimer = now;
                if (this.currentFrame >= this.spawnImages.images.length) {
                    this.player.setState(this.player.idleState);
                }
            }
        }
    }

    draw() {
        if (this.spawnImages) {
            const img = this.spawnImages.images[this.currentFrame];
            Drawer.drawToCanvas([img], this.player.x, this.player.y, 'spawn', this.spawnImages.delay);
        }
    }
}
export default PlayerSpawnState;