import EnemyFactory from "./enemyFactory.js";
import { canvas } from "../ctx.js";
import { enemyType } from "./types/enemyType.js";

class EnemySpawner {
  constructor() {
    this.minSpawnTime = 1000; 
    this.maxSpawnTime = 3000; 
    this.lastSpawnTime = Date.now();
    this.nextSpawnTime = this.getRandomSpawnTime();
    this.minEnemies = 1;
    this.maxEnemies = 3;
    this.enemyTypes = Object.values(enemyType);
  }

  getRandomSpawnTime() {
    return (
      Math.random() * (this.maxSpawnTime - this.minSpawnTime) +
      this.minSpawnTime
    );
  }

  getRandomPosition() {
    return {
      x: Math.random() * (canvas.width * 2) + 300,
      y: Math.random() * 600 + 200,
    };
  }

  getRandomEnemyCount() {
    return (
      Math.floor(Math.random() * (this.maxEnemies - this.minEnemies + 1)) +
      this.minEnemies
    );
  }

  getRandomEnemyType() {
    const randomIndex = Math.floor(Math.random() * this.enemyTypes.length);
    return this.enemyTypes[randomIndex];
  }

  update() {
    const currentTime = Date.now();
    if (currentTime - this.lastSpawnTime > this.nextSpawnTime) {
      const enemyCount = this.getRandomEnemyCount();
      const newEnemies = [];

      for (let i = 0; i < enemyCount; i++) {
        const position = this.getRandomPosition();
        const type = this.getRandomEnemyType();
        const enemy = EnemyFactory.createEnemy(
          type,
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
