import { DIRECTION } from "../../entities/components/actions.js";

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

    if (activeKeys.has("a") || activeKeys.has("d")) {
      const direction = activeKeys.has("a") ? DIRECTION.LEFT : DIRECTION.RIGHT;
      player.setDirection(direction);
      if (!(player.state instanceof player.jumpState.constructor)) {
        player.setState(player.moveState);
      }
    } else {
      if (!(player.state instanceof player.jumpState.constructor)) {
        player.setState(player.idleState);
      }
    }

    if (activeKeys.has(" ")) {
      if (player.grounded && player.canJump) {
        player.setState(player.jumpState);
      }
    }

    if (activeKeys.has(" ") && (activeKeys.has("a") || activeKeys.has("d"))) {
    }

    if (activeKeys.has("control")) {
      player.setState(player.shootState);
      this.activeKeys.delete("control");
    }
  }
}

export default PlayerInputHandler;
