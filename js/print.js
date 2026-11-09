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

  if (new URLSearchParams(location.search).get('print') === 'rider') {
    root.classList.add('print-rider');
    document.title = titles.rider;
  }

  document.querySelectorAll('.kit-print').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      await loadImages();
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
