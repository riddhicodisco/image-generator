import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
  try {
    const { sessionId, id } = await params;
    const imagePath = path.join(process.cwd(), 'tmp', sessionId, 'output', `${id}.png`);

    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(imagePath);

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error: unknown) {
    console.error("Image fetch error:", error);
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
