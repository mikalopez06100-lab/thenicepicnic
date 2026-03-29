import fs from "fs";
const h = fs
  .readFileSync("c:/Users/ppmpc/Downloads/thenicepicnic-homepage.html", "utf8")
  .replace(/data:image\/[^;]+;base64,[^"'>\s]+/g, "IMG");
const lines = h.split("\n");
for (let i = 270; i < 360; i++) {
  console.log(i + 1 + ": " + (lines[i] || "").slice(0, 350));
}
