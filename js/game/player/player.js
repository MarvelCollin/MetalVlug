import PlayerIdleState from "./states/playerIdleState.js";
import PlayerRunState from "./states/playerRunState.js";
import PlayerShootState from "./states/playerShootState.js";
import PlayerSpawnState from "./states/playerSpawnState.js";
import PlayerJumpState from "./states/playerJumpState.js";
import { Direction } from "./components/direction.js";
import { canvas } from "../ctx.js";
import Entity from "../entities/entity.js";

class Player extends Entity {
  constructor(x, y) {
    const spawnHeight = 800;
    super(x, 0, 100, 100);

    this.idleState = new PlayerIdleState(this);
    this.runState = new PlayerRunState(this);
    this.shootState = new PlayerShootState(this);
    this.spawnState = new PlayerSpawnState(this, spawnHeight);
    this.jumpState = new PlayerJumpState(this);

    this.state = this.spawnState;
    this.state.enter();

    this.bullets = [];
    this.lastShootTime = 0;
    this.shootCooldown = 150;

    this.gravity = 0.5;
    this.terminalVelocity = 10;
    this.grounded = false;
    this.canJump = true; 

    this.currentInputs = new Set();
    this.lastDirection = Direction.RIGHT;
  }

  setState(state) {
    this.state = state;
    this.state.enter();
  }

  handleInput(input) {
    let handled = false;

    if (input === "runLeft" || input === "runRight") {
      this.lastDirection = input;
      this.setDirection(input === "runLeft" ? Direction.LEFT : Direction.RIGHT);
      if (!(this.state instanceof PlayerJumpState)) {
        this.setState(this.runState);
        handled = true;
      }
    } else if (input === "idle") {
      this.lastDirection = null;
      if (!(this.state instanceof PlayerJumpState)) {
        this.setState(this.idleState);
        handled = true;
      }
      this.velocityX = 0;
    } else if (input === "jump" && this.grounded && this.canJump) { // Updated condition
      const currentDirection = this.lastDirection;
      this.grounded = false;
      this.canJump = false; // Reset jump ability
      this.setState(this.jumpState);
      if (currentDirection) {
        this.lastDirection = currentDirection;
        this.setDirection(
          currentDirection === "runLeft" ? Direction.LEFT : Direction.RIGHT
        );
      }
      handled = true;
    } else if (input === "shoot") {
      const now = Date.now();
      if (now - this.lastShootTime >= this.shootCooldown) {
        this.lastShootTime = now;
        const shootState = new PlayerShootState(this);
        shootState.previousState = this.state;
        this.setState(shootState);
        handled = true;
      }
    }

    // Only call handleInput if the input wasn't handled above
    if (!handled) {
      this.state.handleInput(input);
    }
  }

  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  update(deltaTime) {
    super.update();
    this.state.update(deltaTime); // Pass deltaTime to current state

    // Update grounded status immediately after position update
    if (this.y >= this.initialY) {
      this.y = this.initialY;
      this.velocityY = 0;
      if (!this.grounded) {
        this.grounded = true;
        // Allow jump immediately upon landing
        this.canJump = true;
      }
    } else {
      this.grounded = false;
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
}

export default Player;
