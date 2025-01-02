
class StateManager {
    constructor(entity) {
        this.entity = entity;
    }

    update(deltaTime) {
        if (this.entity.state) {
            this.entity.state.update(deltaTime);
        }
    }
}

export default StateManager;