import { CANVAS_SIZES } from './constants';

export interface Template {
  id: number;
  canvasSize: { width: number; height: number };
  background: string;
  borderWidth: number;
  borderColor: string;
  stickers: {
    type: 'free-delivery' | 'low-shipping' | 'shipping-badge';
    position: { x: number; y: number };
    scale: number;
  }[];
  text?: {
    content: string;
    position: { x: number; y: number };
    fontSize: number;
    color: string;
  };
}

const backgrounds = [
  '#f5f5f5', '#ffffff', '#e0e0e0', '#fce4ec', '#e3f2fd', '#f1f8e9', '#fff8e1', '#efebe9'
];

const borderColors = [
  '#2196f3', '#4caf50', '#f44336', '#ff9800', '#9c27b0', '#ffffff', '#000000'
];

export const templates: Template[] = Array.from({ length: 57 }, (_, i) => {
  const canvasSize = CANVAS_SIZES[i % CANVAS_SIZES.length];
  const bgIndex = i % backgrounds.length;
  const borderColIndex = i % borderColors.length;
  const stickerCount = (i % 2) + 1; // 1 or 2 stickers

  const stickers: Template['stickers'] = [];

  if (stickerCount >= 1) {
    stickers.push({
      type: i % 3 === 0 ? 'free-delivery' : (i % 3 === 1 ? 'low-shipping' : 'shipping-badge'),
      position: { x: 50, y: 50 },
      scale: 0.5,
    });
  }

  if (stickerCount === 2) {
    stickers.push({
      type: 'shipping-badge',
      position: { x: canvasSize.width - 250, y: canvasSize.height - 120 },
      scale: 0.4,
    });
  }

  return {
    id: i + 1,
    canvasSize,
    background: backgrounds[bgIndex],
    borderWidth: (i % 5 === 0) ? 20 : 0,
    borderColor: borderColors[borderColIndex],
    stickers,
  };
});
