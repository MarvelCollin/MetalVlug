import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../helper/assets.js';

class PlayerSpawnState extends PlayerState {
    constructor(player, spawnHeight) {
        super(player);
        this.spawnHeight = spawnHeight;
    }

    async enter() {
        this.player.setDirection(null);
        this.player.resetVelocity();
        this.player.y = this.spawnHeight; 
        this.spawnImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolSpawn());
    }

    handleInput(input) {
        return;
    }

    update(deltaTime) {
        if (this.spawnImages) {
            const currentFrame = Drawer.currentFrames['spawn'];
            if (currentFrame >= this.spawnImages.images.length - 1) {
                this.player.setState(this.player.idleState);
            }
        }
    }

    draw() {
        if (this.spawnImages) {
            Drawer.drawToCanvas(
                this.spawnImages.images,
                this.player.x * this.player.getScaleX(),
                this.player.y,
                'spawn',
                this.spawnImages.delay
            );
        }
    }
}

export default PlayerSpawnState;