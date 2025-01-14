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
    const { playerMoveHandler } = this.player;
    if (activeKeys.has("arrowleft") || activeKeys.has("arrowright")) {
      playerMoveHandler.move(activeKeys.has("arrowleft") ? DIRECTION.LEFT : DIRECTION.RIGHT); // Set velocity
      this.player.isMoving = true;
      this.player.actions.add(ACTION.RUN);
    } else {
      playerMoveHandler.resetVelocity(); // Reset horizontal velocity
      this.player.isMoving = false;
      this.player.actions.delete(ACTION.RUN);
    }
  }

  handleJump(activeKeys) {
    const { playerMoveHandler } = this.player;
    if (activeKeys.has(" ") && this.player.currentJumpHeight < this.player.maxJumpHeight) {
      playerMoveHandler.jump(); // Initiate jump
    } else if (!activeKeys.has(" ")) {
      this.player.actions.delete(ACTION.JUMP);
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
