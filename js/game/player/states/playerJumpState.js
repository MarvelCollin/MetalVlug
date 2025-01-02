import PlayerState from './playerState.js';
import PlayerShootState from './playerShootState.js';
import { Direction } from '../components/direction.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../assets.js';
import PlayerIdleState from './playerIdleState.js';

class PlayerJumpState extends PlayerState {
    async enter() {
        try {
            this.canMove = true;  // Allow movement while jumping
            this.idle = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolJumpIdle());
            this.shoot = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolJumpShoot());
            this.currentFrame = 0;
            this.frameTimer = Date.now();
            this.jumpForce = -22;
            this.player.velocityY = this.jumpForce;
            this.player.grounded = false;
            this.isShooting = false;
            
            // Reset horizontal velocity unless already moving
            if (!this.player.direction) {
                this.player.velocityX = 0;
            }
        } catch (error) {
            console.error('Failed to load jump state assets:', error);
        }
    }

    handleInput(input) {
        if (input === 'shoot') {
            this.isShooting = true;
            setTimeout(() => {
                this.isShooting = false;
            }, 200); 
        } else if (input === 'runLeft') {
            this.player.setDirection(Direction.LEFT);
        } else if (input === 'runRight') {
            this.player.setDirection(Direction.RIGHT);
        } else if (input === 'idle') {
            this.player.setDirection(null);
            this.player.velocityX = 0;
        }
    }

    update(deltaTime) {
        const images = this.isShooting ? this.shoot : this.idle;
        this.player.setDirection(null);
        if (images) {
            const now = Date.now();
            if (now - this.frameTimer >= images.delay) {
                if (this.player.velocityY < 0) {
                    this.currentFrame = 0;
                } else if (this.player.velocityY > 0) {
                    this.currentFrame = Math.min(4, images.images.length - 1);
                }
                this.frameTimer = now;
            }

            if (this.player.grounded) {
                this.player.setState(new PlayerIdleState(this.player));
            }
        }
    }

    draw() {
        const images = this.isShooting ? this.shoot : this.idle;
        if (images) {
            const flip = this.player.direction === Direction.LEFT;
            Drawer.drawToCanvas(
                images.images,
                this.player.x,
                this.player.y,
                'jump',
                images.delay,
                undefined,
                undefined,
                flip,
                'ONCE'
            );
        }
    }
}

export default PlayerJumpState;
