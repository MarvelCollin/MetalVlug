import PlayerIdleState from "./states/playerIdleState.js";
import PlayerRunState from "./states/playerRunState.js";
import PlayerShootState from "./states/playerShootState.js";
import PlayerSpawnState from "./states/playerSpawnState.js";
import PlayerJumpState from "./states/playerJumpState.js";
import { Direction } from "./components/direction.js";
import { canvas } from "../ctx.js";
import Entities from "../entities.js";

class Player extends Entities {
    constructor(x, y) {
        const spawnHeight = 300;
        super(x, 0, 100, 100);

        this.idleState = new PlayerIdleState(this);
        this.runState = new PlayerRunState(this);
        this.shootState = new PlayerShootState(this);
        this.spawnState = new PlayerSpawnState(this, spawnHeight)
        this.jumpState = new PlayerJumpState(this);

        this.state = this.spawnState;
        this.state.enter();
        
        this.bullets = [];
        this.lastShootTime = 0;
        this.shootCooldown = 150;

        this.gravity = 0.5;
        this.terminalVelocity = 10;
        this.grounded = false;

        this.currentInputs = new Set();  // Add this to track current inputs
    }

    setState(state) {
        this.state = state;
        this.state.enter();
    }

    handleInput(input) {
        this.currentInputs.add(input);

        if (this.currentInputs.has('shoot')) {
            const now = Date.now();
            if (now - this.lastShootTime >= this.shootCooldown) {
                this.lastShootTime = now;
                const shootState = new PlayerShootState(this);
                shootState.previousState = this.state;
                this.setState(shootState);
            }
        }
        
        if (input === 'idle') {
            this.currentInputs.clear();
            this.setState(this.idleState);
        } else if (this.currentInputs.has('jump') && this.grounded) {
            this.grounded = false;
            this.setState(this.jumpState);
        } else if (this.currentInputs.has('runLeft') || this.currentInputs.has('runRight')) {
            this.setDirection(this.currentInputs.has('runLeft') ? Direction.LEFT : Direction.RIGHT);
            if (!(this.state instanceof PlayerJumpState)) {
                this.setState(this.runState);
            }
        }

        this.state.handleInput(input);
    }

    addBullet(bullet) {
        this.bullets.push(bullet);
    }

    update(deltaTime) {
        super.update();  
        // console.log(this.x, this.y)

        this.bullets = this.bullets.filter((bullet) => {
            bullet.update();
            return bullet.active && bullet.x > 0 && bullet.x < canvas.width;
        });
    }

    draw() {
        super.draw();
        this.bullets.forEach((bullet) => bullet.draw());
    }
}

export default Player;
