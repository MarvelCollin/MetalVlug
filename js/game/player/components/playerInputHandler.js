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
      playerMoveHandler.move(activeKeys.has("arrowleft") ? DIRECTION.LEFT : DIRECTION.RIGHT); 
      this.player.isMoving = true;
      this.player.actions.add(ACTION.RUN);
    } else {
      playerMoveHandler.resetVelocity(); 
      this.player.isMoving = false;
      this.player.actions.delete(ACTION.RUN);
    }
  }

  handleDirection() {
    const { player } = this;
    if (this.activeKeys.has("arrowdown")) {
        player.actions.add(ACTION.SNEAK);
    } else {
        player.actions.delete(ACTION.SNEAK);
    }
    
    if (this.activeKeys.has("arrowup")) {
        player.actions.add(ACTION.LOOKUP);
    } else {
        player.actions.delete(ACTION.LOOKUP);
    }
  }

  handleJump(activeKeys) {
    const { playerMoveHandler } = this.player;
    if (activeKeys.has(" ") && !playerMoveHandler.isJumping && this.player.grounded) {
      playerMoveHandler.jump(); 
    } 
  }

  handleShoot(activeKeys) {
    const { player } = this;
    if (activeKeys.has("control") && !player.isShooting) {
      this.activeKeys.delete("control");
      player.actions.add(ACTION.SHOOT);
      player.isShooting = true; 
      player.setState(player.shootState);
    }
  }

  handleDash(activeKeys) {
    if (activeKeys.has("shift") && !this.player.playerMoveHandler.isDashing) {
        this.player.actions.add(ACTION.DASH);
        this.player.playerMoveHandler.dash();
    }
  }

  isMove(activeKeys) {
    return activeKeys.has("arrowleft") || activeKeys.has("arrowright"); 
  }

  updatePlayerFromKeys() {
    const { player } = this;
    const { activeKeys } = this;
    player.currentInputs = new Set(activeKeys);

    this.handleDirection();
    this.handleJump(activeKeys);
    this.handleShoot(activeKeys);
    this.handleMove(activeKeys);
    this.handleDash(activeKeys);
  }
}

export default PlayerInputHandler;
