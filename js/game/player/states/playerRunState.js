import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../assets.js";
import { ctx } from "../../ctx.js";
import { Direction } from "../components/direction.js";

class PlayerRunState extends PlayerState {
  constructor(player) {
    super(player);
    this.canMove = true;
  }

  async enter() {
    this.runImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolStandRun());
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
    }
  }

  update() {
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
