import PlayerIdleState from './state/playerIdleState.js';
import PlayerRunState from './state/playerRunState.js';
import PlayerShootState from './state/playerShootState.js';
import PlayerSpawnState from './state/playerSpawnState.js';

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 1.5;
        this.direction = null;

        this.idleState = new PlayerIdleState(this);
        this.runState = new PlayerRunState(this);
        this.shootState = new PlayerShootState(this);
        this.spawnState = new PlayerSpawnState(this);

        this.currentState = this.spawnState;
        this.currentState.enter();
    }

    setState(state) {
        this.currentState = state;
        this.currentState.enter();
    }

    handleInput(input) {
        if (input === 'runLeft') {
            this.direction = 'left';
            this.setState(this.runState);
        } else if (input === 'runRight') {
            this.direction = 'right';
            this.setState(this.runState);
        } else if (input === 'shoot') {
            this.setState(this.shootState);
        } else if (input === 'idle') {
            this.direction = null;
            this.setState(this.idleState);
        }
        this.currentState.handleInput(input);
    }

    update() {
        this.currentState.update();
    }

    draw() {
        this.currentState.draw();
    }
}

export default Player;
