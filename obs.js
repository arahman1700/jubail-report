(() => {
  const dlg = document.getElementById('obs-dialog');
  if (!dlg) return;
  const body = document.getElementById('obs-dlg-body'), title = document.getElementById('obs-dlg-title');
  document.querySelectorAll('[data-img],[data-video]').forEach(b => b.addEventListener('click', () => {
    let node;
    if (b.dataset.video) {
      node = document.createElement('video');
      node.controls = true; node.autoplay = true; node.playsInline = true;
      node.src = b.dataset.video; if (b.dataset.poster) node.poster = b.dataset.poster;
    } else { node = document.createElement('img'); node.src = b.dataset.img; node.alt = ''; }
    title.textContent = b.dataset.title || '';
    body.replaceChildren(node); dlg.showModal();
  }));
  dlg.addEventListener('close', () => { const v = body.querySelector('video'); if (v) v.pause(); body.replaceChildren(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
})();
