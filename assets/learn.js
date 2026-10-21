// EF Core 學習系列共用腳本：程式碼上色、Mermaid 圖表
// 頁面需先載入 highlight.js 與 mermaid（CDN），沒有網路時仍可閱讀文字內容
(async function () {
  if (window.hljs) {
    document.querySelectorAll('pre code:not(.nohighlight)').forEach(el => hljs.highlightElement(el));
  }

  const sources = [...document.querySelectorAll('script[type="text/x-mermaid"]')];
  if (!sources.length) return;
  if (!window.mermaid) {
    sources.forEach(s => { s.parentElement.textContent = '圖表需要網路連線才能顯示'; });
    return;
  }
  const nodes = sources.map(s => {
    const pre = document.createElement('pre');
    pre.className = 'mermaid';
    pre.textContent = s.textContent.trim();
    pre.style.cssText = 'margin:0;border:0;background:none;padding:0';
    s.replaceWith(pre);
    return pre;
  });
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'default', themeVariables: { fontSize: '16px' } });
  await mermaid.run({ nodes });
})();
