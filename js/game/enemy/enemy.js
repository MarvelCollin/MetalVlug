import Entity from '../entities/entity.js';
import EnemyIdleState from './states/enemyIdleState.js';
import EnemyMoveState from './states/enemyMoveState.js';
import EnemyAttackState from './states/enemyAttackState.js';
import EnemyDieState from './states/enemyDieState.js';
import { DIRECTION } from '../entities/components/actions.js';
import Drawer from '../helper/drawer.js';
import { debugConfig } from '../helper/debug.js';
import { ctx } from '../ctx.js';

class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y, 100, 100);
        this.type = type;
        this.health = 100;
        this.speed = 10;
        this.detectionRange = 300;
        this.attackRange = 150;
        
        this.idleState = new EnemyIdleState(this);
        this.moveState = new EnemyMoveState(this);
        this.attackState = new EnemyAttackState(this);
        this.dieState = new EnemyDieState(this);
        
        this.state = this.idleState;
        this.state.enter();

        this.scale = 5;
        this.currentFrame = 0;
        this.frameAccumulator = 0;
        
        this.gravity = 0.3;
        this.terminalVelocity = 8;
        this.grounded = false;
        this.previousY = y;

        this.target = null; 
    }

    async setSprite(sprite) {
        try {
            this.currentSprite = await Drawer.loadImage(() => sprite);
        } catch (error) {
            console.error("Failed to load sprite:", error);
        }
    }

    draw() {
        super.draw();
        if (this.currentSprite && this.currentSprite.images) {
            const flip = this.lastDirection === DIRECTION.LEFT;
            Drawer.drawToCanvas(
                this.currentSprite.images,
                this.x,
                this.y,
                this.currentSprite.delay,
                flip,
                this.scale
            );
        }

        if (debugConfig.enemyDetail) {
            ctx.save();
            
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.arc(this.x + this.width/2, this.y - this.height/2, this.detectionRange, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.arc(this.x + this.width/2, this.y - this.height/2, this.attackRange, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(`Health: ${this.health}`, this.x, this.y - this.height - 20);
            ctx.fillText(`State: ${this.state.constructor.name}`, this.x, this.y - this.height - 5);
            ctx.fillText(`Grounded: ${this.grounded}`, this.x, this.y - this.height + 10);

            if (this.velocityX !== 0 || this.velocityY !== 0) {
                ctx.beginPath();
                ctx.strokeStyle = 'cyan';
                ctx.moveTo(this.x + this.width/2, this.y - this.height/2);
                ctx.lineTo(
                    this.x + this.width/2 + this.velocityX * 10,
                    this.y - this.height/2 + this.velocityY * 10
                );
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    update(player) {
        this.target = player;
        this.previousY = this.y;

        if (!this.grounded) {
            this.velocityY += this.gravity;
            if (this.velocityY > this.terminalVelocity) {
                this.velocityY = this.terminalVelocity;
            }
        }

        super.update();

        if (this.y < this.previousY && this.grounded) {
            this.y = this.previousY;
            this.velocityY = 0;
        }

        if (this.grounded) {
            this.velocityY = 0;
            const distanceToPlayer = this.getDistanceToPlayer(player);
            
            if (this.health <= 0) {
                this.setState(this.dieState);
            } else if (distanceToPlayer <= this.attackRange) {
                this.setState(this.attackState);
                this.velocityX = 0;
            } else if (distanceToPlayer <= this.detectionRange) {
                this.setState(this.moveState);
                this.moveTowardsPlayer(player);
            } else {
                this.setState(this.idleState);
                this.velocityX = 0;
            }
        } else {
            this.velocityX = 0;
        }

        this.x += this.velocityX;
        this.state.update();
    }

    getDistanceToPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    moveTowardsPlayer(player) {
        const direction = player.x < this.x ? DIRECTION.LEFT : DIRECTION.RIGHT;
        this.lastDirection = direction;
        this.velocityX = direction === DIRECTION.LEFT ? -this.speed : this.speed;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.setState(this.dieState);
        }
    }

    setState(state) {
        if (this.state !== state) {
            if (this.state) {
                this.state.exit();
            }
            this.state = state;
            this.state.enter();
        }
    }
}

export default Enemy;
