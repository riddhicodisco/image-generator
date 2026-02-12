import sharp from "sharp";
import { Template } from "./templates";
import { calculateMeeshoShipping } from "./shipping/calc";

/**
 * Generate a dynamic SVG sticker buffer
 */
function generateSticker(
  type: string,
  amount?: number,
  rotation: number = 0,
): Buffer {
  let bgColor = "#4caf50"; // Default Green
  let textColor = "#ffffff";
  let text = "FREE DELIVERY";
  let secondaryText = "";

  switch (type) {
    case "LOW_SHIPPING":
      bgColor = "#2196f3";
      text = "LOW SHIPPING";
      secondaryText = amount ? `₹${amount}` : "";
      break;
    case "BESTSELLER":
      bgColor = "#ffd700"; // Gold
      textColor = "#000000";
      text = "★ BESTSELLER ★";
      break;
    case "NEW_ARRIVAL":
      bgColor = "#ff4081"; // Pink/Modern
      text = "NEW ARRIVAL";
      break;
    case "CASH_ON_DELIVERY":
      bgColor = "#37474f";
      text = "COD AVAILABLE";
      break;
    case "MEESHO_MALL":
      bgColor = "#ff6b35"; // Meesho Orange
      text = "MEESHO MALL";
      break;
    case "ASSURED_QUALITY":
      bgColor = "#4caf50";
      text = "ASSURED";
      secondaryText = "QUALITY";
      break;
    case "EXCLUSIVE_OFFER":
      bgColor = "#e91e63";
      text = "EXCLUSIVE";
      secondaryText = "OFFER";
      break;
    case "LIMITED_STOCK":
      bgColor = "#ff5722";
      text = "LIMITED";
      secondaryText = "STOCK";
      break;
    case "TRENDING_NOW":
      bgColor = "#9c27b0";
      text = "TRENDING";
      secondaryText = "NOW";
      break;
  }

  const svg = `
    <svg width="320" height="100" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="3" dy="3" stdDeviation="4" flood-opacity="0.4" />
        </filter>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${bgColor};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <g transform="rotate(${rotation}, 160, 50)">
        <rect x="10" y="10" width="300" height="80" rx="40" fill="url(#grad)" filter="url(#shadow)" stroke="#ffffff" stroke-width="3" />
        <text x="160" y="${secondaryText ? 42 : 50}" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
          ${text}
        </text>
        ${
          secondaryText
            ? `
        <text x="160" y="68" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
          ${secondaryText}
        </text>`
            : ""
        }
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}

export async function generateSingleImage(
  template: Template,
  productImagePath: string,
  categoryId: string,
): Promise<Buffer> {
  // Use a typical weight for the category if real weight is unknown
  const weight =
    categoryId === "10000"
      ? 0.4
      : categoryId === "10001"
        ? 0.6
        : categoryId === "10002"
          ? 0.8
          : 1.2;
  const zone: "LOCAL" | "REGIONAL" | "NATIONAL" =
    template.id % 3 === 0
      ? "LOCAL"
      : template.id % 3 === 1
        ? "REGIONAL"
        : "NATIONAL";

  const { charge: shippingCharge } = calculateMeeshoShipping(weight, zone);

  const { width, height } = template.canvasSize;

  const canvas = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: template.background,
    },
  });

  const layers: sharp.OverlayOptions[] = [];

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

  const productImg = sharp(productImagePath);
  const metadata = await productImg.metadata();
  const scale = Math.min(
    (width * 0.8) / (metadata.width || 1),
    (height * 0.8) / (metadata.height || 1),
  );
  const productResized = await productImg
    .resize(
      Math.round((metadata.width || 1) * scale),
      Math.round((metadata.height || 1) * scale),
    )
    .toBuffer();

  const productMeta = await sharp(productResized).metadata();
  const productTop = Math.round((height - (productMeta.height || 0)) / 2);
  const productLeft = Math.round((width - (productMeta.width || 0)) / 2);

  layers.push({
    input: productResized,
    top: productTop,
    left: productLeft,
  });

  // Stickers
  for (const sticker of template.stickers) {
    const rotation = ((template.id * 7) % 15) - 7; // Deterministic rotation between -7 and +7 degrees
    const stickerBuffer = generateSticker(
      sticker.type,
      shippingCharge,
      rotation,
    );
    const sMeta = await sharp(stickerBuffer).metadata();
    const sWidth = Math.round((sMeta.width || 320) * sticker.scale);
    const finalSticker = await sharp(stickerBuffer).resize(sWidth).toBuffer();
    const finalStickerMeta = await sharp(finalSticker).metadata();

    let top = 40;
    let left = 40;

    if (sticker.position === "TOP_RIGHT")
      left = width - (finalStickerMeta.width || 0) - 40;
    if (sticker.position === "BOTTOM_LEFT")
      top = height - (finalStickerMeta.height || 0) - 40;
    if (sticker.position === "BOTTOM_RIGHT") {
      top = height - (finalStickerMeta.height || 0) - 40;
      left = width - (finalStickerMeta.width || 0) - 40;
    }
    if (sticker.position === "CENTER_TOP") {
      top = 20;
      left = Math.round((width - (finalStickerMeta.width || 0)) / 2);
    }
    if (sticker.position === "CENTER_BOTTOM") {
      top = height - (finalStickerMeta.height || 0) - 20;
      left = Math.round((width - (finalStickerMeta.width || 0)) / 2);
    }

    layers.push({
      input: finalSticker,
      top,
      left,
    });
  }

  return await canvas.composite(layers).png().toBuffer();
}
