/**
 * generate-logo-pngs.mjs
 * Converts SVG logos to PNG at multiple sizes using sharp.
 * Run: node scripts/generate-logo-pngs.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

// Dynamically import sharp (bundled with Next.js)
let sharp;
try {
  const mod = await import('sharp');
  sharp = mod.default;
} catch {
  console.error('sharp not available. Run: npm install sharp');
  process.exit(1);
}

const jobs = [
  // Full horizontal logo
  { input: 'logo.svg',       output: 'logo.png',          width: 640,  height: 160 },
  { input: 'logo.svg',       output: 'logo@2x.png',       width: 1280, height: 320 },
  { input: 'logo-white.svg', output: 'logo-white.png',    width: 640,  height: 160 },

  // Icon only
  { input: 'logo-icon.svg',  output: 'logo-icon-512.png', width: 512,  height: 512 },
  { input: 'logo-icon.svg',  output: 'logo-icon-256.png', width: 256,  height: 256 },
  { input: 'logo-icon.svg',  output: 'logo-icon-192.png', width: 192,  height: 192 },
  { input: 'logo-icon.svg',  output: 'logo-icon-128.png', width: 128,  height: 128 },
  { input: 'logo-icon.svg',  output: 'logo-icon-64.png',  width: 64,   height: 64  },

  // OG image (social share preview)
  { input: 'logo.svg',       output: 'og-logo.png',       width: 1200, height: 300 },
];

for (const job of jobs) {
  const inputPath  = join(publicDir, job.input);
  const outputPath = join(publicDir, job.output);

  try {
    await sharp(inputPath)
      .resize(job.width, job.height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`✓  ${job.output}  (${job.width}×${job.height})`);
  } catch (err) {
    console.error(`✗  ${job.output}: ${err.message}`);
  }
}

console.log('\nDone! All logo PNGs generated in /public');
