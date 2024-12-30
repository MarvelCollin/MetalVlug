class PlayerState {
    constructor(player) {
        this.player = player;
    }

    enter() {
        // To be implemented by subclasses
    }

    handleInput(input) {
        // To be implemented by subclasses
    }

    update() {
        // To be implemented by subclasses
    }

    draw() {
        // To be implemented by subclasses
    }
}

export default PlayerState;
