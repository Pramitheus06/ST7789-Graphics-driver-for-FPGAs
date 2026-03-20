const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const WIDTH = 240;
const HEIGHT = 135;

// Helper to find the closest RGB332 match
function findClosest332(r, g, b) {
    const nr = Math.round(r * 7 / 255) * 255 / 7;
    const ng = Math.round(g * 7 / 255) * 255 / 7;
    const nb = Math.round(b * 3 / 255) * 255 / 3;
    return [nr, ng, nb];
}

loadImage("image.png").then((img) => {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const pixels = imageData.data;

    // Floyd-Steinberg Dithering Loop
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const i = (y * WIDTH + x) * 4;
            const oldR = pixels[i];
            const oldG = pixels[i + 1];
            const oldB = pixels[i + 2];

            const [newR, newG, newB] = findClosest332(oldR, oldG, oldB);

            pixels[i] = newR;
            pixels[i + 1] = newG;
            pixels[i + 2] = newB;

            const errR = oldR - newR;
            const errG = oldG - newG;
            const errB = oldB - newB;

            // Distribute error to neighbors
            const distribute = (nx, ny, weight) => {
                if (nx >= 0 && nx < WIDTH && ny < HEIGHT) {
                    const ni = (ny * WIDTH + nx) * 4;
                    pixels[ni] += errR * weight;
                    pixels[ni + 1] += errG * weight;
                    pixels[ni + 2] += errB * weight;
                }
            };

            distribute(x + 1, y, 7 / 16);
            distribute(x - 1, y + 1, 3 / 16);
            distribute(x, y + 1, 5 / 16);
            distribute(x + 1, y + 1, 1 / 16);
        }
    }

    // Convert dithered pixels to RGB332 hex
    const hexOutput = [];
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
        const r = Math.min(255, Math.max(0, pixels[i * 4]));
        const g = Math.min(255, Math.max(0, pixels[i * 4 + 1]));
        const b = Math.min(255, Math.max(0, pixels[i * 4 + 2]));
        
        const byte332 = (Math.round(r * 7 / 255) << 5) | 
                        (Math.round(g * 7 / 255) << 2) | 
                        (Math.round(b * 3 / 255));
        hexOutput.push(byte332.toString(16).padStart(2, '0'));
    }

    fs.writeFileSync("image.hex", hexOutput.join("\n"));
    console.log("Done! Check your screen now.");
});