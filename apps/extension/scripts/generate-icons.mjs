import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(__dirname, "..", "wxt.svg"));

const sizes = [16, 32, 48, 128];
const outDir = resolve(__dirname, "..", "public");

mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(resolve(outDir, `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}
