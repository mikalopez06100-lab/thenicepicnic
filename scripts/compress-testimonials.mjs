/**
 * Compresse les vidéos témoignages et génère src/lib/testimonials-data.ts
 * Usage : node scripts/compress-testimonials.mjs
 */
import { execFile } from "node:child_process";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_DIR =
  process.env.TESTIMONIALS_SOURCE_DIR ||
  "c:\\Users\\ppmpc\\Desktop\\MasterPrompt\\analyse\\thenicepicnic\\vidéo avis";
const VIDEO_DIR = path.join(ROOT, "public/videos/testimonials");
const POSTER_DIR = path.join(ROOT, "public/images/testimonials");
const MANIFEST_PATH = path.join(ROOT, "src/lib/testimonials-data.ts");

function extractOrder(filename) {
  const match = filename.match(/(\d{2})\.(\d{2})\.(\d+)/);
  if (!match) {
    return filename;
  }
  return `${match[1]}${match[2]}${match[3]}`;
}

async function compressVideo(inputPath, outputPath) {
  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-vf",
    "scale=480:-2",
    "-c:v",
    "libx264",
    "-crf",
    "32",
    "-preset",
    "medium",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "96k",
    "-ar",
    "44100",
    "-ac",
    "1",
    outputPath,
  ]);
}

async function createPoster(inputPath, outputPath) {
  await execFileAsync("ffmpeg", [
    "-y",
    "-ss",
    "00:00:01",
    "-i",
    inputPath,
    "-vframes",
    "1",
    "-vf",
    "scale=360:-2",
    "-q:v",
    "4",
    outputPath,
  ]);
}

async function main() {
  await mkdir(VIDEO_DIR, { recursive: true });
  await mkdir(POSTER_DIR, { recursive: true });

  const files = (await readdir(SOURCE_DIR))
    .filter((name) => name.toLowerCase().endsWith(".mp4"))
    .sort((a, b) => extractOrder(a).localeCompare(extractOrder(b)));

  if (files.length === 0) {
    throw new Error(`Aucune vidéo trouvée dans ${SOURCE_DIR}`);
  }

  const entries = [];

  for (let i = 0; i < files.length; i++) {
    const id = `video-${String(i + 1).padStart(2, "0")}`;
    const inputPath = path.join(SOURCE_DIR, files[i]);
    const videoPath = path.join(VIDEO_DIR, `${id}.mp4`);
    const posterPath = path.join(POSTER_DIR, `${id}.jpg`);

    console.log(`→ ${files[i]} → ${id}`);
    await compressVideo(inputPath, videoPath);
    await createPoster(videoPath, posterPath);

    entries.push({
      id,
      src: `/videos/testimonials/${id}.mp4`,
      poster: `/images/testimonials/${id}.jpg`,
    });
  }

  const manifest = `// Auto-généré par scripts/compress-testimonials.mjs — ne pas éditer à la main
export type TestimonialVideo = {
  id: string;
  src: string;
  poster: string;
};

export const testimonialVideos: TestimonialVideo[] = ${JSON.stringify(entries, null, 2)};
`;

  await writeFile(MANIFEST_PATH, manifest, "utf8");
  console.log(`\n✓ ${entries.length} vidéos → public/videos/testimonials/`);
  console.log(`✓ Manifeste → src/lib/testimonials-data.ts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
