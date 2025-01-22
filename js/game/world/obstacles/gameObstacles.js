import { Obstacle } from '../obstacle.js';

export const gameObstacles = [
    new Obstacle(0, 910, 3000, 20, "normal"),    // floor
    new Obstacle(420, 550, 300, 250, "stair"),   // left stair
    new Obstacle(1800, 570, 300, 250, "reverseStair"), // right stair
    new Obstacle(750, 550, 1100, 20, "normal"),  // mid platform
];
