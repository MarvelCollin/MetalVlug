import { DIRECTION } from "../../entities/components/actions.js";
import Assets from "../../helper/assets.js";

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

  handleMove(activeKeys, sprite) {
    const { player } = this;
    if (activeKeys.has("a") || activeKeys.has("d")) {
      const direction = activeKeys.has("a") ? DIRECTION.LEFT : DIRECTION.RIGHT;
      player.movement.move(direction);
      player.setSprite(sprite);
    } else {
      player.resetVelocity();
      player.setSprite(Assets.getPlayerMarcoPistolStandIdleNormal());
    }
  }

  handleJump(activeKeys, sprite) {
    const { player } = this;
    if (activeKeys.has(" ") && player.grounded) {
      player.movement.jump();
      player.setSprite(sprite);
      player.grounded = false;
    }
  }

  handleShoot(activeKeys, sprite) {
    const { player } = this;
    if (activeKeys.has("control")) {
      player.setState(player.shootState, sprite);
      this.activeKeys.delete("control");
    }
  }

  isMove(activeKeys) {
    return activeKeys.has("a") || activeKeys.has("d");
  }

  updatePlayerFromKeys() {
    const { player } = this;
    const { activeKeys } = this;
    player.currentInputs = new Set(activeKeys);

    this.handleJump(activeKeys, Assets.getPlayerMarcoPistolJumpIdle());
    this.handleShoot(activeKeys, Assets.getPlayerMarcoPistolStandShoot());

    if (player.grounded) {
      this.handleMove(activeKeys, Assets.getPlayerMarcoPistolStandRun());
    }
  }
}

export default PlayerInputHandler;
