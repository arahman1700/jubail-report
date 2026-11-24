// plan page: offers open in place, right under the card that owns them
(() => {
  const btns = [...document.querySelectorAll('.acc-btn')];
  if (!btns.length) return;
  const set = (id, open) => {
    const p = document.getElementById(id); if (!p) return;
    p.hidden = !open;
    document.querySelectorAll('.acc-btn[aria-controls="' + id + '"]').forEach(b => b.setAttribute('aria-expanded', open));
    document.querySelectorAll('[data-panel="' + id + '"]').forEach(c => c.classList.toggle('is-open', open));
  };
  const openAndGo = id => {
    set(id, true);
    const card = document.querySelector('[data-panel="' + id + '"]') || document.getElementById(id);
    card.scrollIntoView({behavior: 'smooth', block: 'start'});
  };
  btns.forEach(b => b.addEventListener('click', () => {
    const id = b.getAttribute('aria-controls'), open = b.getAttribute('aria-expanded') !== 'true';
    set(id, open);
    if (open) document.getElementById(id).scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }));
  document.querySelectorAll('.acc-close').forEach(b => b.addEventListener('click', () => {
    set(b.dataset.close, false);
    const card = document.querySelector('[data-panel="' + b.dataset.close + '"]'); if (card) card.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }));
  document.querySelectorAll('[data-tab]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openAndGo(a.dataset.tab); }));
  const h = location.hash.slice(1), hp = h && document.getElementById(h);
  if (hp && hp.classList.contains('acc-panel')) openAndGo(h);
  window.addEventListener('beforeprint', () => document.querySelectorAll('.acc-panel').forEach(p => p.hidden = false));
})();
