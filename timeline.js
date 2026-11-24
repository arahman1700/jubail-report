(() => {
  const video = document.getElementById('full-video');
  const buttons = [...document.querySelectorAll('.chapters [data-seek]')];
  if (!video || !buttons.length) return;
  const starts = buttons.map(b => Number(b.dataset.seek));
  buttons.forEach(b => b.addEventListener('click', () => {
    const t = Number(b.dataset.seek) + 0.05;
    const go = () => { video.currentTime = t; video.play().catch(() => {}); };
    if (video.readyState >= 1) go(); else video.addEventListener('loadedmetadata', go, {once: true});
    video.scrollIntoView({block: 'nearest'});
  }));
  video.addEventListener('timeupdate', () => {
    let i = 0;
    starts.forEach((s, k) => { if (video.currentTime >= s) i = k; });
    buttons.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
  });
  // pause other clips when one plays
  document.addEventListener('play', e => {
    document.querySelectorAll('video').forEach(v => { if (v !== e.target) v.pause(); });
  }, true);
})();
(() => {
  const dlg = document.getElementById('ev-dialog');
  if (!dlg) return;
  const body = document.getElementById('dlg-body'), title = document.getElementById('dlg-title');
  const open = (t, node) => { title.textContent = t; body.replaceChildren(node); dlg.showModal(); };
  document.querySelectorAll('.ev-play').forEach(b => b.addEventListener('click', () => {
    const v = document.createElement('video');
    v.controls = true; v.autoplay = true; v.playsInline = true;
    v.poster = 'assets/tl-' + b.dataset.clip + '.jpg';
    v.src = 'media/tl-' + b.dataset.clip + '.mp4';
    open(b.dataset.title, v);
  }));
  document.querySelectorAll('.ev-thumb').forEach(b => b.addEventListener('click', () => {
    const i = document.createElement('img'); i.src = b.dataset.img; i.alt = '';
    open(b.closest('.ev').querySelector('h4').firstChild.textContent.trim(), i);
  }));
  dlg.addEventListener('close', () => { const v = body.querySelector('video'); if (v) v.pause(); body.replaceChildren(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
})();
(() => {
  const dlg = document.getElementById('ev-dialog');
  if (!dlg || document.querySelector('.ev-play')) return;
  const body = document.getElementById('dlg-body'), title = document.getElementById('dlg-title');
  const open = (t, node) => { title.textContent = t; body.replaceChildren(node); dlg.showModal(); };
  document.querySelectorAll('.zoom[data-img]').forEach(b => b.addEventListener('click', () => {
    const i = document.createElement('img'); i.src = b.dataset.img; i.alt = ''; open(b.dataset.title || '', i);
  }));
  document.querySelectorAll('.tl-play').forEach(b => b.addEventListener('click', () => {
    const v = document.createElement('video'); v.controls = true; v.autoplay = true; v.playsInline = true;
    v.poster = 'assets/tl-' + b.dataset.clip + '.jpg'; v.src = 'media/tl-' + b.dataset.clip + '.mp4'; open(b.dataset.title || '', v);
  }));
  dlg.addEventListener('close', () => { const v = body.querySelector('video'); if (v) v.pause(); body.replaceChildren(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
})();
