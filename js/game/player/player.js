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
        super(x, y, 50, 100);

        this.idleState = new PlayerIdleState(this);
        this.runState = new PlayerRunState(this);
        this.shootState = new PlayerShootState(this);
        this.spawnState = new PlayerSpawnState(this);
        this.jumpState = new PlayerJumpState(this);

        this.state = this.spawnState;
        this.state.enter();
        
        this.bullets = [];
        this.lastShootTime = 0;
        this.shootCooldown = 150;
    }

    setState(state) {
        this.state = state;
        this.state.enter();
    }

    handleInput(input) {
        if (input === "shoot") {
            const now = Date.now();
            if (now - this.lastShootTime >= this.shootCooldown) {
                this.lastShootTime = now;
                const shootState = new PlayerShootState(this);
                shootState.previousState = this.state;
                this.setState(shootState);
            }
            return;
        }
        
        if (input === "runLeft" || input === "runRight") {
            this.setDirection(input === "runLeft" ? Direction.LEFT : Direction.RIGHT);
            this.setState(this.runState);
        } else if (input === "idle") {
            this.setState(this.idleState);
        } else if (input === "jump" && this.grounded) {
            this.grounded = false;
            this.setState(this.jumpState);
            return;
        }
        this.state.handleInput(input);
    }

    addBullet(bullet) {
        this.bullets.push(bullet);
    }

    update(deltaTime, obstacles = []) {
        super.update(obstacles);
        
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
