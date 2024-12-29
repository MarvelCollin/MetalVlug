export const idleImages = [];
export const runImages = [];
export const shootImages = [];
let loadedImages = 0;
let totalImages = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let currentFrame = 0;
const frameDelay = 100;
const scaleFactor = 2;
let isIdle = true;
let isShooting = false;
let groundY = canvas.height - 50;
let x = 50;
let y = groundY;

const speed = 5;

const keys = {
    a: false,
    d: false,
    f: false
};

function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let img;
    if (isShooting && shootImages.length > 0) {
        img = shootImages[currentFrame % shootImages.length];
    } else if (!isIdle && runImages.length > 0) {
        img = runImages[currentFrame % runImages.length];
    } else if (isIdle && idleImages.length > 0) {
        img = idleImages[currentFrame % idleImages.length];
    }

    if (img && img.complete) {
        const drawX = x;
        const drawY = groundY - (img.height * scaleFactor);

        ctx.drawImage(img, drawX, drawY, img.width * scaleFactor, img.height * scaleFactor);
        
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, img.width * scaleFactor, img.height * scaleFactor);
    }

    currentFrame++;

    if (isShooting) {
        if (currentFrame >= shootImages.length) {
            isShooting = false;
            currentFrame = 0;
        }
    } else if (!isIdle && currentFrame >= runImages.length) {
        currentFrame = 0;
    } else if (isIdle && currentFrame >= idleImages.length) {
        currentFrame = 0;
    }

    setTimeout(() => {
        requestAnimationFrame(drawFrame);
    }, frameDelay);
}

function updatePosition() {
    let moving = false;
    if (keys.a) {
        x -= speed;
        moving = true;
    }
    if (keys.d) {
        x += speed;
        moving = true;
    }
    isIdle = !moving;

    if (keys.f && !isShooting) {
        isShooting = true;
        currentFrame = 0;
    }

    x = Math.max(0, Math.min(canvas.width - 50, x));
}

function handleKeyDown(event) {
    if (event.key === 'a') keys.a = true;
    if (event.key === 'd') keys.d = true;
    if (event.key === 'f') keys.f = true;
}

function handleKeyUp(event) {
    if (event.key === 'a') keys.a = false;
    if (event.key === 'd') keys.d = false;
    if (event.key === 'f') keys.f = false;
}

fetch('../js/assets.json')
    .then(response => response.json())
    .then(assets => {
        const marco = assets.PLAYER.MARCO;

        totalImages = marco.IDLE.frames + marco.RUN.frames + marco.SHOOT.frames;

        loadFrames(marco.IDLE.path, marco.IDLE.frames, idleImages, () => {
            loadFrames(marco.RUN.path, marco.RUN.frames, runImages, () => {
                loadFrames(marco.SHOOT.path, marco.SHOOT.frames, shootImages, startAnimation);
            });
        });
    });

function loadFrames(path, frameCount, imageArray, callback) {
    let loaded = 0;
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.onload = () => {
            loaded++;
            if (loaded === frameCount) callback();
        };
        img.onerror = (e) => console.error(`Failed to load image: ${img.src}`, e);
        img.src = `${path}${i}.png`;
        imageArray.push(img);
    }
}

function startAnimation() {
    requestAnimationFrame(drawFrame);
    setInterval(updatePosition, frameDelay);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);