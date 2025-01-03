import PlayerState from './playerState.js';
import PlayerJumpState from './playerJumpState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../helper/assets.js';
import Bullet from '../components/bullet.js';
import { Direction } from '../components/direction.js';

class PlayerShootState extends PlayerState {
    previousState = null;

    constructor(player) {
        super(player);
        this.frameAccumulator = 0; 
    }

    async enter() {
        if(this.player.direction === null) this.player.direction = Direction.RIGHT;

        try {
            if (!this.shootImages) {
                if (this.player.isJumping) {
                    this.shootImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolJumpShoot());
                } else {
                    this.shootImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolStandShoot());
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
        } catch (error) {
            console.error('Failed to load shoot state assets:', error);
        }
    }

    handleInput(input) {
        if (input === 'shoot') {
            const now = Date.now();
            if (now - this.player.lastShootTime >= this.player.shootCooldown) {
                this.player.lastShootTime = now; 
                this.currentFrame = 0;
                this.frameTimer = Date.now();
            }
            return;
        }
        if (input === 'idle') {
            this.player.setState(this.player.idleState);
        } else if (input === 'runLeft' || input === 'runRight') {
            this.player.setState(this.player.runState);
        } else if (input === 'shoot') {
            this.currentFrame = 0;
            this.frameTimer = Date.now();
        }
    }

    update(deltaTime) {
        if (this.shootImages) {
            this.frameAccumulator += deltaTime;
            if (this.frameAccumulator >= this.shootImages.delay) {
                this.currentFrame++;
                this.frameAccumulator = 0;
                if (this.currentFrame >= this.shootImages.images.length) {
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
        if (this.shootImages) {
            const flip = this.player.direction === Direction.LEFT;
            Drawer.drawToCanvas(
                this.shootImages.images,
                this.player.x * this.player.getScaleX(),
                this.player.y * this.player.getScaleY(),
                'shoot',
                this.shootImages.delay,
                undefined,
                undefined,
                flip
            );
        }
    }
}

export default PlayerShootState;
