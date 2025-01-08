import { DIRECTION } from "../../entities/components/actions.js";
import Assets from "../../helper/assets.js";
import PlayerJumpState from "../states/playerJumpState.js";

class PlayerInputHandler {
  constructor(player) {
    this.player = player;
    this.activeKeys = new Set();

    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  handleKeyDown(event) {
    if (event.repeat) return;
    this.activeKeys.add(event.key.toLowerCase());
    this.updatePlayerFromKeys();
  }

  handleKeyUp(event) {
    this.activeKeys.delete(event.key.toLowerCase());
    this.updatePlayerFromKeys();
  }

  updatePlayerFromKeys() {
    const { player } = this;
    const { activeKeys } = this;

    if (!(player.state instanceof PlayerJumpState)) {
      if (activeKeys.has("a") || activeKeys.has("d")) {
        const direction = activeKeys.has("a") ? DIRECTION.LEFT : DIRECTION.RIGHT;
        player.setDirection(direction);
        if (!(player.state instanceof player.jumpState.constructor)) {
          player.setState(player.moveState);
        }
        player.setSprite(Assets.getPlayerMarcoPistolStandRun());
      } else {
        if (!(player.state instanceof player.jumpState.constructor)) {
          player.setState(player.idleState);
          player.setSprite(Assets.getPlayerMarcoPistolStandIdleNormal());
          player.setDirection(null);
        }
      }
    }

    if (activeKeys.has(" ")) {
      if (player.grounded && player.canJump) {
        player.setState(player.jumpState);
        player.setSprite(Assets.getPlayerMarcoPistolJumpIdle());
      }
    }

    if (activeKeys.has(" ") && (activeKeys.has("a") || activeKeys.has("d"))) {
      // ...existing code...
    }

    if (activeKeys.has("control")) {
      player.setState(player.shootState);
      player.setSprite(Assets.getPlayerMarcoPistolStandShoot());
      this.activeKeys.delete("control");
    }
  }
}

export default PlayerInputHandler;
