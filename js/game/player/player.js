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
    this.direction = Direction.RIGHT; // Default direction
    this.width = 50; // Define the player's width

    this.idleState = new PlayerIdleState(this);
    this.runState = new PlayerRunState(this);
    this.shootState = new PlayerShootState(this);
    this.spawnState = new PlayerSpawnState(this);

    this.currentState = this.spawnState;
    this.currentState.enter();
  }

  setState(state) {
    this.currentState = state;
    this.currentState.enter();
  }

  handleInput(input) {
    if (input === "runLeft") {
      this.direction = Direction.LEFT;
      this.setState(this.runState);
    } else if (input === "runRight") {
      this.direction = Direction.RIGHT;
      this.setState(this.runState);
    } else if (input === "shoot") {
      this.setState(this.shootState);
    } else if (input === "idle") {
      this.direction = null;
      this.setState(this.idleState);
    }
    this.currentState.handleInput(input);
  }

  update() {
    this.currentState.update();
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(6, 6);
    ctx.translate(-this.x, -this.y);
    this.currentState.draw();
    ctx.restore();
  }

  getScaleX() {
    return scaleX;
  }

  getScaleY() {
    return scaleY;
  }
}

export default Player;
