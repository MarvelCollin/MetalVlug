import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../assets.js";
import { Direction } from "../components/direction.js";

class PlayerIdleState extends PlayerState {
  async enter() {
    this.idleImages = await Drawer.loadImage(() => Assets.getPlayerMarcoPistolStandIdleNormal());
  }

  handleInput(input) {
    if (input === "runLeft" || input === "runRight") {
      this.player.setState(this.player.runState);
    } else if (input === "shoot") {
      this.player.setState(this.player.shootState);
      this.player.state.currentFrame = 0;
      this.player.state.frameTimer = Date.now();
    }
  }

  update() {
    // Update logic for idle state
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
