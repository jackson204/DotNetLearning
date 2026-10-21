// md → site/：唯一來源是 course/**/*.md、notes/**/*.md 與各 README.md
// 另外會把 toc.json 的資訊寫回 md（<!-- meta --> / <!-- nav --> / <!-- toc --> 標記之間），讓 GitHub 上看到的內容與 HTML 一致
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import alerts from 'markdown-it-github-alerts';
import taskLists from 'markdown-it-task-lists';
import GithubSlugger from 'github-slugger';
import hljs from 'highlight.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const toc = JSON.parse(read('course/toc.json'));
const template = read('build/template.html');

function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function write(p, s) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); }
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const toPosix = p => p.split(path.sep).join('/');
const htmlPath = mdPath => mdPath.replace(/\.md$/i, '.html');
const relLink = (fromFile, toFile) => toPosix(path.relative(path.dirname(fromFile), toFile)) || '.';

// ---------- toc：排序、編號、上一課 / 下一課 ----------
const parts = toc.parts;
const partById = Object.fromEntries(parts.map(p => [p.id, p]));
const units = toc.units.map(u => ({ ...u }));
const counter = {};
for (const u of units) {
  counter[u.part] = (counter[u.part] || 0) + 1;
  u.no = `${partById[u.part].no}-${String(counter[u.part]).padStart(2, '0')}`;
  u.exists = u.status === 'available';
  // 尚未推出的單元先放一個佔位頁，讓其他單元的連結在 GitHub 與 site/ 都不會壞
  const file = path.join(ROOT, u.file);
  if (!fs.existsSync(file)) {
    if (u.exists) throw new Error(`toc 標為 available 但檔案不存在：${u.file}`);
    write(file, `# ${u.title}\n\n> [!NOTE]\n> **這一課尚未推出。**\n>\n> 這一課會學：${u.goal}。想先了解相關內容，可以回到學習路線看前後的單元。\n`);
  }
}
units.forEach((u, i) => { u.prev = units[i - 1] || null; u.next = units[i + 1] || null; });

// ---------- Markdown 渲染 ----------
function createRenderer(mdFile) {
  const slugger = new GithubSlugger();
  const fromDir = path.posix.dirname(toPosix(mdFile));
  const md = new MarkdownIt({
    html: true, linkify: true, breaks: false,
    highlight(str, lang) {
      if (lang === 'mermaid') return `<pre class="mermaid">${esc(str)}</pre>`;
      if (lang && hljs.getLanguage(lang)) {
        return `<pre><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      }
      return `<pre><code class="hljs">${esc(str)}</code></pre>`;
    },
  });
  md.use(anchor, { slugify: s => slugger.slug(s), tabIndex: false });
  md.use(alerts);
  md.use(taskLists, { label: true });

  // .md 連結 → .html（保留 #錨點）；圖片路徑不動（整棵樹會鏡射）
  md.core.ruler.push('rewrite_links', state => {
    const walk = tokens => {
      for (const t of tokens) {
        if (t.type === 'link_open') {
          const href = t.attrGet('href') || '';
          const m = href.match(/^(?![a-z]+:|\/|#)(.*?)\.md(#.*)?$/i);
          if (m) {
            // 根目錄的 README.md 在 site/ 是 index.html
            const target = path.posix.normalize(path.posix.join(fromDir, `${m[1]}.md`));
            const html = target === 'README.md' ? `${m[1].replace(/README$/, 'index')}.html` : `${m[1]}.html`;
            t.attrSet('href', `${html}${m[2] || ''}`);
          }
        }
        if (t.children) walk(t.children);
      }
    };
    walk(state.tokens);
  });

  // 「下一個問題」引用區塊 → 橋接樣式；圖下一行的斜體 → 圖說
  md.core.ruler.push('semantic_blocks', state => {
    const tk = state.tokens;
    for (let i = 0; i < tk.length; i++) {
      if (tk[i].type === 'blockquote_open' && tk[i + 1]?.type === 'paragraph_open' && tk[i + 2]?.type === 'inline'
          && /^\*\*下一個問題\*\*/.test(tk[i + 2].content)) {
        tk[i].attrJoin('class', 'bridge');
      }
      if (tk[i].type === 'paragraph_open' && tk[i + 1]?.type === 'inline' && /^\*[^*\n]+\*$/.test(tk[i + 1].content)) {
        const prev = tk[i - 1];
        const afterImage = prev?.type === 'paragraph_close' && tk[i - 2]?.type === 'inline' && /^!\[[^\]]*\]\([^)]+\)$/.test(tk[i - 2].content);
        if (prev?.type === 'fence' || afterImage) tk[i].attrJoin('class', 'caption');
      }
    }
  });
  return md;
}

function renderMarkdown(src, mdFile) {
  const md = createRenderer(mdFile);
  const env = {};
  const tokens = md.parse(src, env);
  const headings = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'heading_open' && (t.tag === 'h2' || t.tag === 'h3')) {
      const text = tokens[i + 1].children.filter(c => c.type === 'text' || c.type === 'code_inline').map(c => c.content).join('');
      headings.push({ level: Number(t.tag[1]), id: t.attrGet('id'), text });
    }
  }
  let html = md.renderer.render(tokens, md.options, env);
  html = html
    .replace('<!-- meta:start -->', '<div class="meta">').replace('<!-- meta:end -->', '</div>')
    .replace('<!-- nav:start -->', '<nav class="nav-foot">').replace('<!-- nav:end -->', '</nav>');
  return { html, headings, title: (src.match(/^#\s+(.+)$/m) || [, ''])[1].trim() };
}

// ---------- 寫回 md：meta / nav / README 路線表 ----------
function replaceBetween(src, start, end, body) {
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  return re.test(src) ? src.replace(re, `${start}\n${body}\n${end}`) : null;
}
const mdLink = (fromFile, u) => `[${u.title}](${relLink(fromFile, u.file)})`;

function syncUnitMd(u) {
  const file = path.join(ROOT, u.file);
  const src = fs.readFileSync(file, 'utf8');
  const part = partById[u.part];
  const metaBits = [`Part ${part.no}　${part.title}`, `單元 ${u.no}`, `約 ${u.minutes} 分鐘`];
  if (u.lab) metaBits.push(`練習專案：\`dotnet run -- ${u.lab}\``);
  if (u.sql) metaBits.push(`SQL 檔：\`${u.sql}\``);
  if (u.optional) metaBits.push('選讀');
  const meta = metaBits.join('　·　');
  const roadmap = `${relLink(u.file, 'README.md')}#學習路線`;
  const prev = u.prev ? `← 上一課：${mdLink(u.file, u.prev)}${u.prev.exists ? '' : '（尚未推出）'}` : '';
  const next = u.next ? `下一課：${mdLink(u.file, u.next)}${u.next.exists ? '' : '（尚未推出）'} →` : '';
  const nav = `---\n${[prev, `[學習路線](${roadmap})`, next].filter(Boolean).join('　｜　')}`;

  let out = replaceBetween(src, '<!-- meta:start -->', '<!-- meta:end -->', meta)
    ?? src.replace(/^(# .+\r?\n)/, `$1\n<!-- meta:start -->\n${meta}\n<!-- meta:end -->\n`);
  out = replaceBetween(out, '<!-- nav:start -->', '<!-- nav:end -->', nav)
    ?? out.replace(/\s*$/, `\n\n<!-- nav:start -->\n${nav}\n<!-- nav:end -->\n`);
  if (out !== src) fs.writeFileSync(file, out);
  return out;
}

function roadmapMarkdown() {
  const lines = [];
  for (const part of parts) {
    lines.push(`### Part ${part.no}　${part.title}`, '', `> ${part.desc}`, '', '| # | 單元 | 學什麼 | 時間 | 狀態 |', '|---|---|---|---|---|');
    for (const u of units.filter(x => x.part === part.id)) {
      const title = `[${u.title}](${u.file})`;
      const status = (u.exists ? '✅ 可以學' : '⏳ 尚未推出') + (u.optional ? '（選讀）' : '');
      lines.push(`| ${u.no} | ${title} | ${u.goal} | ${u.minutes} 分 | ${status} |`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

function syncReadme() {
  const file = path.join(ROOT, 'README.md');
  const src = fs.readFileSync(file, 'utf8');
  const out = replaceBetween(src, '<!-- toc:start -->', '<!-- toc:end -->', roadmapMarkdown());
  if (out === null) throw new Error('README.md 缺少 <!-- toc:start --> / <!-- toc:end --> 標記');
  if (out !== src) fs.writeFileSync(file, out);
}

// ---------- 頁面組裝 ----------
function tocHtml(headings) {
  if (!headings.length) return '';
  return `<ol class="toc">${headings.map(h => `<li class="h${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ol>`;
}

function pageHtml({ title, crumbs, content, headings, pager, srcPath, outFile }) {
  return template
    .replaceAll('{{TITLE}}', esc(title))
    .replaceAll('{{ASSETS}}', `${relLink(outFile, path.join(SITE, 'assets'))}/`)
    .replaceAll('{{HOME}}', relLink(outFile, path.join(SITE, 'index.html')))
    .replace('{{CRUMBS}}', crumbs)
    .replace('{{TOC}}', tocHtml(headings))
    .replace('{{CONTENT}}', content)
    .replace('{{PAGER}}', pager || '')
    .replace('{{SOURCE}}', esc(srcPath));
}

function renderUnitPage(u) {
  const src = syncUnitMd(u);
  const outFile = path.join(SITE, htmlPath(u.file));
  const part = partById[u.part];
  const { html, headings } = renderMarkdown(src, u.file);
  const home = relLink(outFile, path.join(SITE, 'index.html'));
  const crumbs = `<a href="${home}">學習首頁</a> › <a href="${home}#part-${part.id}">Part ${part.no}　${part.title}</a> › ${esc(u.no)}`;
  const card = (label, v, cls) => {
    if (!v) return '<span></span>';
    const href = relLink(outFile, path.join(SITE, htmlPath(v.file)));
    return `<a class="${cls}${v.exists ? '' : ' locked'}" href="${href}"><small>${label}</small>${esc(v.title)}${v.exists ? '' : '（尚未推出）'}</a>`;
  };
  const pager = `<nav class="pager">${card('← 上一課', u.prev, 'prev')}${card('下一課 →', u.next, 'next')}</nav>`;
  write(outFile, pageHtml({ title: u.title, crumbs, content: html, headings, pager, srcPath: u.file, outFile }));
}

function renderPlainPage(mdFile, crumbLabel) {
  const src = fs.readFileSync(path.join(ROOT, mdFile), 'utf8');
  const outFile = path.join(SITE, htmlPath(mdFile));
  const { html, headings, title } = renderMarkdown(src, mdFile);
  const home = relLink(outFile, path.join(SITE, 'index.html'));
  const crumbs = `<a href="${home}">學習首頁</a> › ${esc(crumbLabel || mdFile)}`;
  write(outFile, pageHtml({ title: title || mdFile, crumbs, content: html, headings, srcPath: mdFile, outFile }));
}

function roadmapCards(outFile) {
  const out = ['<div class="roadmap"><div class="progress"><div class="progress-bar"><div id="progress-fill"></div></div><div class="progress-text" id="progress-text"></div></div>'];
  for (const part of parts) {
    out.push(`<section class="part" id="part-${part.id}"><div class="part-head"><span class="part-no">Part ${part.no}</span><h3>${esc(part.title)}</h3></div><p class="part-desc">${esc(part.desc)}</p><div class="cards">`);
    for (const u of units.filter(x => x.part === part.id)) {
      const href = relLink(outFile, path.join(SITE, htmlPath(u.file)));
      out.push(`<div class="card ${u.exists ? 'open' : 'locked'}" data-unit="${u.id}">`
        + `<span class="card-no">${u.no}${u.optional ? ' · 選讀' : ''}</span>`
        + `<a class="card-title" href="${href}">${esc(u.title)}</a>`
        + `<span class="card-goal">${esc(u.goal)}</span><span class="card-foot">`
        + (u.exists ? `<a class="go" href="${href}">開始 · ${u.minutes} 分 →</a><label class="done"><input type="checkbox" data-done="${u.id}"> 已完成</label>` : '<span class="status">尚未推出</span>')
        + '</span></div>');
    }
    out.push('</div></section>');
  }
  out.push('</div>');
  return out.join('\n');
}

function renderHome() {
  const src = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const outFile = path.join(SITE, 'index.html');
  const { html, headings, title } = renderMarkdown(src, 'README.md');
  // README 的路線表在 HTML 版換成卡片（資料相同，多了進度勾選）
  const content = html.replace(/<!-- toc:start -->[\s\S]*?<!-- toc:end -->/, roadmapCards(outFile));
  // 側欄目錄裡的「Part N」改指向卡片區塊（原本的 ### 標題已被卡片取代）
  const tocHeadings = headings.filter(h => !(h.level === 3 && /^Part \d/.test(h.text)));
  const roadmapIndex = tocHeadings.findIndex(h => h.text === '學習路線');
  tocHeadings.splice(roadmapIndex + 1, 0, ...parts.map(p => ({ level: 3, id: `part-${p.id}`, text: `Part ${p.no}　${p.title}` })));
  write(outFile, pageHtml({ title, crumbs: '學習首頁', content, headings: tocHeadings, srcPath: 'README.md', outFile }));
}

// ---------- 資產 ----------
function copyAssets() {
  const nm = path.join(ROOT, 'node_modules');
  const assets = path.join(SITE, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  const pairs = [
    [path.join(ROOT, 'build/style.css'), 'style.css'],
    [path.join(ROOT, 'build/site.js'), 'site.js'],
    [path.join(nm, 'highlight.js/styles/github.min.css'), 'hljs-light.css'],
    [path.join(nm, 'highlight.js/styles/github-dark.min.css'), 'hljs-dark.css'],
    [path.join(nm, 'markdown-it-github-alerts/styles/github-base.css'), 'alerts-base.css'],
    [path.join(nm, 'markdown-it-github-alerts/styles/github-colors-light.css'), 'alerts-light.css'],
    [path.join(nm, 'markdown-it-github-alerts/styles/github-colors-dark-media.css'), 'alerts-dark.css'],
    [path.join(nm, 'mermaid/dist/mermaid.min.js'), 'mermaid.min.js'],
  ];
  for (const [from, to] of pairs) fs.copyFileSync(from, path.join(assets, to));
  copyDir(path.join(ROOT, 'course/images'), path.join(SITE, 'course/images'));
}
function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) fs.copyFileSync(path.join(from, f), path.join(to, f));
}
function listMd(dir) {
  const out = [];
  if (!fs.existsSync(path.join(ROOT, dir))) return out;
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...listMd(p));
    else if (e.name.toLowerCase().endsWith('.md')) out.push(p);
  }
  return out;
}

// ---------- 執行 ----------
fs.rmSync(SITE, { recursive: true, force: true });
syncReadme();
copyAssets();
for (const u of units) renderUnitPage(u);
renderHome();
renderPlainPage('course/STYLE.md', '寫作慣例');
for (const f of ['lab/README.md', 'project/README.md']) if (fs.existsSync(path.join(ROOT, f))) renderPlainPage(f, f);
for (const f of listMd('notes')) renderPlainPage(f, f);
console.log(`site/ 已產生：${units.filter(u => u.exists).length} 個可學的單元、${units.filter(u => !u.exists).length} 個佔位頁、首頁與其他頁面`);
