import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../helper/assets.js';

class PlayerSpawnState extends PlayerState {
    constructor(player, spawnHeight) {
        super(player);
        this.spawnHeight = spawnHeight;
        this.startY = 0; 
        this.frameAccumulator = 0;
    }

    async enter() {
        this.player.setDirection(null);
        this.player.resetVelocity();
        this.spawnImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolSpawn());
        this.currentFrame = 0;
        this.frameTimer = Date.now();
    }

    handleInput(input) {
        return;
    }

    update(deltaTime) {
        if (this.spawnImages) {
            this.frameAccumulator += deltaTime;
            if (this.frameAccumulator >= this.spawnImages.delay) {
                this.currentFrame++;
                this.frameAccumulator = 0;
                if (this.currentFrame >= this.spawnImages.images.length) {
                    this.player.y = this.spawnHeight; 
                    this.player.setState(this.player.idleState);
                }
            }
            const progress = this.currentFrame / this.spawnImages.images.length;
            this.player.y = this.startY + progress * (this.spawnHeight - this.startY);
        }
    }

    draw() {
        if (this.spawnImages) {
            const img = this.spawnImages.images[this.currentFrame];
            Drawer.drawToCanvas([img], this.player.x * this.player.getScaleX(), this.player.y, 'spawn', this.spawnImages.delay);
        }
    }
}

export default PlayerSpawnState;