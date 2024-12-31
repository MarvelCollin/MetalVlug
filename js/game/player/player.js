import PlayerIdleState from "./states/playerIdleState.js";
import PlayerRunState from "./states/playerRunState.js";
import PlayerShootState from "./states/playerShootState.js";
import PlayerSpawnState from "./states/playerSpawnState.js";
import PlayerJumpState from "./states/playerJumpState.js";
import { ctx, canvas, scaleX, scaleY } from "../ctx.js";
import { Direction } from "./components/direction.js";
import Entities from '../entities.js';

class Player extends Entities {
  constructor(x, y) {
    super(x, y, 50, 100); 
    this.speed = 10;
    this.direction = null; 
    this.width = 50; 

    this.idleState = new PlayerIdleState(this);
    this.runState = new PlayerRunState(this);
    this.shootState = new PlayerShootState(this);
    this.spawnState = new PlayerSpawnState(this);
    this.jumpState = new PlayerJumpState(this);

    this.currentState = this.spawnState;
    this.currentState.enter();

    this.bullets = [];
    this.lastShootTime = 0;
    this.shootCooldown = 150; 

    this.initialY = y;    
    this.grounded = true;
    this.velocityY = 0;   
    this.velocityX = 0;
    this.lastUpdateTime = Date.now(); 
  }

  setState(state) {
    this.currentState = state;
    this.currentState.enter();
  }

  handleInput(input) {
    if (input === "shoot") {
      const now = Date.now();
      if (now - this.lastShootTime >= this.shootCooldown) {
        this.lastShootTime = now;
        const shootState = new PlayerShootState(this);
        shootState.previousState = this.currentState;
        this.setState(shootState);
      }
      return;
    }
    
    if (input === "runLeft") {
      this.direction = Direction.LEFT;
      this.setState(this.runState);
    } else if (input === "runRight") {
      this.direction = Direction.RIGHT;
      this.setState(this.runState);
    } else if (input === "idle") {
        this.setState(this.idleState);
    } else if (input === "jump" && this.grounded) {
      this.grounded = false;
      const jumpState = new PlayerJumpState(this);
      this.setState(jumpState);
      return;
    }
    this.currentState.handleInput(input);
  }

  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  update(deltaTime, obstacles = []) {
    // Only update velocity if not in spawn state
    if (!(this.currentState instanceof PlayerSpawnState)) {
      this.velocityX = this.direction === Direction.LEFT ? -this.speed : 
                      this.direction === Direction.RIGHT ? this.speed : 0;
    }

    const moved = super.update(obstacles);

    const now = Date.now();
    deltaTime = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    this.currentState.update(deltaTime);

    this.bullets = this.bullets.filter((bullet) => {
      bullet.update();
      return bullet.active && bullet.x > 0 && bullet.x < canvas.width;
    });

    return moved;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(5.5, 5.5);
    ctx.translate(-this.x, -this.y);
    this.currentState.draw();
    ctx.restore();

    this.bullets.forEach((bullet) => bullet.draw());
  }

  getScaleX() {
    return scaleX;
  }

  getScaleY() {
    return scaleY;
  }

  getPosition() {
    return { x: this.x, y: this.y, direction: this.direction };
  }
}

export default Player;
