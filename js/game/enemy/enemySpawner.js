import EnemyFactory from "./enemyFactory.js";
import { canvas } from "../ctx.js";

class EnemySpawner {
  constructor() {
    this.minSpawnTime = 10000000; 
    this.maxSpawnTime = 100000000; 
    this.lastSpawnTime = Date.now();
    this.nextSpawnTime = this.getRandomSpawnTime();
    this.minEnemies = 1;
    this.maxEnemies = 3;
  }

  getRandomSpawnTime() {
    return (
      Math.random() * (this.maxSpawnTime - this.minSpawnTime) +
      this.minSpawnTime
    );
  }

  getRandomPosition() {
    return {
      x: Math.random() * (canvas.width * 2) + 500,
      y: Math.random() * 600 + 200,
    };
  }

  getRandomEnemyCount() {
    return (
      Math.floor(Math.random() * (this.maxEnemies - this.minEnemies + 1)) +
      this.minEnemies
    );
  }

  update() {
    const currentTime = Date.now();
    if (currentTime - this.lastSpawnTime > this.nextSpawnTime) {
      const enemyCount = this.getRandomEnemyCount();
      const newEnemies = [];

      for (let i = 0; i < enemyCount; i++) {
        const position = this.getRandomPosition();
        const enemy = EnemyFactory.createEnemy(
          "normal",
          position.x,
          position.y
        );
        newEnemies.push(enemy);
      }

      this.lastSpawnTime = currentTime;
      this.nextSpawnTime = this.getRandomSpawnTime();
      return newEnemies;
    }
    return [];
  }
}

export default EnemySpawner;
