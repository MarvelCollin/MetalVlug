import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../helper/assets.js';
import Bullet from '../components/bullet.js';
import { DIRECTION } from '../../entities/components/actions.js';

class PlayerShootState extends PlayerState {
    previousState = null;
    constructor(player) {
        super(player);
    }

    async enter(sprite) {
        this.previousState = this.player.state;
        if (sprite) {
            await this.player.setSprite(sprite);
        }
        console.log("direction", this.player.direction);
        if (!this.bulletAssets) {
            this.bulletAssets = await Drawer.loadImage(() => Assets.getPlayerOtherBullet());
        }

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
        this.player.currentFrame = 0; 
    }

    async update() {
        this.player.currentFrame++; 
        if (this.player.currentFrame >= this.player.currentSprite.images.length - 1) {
            this.player.isShooting = false; 
            this.player.currentFrame = 0;
            this.player.setState(this.previousState);
        }
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
