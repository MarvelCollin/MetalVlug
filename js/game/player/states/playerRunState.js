import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../helper/assets.js";
import { ctx } from "../../ctx.js";
import { Direction } from "../components/direction.js";

class PlayerRunState extends PlayerState {
  constructor(player) {
    super(player);
    this.canMove = true;
    this.frameAccumulator = 0; 
    this.currentFrame = 0; 
  }

  async enter() {
    this.runImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolStandRun());
    this.currentFrame = 0; 
    this.frameAccumulator = 0;
  }

  handleInput(input) {
    if (input === "idle") {
      this.player.setState(this.player.idleState);
    } else if (input === "shoot") {
      this.player.setState(this.player.shootState);
      this.player.state.currentFrame = 0;
      this.player.state.frameTimer = Date.now();
    } else if (input === "runLeft") {
      this.player.setDirection(Direction.LEFT);
    } else if (input === "runRight") {
      this.player.setDirection(Direction.RIGHT);
    } else if (input === "jump" && this.player.canJump) {   
      this.player.setState(this.player.jumpState); 
    }
  }

  update(deltaTime) {
    if (this.runImages) {
      this.frameAccumulator += deltaTime;
      if (this.frameAccumulator >= this.runImages.delay) {
        this.currentFrame = (this.currentFrame + 1) % this.runImages.images.length;
        this.frameAccumulator = 0;
      }
    }
  }

  draw() {
    if (this.runImages) {
      const flip = this.player.direction === Direction.LEFT;
      Drawer.drawToCanvas(
        this.runImages.images,
        this.player.x,
        this.player.y,
        "run",
        this.runImages.delay,
        undefined,
        undefined,
        flip
      );
    }
  }
}

export default PlayerRunState;

