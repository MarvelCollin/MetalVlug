import { idleImages, runImages } from './game.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let x = canvas.width / 2; // Center x position
let y = canvas.height; // Bottom y position

let currentFrame = 0;
const frameDelay = 100; // Delay in milliseconds
const scaleFactor = 1.5; // Scale factor to increase image size

// Drawing logic moved to game.js
