import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../helper/assets.js';
import Bullet from '../components/bullet.js';
import { DIRECTION, ACTION } from '../../entities/components/actions.js';

class PlayerShootState extends PlayerState {
    previousState = null;
    constructor(player) {
        super(player);
    }

    async enter(sprite) {
        if(!this.player.isShooting) return;

        this.previousState = this.player.state;
        this.player.actions.delete(ACTION.IDLE);
        if (sprite) {
            await this.player.setSprite(sprite);
        }
        if (!this.bulletAssets) {
            this.bulletAssets = await Drawer.loadImage(() => Assets.getPlayerOtherBullet());
        }

        const bulletOffset = {
            x: this.player.lastDirection === DIRECTION.LEFT ? -20 : this.player.width * 2 , 
            y: -125
        };
        const bullet = new Bullet(
            this.player.x + bulletOffset.x,
            this.player.y + bulletOffset.y,
            this.player.lastDirection,
            this.bulletAssets
        );
        this.player.addBullet(bullet);
        this.player.currentFrame = 0; 
    }

    async update() {
        this.player.currentFrame++; 
        if (this.player.currentFrame >= this.player.currentSprite.images.length - 1) {
            this.player.currentFrame = 0;
            this.player.setState(this.player.idleState);
        }
    }

    exit() {
        this.player.currentFrame = 0;
        this.player.isShooting = false;
        this.previousState = null;
    }
}

export default PlayerShootState;
