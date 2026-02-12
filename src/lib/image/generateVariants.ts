import sharp from "sharp";
import path from "path";
import fs from "fs";
import { templates } from "../templates";
import { generateSingleImage } from "../imageProcessor";

/**
 * Generates 50 image variations using Meesho-style templates and saves them to /public/generated.
 * @param inputBuffer Original image buffer
 * @param baseName Basis for naming files
 * @param categoryId Product category for shipping calculations
 * @returns Array of generated file paths
 */
export async function generate50Variants(
  inputBuffer: Buffer,
  baseName: string,
  categoryId: string = "10000",
): Promise<string[]> {
  const outputDir = path.join(process.cwd(), "public", "generated");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const generatedPaths: string[] = [];
  console.log("Variants: Starting Meesho template generation...");

  // Save the original image temporarily for template processing
  const tempImagePath = path.join(outputDir, `${baseName}_temp.png`);
  await sharp(inputBuffer).toFile(tempImagePath);

  try {
    // Generate first 50 templates (we have 57 templates defined)
    for (let i = 0; i < 50 && i < templates.length; i++) {
      const template = templates[i];
      const filename = `${baseName}_variant_${i + 1}.png`;
      const outputPath = path.join(outputDir, filename);

      console.log(`Generating variant ${i + 1} with template ${template.id}`);

      // Generate image using the template system
      const imageBuffer = await generateSingleImage(
        template,
        tempImagePath,
        categoryId,
      );
      await fs.promises.writeFile(outputPath, imageBuffer);

      generatedPaths.push(`/generated/${filename}`);
    }
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
  }

  console.log(`Generated ${generatedPaths.length} variants`);
  return generatedPaths;
}
