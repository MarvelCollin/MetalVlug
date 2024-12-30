import PlayerIdleState from "./states/playerIdleState.js";
import PlayerRunState from "./states/playerRunState.js";
import PlayerShootState from "./states/playerShootState.js";
import PlayerSpawnState from "./states/playerSpawnState.js";
import { ctx, canvas, scaleX, scaleY } from "../ctx.js";
import { Direction } from "./components/direction.js";

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.direction = Direction.RIGHT; 
    this.width = 50; 

    this.idleState = new PlayerIdleState(this);
    this.runState = new PlayerRunState(this);
    this.shootState = new PlayerShootState(this);
    this.spawnState = new PlayerSpawnState(this);

    this.currentState = this.spawnState;
    this.currentState.enter();

    this.bullets = [];
    this.lastShootTime = 0;
    this.shootCooldown = 150; 
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
        this.setState(this.shootState);
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
      this.direction = null;
      this.setState(this.idleState);
    }
    this.currentState.handleInput(input);
  }

  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  update() {
    this.currentState.update();

    this.bullets = this.bullets.filter((bullet) => {
      bullet.update();
      return bullet.active && bullet.x > 0 && bullet.x < canvas.width;
    });
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
