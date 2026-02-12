
import sharp from "sharp";

/**
 * Generates a perceptual hash from an image buffer using purely Sharp.
 * This removes the dependency on 'imghash' which can be unstable.
 * Algorithm: Average Hash (aHash) - simple and effective for near-duplicates.
 * @param buffer Image buffer
 * @returns Hex string hash
 */
export async function generateHash(buffer: Buffer): Promise<string> {
  // 1. Resize to small square (8x8) for hash signature
  // We use 8x8 = 64 pixels.
  const size = 8;
  const resized = await sharp(buffer)
    .resize(size, size, { fit: "fill" })
    .grayscale() // Convert to grayscale
    .raw() // Output raw pixel data (no header)
    .toBuffer();

  if (!resized || !Buffer.isBuffer(resized)) {
    console.error("Hasher: CRITICAL ERROR - resized buffer is null or not a buffer:", resized);
    throw new Error("Image hashing failed: Sharp returned invalid buffer");
  }

  // 2. Calculate average brightness
  let total = 0;
  for (let i = 0; i < resized.length; i++) {
    total += resized[i];
  }
  const avg = total / resized.length;

  // 3. Compute bits (1 if > avg, 0 if < avg)
  let hashBits = "";
  for (let i = 0; i < resized.length; i++) {
    hashBits += resized[i] >= avg ? "1" : "0";
  }

  // 4. Convert binary string to hex
  let hexParams = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    const chunk = hashBits.substring(i, i + 4);
    const hexDigit = parseInt(chunk, 2).toString(16);
    hexParams += hexDigit;
  }

  return hexParams;
}
