import { DIRECTION, ACTION } from "../../entities/components/actions.js";
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

  handleMove(activeKeys) {
    const { player } = this;
    if (activeKeys.has("arrowleft") || activeKeys.has("arrowright")) {
      player.isMoving = true;
      const direction = activeKeys.has("arrowleft") ? DIRECTION.LEFT : DIRECTION.RIGHT; 
      player.direction = direction;
      player.movement.move(direction);
      player.actions.add(ACTION.RUN);
    } else {
      player.resetVelocity();
      player.isMoving = false;
      player.actions.delete(ACTION.RUN);
    }
  }

  handleJump(activeKeys) {
    const { player } = this;
    if (activeKeys.has(" ") && player.currentJumpHeight < player.maxJumpHeight) {
      player.movement.jump();
      player.actions.add(ACTION.JUMP);
    } else if (!activeKeys.has(" ")) {
      player.actions.delete(ACTION.JUMP);
    }
  }

  handleShoot(activeKeys) {
    const { player } = this;
    if (activeKeys.has("control") && !player.isShooting) {
      this.activeKeys.delete("control");
      player.actions.add(ACTION.SHOOT);
      player.isShooting = true; 
    }
  }

  isMove(activeKeys) {
    return activeKeys.has("arrowleft") || activeKeys.has("arrowright"); 
  }

  updatePlayerFromKeys() {
    const { player } = this;
    const { activeKeys } = this;
    player.currentInputs = new Set(activeKeys);

    this.handleJump(activeKeys);
    this.handleShoot(activeKeys);
    this.handleMove(activeKeys);
  }
}

export default PlayerInputHandler;
