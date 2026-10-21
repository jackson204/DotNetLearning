// 由 build/diagrams/overview.template.svg 產生全景圖與「亮起某一塊」的版本，輸出到 course/images/（產物要 commit，GitHub 直接顯示）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const template = fs.readFileSync(path.join(ROOT, 'build/diagrams/overview.template.svg'), 'utf8');
const outDir = path.join(ROOT, 'course/images');
fs.mkdirSync(outDir, { recursive: true });

// 檔名後綴 → 要亮起的 data-hl 標記（其他區塊淡出）
const variants = { '': null, '-http': 'http', '-api': 'api', '-efcore': 'efcore', '-db': 'db' };
for (const [suffix, hl] of Object.entries(variants)) {
  const css = hl
    ? `.hl { opacity: .28; } .hl[data-hl~="${hl}"] { opacity: 1; } .hl[data-hl~="${hl}"] .box { stroke-width: 4; } .hl[data-hl~="${hl}"] .card { stroke: var(--accent); stroke-width: 3; }`
    : '';
  fs.writeFileSync(path.join(outDir, `overview${suffix}.svg`), template.replace('/*HL*/', css));
}
console.log(`course/images/overview*.svg 已產生（${Object.keys(variants).length} 個）`);
