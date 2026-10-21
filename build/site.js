// 本機 HTML 版的互動：Mermaid 圖表、目錄高亮、路線圖進度（localStorage，只存在這台電腦）
(function () {
  if (window.mermaid) {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    mermaid.initialize({
      startOnLoad: false, theme: dark ? 'dark' : 'default', themeVariables: { fontSize: '16px' },
      flowchart: { nodeSpacing: 40, rankSpacing: 45 },
      sequence: { wrap: true, width: 120, actorMargin: 20, messageFontSize: 15, noteFontSize: 14, actorFontSize: 15 },
    });
    const nodes = document.querySelectorAll('pre.mermaid');
    if (nodes.length) mermaid.run({ nodes });
  }

  // 側欄目錄跟著捲動高亮
  const links = new Map([...document.querySelectorAll('.toc a')].map(a => [decodeURIComponent(a.getAttribute('href').slice(1)), a]));
  if (links.size) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.remove('active'));
        links.get(e.target.id)?.classList.add('active');
      });
    }, { rootMargin: '0px 0px -75% 0px' });
    links.forEach((a, id) => { const h = document.getElementById(id); if (h) observer.observe(h); });
  }

  // 路線圖進度
  const boxes = document.querySelectorAll('input[data-done]');
  if (boxes.length) {
    const KEY = 'dotnet-learning-done';
    let done = [];
    try { done = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { done = []; }
    const render = () => {
      boxes.forEach(b => { b.checked = done.includes(b.dataset.done); b.closest('.card').classList.toggle('is-done', b.checked); });
      const count = [...boxes].filter(b => b.checked).length;
      const fill = document.getElementById('progress-fill');
      const text = document.getElementById('progress-text');
      if (fill) fill.style.width = `${boxes.length ? count / boxes.length * 100 : 0}%`;
      if (text) text.textContent = `已完成 ${count} / ${boxes.length} 個已推出的單元（全系列 ${document.querySelectorAll('.card').length} 個）`;
    };
    boxes.forEach(b => b.addEventListener('change', () => {
      done = b.checked ? [...new Set([...done, b.dataset.done])] : done.filter(x => x !== b.dataset.done);
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) { /* 無法儲存時只在本次顯示 */ }
      render();
    }));
    render();
  }
})();
