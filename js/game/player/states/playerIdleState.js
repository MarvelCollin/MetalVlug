import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../helper/assets.js";
import { Direction } from "../components/direction.js";

class PlayerIdleState extends PlayerState {
  constructor(player) {
    super(player);
    this.canMove = false;
    this.frameAccumulator = 0; // Initialize accumulator
  }

  async enter() {
    this.player.resetVelocity();
    this.idleImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolStandIdleNormal());
  }

  handleInput(input) {
    if (input === "runLeft" || input === "runRight") {
      this.player.setState(this.player.runState);
    } else if (input === "shoot") {
      this.player.setState(this.player.shootState);
      this.player.state.currentFrame = 0;
      this.player.state.frameTimer = Date.now();
    } else if (input === "jump" && this.player.canJump) { // Allow jump from idle state
      // Directly set the state to jumpState to prevent recursion
      this.player.setState(this.player.jumpState);
    }
  }

  update(deltaTime) {
    if (this.idleImages) {
      this.frameAccumulator += deltaTime;
      if (this.frameAccumulator >= this.idleImages.delay) {
        this.currentFrame = (this.currentFrame + 1) % this.idleImages.images.length;
        this.frameAccumulator = 0;
      }
    }
  }

  draw() {
    if (this.idleImages) {
      const flip = this.player.direction === Direction.LEFT;
      Drawer.drawToCanvas(
        this.idleImages.images,
        this.player.x,
        this.player.y,
        "idle",
        this.idleImages.delay,
        undefined,
        undefined,
        flip
      );
    }
  }
}

export default PlayerIdleState;

