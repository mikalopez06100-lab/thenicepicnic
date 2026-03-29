import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = "c:\\Users\\ppmpc\\Downloads\\thenicepicnic-homepage.html";
const outDir = path.join(root, "public", "images", "home");

const html = fs.readFileSync(htmlPath, "utf8");
const re = /src="(data:image\/(jpeg|png|webp);base64,([^"]+))"/g;
const names = [
  "hero",
  "editorial-concept",
  "bento-setup",
  "divider-promenade",
  "spot-chateau",
  "spot-boron",
  "spot-promenade",
  "spot-hauteurs",
  "spot-cimiez",
  "editorial-prestige",
];

let m;
let i = 0;
fs.mkdirSync(outDir, { recursive: true });

while ((m = re.exec(html)) !== null) {
  const ext = m[2] === "png" ? "png" : m[2] === "webp" ? "webp" : "jpg";
  const buf = Buffer.from(m[3], "base64");
  const base = names[i] ?? `image-${i + 1}`;
  const file = path.join(outDir, `${base}.${ext}`);
  fs.writeFileSync(file, buf);
  console.log("Wrote", file, buf.length, "bytes");
  i++;
}
console.log("Total images:", i);
