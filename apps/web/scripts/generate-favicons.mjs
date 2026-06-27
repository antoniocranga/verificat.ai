import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, "../public");
const sourceSvg = path.join(publicDir, "logo-accent.svg");

async function generateFavicons() {
  try {
    console.log("Generating favicons from", sourceSvg);

    // favicon-16.png
    await sharp(sourceSvg)
      .resize(16, 16)
      .toFile(path.join(publicDir, "favicon-16.png"));
    console.log("Generated favicon-16.png");

    // favicon-32.png
    await sharp(sourceSvg)
      .resize(32, 32)
      .toFile(path.join(publicDir, "favicon-32.png"));
    console.log("Generated favicon-32.png");

    // apple-touch-icon.png
    await sharp(sourceSvg)
      .resize(180, 180)
      .extend({
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
        background: { r: 250, g: 249, b: 245, alpha: 1 }, // #faf9f5 canvas background
      })
      .resize(180, 180) // Re-resize to exact dimensions
      .flatten({ background: { r: 250, g: 249, b: 245 } }) // Replace transparent background
      .toFile(path.join(publicDir, "apple-touch-icon.png"));
    console.log("Generated apple-touch-icon.png");

    console.log("Successfully generated all favicons!");
  } catch (error) {
    console.error("Error generating favicons:", error);
    process.exit(1);
  }
}

generateFavicons().catch(console.error);
