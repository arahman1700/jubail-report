// keep the current section (#anchor) when switching language
document.addEventListener('click', e => {
  const a = e.target.closest('a.lang-switch');
  if (a && location.hash && !a.getAttribute('href').includes('#')) { e.preventDefault(); location.href = a.getAttribute('href') + location.hash; }
});

// download menu: close on outside click, Escape, or after choosing a file
document.addEventListener('click', e => {
  document.querySelectorAll('details.export-menu[open]').forEach(d => { if (!d.contains(e.target) || e.target.closest('.export-pop a')) d.removeAttribute('open'); });
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('details.export-menu[open]').forEach(d => d.removeAttribute('open')); });
