import PlayerIdleState from "./states/playerIdleState.js";
import PlayerShootState from "./states/playerShootState.js";
import PlayerSpawnState from "./states/playerSpawnState.js";
import { DIRECTION, ACTION } from "../entities/components/actions.js";
import { canvas } from "../ctx.js";
import Entity from "../entities/entity.js";
import Drawer from "../helper/drawer.js";
import Assets from "../helper/assets.js";
import PlayerInputHandler from "./components/playerInputHandler.js";
import Movement from "./components/movement.js";
import PlayerSpriteHandler from "./components/playerSpriteHandler.js";

class Player extends Entity {
  constructor(x, y) {
    super(x, 0, 100, 100); 

    this.idleState = new PlayerIdleState(this);
    this.shootState = new PlayerShootState(this);
    this.spawnState = new PlayerSpawnState(this); 

    this.previousState = this.spawnState;
    this.state = this.spawnState;
    this.state.enter();

    this.bullets = [];
    this.lastShootTime = 0;
    this.shootCooldown = 150;
    this.isShooting = false;

    this.gravity = 0.5;
    this.terminalVelocity = 10;
    this.isMoving = false;
    this.maxJumpHeight = 1000;
    this.currentJumpHeight = 0;

    this.currentInputs = new Set();
    this.lastDirection = DIRECTION.RIGHT;

    this.setSprite(Assets.getPlayerMarcoPistolStandIdleNormal());

    this.inputHandler = new PlayerInputHandler(this);
    this.movement = new Movement(this);

    this.frameAccumulator = 0; 
    this.currentFrame = 0; 

    this.actions = new Set();
    this.spriteHandler = new PlayerSpriteHandler(this);

    this.idleTime = 0;
    this.lastActionTime = Date.now();
  }

  setState(state, sprite = Assets.getPlayerMarcoPistolStandIdleNormal()) {
    this.previousState = this.state;
    if (this.state) {
      this.state.exit();
    }
    this.state = state;
    if (sprite) {
        this.state.enter(sprite);
    } else {
        this.state.enter();
    }
  }

  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  update() {
    super.update();
    this.state.update(); 
    this.movement.update();
    console.log(this.actions);

    // Update idle time
    if (this.actions.size === 0 || (this.actions.size === 1 && this.actions.has(ACTION.IDLE))) {
        this.idleTime = Date.now() - this.lastActionTime;
    } else {
        this.lastActionTime = Date.now();
        this.idleTime = 0;
    }

    // Add IDLE action if no other actions are present
    if (this.actions.size === 0) {
        this.actions.add(ACTION.IDLE);
    }

    // Update sprite based on current actions
    const newSprite = this.spriteHandler.handleSprite(this.actions);
    if (newSprite) {
        this.setSprite(newSprite);
    }

    // Reset shoot action after animation
    if (this.actions.has(ACTION.SHOOT) && 
        this.currentFrame >= this.currentSprite.images.length - 1) {
        this.actions.delete(ACTION.SHOOT);
        this.isShooting = false;
    }

    // Reset jump action when grounded
    if (this.grounded) {
        this.actions.delete(ACTION.JUMP);
    }

    // Update bullets
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update();
      return bullet.active && bullet.x > 0 && bullet.x < canvas.width;
    });
  }

  draw() {
    super.draw();
    this.bullets.forEach((bullet) => bullet.draw());
  }

  goPreviousState() {
    this.state = this.previousState;
    this.state.enter();
  }
}

export default Player;