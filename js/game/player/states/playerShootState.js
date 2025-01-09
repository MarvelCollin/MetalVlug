import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../helper/assets.js';
import Bullet from '../components/bullet.js';
import { DIRECTION } from '../../entities/components/actions.js';

class PlayerShootState extends PlayerState {
    previousState = null;

    constructor(player) {
        super(player);
        this.frameAccumulator = 0; 
    }

    async enter(sprite) {
        this.previousState = this.player.state;
        if (sprite) {
            await this.player.setSprite(sprite);
        }
        if(this.player.direction === null) this.player.direction = DIRECTION.RIGHT;

        if (!this.bulletAssets) {
            this.bulletAssets = await Drawer.loadImage(() => Assets.getPlayerOtherBullet());
        }
        this.currentFrame = 0; 
        this.frameAccumulator = 0; 

        const bulletOffset = {
            x: this.player.direction === DIRECTION.LEFT ? -20 : this.player.width + 20, 
            y: -140
        };
        const bullet = new Bullet(
            this.player.x + bulletOffset.x,
            this.player.y + bulletOffset.y,
            this.player.direction,
            this.bulletAssets
        );
        this.player.addBullet(bullet);
    }

    async update(deltaTime) {
        this.player.isShooting = false;
    }

    draw() {
        if (this.player.currentSprite) {
            const flip = this.player.direction === DIRECTION.LEFT;
            Drawer.drawToCanvas(
                this.player.currentSprite.images,
                this.player.x * this.player.getScaleX(),
                this.player.y * this.player.getScaleY(),
                this.player.currentSprite.delay,
                undefined,
                undefined,
                flip
            );
        }
    }
}

export default PlayerShootState;
