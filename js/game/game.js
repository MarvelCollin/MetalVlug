// ...existing code...
export const idleImages = [];
for (let i = 1; i <= 7; i++) {
    const img = new Image();
    img.src = `../assets/player/marco/spawn/spawn_${i}.png`;
    idleImages.push(img);
}
// ...existing code...
