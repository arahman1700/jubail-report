'use strict';
(() => {
  const records = window.executiveAttachments;
  if (!records || !('HTMLDialogElement' in window)) return;
  const EN = document.documentElement.lang === 'en';
  const T = EN
    ? {close:'Close', prev:'Previous', next:'Next', open:'Open original', dl:'Download file', page:'Page', image:'Image', of:'of'}
    : {close:'إغلاق', prev:'السابق', next:'التالي', open:'فتح الأصل', dl:'تنزيل الملف', page:'الصفحة', image:'الصورة', of:'من'};
  const dialog = document.createElement('dialog');
  dialog.className = 'attachment-dialog';
  dialog.setAttribute('aria-labelledby', 'attachment-title');
  dialog.innerHTML = `
    <header class="attachment-header">
      <div class="attachment-title-row">
        <h2 id="attachment-title"></h2>
        <button type="button" class="attachment-close">${T.close}</button>
      </div>
      <div class="attachment-bar">
        <div class="attachment-pages" hidden>
          <button type="button" data-move="-1">${T.prev}</button>
          <output dir="ltr" aria-live="polite"></output>
          <button type="button" data-move="1">${T.next}</button>
        </div>
        <div class="attachment-actions">
          <a data-view-original target="_blank" rel="noopener">${T.open}</a>
          <a data-download-original download>${T.dl}</a>
        </div>
      </div>
    </header>
    <div class="attachment-body"></div>`;
  document.body.append(dialog);
  const select = query => dialog.querySelector(query);
  const title = select('h2');
  const body = select('.attachment-body');
  const close = select('.attachment-close');
  const pages = select('.attachment-pages');
  const progress = select('output');
  const previous = select('[data-move="-1"]');
  const next = select('[data-move="1"]');
  const view = select('[data-view-original]');
  const download = select('[data-download-original]');
  let group = [];
  let current = 0;
  let page = 0;
  let initiator;

  function draw() {
    const file = records[group[current]];
    const isPDF = file.kind === 'pdf';
    const count = isPDF ? file.pages.length : group.length;
    const position = isPDF ? page : current;
    title.textContent = file.title;
    view.href = download.href = file.url;
    download.download = file.name;
    pages.hidden = count < 2;
    progress.textContent = `${position + 1} / ${count}`;
    progress.setAttribute('aria-label', `${isPDF ? T.page : T.image} ${position + 1} ${T.of} ${count}`);
    previous.disabled = isPDF && page === 0;
    next.disabled = isPDF && page === count - 1;

    if (file.kind === 'mail') {
      const mail = document.createElement('article');
      mail.className = 'mail';
      for (const [tag, value] of [['h3', file.subject], ['p', file.date], ['pre', file.text]]) {
        const line = document.createElement(tag);
        line.dir = 'auto';
        line.textContent = value;
        mail.append(line);
      }
      body.replaceChildren(mail);
    } else {
      const image = document.createElement('img');
      image.className = isPDF ? 'document-page' : 'photo-view';
      image.alt = isPDF ? `${file.title} · ${T.page} ${page + 1}` : file.title;
      image.src = isPDF ? file.pages[page] : file.url;
      body.replaceChildren(image);
    }
    dialog.scrollTop = 0;
  }

  function move(step) {
    const file = records[group[current]];
    if (file.kind === 'pdf') page = Math.max(0, Math.min(file.pages.length - 1, page + step));
    else current = (current + step + group.length) % group.length;
    draw();
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-attachment]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const key = link.dataset.attachment;
    if (!Object.hasOwn(records, key)) return;
    event.preventDefault();
    initiator = link;
    group = link.dataset.gallery
      ? [...document.querySelectorAll('a[data-gallery]')]
          .filter(item => item.dataset.gallery === link.dataset.gallery && Object.hasOwn(records, item.dataset.attachment))
          .map(item => item.dataset.attachment)
      : [key];
    current = group.indexOf(key);
    page = 0;
    draw();
    dialog.showModal();
    close.focus({preventScroll:true});
  });

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => initiator?.focus({preventScroll:true}));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (!pages.hidden && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      move((event.key === 'ArrowLeft') !== EN ? 1 : -1);
    }
  });
  document.querySelector('.site-header [data-print]')?.addEventListener('click', () => window.print());
})();
