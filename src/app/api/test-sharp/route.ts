
import { NextResponse } from "next/server";
import sharp from "sharp";

export async function GET() {
  try {
    console.log("Test Sharp route hit");

    // Create a simple 1x1 png image
    const image = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
      .png()
      .toBuffer();

    console.log("Sharp image created successfully, size:", image.length);

    return new NextResponse(image, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error: any) {
    console.error("Test Sharp error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
