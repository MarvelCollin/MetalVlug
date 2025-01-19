import Enemy from './enemy.js';

class EnemyFactory {
    static createEnemy(type, x, y) {
        return new Enemy(x, y, type);
    }

    static createEnemyGroup(type, positions) {
        return positions.map(pos => this.createEnemy(type, pos.x, pos.y));
    }
}

export default EnemyFactory;
