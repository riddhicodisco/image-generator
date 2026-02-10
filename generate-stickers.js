const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const STICKERS_DIR = path.join(__dirname, 'public', 'assets', 'stickers');

if (!fs.existsSync(STICKERS_DIR)) {
  fs.mkdirSync(STICKERS_DIR, { recursive: true });
}

async function createSticker(name, text, bgColor, textColor) {
  const svg = `
    <svg width="400" height="150" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="380" height="130" rx="30" fill="${bgColor}" stroke="white" stroke-width="5"/>
      <text x="200" y="85" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(STICKERS_DIR, `${name}.png`));
  console.log(`Generated ${name}.png`);
}

async function run() {
  await createSticker('free-delivery', 'FREE DELIVERY', '#FF5722', '#FFFFFF');
  await createSticker('low-shipping', 'LOW SHIPPING', '#4CAF50', '#FFFFFF');
  await createSticker('shipping-badge', '₹ SHIPPING', '#2196F3', '#FFFFFF');
}

run().catch(console.error);
