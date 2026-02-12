import { CANVAS_SIZES } from "./constants";

export interface Template {
  id: number;
  canvasSize: { width: number; height: number };
  background: string;
  borderWidth: number;
  borderColor: string;
  stickers: {
    type:
      | "FREE_DELIVERY"
      | "LOW_SHIPPING"
      | "BESTSELLER"
      | "NEW_ARRIVAL"
      | "CASH_ON_DELIVERY"
      | "MEESHO_MALL"
      | "ASSURED_QUALITY"
      | "EXCLUSIVE_OFFER"
      | "LIMITED_STOCK"
      | "TRENDING_NOW";
    position:
      | "TOP_LEFT"
      | "TOP_RIGHT"
      | "BOTTOM_LEFT"
      | "BOTTOM_RIGHT"
      | "CENTER_TOP"
      | "CENTER_BOTTOM";
    scale: number;
  }[];
}

// Meesho-specific color schemes
const meeshoBackgrounds = [
  "#fef3f2",
  "#fff7ed",
  "#fefce8",
  "#f7fee7",
  "#ecfdf5",
  "#f0fdf4",
  "#f0f9ff",
  "#eff6ff",
  "#faf5ff",
  "#fdf4ff",
  "#fff1f2",
  "#fef2f2",
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#f8fafc",
];

const meeshoBorderColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ffffff",
  "#000000",
  "#6b7280",
];

const meeshoStickerTypes: Template["stickers"][0]["type"][] = [
  "FREE_DELIVERY",
  "LOW_SHIPPING",
  "BESTSELLER",
  "NEW_ARRIVAL",
  "CASH_ON_DELIVERY",
  "MEESHO_MALL",
  "ASSURED_QUALITY",
  "EXCLUSIVE_OFFER",
  "LIMITED_STOCK",
  "TRENDING_NOW",
];

const positions: Template["stickers"][0]["position"][] = [
  "TOP_LEFT",
  "TOP_RIGHT",
  "BOTTOM_LEFT",
  "BOTTOM_RIGHT",
  "CENTER_TOP",
  "CENTER_BOTTOM",
];

export const templates: Template[] = Array.from({ length: 100 }, (_, i) => {
  const canvasSize = CANVAS_SIZES[i % CANVAS_SIZES.length];
  const bgIndex = i % meeshoBackgrounds.length;
  const borderColIndex = i % meeshoBorderColors.length;

  // Create unique set of stickers for each template
  const stickers: Template["stickers"] = [];

  // Primary sticker - always present
  stickers.push({
    type: meeshoStickerTypes[i % meeshoStickerTypes.length],
    position: positions[i % positions.length],
    scale: 0.9 + (i % 4) * 0.05, // 0.9 to 1.05 scale variation
  });

  // Secondary sticker for some templates (30% chance)
  if (i % 3 === 0) {
    stickers.push({
      type: meeshoStickerTypes[(i + 3) % meeshoStickerTypes.length],
      position: positions[(i + 2) % positions.length],
      scale: 0.7 + (i % 3) * 0.05, // 0.7 to 0.8 scale
    });
  }

  // Tertiary sticker for premium templates (10% chance)
  if (i % 10 === 0) {
    stickers.push({
      type: meeshoStickerTypes[(i + 5) % meeshoStickerTypes.length],
      position: positions[(i + 4) % positions.length],
      scale: 0.6,
    });
  }

  // Border logic - more variety
  let borderWidth = 0;
  if (i % 5 === 0)
    borderWidth = 30; // Thick border
  else if (i % 3 === 0)
    borderWidth = 15; // Medium border
  else if (i % 7 === 0) borderWidth = 8; // Thin border

  return {
    id: i + 1,
    canvasSize,
    background: meeshoBackgrounds[bgIndex],
    borderWidth,
    borderColor: meeshoBorderColors[borderColIndex],
    stickers,
  };
});
