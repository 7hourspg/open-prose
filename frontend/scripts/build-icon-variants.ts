import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..", "..");
const dir = path.join(root, "build/variants");
const svgs = fs.readdirSync(dir).filter((f) => f.endsWith(".svg"));

for (const f of svgs) {
  const svg = fs.readFileSync(path.join(dir, f), "utf8");
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 512 },
    font: { loadSystemFonts: true },
  })
    .render()
    .asPng();
  const out = path.join(dir, f.replace(/\.svg$/, ".png"));
  fs.writeFileSync(out, png);
  console.log(`✓ ${path.relative(root, out)}`);
}
