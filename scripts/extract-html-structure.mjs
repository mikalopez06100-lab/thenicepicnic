import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = "c:\\Users\\ppmpc\\Downloads\\thenicepicnic-homepage.html";
const html = fs.readFileSync(htmlPath, "utf8");
const stripped = html.replace(/data:image\/[^;]+;base64,[^"'>\s]+/g, "__BASE64__");
const lines = stripped.split("\n");
lines.forEach((l, i) => {
  if (i < 500) console.log(String(i + 1).padStart(4) + ": " + l.slice(0, 220));
});
