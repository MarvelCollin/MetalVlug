import Entity from '../entities/entity.js';
import EnemyIdleState from './states/enemyIdleState.js';
import EnemyMoveState from './states/enemyMoveState.js';
import EnemyAttackState from './states/enemyAttackState.js';
import EnemyDieState from './states/enemyDieState.js';
import { DIRECTION } from '../entities/components/actions.js';
import Drawer from '../helper/drawer.js';
import { debugConfig } from '../helper/debug.js';
import { ctx } from '../ctx.js';
import { enemyType, enemyTypeToSprite } from './types/enemyType.js';
import { NormalSoldier } from './types/normalSoldier/normalSoldier.js';
import { BazookaSoldier } from './types/bazookaSoldier/bazookaSoldier.js';
import { ShieldSoldier } from './types/shieldSoldier/shieldSoldier.js';
import { RifleSoldier } from './types/rifleSoldier/rifleSoldier.js';
import { Gunner } from './types/gunner/gunner.js';

class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y, 100, 100);
        this.type = type;
        
        switch(type) {
            case enemyType.GUNNER:
                this.behavior = new Gunner();
                break;
            case enemyType.RIFLE:
                this.behavior = new RifleSoldier();
                break;
            case enemyType.BAZOOKA:
                this.behavior = new BazookaSoldier();
                break;
            case enemyType.SHIELD:
                this.behavior = new ShieldSoldier();
                break;
            case enemyType.NORMAL:
            default:
                this.behavior = new NormalSoldier();
                break;
        }
        
        this.setStat(this.behavior.stats);
        
        this.idleState = new EnemyIdleState(this);
        this.moveState = new EnemyMoveState(this);
        this.attackState = new EnemyAttackState(this);
        this.dieState = new EnemyDieState(this);
        
        this.state = this.idleState;
        this.state.enter();

        this.currentFrame = 0;
        this.frameAccumulator = 0;
        
        this.gravity = 0.3;
        this.terminalVelocity = 8;
        this.grounded = false;
        this.previousY = y;

        this.target = null;
        this.sprites = this.behavior.sprites;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000;
        this.damageAmount = 10;
    }

    async setSprite(sprite) {
        try {
            const typeSprites = enemyTypeToSprite[this.type];
            if (typeSprites) {
                switch(this.state.constructor) {
                    case EnemyIdleState:
                        this.currentSprite = await Drawer.loadImage(() => typeSprites.idle);
                        break;
                    case EnemyMoveState:
                        this.currentSprite = await Drawer.loadImage(() => typeSprites.walk);
                        break;
                    case EnemyAttackState:
                        this.currentSprite = await Drawer.loadImage(() => typeSprites.attack);
                        break;
                    case EnemyDieState:
                        this.currentSprite = await Drawer.loadImage(() => typeSprites.die);
                        break;
                    default:
                        this.currentSprite = await Drawer.loadImage(() => sprite);
                }
            } else {
                this.currentSprite = await Drawer.loadImage(() => sprite);
            }
        } catch (error) {
            console.error("Failed to load sprite:", error);
        }
    }

    setStat(stat) {
        this.health = stat.health;
        this.speed = stat.speed;
        this.detectionRange = stat.detectionRange;
        this.attackRange = stat.attackRange;
        this.scale = stat.scale;
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

        if (this.behavior.draw) {
            this.behavior.draw(this);
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
            let textY = this.y - this.height - 20;

            ctx.fillText(`Health: ${this.health}`, this.x, textY);
            textY += 15;
            
            if (debugConfig.showEnemyType) {
                ctx.fillStyle = 'yellow';
                ctx.fillText(`Type: ${this.type}`, this.x, textY);
                textY += 15;
            }

            if (debugConfig.showSpriteInfo) {
                ctx.fillStyle = 'cyan';
                const currentSpriteName = this.state.constructor.name.replace('Enemy', '').replace('State', '');
                ctx.fillText(`Sprite: ${currentSpriteName}`, this.x, textY);
                textY += 15;
            }

            ctx.fillStyle = 'white';
            ctx.fillText(`State: ${this.state.constructor.name}`, this.x, textY);
            textY += 15;
            ctx.fillText(`Grounded: ${this.grounded}`, this.x, textY);

            // Velocity indicator
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

        this.behavior.updateBehavior(this);

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
        if (this.behavior.takeDamage) {
            amount = this.behavior.takeDamage(this, amount);
        }
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
