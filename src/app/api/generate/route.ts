import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { templates } from '@/lib/templates';
import { generateSingleImage } from '@/lib/imageProcessor';
import { CATEGORIES } from '@/lib/constants';

export const maxDuration = 300; // 5 minutes for generation

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const categoryId = formData.get('categoryId') as string;

    if (!image || !categoryId) {
      return NextResponse.json({ error: 'Missing image or category' }, { status: 400 });
    }

    const sessionId = uuidv4();
    const tempDir = path.join(process.cwd(), 'tmp', sessionId);
    const outputDir = path.join(tempDir, 'output');

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const buffer = Buffer.from(await image.arrayBuffer());
    const inputPath = path.join(tempDir, 'input.png');
    fs.writeFileSync(inputPath, buffer);

    // Generate 57 images
    const variations = [];
    const category = CATEGORIES.find(c => c.id === categoryId);
    const minShipping = category?.shippingRange[0] || 40;
    const maxShipping = category?.shippingRange[1] || 100;

    for (const template of templates) {
      const imageBuffer = await generateSingleImage(template, inputPath, categoryId);
      const shippingCharge = minShipping + (template.id % (maxShipping - minShipping + 1));

      const variationId = template.id;
      const variationPath = path.join(outputDir, `${variationId}.png`);
      fs.writeFileSync(variationPath, imageBuffer);

      variations.push({
        id: variationId,
        shipping: shippingCharge,
      });
    }

    // Cleanup input image, but keep outputDir for serving
    fs.rmSync(inputPath, { force: true });

    return NextResponse.json({
      sessionId,
      images: variations
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
