import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db/prisma";
import { generateHash } from "@/lib/hash/hasher";
import { generate50Variants } from "@/lib/image/generateVariants";
import { calculateMeeshoShipping } from "@/lib/shipping/calc";

export async function POST(request: NextRequest) {
  console.log("API: /api/upload started");
  try {
    const formData = await request.formData();
    console.log("API: FormData parsed");
    const image = formData.get("image") as File;
    const categoryId = (formData.get("categoryId") as string) || "10000"; // Default to T-shirt

    if (!image) {
      console.log("API: No image provided");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("API: Image found, processing buffer...");
    const buffer = Buffer.from(await image.arrayBuffer());
    console.log("API: Buffer created");

    console.log("API: Generating hash...");
    const hash = await generateHash(buffer);
    console.log("API: Hash generated:", hash);

    // Check if exists
    console.log("API: Checking DB for hash...");
    let product = await prisma.product.findUnique({
      where: { hash },
    });
    console.log("API: DB check complete. Product found?", !!product);

    // Generate variants (Always generate fresh variants as they are randomized)
    console.log("API: Generating variants...");
    const baseName = uuidv4();
    const variants = await generate50Variants(buffer, baseName, categoryId);
    console.log("API: Variants generated type:", typeof variants);

    if (!variants) {
      console.error("API: Variants is IDIOTICALLY UNDEFINED");
      throw new Error("Variant generation failed internally.");
    }
    console.log("API: Variants generated. Count:", variants.length);

    // Dynamic Shipping Estimate based on Category
    let weight = 0.4;
    switch (categoryId) {
      case "10001":
        weight = 0.6;
        break;
      case "10002":
        weight = 0.8;
        break;
      case "10003":
        weight = 1.2;
        break;
      default:
        weight = 0.4;
    }

    // Default to 'NATIONAL' zone for worst-case valid estimate
    const calc = calculateMeeshoShipping(weight, "NATIONAL");
    const shippingCharge = calc.charge;
    console.log(
      `API: Calculated shipping for category ${categoryId}, weight ${weight}kg: ₹${shippingCharge}`,
    );

    // DB Operations
    if (product) {
      console.log("API: Product exists, updating...");
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          imagePath: variants[0],
          shippingCharge,
        },
      });
      console.log("API: Product updated.");
    } else {
      console.log("API: Creating new product...");
      product = await prisma.product.create({
        data: {
          hash,
          imagePath: variants[0],
          shippingCharge,
        },
      });
      console.log("API: Product created.");
    }

    return NextResponse.json({
      message: "Uploaded and processed successfully",
      hash,
      shippingCharge,
      variants,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("Upload error FULL OBJECT:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
