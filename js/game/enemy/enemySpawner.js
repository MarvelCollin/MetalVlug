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
    this.flag = false;
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
    const newEnemies = []
    if(!this.flag){
      const enemy = EnemyFactory.createEnemy(
        enemyType.NORMAL,
        1000,
        200
      );
      newEnemies.push(enemy);
      this.flag = true
    }

    return newEnemies



  }
}

export default EnemySpawner;
