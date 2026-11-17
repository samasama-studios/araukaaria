(() => {
  const root = document.documentElement;
  const titles = {
    all: 'Araukaaria – Press kit',
    rider: 'Araukaaria – Technical rider',
  };

  const loadImages = () => Promise.all([...document.querySelectorAll('img[loading="lazy"]')].map(img => {
    img.loading = 'eager';
    return img.complete ? null : new Promise(done => {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }));
  addEventListener('beforeprint', loadImages);

  const themes = document.querySelectorAll('.kit-print-theme');
  const logos = [...document.querySelectorAll('.kit-print-cover img, .kit-print-header img')];
  const setLight = light => {
    root.classList.toggle('kit-light', light);
    themes.forEach(toggle => toggle.setAttribute('aria-checked', String(light)));
    return Promise.all(logos.map(img => {
      const src = img.getAttribute('src').replace(light ? /-light\./ : /-dark\./, light ? '-dark.' : '-light.');
      if (src === img.getAttribute('src')) return null;
      img.src = src;
      return img.decode().catch(() => {});
    }));
  };
  let switching = Promise.resolve();
  themes.forEach(toggle => {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      switching = setLight(toggle.getAttribute('aria-checked') !== 'true');
    });
  });

  const params = new URLSearchParams(location.search);
  if (params.get('theme') === 'light') switching = setLight(true);

  if (params.get('print') === 'rider') {
    root.classList.add('print-rider');
    document.title = titles.rider;
  }

  document.querySelectorAll('.kit-print').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      await Promise.all([loadImages(), switching]);
      const title = document.title;
      const mode = button.dataset.print;
      root.classList.toggle('print-rider', mode === 'rider');
      document.title = titles[mode];
      addEventListener('afterprint', () => {
        root.classList.remove('print-rider');
        document.title = title;
      }, { once: true });
      print();
    });
  });
})();
