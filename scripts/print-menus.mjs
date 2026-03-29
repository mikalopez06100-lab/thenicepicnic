import fs from "fs";
const h = fs
  .readFileSync("c:/Users/ppmpc/Downloads/thenicepicnic-homepage.html", "utf8")
  .replace(/data:image\/[^;]+;base64,[^"'>\s]+/g, "IMG");
const lines = h.split("\n");
for (let i = 356; i < 373; i++) {
  console.log(lines[i]);
}
