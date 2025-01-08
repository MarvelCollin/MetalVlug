import PlayerIdleState from "./states/playerIdleState.js";
import PlayerMoveState from "./states/playerMoveState.js";
import PlayerShootState from "./states/playerShootState.js";
import PlayerSpawnState from "./states/playerSpawnState.js";
import PlayerJumpState from "./states/playerJumpState.js";
import { DIRECTION } from "../entities/components/actions.js";
import { canvas } from "../ctx.js";
import Entity from "../entities/entity.js";
import Drawer from "../helper/drawer.js";
import Assets from "../helper/assets.js";
import PlayerInputHandler from "./components/playerInputHandler.js";

class Player extends Entity {
  constructor(x, y) {
    super(x, 0, 100, 100); 

    this.idleState = new PlayerIdleState(this);
    this.moveState = new PlayerMoveState(this);
    this.shootState = new PlayerShootState(this);
    this.spawnState = new PlayerSpawnState(this); 
    this.jumpState = new PlayerJumpState(this);

    this.previousState = this.spawnState;
    this.state = this.spawnState;
    this.state.enter();

    this.bullets = [];
    this.lastShootTime = 0;
    this.shootCooldown = 150;

    this.gravity = 0.5;
    this.terminalVelocity = 10;
    this.canJump = true; 

    this.currentInputs = new Set();
    this.lastDirection = DIRECTION.RIGHT;

    this.setSprite(Assets.getPlayerMarcoPistolStandIdleNormal());

    this.inputHandler = new PlayerInputHandler(this);
  }

  setState(state, sprite = Assets.getPlayerMarcoPistolStandIdleNormal()) {
    this.previousState = this.state;
    this.state = state;
    this.state.enter(sprite);
  }

  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  update(deltaTime) {
    super.update();
    this.state.update(deltaTime); 

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