export const idleImages = [];
export const runImages = [];
export const shootImages = []; // Renamed from attackImages
let loadedImages = 0;
let totalImages = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

let currentFrame = 0;
const frameDelay = 100; // Delay in milliseconds
const scaleFactor = 2;
let isIdle = true;
let isShooting = false; // Renamed from isAttacking
let x = canvas.width / 2; // Center x position
let y = canvas.height - 100; // Bottom y position

const speed = 5; // Movement speed

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    f: false // Added attack key
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
        // Correct position calculations
        const drawX = x - (img.width * scaleFactor) / 2;
        const drawY = y - img.height * scaleFactor;

        ctx.drawImage(img, drawX, drawY, img.width * scaleFactor, img.height * scaleFactor);
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
    if (keys.w) {
        y -= speed;
        moving = true;
    }
    if (keys.a) {
        x -= speed;
        moving = true;
    }
    if (keys.s) {
        y += speed;
        moving = true;
    }
    if (keys.d) {
        x += speed;
        moving = true;
    }
    isIdle = !moving;

    // Handle shoot state
    if (keys.f && !isShooting) { // Trigger shoot with 'f' key
        isShooting = true;
        currentFrame = 0;
    }

    // Optional: Clamp position to canvas boundaries
    x = Math.max(0, Math.min(canvas.width, x));
    y = Math.max(0, Math.min(canvas.height, y));
}

function handleKeyDown(event) {
    if (event.key === 'w') keys.w = true;
    if (event.key === 'a') keys.a = true;
    if (event.key === 's') keys.s = true;
    if (event.key === 'd') keys.d = true;
    if (event.key === 'f') keys.f = true; // Added attack key
}

function handleKeyUp(event) {
    if (event.key === 'w') keys.w = false;
    if (event.key === 'a') keys.a = false;
    if (event.key === 's') keys.s = false;
    if (event.key === 'd') keys.d = false;
    if (event.key === 'f') keys.f = false; // Added attack key
}

fetch('../js/assets.json')
    .then(response => response.json())
    .then(assets => {
        const marco = assets.PLAYER.MARCO;

        totalImages = marco.IDLE.frames + marco.RUN.frames + marco.SHOOT.frames; // Include SHOOT frames

        // Load idle frames
        loadFrames(marco.IDLE.path, marco.IDLE.frames, idleImages, () => {
            // After idle frames are loaded, load run frames
            loadFrames(marco.RUN.path, marco.RUN.frames, runImages, () => {
                // After run frames are loaded, load shoot frames
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