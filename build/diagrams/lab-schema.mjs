// 產生 course/images/lab-schema.svg：EfCoreLab 六張資料表與外鍵關聯（資料庫圖 / ER 圖）。
// 欄位型別與可否為 NULL 以 LocalDB 實際 schema 為準（INFORMATION_SCHEMA.COLUMNS），改 Model 後記得同步這裡。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// ---- 版面常數 ----
const W = 250;          // 資料表寬
const HEAD = 32;        // 表頭高
const ROW = 26;         // 每列高
const COL = { L: 25, C: 375, R: 725 }; // 三欄的 x（欄間距 100，給關聯記號與標籤用）

// ---- 資料表（欄位順序 = 資料庫 ORDINAL_POSITION）----
// key: 'PK' | 'FK' | 'PK,FK'；nullable: 可為 NULL
const tables = {
  PostTag: {
    col: 'C', y: 48,
    rows: [
      { name: 'PostsPostId', type: 'int', key: 'PK,FK' },
      { name: 'TagsTagId', type: 'int', key: 'PK,FK' },
    ],
  },
  Posts: {
    col: 'C', y: 176,
    rows: [
      { name: 'PostId', type: 'int', key: 'PK' },
      { name: 'Title', type: 'nvarchar(200)' },
      { name: 'Content', type: 'nvarchar(max)', nullable: true },
      { name: 'PublishedOn', type: 'date' },
      { name: 'Views', type: 'int' },
      { name: 'BlogId', type: 'int', key: 'FK' },
      { name: 'AuthorId', type: 'int', key: 'FK', nullable: true },
    ],
  },
  Blogs: {
    col: 'L', y: 0, alignRowTo: ['Posts', 'BlogId'], alignRow: 'BlogId',
    rows: [
      { name: 'BlogId', type: 'int', key: 'PK' },
      { name: 'Url', type: 'nvarchar(200)' },
      { name: 'Rating', type: 'int', nullable: true },
    ],
  },
  BlogHeaders: {
    col: 'L', y: 0, above: 'Blogs', gap: 44,
    rows: [
      { name: 'BlogHeaderId', type: 'int', key: 'PK' },
      { name: 'Title', type: 'nvarchar(100)' },
      { name: 'Subtitle', type: 'nvarchar(max)', nullable: true },
      { name: 'BlogId', type: 'int', key: 'FK' },
    ],
  },
  Tags: {
    col: 'R', y: 0, alignRowTo: ['PostTag', 'TagsTagId'], alignRow: 'TagId',
    rows: [
      { name: 'TagId', type: 'int', key: 'PK' },
      { name: 'Name', type: 'nvarchar(50)' },
    ],
  },
  Authors: {
    col: 'R', y: 0, alignRowTo: ['Posts', 'AuthorId'], alignRow: 'AuthorId',
    rows: [
      { name: 'AuthorId', type: 'int', key: 'PK' },
      { name: 'Name', type: 'nvarchar(50)' },
      { name: 'Email', type: 'nvarchar(max)', nullable: true },
    ],
  },
};

// ---- 幾何：算出每張表的 x / y 與每列中心 y ----
const height = t => HEAD + ROW * t.rows.length;
const rowIndex = (t, name) => t.rows.findIndex(r => r.name === name);
const rowY = (t, name) => t.y + HEAD + ROW * rowIndex(t, name) + ROW / 2;

for (const t of Object.values(tables)) t.x = COL[t.col];
for (const [name, t] of Object.entries(tables)) {
  if (t.alignRowTo) {
    const [other, otherRow] = t.alignRowTo;
    t.y = rowY(tables[other], otherRow) - (HEAD + ROW * rowIndex(t, t.alignRow) + ROW / 2);
  }
  t.name = name;
}
for (const t of Object.values(tables)) {
  if (t.above) t.y = tables[t.above].y - t.gap - height(t);
}

// ---- 關聯：child.fkCol → parent.pkCol；記號用 IE（烏鴉腳）表示法 ----
// parentEnd / childEnd: '||' 恰好一個、'|o' 零或一、'o{' 零或多
const relations = [
  { child: 'Posts', fk: 'BlogId', parent: 'Blogs', pk: 'BlogId', parentEnd: '||', childEnd: 'o{', label: '一對多', labelAt: 'above', labelDx: 22 },
  { child: 'BlogHeaders', fk: 'BlogId', parent: 'Blogs', pk: 'BlogId', parentEnd: '||', childEnd: '|o', label: '一對一', route: 'elbow-right', elbowX: 307, labelAt: 'between' },
  { child: 'Posts', fk: 'AuthorId', parent: 'Authors', pk: 'AuthorId', parentEnd: '|o', childEnd: 'o{', label: '一對多', sub: '作者可為空', labelAt: 'above' },
  { child: 'PostTag', fk: 'PostsPostId', parent: 'Posts', pk: 'PostId', parentEnd: '||', childEnd: 'o{', route: 'elbow-left', elbowX: 343 },
  { child: 'PostTag', fk: 'TagsTagId', parent: 'Tags', pk: 'TagId', parentEnd: '||', childEnd: 'o{' },
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const out = [];

// ---- 畫資料表 ----
function drawTable(t) {
  const h = height(t);
  out.push(`<g class="table" data-table="${t.name}">`);
  out.push(`<rect class="card" x="${t.x}" y="${t.y}" width="${W}" height="${h}" rx="8"/>`);
  out.push(`<path class="head" d="M${t.x + 8},${t.y} h${W - 16} a8,8 0 0 1 8,8 v${HEAD - 8} h-${W} v-${HEAD - 8} a8,8 0 0 1 8,-8 z"/>`);
  out.push(`<text class="tname" x="${t.x + W / 2}" y="${t.y + 21}" text-anchor="middle">${t.name}</text>`);
  t.rows.forEach((r, i) => {
    const y = t.y + HEAD + ROW * i;
    const cy = y + ROW / 2;
    if (i > 0) out.push(`<line class="sep" x1="${t.x}" y1="${y}" x2="${t.x + W}" y2="${y}"/>`);
    let nx = t.x + 12;
    for (const k of (r.key ? r.key.split(',') : [])) {
      out.push(`<rect class="badge ${k.toLowerCase()}" x="${nx}" y="${cy - 8}" width="26" height="16" rx="4"/>`);
      out.push(`<text class="badge-t ${k.toLowerCase()}" x="${nx + 13}" y="${cy + 4}" text-anchor="middle">${k}</text>`);
      nx += 30;
    }
    if (!r.key) nx += 30;
    out.push(`<text class="col${r.key?.includes('PK') ? ' pk' : ''}" x="${nx + 6}" y="${cy + 4.5}">${r.name}</text>`);
    const type = `<tspan class="type">${esc(r.type)}</tspan>` + (r.nullable ? `<tspan class="null"> NULL</tspan>` : '');
    out.push(`<text x="${t.x + W - 12}" y="${cy + 4.5}" text-anchor="end">${type}</text>`);
  });
  out.push('</g>');
}

// ---- 畫關聯記號：在端點 E（表邊緣），d = 由線往表內的方向（+1 進入左邊緣、-1 進入右邊緣）----
function endMark(kind, ex, ey, d) {
  const p = [];
  const bar = dist => p.push(`<line x1="${ex - d * dist}" y1="${ey - 7}" x2="${ex - d * dist}" y2="${ey + 7}"/>`);
  const circle = dist => p.push(`<circle class="zero" cx="${ex - d * dist}" cy="${ey}" r="4.5"/>`);
  const crow = () => {
    const sx = ex - d * 16;
    p.push(`<line x1="${sx}" y1="${ey}" x2="${ex}" y2="${ey - 8}"/>`);
    p.push(`<line x1="${sx}" y1="${ey}" x2="${ex}" y2="${ey + 8}"/>`);
  };
  if (kind === '||') { bar(8); bar(14); }
  else if (kind === '|o') { bar(10); circle(22); }
  else if (kind === 'o{') { crow(); circle(24); }
  return p.join('');
}

// ---- 畫關聯線 ----
function drawRelation(rel) {
  const c = tables[rel.child], p = tables[rel.parent];
  const cy = rowY(c, rel.fk), py = rowY(p, rel.pk);
  let pts, cEnd, pEnd; // 端點與方向
  if (rel.route === 'elbow-right') {
    // 子表與父表同一欄（上下排）：從兩張表的右邊緣出去，在 elbowX 轉折
    const x = c.x + W;
    pts = [[x, cy], [rel.elbowX, cy], [rel.elbowX, py], [x, py]];
    cEnd = [x, cy, -1]; pEnd = [x, py, -1];
  } else if (rel.route === 'elbow-left') {
    const x = c.x;
    pts = [[x, cy], [rel.elbowX, cy], [rel.elbowX, py], [x, py]];
    cEnd = [x, cy, 1]; pEnd = [x, py, 1];
  } else if (p.x < c.x) {
    // 父表在左：父表右邊緣 → 子表左邊緣（同一列高，直線）
    pts = [[p.x + W, py], [c.x, cy]];
    pEnd = [p.x + W, py, -1]; cEnd = [c.x, cy, 1];
  } else {
    // 父表在右
    pts = [[c.x + W, cy], [p.x, py]];
    cEnd = [c.x + W, cy, -1]; pEnd = [p.x, py, 1];
  }
  const kinds = { '||': 'one-to-one', '|o': 'one-to-one', 'o{': 'many' };
  out.push(`<g class="rel" data-rel="${rel.child}.${rel.fk}->${rel.parent}.${rel.pk}">`);
  out.push(`<polyline class="link" points="${pts.map(q => q.join(',')).join(' ')}"/>`);
  out.push(`<g class="mark">${endMark(rel.childEnd, ...cEnd)}${endMark(rel.parentEnd, ...pEnd)}</g>`);
  if (rel.label) {
    if (rel.labelAt === 'above') {
      const [a, b] = pts;
      const mx = (a[0] + b[0]) / 2 + (rel.labelDx || 0);
      out.push(`<text class="lbl" x="${mx}" y="${a[1] - 9}" text-anchor="middle">${rel.label}</text>`);
      if (rel.sub) out.push(`<text class="sub" x="${mx}" y="${a[1] + 18}" text-anchor="middle">${rel.sub}</text>`);
    } else if (rel.labelAt === 'between') {
      // 標在上下兩張表之間的空隙，貼齊轉折線
      const gy = (c.y + height(c) + p.y) / 2 + 4.5;
      out.push(`<text class="lbl" x="${c.x + W - 8}" y="${gy}" text-anchor="end">${rel.label}</text>`);
    }
  }
  out.push('</g>');
}

for (const t of Object.values(tables)) drawTable(t);
for (const r of relations) drawRelation(r);

// 多對多說明（PostTag 上方）
{
  const t = tables.PostTag;
  out.push(`<text class="lbl" x="${t.x + W / 2}" y="${t.y - 14}" text-anchor="middle">多對多：Posts ⟷ Tags 經由中間表 PostTag</text>`);
}

// ---- 圖例 ----
const bottom = Math.max(...Object.values(tables).map(t => t.y + height(t)));
const LEG_Y = bottom + 36;
{
  const items = [];
  let x = COL.L;
  const add = (markSvg, text, width) => {
    items.push(`<g transform="translate(${x},${LEG_Y})">${markSvg}<text class="leg" x="34" y="4.5">${text}</text></g>`);
    x += width;
  };
  const line = (kind, d) => `<g class="rel"><line class="link" x1="0" y1="0" x2="28" y2="0"/><g class="mark">${endMark(kind, d > 0 ? 28 : 0, 0, d)}</g></g>`;
  add(line('||', 1), '恰好一個', 110);
  add(line('|o', 1), '零或一', 96);
  add(line('o{', 1), '零或多', 100);
  const badge = (k) => `<rect class="badge ${k.toLowerCase()}" x="0" y="-8" width="26" height="16" rx="4"/><text class="badge-t ${k.toLowerCase()}" x="13" y="4" text-anchor="middle">${k}</text>`;
  add(badge('PK'), '主鍵', 78);
  add(badge('FK'), '外鍵（指向別張表的主鍵）', 206);
  add(`<text class="null" x="0" y="4.5">NULL</text>`, '可為 NULL（這格可以沒有值）', 190);
  out.push(`<g class="legend">${items.join('')}</g>`);
}

const H = LEG_Y + 28;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${H}" width="1000" height="${H}" role="img" aria-label="EfCoreLab 的六張資料表與外鍵關聯：Blogs 一對一 BlogHeaders、Blogs 一對多 Posts、Authors 一對多 Posts（作者可為空）、Posts 與 Tags 多對多經由中間表 PostTag">
<style>
  svg {
    --bg: #ffffff; --fg: #1f2328; --muted: #59636e; --border: #d1d9e0; --soft: #f6f8fa; --card: #ffffff;
    --accent: #6d28d9; --accent-soft: #ede9fe; --line: #6d28d9; --fk: #ea580c; --fk-soft: #ffedd5;
    font-family: "Segoe UI", "Microsoft JhengHei", "Noto Sans TC", "PingFang TC", sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    svg {
      --bg: #0d1117; --fg: #e6edf3; --muted: #9198a1; --border: #3d444d; --soft: #151b23; --card: #161b22;
      --accent: #b58cff; --accent-soft: #2a1f45; --line: #b58cff; --fk: #fb923c; --fk-soft: #3b2412;
    }
  }
  .bg { fill: var(--bg); }
  text { fill: var(--fg); font-size: 13.5px; }
  .card { fill: var(--card); stroke: var(--border); stroke-width: 1.5; }
  .head { fill: var(--soft); }
  .tname { font-size: 15px; font-weight: 700; }
  .sep { stroke: var(--border); stroke-width: 1; }
  .col { font-size: 13.5px; }
  .col.pk { font-weight: 700; }
  .type { font-size: 12.5px; fill: var(--muted); font-family: "Cascadia Code", Consolas, "Courier New", monospace; }
  .null { font-size: 11.5px; font-weight: 700; fill: var(--fk); }
  .badge.pk { fill: var(--accent-soft); } .badge-t.pk { fill: var(--accent); }
  .badge.fk { fill: var(--fk-soft); } .badge-t.fk { fill: var(--fk); }
  .badge-t { font-size: 10.5px; font-weight: 800; }
  .link { fill: none; stroke: var(--line); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
  .mark line { stroke: var(--line); stroke-width: 2; stroke-linecap: round; }
  .mark .zero { fill: var(--bg); stroke: var(--line); stroke-width: 2; }
  .lbl { font-size: 12.5px; font-weight: 700; fill: var(--accent); }
  .sub { font-size: 11.5px; fill: var(--muted); }
  .leg { font-size: 12.5px; fill: var(--muted); }
</style>
<rect class="bg" x="0" y="0" width="1000" height="${H}" rx="12"/>
${out.join('\n')}
</svg>
`;

export function buildLabSchema() {
  const file = path.join(ROOT, 'course/images/lab-schema.svg');
  fs.writeFileSync(file, svg);
  return file;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(buildLabSchema());
}
