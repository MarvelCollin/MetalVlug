import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../assets.js';

class PlayerSpawnState extends PlayerState {
    async enter() {
        this.player.direction = null;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.spawnImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolSpawn());
        this.currentFrame = 0;
        this.frameTimer = Date.now();
    }

    handleInput(input) {
        return;
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
            Drawer.drawToCanvas([img], this.player.x * this.player.getScaleX(), this.player.y * this.player.getScaleY(), 'spawn', this.spawnImages.delay);
        }
    }
}
export default PlayerSpawnState;