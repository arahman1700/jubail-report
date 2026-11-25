// Plan quotes and detail links, including links from older report URLs.
(() => {
  const buttons = [...document.querySelectorAll('.acc-btn')];
  if (!buttons.length) return;
  const panels = new Map(buttons.map(button => {
    const id = button.getAttribute('aria-controls');
    const panel = document.getElementById(id);
    const card = button.closest('[data-panel]');
    return [id, {button, card, panel}];
  }));

  const setOpen = (id, open) => {
    const entry = panels.get(id);
    if (!entry) return;
    entry.panel.hidden = !open;
    entry.button.setAttribute('aria-expanded', String(open));
    entry.card.classList.toggle('is-open', open);
  };

  const showOnly = id => {
    panels.forEach((_, panelId) => setOpen(panelId, panelId === id));
  };

  const revealHash = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    const panel = target.closest('.acc-panel');
    if (panel) showOnly(panel.id);
    for (let ancestor = target; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    }
    if (panel || target.tagName === 'DETAILS') {
      requestAnimationFrame(() => (target === panel ? panels.get(panel.id).card : target).scrollIntoView());
    }
  };

  panels.forEach(({button, panel}, id) => {
    button.addEventListener('click', () => {
      if (panel.hidden) {
        showOnly(id);
        panel.scrollIntoView({block: 'nearest'});
      } else {
        setOpen(id, false);
      }
    });
    panel.querySelector('.acc-close')?.addEventListener('click', () => {
      setOpen(id, false);
      button.focus();
    });
  });

  document.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.dataset.tab;
      if (!panels.has(id)) return;
      event.preventDefault();
      if (location.hash === '#' + id) revealHash();
      else location.hash = id;
    });
  });

  window.addEventListener('hashchange', revealHash);
  revealHash();
})();
