import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateHash } from "@/lib/hash/hasher";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const hash = await generateHash(buffer);

    const product = await prisma.product.findUnique({
      where: { hash },
    });

    if (!product) {
      return NextResponse.json({
        message: "No shipping charge found for this image",
        hash,
        shippingCharge: null,
      }, { status: 404 });
    }

    return NextResponse.json({
      hash,
      shippingCharge: product.shippingCharge,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Get shipping error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
