// Save as PDF (press-kit.html): the buttons open the browser's print
// dialog, where visitors pick "Save as PDF". The print styles in style.css
// lay the page out for paper. The rider button adds "print-rider" to <html>
// for the length of the dialog, so only the rider is printed. The page title
// is swapped too, as browsers suggest it as the PDF's file name.
// press-kit.html?print=rider shows the rider-only version straight away
// (for making the downloadable rider PDF).
(() => {
  const root = document.documentElement;
  const titles = {
    all: 'Araukaaria – Press kit',
    rider: 'Araukaaria – Technical rider',
  };

  // Lazy images (photos, video covers, the stage plot) are only fetched
  // when scrolled to, so they would print blank. Load them all first; the
  // buttons wait for them, and Cmd+P (beforeprint) at least starts them.
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
