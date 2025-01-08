import PlayerState from './playerState.js';
import PlayerJumpState from './playerJumpState.js';
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

    async enter() {
        if(this.player.direction === null) this.player.direction = DIRECTION.RIGHT;

            if (!this.currentSprite) {
                if (this.player.isJumping) {
                    this.currentSprite = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolJumpShoot());
                } else {
                    this.currentSprite = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolStandShoot());
                }
            }
            if (!this.bulletAssets) {
                this.bulletAssets = await Drawer.loadImage(() => Assets.getPlayerOtherBullet());
            }
            this.currentFrame = 0; 
            this.frameAccumulator = 0; 

            const bulletOffset = {
                x: this.player.direction === 'LEFT' ? -20 : this.player.width + 200,
                y: -140
            };
            console.log(this.player.direction)
            const bullet = new Bullet(
                this.player.x + bulletOffset.x,
                this.player.y + bulletOffset.y,
                this.player.direction,
                this.bulletAssets
            );
            this.player.addBullet(bullet);
    }

    update(deltaTime) {
        if (this.currentSprite) {
            this.frameAccumulator += deltaTime;
            if (this.frameAccumulator >= this.currentSprite.delay) {
                this.currentFrame++;
                this.frameAccumulator = 0;
                if (this.currentFrame >= this.currentSprite.images.length) {
                    this.player.setState(this.previousState || this.player.idleState);
                }
            }
        }

        if (this.previousState instanceof PlayerJumpState) {
            this.previousState.update(deltaTime); 
        }

        if (this.player.grounded) {
            this.player.canJump = true;
        }

    }

    draw() {
        if (this.currentSprite) {
            const flip = this.player.direction === DIRECTION.LEFT;
            Drawer.drawToCanvas(
                this.currentSprite.images,
                this.player.x * this.player.getScaleX(),
                this.player.y * this.player.getScaleY(),
                'shoot',
                this.currentSprite.delay,
                undefined,
                undefined,
                flip
            );
        }
    }
}

export default PlayerShootState;
