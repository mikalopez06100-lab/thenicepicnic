/**
 * Compresse les photos source et génère src/lib/gallery-data.ts
 * Usage : node scripts/compress-gallery.mjs
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const ASSETS_DIR =
  process.env.GALLERY_ASSETS_DIR ||
  path.join(ROOT, "..", ".cursor", "projects", "c-Users-ppmpc-Thenicepicnic", "assets");
const OUT_DIR = path.join(ROOT, "public/images/gallery");
const MANIFEST_PATH = path.join(ROOT, "src/lib/gallery-data.ts");

const FEATURED_IDS = ["img-1854", "img-1831", "img-2054", "img-floating-sunset"];

const EXTRA_SOURCES = [
  {
    id: "img-floating-bay",
    src: path.join(ROOT, "public/images/home/floating-boat-bay.jpg"),
    featured: false,
  },
  {
    id: "img-floating-sunset",
    src: path.join(ROOT, "public/images/home/floating-boat-sunset.jpg"),
    featured: true,
  },
];

function extractId(filename) {
  const match = filename.match(/IMG_(\d+)/i);
  return match ? `img-${match[1]}` : null;
}

async function compressOne(inputPath, outputPath, maxWidth) {
  await sharp(inputPath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outputPath);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const entries = [];
  const assetFiles = (await readdir(ASSETS_DIR))
    .filter((name) => name.includes("IMG_"))
    .sort((a, b) => {
      const idA = extractId(a) ?? "";
      const idB = extractId(b) ?? "";
      return idA.localeCompare(idB, undefined, { numeric: true });
    });

  for (const file of assetFiles) {
    const id = extractId(file);
    if (!id) {
      continue;
    }
    const inputPath = path.join(ASSETS_DIR, file);
    const outputPath = path.join(OUT_DIR, `${id}.jpg`);
    await compressOne(inputPath, outputPath, 1600);
    entries.push({
      id,
      src: `/images/gallery/${id}.jpg`,
      featured: FEATURED_IDS.includes(id),
    });
    console.log(`✓ ${id}`);
  }

  for (const extra of EXTRA_SOURCES) {
    const outputPath = path.join(OUT_DIR, `${extra.id}.jpg`);
    await compressOne(extra.src, outputPath, 1600);
    if (!entries.some((e) => e.id === extra.id)) {
      entries.push({
        id: extra.id,
        src: `/images/gallery/${extra.id}.jpg`,
        featured: extra.featured,
      });
    }
    console.log(`✓ ${extra.id} (floating)`);
  }

  entries.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  const featured = entries.filter((e) => e.featured);

  const fileContents = `/** Généré par scripts/compress-gallery.mjs — ne pas éditer à la main */
export type GalleryPhoto = {
  id: string;
  src: string;
  featured: boolean;
};

export const galleryPhotos: GalleryPhoto[] = ${JSON.stringify(entries, null, 2)};

export const featuredGalleryPhotos: GalleryPhoto[] = galleryPhotos.filter(
  (photo) => photo.featured,
);
`;

  await writeFile(MANIFEST_PATH, fileContents, "utf8");
  console.log(`\n${entries.length} photos → public/images/gallery/`);
  console.log(`${featured.length} mises en avant : ${featured.map((p) => p.id).join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
