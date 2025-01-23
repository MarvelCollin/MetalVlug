import PlayerIdleState from "./states/playerIdleState.js";
import PlayerShootState from "./states/playerShootState.js";
import PlayerSpawnState from "./states/playerSpawnState.js";
import { DIRECTION, ACTION } from "../entities/components/actions.js";
import { canvas } from "../ctx.js";
import Entity from "../entities/entity.js";
import Drawer from "../helper/drawer.js";
import Assets from "../helper/assets.js";
import PlayerInputHandler from "./components/playerInputHandler.js";
import PlayerMoveHandler from "./components/playerMoveHandler.js";
import PlayerSpriteHandler from "./components/playerSpriteHandler.js";
import { debugConfig } from "../helper/debug.js";
import { ctx } from "../ctx.js";
import { playerConfig } from "./components/playerConfig.js";

class Player extends Entity {
  constructor(x, y) {
    super(x, y, 100, 100);

    this.idleState = new PlayerIdleState(this);
    this.shootState = new PlayerShootState(this);
    this.spawnState = new PlayerSpawnState(this);

    this.previousState = this.spawnState;
    this.state = this.spawnState;
    this.state.enter();

    this.speed = playerConfig.speed;

    this.bullets = [];
    this.lastShootTime = 0;
    this.shootCooldown = playerConfig.shootCooldown;
    this.isShooting = false;

    this.gravity = playerConfig.gravity; 
    this.terminalVelocity = playerConfig.terminalVelocity;
    this.jumpForce = playerConfig.jumpForce;

    this.maxJumpHeight = playerConfig.maxJumpHeight; 
    this.currentJumpHeight = 0;

    this.currentInputs = new Set();

    this.inputHandler = new PlayerInputHandler(this);
    this.playerMoveHandler = new PlayerMoveHandler(this);

    this.frameAccumulator = 0;
    this.currentFrame = 0;

    this.spriteHandler = new PlayerSpriteHandler(this);

    this.idleTime = 0;
    this.lastActionTime = Date.now();
    this.damage = playerConfig.damage;

    this.scale = playerConfig.scale; 

    this.health = playerConfig.health;
    this.maxHealth = playerConfig.maxHealth;
    this.invulnerableTime = playerConfig.inuverableTime; 
    this.lastHitTime = 0;

    this.initialX = x;
    this.initialY = y;
    this.isDead = false;

    // Add these properties for UI
    this.health = 100;
    this.ammo = 50;
    this.bombs = 10;
    this.coins = 1000;
  }

  setState(state, sprite = Assets.getPlayerMarcoPistolStandIdleNormal()) {
    if (!state) return;
    
    this.previousState = this.state;
    if (this.state && typeof this.state.exit === 'function') {
        this.state.exit();
    }
    this.state = state;
    if (typeof this.state.enter === 'function') {
        if (sprite) {
            this.state.enter(sprite);
        } else {
            this.state.enter();
        }
    }
  }

  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  update(enemies = []) {
    this.actions.has(ACTION.SNEAK) ? this.speed = playerConfig.sneakSpeed : this.speed = playerConfig.speed;
    super.update();
    this.playerMoveHandler.update();
    this.state.update();

    this.bullets = this.bullets.filter((bullet) => {
        enemies.forEach(enemy => {
            if (bullet.checkCollision(enemy)) {
                enemy.takeDamage(this.damage);  
                bullet.active = false;
            }
        });

        bullet.update();
        return bullet.active; 
    });


    if(!this.actions.has(ACTION.JUMP) && this.actions.has(ACTION.FLOAT)){
      // this.grounded = true;
    }

    if (
      this.actions.size === 0 ||
      (this.actions.size === 1 && this.actions.has(ACTION.IDLE))
    ) {
      this.idleTime = Date.now() - this.lastActionTime;
    } else {
      this.lastActionTime = Date.now();
      this.idleTime = 0;
    }

    if (this.actions.size === 0) {
      this.actions.add(ACTION.IDLE);
    }

    if (!this.grounded) {
      this.actions.add(ACTION.FLOAT);
    } else {
      this.actions.delete(ACTION.FLOAT);
    }

    const newSprite = this.spriteHandler.handleSprite(this.actions);
    if (newSprite) {
      this.setSprite(newSprite);
    }

    if (this.actions.has(ACTION.SHOOT) && !this.isShooting) {
      this.setState(this.shootState);
    }
  }

  draw() {
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
    this.bullets.forEach((bullet) => bullet.draw());
    this.debug();
  }

  debug() {
    if (debugConfig.playerStat) {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(
            `Health: ${this.health}`,
            this.x,
            this.y - this.height - 25
        );
        ctx.fillText(
            `State: ${this.state.constructor.name}`,
            this.x,
            this.y - this.height - 40
        );
        ctx.restore();
    }
  }

  goPreviousState() {
    this.state = this.previousState;
    this.state.enter();
  }

  takeDamage(amount) {
    const currentTime = Date.now();
    if (currentTime - this.lastHitTime > this.invulnerableTime) {
        this.health = Math.max(0, this.health - amount);
        this.lastHitTime = currentTime;
        
        if (this.health <= 0 && !this.isDead) {
            this.isDead = true;
            setTimeout(() => this.respawn(), 1000); 
        }
    }
  }

  respawn() {
    this.health = this.maxHealth;
    this.x = this.initialX;
    this.y = this.initialY;
    this.isDead = false;
    this.velocityX = 0;
    this.velocityY = 0;
    this.setState(this.spawnState);
  }
}

export default Player;
