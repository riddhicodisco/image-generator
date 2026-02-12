
import { NextResponse } from "next/server";
import { generateHash } from "@/lib/hash/hasher";
import sharp from "sharp";

export async function GET() {
  try {
    console.log("Test Hash route hit");

    // Create a simple image buffer
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 0, g: 255, b: 0 }
      }
    })
      .png()
      .toBuffer();

    const hash = await generateHash(buffer);
    console.log("Hash generated:", hash);

    return NextResponse.json({ status: "ok", hash });
  } catch (error: any) {
    console.error("Test Hash error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
