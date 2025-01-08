import { Direction } from './direction.js';

class PlayerInputHandler {
    constructor(player) {
        this.player = player;
        this.activeKeys = new Set();

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
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

        if (activeKeys.has('a') || activeKeys.has('d')) {
            const direction = activeKeys.has('a') ? 'runLeft' : 'runRight';
            player.handleInput(direction);
        } else {
            player.handleInput('idle');
        }

        if (activeKeys.has(' ')) {
            player.handleInput('jump');
        }

        if (activeKeys.has('control')) { 
            player.handleInput('shoot');
            this.activeKeys.delete('control'); 
        }
    }
}

export default PlayerInputHandler;
