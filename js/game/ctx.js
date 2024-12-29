import { idleImages, runImages } from './game.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let x = canvas.width / 2;
let y = canvas.height;

let currentFrame = 0;
const frameDelay = 100;
const scaleFactor = 1.5;
