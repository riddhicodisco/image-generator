
import fs from 'fs';
import path from 'path';
import { generateHash } from '../src/lib/hash/hasher';
import { generate50Variants } from '../src/lib/image/generateVariants';
import sharp from 'sharp';

async function test() {
  try {
    console.log("Starting upload logic test...");

    // 1. Create a dummy image buffer (100x100 red png)
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
      .png()
      .toBuffer();
    console.log("Dummy buffer created. Size:", buffer.length);

    // 2. Test Hash
    console.log("Testing generateHash...");
    const hash = await generateHash(buffer);
    console.log("Hash generated:", hash);

    // 3. Test Variants
    console.log("Testing generate50Variants...");
    // Mock BaseName
    const baseName = "test-run-" + Date.now();

    // Ensure public/generated exists (the function does this but let's check permission)
    const variants = await generate50Variants(buffer, baseName);

    console.log("Variants return type:", typeof variants);
    if (!variants) {
      console.error("Variants is undefined!");
    } else {
      console.log("Variants length:", variants.length);
      if (variants.length > 0) {
        console.log("First variant:", variants[0]);
      }
    }

    console.log("Test finished successfully.");

  } catch (e: any) {
    console.error("TEST FAILED WITH ERROR:", e);
  }
}

test();
