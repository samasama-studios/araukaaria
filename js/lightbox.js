(() => {
  const dialog = document.getElementById('lightbox');
  if (!dialog || !dialog.showModal) return;
  const body = dialog.querySelector('.lightbox-body');
  const actions = dialog.querySelector('.lightbox-actions');

  function action(label, target, format) {
    const control = document.createElement(typeof target === 'string' ? 'a' : 'button');
    control.className = 'lightbox-action';
    control.setAttribute('aria-label', label);
    if (typeof target === 'string') {
      control.href = target;
      control.download = '';
    } else {
      control.type = 'button';
      control.addEventListener('click', target);
    }
    const icon = document.createElement('img');
    icon.src = 'assets/icons/download.svg';
    icon.alt = '';
    control.append(icon);
    if (format) {
      const tag = document.createElement('span');
      tag.className = 'lightbox-format';
      tag.textContent = format;
      control.append(tag);
    }
    return control;
  }

  function open(content, items) {
    body.replaceChildren(content);
    actions.replaceChildren(...items);
    dialog.showModal();
  }

  function clean(node) {
    ['id', 'role', 'tabindex', 'aria-label'].forEach(name => node.removeAttribute(name));
    node.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    return node;
  }

  function zoomable(element, label, build) {
    element.tabIndex = 0;
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', label);
    element.addEventListener('click', () => open(...build()));
    element.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open(...build());
    });
  }

  document.querySelectorAll('[data-zoom]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const img = document.createElement('img');
      img.src = link.dataset.zoom;
      img.alt = link.querySelector('img')?.alt || '';
      open(img, [action('Download photo', link.getAttribute('href'))]);
    });
  });

  document.querySelectorAll('.kit-logo-preview').forEach(preview => {
    const card = preview.closest('li');
    zoomable(preview, 'Enlarge logo', () => {
      const copy = clean(preview.cloneNode(true));
      copy.classList.toggle('kit-logo-preview-light', !!preview.closest('.kit-logos-light'));
      const files = [...card.querySelectorAll('a[download]')];
      return [copy, files.map(a => {
        const format = a.textContent.trim();
        return action(`Download ${format}`, a.getAttribute('href'), format);
      })];
    });
  });

  const plot = document.getElementById('rider-plot');
  const riderPrint = document.querySelector('.kit-print[data-print="rider"]');
  if (plot) {
    zoomable(plot, 'Enlarge stage plot', () => [
      clean(plot.cloneNode(true)),
      riderPrint && !riderPrint.hidden ? [action('Save rider as PDF', () => {
        dialog.close();
        riderPrint.click();
      })] : [],
    ]);
  }

  dialog.addEventListener('click', event => {
    if (event.target.closest('.lightbox-action')) return;
    dialog.close();
  });
  dialog.addEventListener('close', () => {
    body.replaceChildren();
    actions.replaceChildren();
  });
})();
