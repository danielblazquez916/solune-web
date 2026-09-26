import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

for (const name of ['dental-interior', 'eter-still-life', 'studio-interior']) {
  const original = await readFile(`public/images/${name}.jpg`);
  await sharp(original)
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(`public/images/${name}-2400.webp`);
  await sharp(original)
    .resize({ width: 1200 })
    .webp({ quality: 90 })
    .toFile(`public/images/${name}.webp`);
  await sharp(original)
    .resize({ width: 640 })
    .webp({ quality: 88 })
    .toFile(`public/images/${name}-640.webp`);
}
await sharp('public/og-cover.svg').png().toFile('public/og-cover.png');
await writeFile(
  'public/images/README.txt',
  'Fotografías de Unsplash utilizadas como referencias visuales de proyectos ficticios.\nNo representan clientes, personal ni instalaciones reales de LUMA.\n\nhttps://images.unsplash.com/photo-1629909613654-28e377c37b09\nhttps://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd\nhttps://images.unsplash.com/photo-1600210492486-724fe5c67fb0\n\nLicencia: https://unsplash.com/license\nIdentidades, diagramas, mockups y halo: composiciones originales de este proyecto.\n',
);
