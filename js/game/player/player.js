import PlayerIdleState from "./states/playerIdleState.js";
import PlayerShootState from "./states/playerShootState.js";
import PlayerSpawnState from "./states/playerSpawnState.js";
import { DIRECTION } from "../entities/components/actions.js";
import { canvas } from "../ctx.js";
import Entity from "../entities/entity.js";
import Drawer from "../helper/drawer.js";
import Assets from "../helper/assets.js";
import PlayerInputHandler from "./components/playerInputHandler.js";
import Movement from "./components/movement.js";

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
    if (!this.grounded) {
        if (this.isShooting) { 
            this.setSprite(Assets.getPlayerMarcoPistolJumpShoot());
        } else {
            this.setSprite(Assets.getPlayerMarcoPistolJumpIdle());
        }
    } else if (this.isMoving) {
        if (this.isShooting) { 
            this.setSprite(Assets.getPlayerMarcoPistolMoveShoot());
        } else {
            this.setSprite(Assets.getPlayerMarcoPistolStandRun());
        }
    } else {
        this.setState(this.idleState);
    }

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