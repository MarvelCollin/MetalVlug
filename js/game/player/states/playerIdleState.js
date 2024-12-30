import PlayerState from "./playerState.js";
import Drawer from "../../helper/drawer.js";
import Assets from "../../assets.js";

class PlayerIdleState extends PlayerState {
  async enter() {
    if (!this.idleImages) {
      this.idleImages = await Drawer.loadImage(Assets.getPlayerMarcoIdle());
    }
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
      Drawer.drawToCanvas(
        this.idleImages.images,
        this.player.x * this.player.getScaleX(),
        this.player.y * this.player.getScaleY(),
        "idle",
        this.idleImages.delay
      );
    }
  }
}

export default PlayerIdleState;
