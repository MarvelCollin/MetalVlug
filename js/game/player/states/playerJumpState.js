import PlayerState from './playerState.js';
import PlayerShootState from './playerShootState.js';
import { Direction } from '../components/direction.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../helper/assets.js';
import PlayerIdleState from './playerIdleState.js';

class PlayerJumpState extends PlayerState {
    async enter() {
        try {
            this.canMove = true;
            this.jumpIdle = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolJumpIdle());
            this.jumpShoot = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolJumpShoot());
            this.currentFrame = 0;
            this.frameTimer = Date.now();
            this.jumpForce = -22;
            this.player.velocityY = this.jumpForce;
            this.player.grounded = false;
            this.isShooting = false;
            
            if (this.player.lastDirection) {
                this.player.setDirection(
                    this.player.lastDirection === 'runLeft' ? Direction.LEFT : Direction.RIGHT
                );
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
            this.player.lastDirection = 'runLeft';
            this.player.velocityX = -this.player.speed;
        } else if (input === 'runRight') {
            this.player.setDirection(Direction.RIGHT);
            this.player.lastDirection = 'runRight';
            this.player.velocityX = this.player.speed;
        } else if (input === 'idle') {
            this.player.lastDirection = null;
            this.player.velocityX = 0;
        }
    }

    update(deltaTime) {
        const currentAnimation = this.isShooting ? this.jumpShoot : this.jumpIdle;
        
        if (currentAnimation) {
            const now = Date.now();
            if (now - this.frameTimer >= currentAnimation.delay) {
                if (this.player.velocityY < 0) {
                    this.currentFrame = 0;
                } else if (this.player.velocityY > 0) {
                    this.currentFrame = Math.min(4, currentAnimation.images.length - 1);
                }
                this.frameTimer = now;
            }

            if (this.player.grounded) {
                const currentDirection = this.player.lastDirection;
                this.player.setState(new PlayerIdleState(this.player));
                if (currentDirection) {
                    this.player.handleInput(currentDirection);
                }
            }
        }
    }

    draw() {
        const currentAnimation = this.isShooting ? this.jumpShoot : this.jumpIdle;
        if (currentAnimation) {
            const flip = this.player.direction === Direction.LEFT;
            Drawer.drawToCanvas(
                currentAnimation.images,
                this.player.x,
                this.player.y,
                'jump',
                currentAnimation.delay,
                undefined,
                undefined,
                flip,
                'ONCE'
            );
        }
    }
}

export default PlayerJumpState;
