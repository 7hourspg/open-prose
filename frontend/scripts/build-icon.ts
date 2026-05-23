import { Resvg } from "@resvg/resvg-js";
import pngToIco from "png-to-ico";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..", "..");
const svgPath = path.join(root, "build/icon.svg");
const appIconPath = path.join(root, "build/appicon.png");
const winIcoPath = path.join(root, "build/windows/icon.ico");

const svg = fs.readFileSync(svgPath, "utf8");

function renderPng(size: number): Buffer {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: true },
  })
    .render()
    .asPng();
}

const appIcon = renderPng(1024);
fs.writeFileSync(appIconPath, appIcon);
console.log(`✓ ${path.relative(root, appIconPath)} (1024×1024)`);

const icoSizes = [16, 24, 32, 48, 64, 128, 256];
const icoPngs = icoSizes.map(renderPng);
fs.mkdirSync(path.dirname(winIcoPath), { recursive: true });
const ico = await pngToIco(icoPngs);
fs.writeFileSync(winIcoPath, ico);
console.log(
  `✓ ${path.relative(root, winIcoPath)} (${icoSizes.join(", ")})`
);
