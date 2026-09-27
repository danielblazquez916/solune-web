import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

// Render the existing social layout with the exact supplied PNG; no logo redraw.
const logo = await readFile('public/brand/solune-logo.png');
const source = await readFile('public/og-cover.svg', 'utf8');
const svg = source.replace(
  'brand/solune-logo.png',
  `data:image/png;base64,${logo.toString('base64')}`,
);
await sharp(Buffer.from(svg)).png().toFile('public/og-cover.png');
