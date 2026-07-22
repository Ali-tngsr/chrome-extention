const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#6E8BFF"/><stop offset="1" stop-color="#5E81F4"/>
  </linearGradient></defs>
  <rect width="128" height="128" rx="30" fill="url(#g)"/>
  <g fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    <rect x="34" y="34" width="36" height="36" rx="8" opacity="0.95"/>
    <rect x="58" y="58" width="36" height="36" rx="8" opacity="0.7"/>
  </g></svg>`;
const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  for (const size of [16, 48, 128]) {
    await sharp(Buffer.from(SVG)).resize(size, size).png().toFile(path.join(outDir, `icon${size}.png`));
    console.log("wrote icon" + size + ".png");
  }
})();
