const { createCanvas, loadImage } = require("canvas");

const WIDTH = 64;
const HEIGHT = 32;

function rgb888to565(r, g, b) {
  return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
}

loadImage("image.png").then((img) => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = imageData.data;

  const pixels = [];

  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    let r = data[i * 4];
    let g = data[i * 4 + 1];
    let b = data[i * 4 + 2];

    const color565 = rgb888to565(r, g, b);
    pixels.push(color565.toString(16).padStart(4, "0"));
  }

  require("fs").writeFileSync("image.hex", pixels.join("\n"));
});