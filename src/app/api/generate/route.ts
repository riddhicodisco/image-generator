import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { templates } from '@/lib/templates';
import { generateSingleImage } from '@/lib/imageProcessor';

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
    for (const template of templates) {
      const outputPath = path.join(outputDir, `image_${template.id}.png`);
      await generateSingleImage(template, inputPath, categoryId, outputPath);
    }

    // Create ZIP
    const zipPath = path.join(tempDir, 'results.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const zipPromise = new Promise<void>((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    archive.pipe(output);
    archive.directory(outputDir, false);
    await archive.finalize();
    await zipPromise;

    const zipBuffer = fs.readFileSync(zipPath);

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="generated-images-${categoryId}.zip"`,
      },
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
