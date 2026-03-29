import fs from "fs";
const html = fs.readFileSync("c:/Users/ppmpc/Downloads/thenicepicnic-homepage.html", "utf8");
const m = html.match(/<style>([\s\S]*?)<\/style>/);
if (!m) throw new Error("no style");
fs.writeFileSync("c:/Users/ppmpc/Thenicepicnic/src/styles/thenicepicnic.css", m[1].trim());
