import Assets from '../assets.js';

async function loadImage(assetPromise) {
    const asset = await assetPromise;
    const images = [];
    for (let i = 0; i < asset.FRAMES; i++) {
        const img = new Image();
        img.src = `${asset.PATH}${i}.png`;
        images.push(img);
    }
    return images;
}

export default loadImage;
