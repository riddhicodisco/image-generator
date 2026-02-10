import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Template } from './templates';
import { CATEGORIES } from './constants';

export async function generateSingleImage(
  template: Template,
  productImagePath: string,
  categoryId: string,
): Promise<Buffer> {
  const category = CATEGORIES.find(c => c.id === categoryId);
  const minShipping = category?.shippingRange[0] || 40;
  const maxShipping = category?.shippingRange[1] || 100;
  // Deterministic shipping based on template id
  const shippingCharge = minShipping + (template.id % (maxShipping - minShipping + 1));

  const { width, height } = template.canvasSize;

  // Create base canvas with background color
  let canvas = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: template.background,
    },
  });

  // Composite layers
  const layers: any[] = [];

  // 1. Border
  if (template.borderWidth > 0) {
    const borderSvg = `
      <svg width="${width}" height="${height}">
        <rect x="${template.borderWidth / 2}" y="${template.borderWidth / 2}" 
              width="${width - template.borderWidth}" height="${height - template.borderWidth}" 
              fill="none" stroke="${template.borderColor}" stroke-width="${template.borderWidth}" />
      </svg>
    `;
    layers.push({ input: Buffer.from(borderSvg), top: 0, left: 0 });
  }

  // 2. Product Image (Resize and center)
  const productImg = sharp(productImagePath);
  const metadata = await productImg.metadata();
  const scale = Math.min((width * 0.8) / (metadata.width || 1), (height * 0.8) / (metadata.height || 1));
  const productResized = await productImg
    .resize(Math.round((metadata.width || 1) * scale), Math.round((metadata.height || 1) * scale))
    .toBuffer();

  const productMeta = await sharp(productResized).metadata();
  layers.push({
    input: productResized,
    top: Math.round((height - (productMeta.height || 0)) / 2),
    left: Math.round((width - (productMeta.width || 0)) / 2),
  });

  // 3. Stickers
  for (const sticker of template.stickers) {
    const stickerPath = path.join(process.cwd(), 'public', 'assets', 'stickers', `${sticker.type}.png`);
    if (fs.existsSync(stickerPath)) {
      let stickerImg = sharp(stickerPath);
      const sMeta = await stickerImg.metadata();
      const sWidth = Math.round((sMeta.width || 1) * sticker.scale);

      // Process other sticker types normally
      let stickerBuffer = await stickerImg.resize(sWidth).toBuffer();

      layers.push({
        input: stickerBuffer,
        top: sticker.position.y,
        left: sticker.position.x,
      });
    }
  }

  return await canvas.composite(layers).png().toBuffer();
}
