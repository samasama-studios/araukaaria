const aboutPhotos = (() => {
  const carousel = document.querySelector('.about-photo');
  if (!carousel) return Promise.resolve([]);
  const controls = carousel.querySelector('.carousel-controls');
  const SIZES = '(max-width: 900px) 100vw, 50vw';

  const srcset = (file, widths, ext) =>
    widths.map(w => `assets/photos/web/${file}-${w}.${ext} ${w}w`).join(', ');

  function source(file, widths, ext, media) {
    const el = document.createElement('source');
    if (media) el.media = media;
    if (ext === 'webp') el.type = 'image/webp';
    el.sizes = SIZES;
    el.srcset = srcset(file, widths, ext);
    return el;
  }

  function slide(photo, i, count) {
    const picture = document.createElement('picture');
    picture.className = 'about-slide';
    picture.setAttribute('role', 'group');
    picture.setAttribute('aria-roledescription', 'slide');
    picture.setAttribute('aria-label', `${i + 1} of ${count}`);
    if (photo.position) picture.style.setProperty('--position', photo.position);
    if (photo.credit) picture.dataset.credit = photo.credit;
    if (photo.creditUrl) picture.dataset.creditUrl = photo.creditUrl;

    const portrait = photo.portrait;
    if (portrait) {
      const media = '(orientation: portrait)';
      picture.append(source(portrait.file, portrait.widths, 'webp', media), source(portrait.file, portrait.widths, 'jpg', media));
      if (portrait.position) picture.style.setProperty('--position-portrait', portrait.position);
    }
    picture.append(source(photo.file, photo.widths, 'webp'));

    const img = document.createElement('img');
    const middle = photo.widths[Math.floor(photo.widths.length / 2)];
    img.src = `assets/photos/web/${photo.file}-${middle}.jpg`;
    img.sizes = SIZES;
    img.srcset = srcset(photo.file, photo.widths, 'jpg');
    img.width = photo.width;
    img.height = photo.height;
    img.decoding = 'async';
    if (i === 0) img.fetchPriority = 'low';
    else img.loading = 'lazy';
    img.alt = photo.alt;
    picture.append(img);
    return picture;
  }

  return fetch('data/photos.json')
    .then(response => {
      if (!response.ok) throw new Error(`photos.json: ${response.status}`);
      return response.json();
    })
    .then(photos => {
      const slides = photos.map((photo, i) => slide(photo, i, photos.length));
      controls.before(...slides);
      return slides;
    })
    .catch(error => {
      console.error(error);
      return [];
    });
})();

(() => {
  const about = document.getElementById('about');
  if (!about || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const photoReady = aboutPhotos
    .then(slides => slides[0]?.querySelector('img').decode())
    .catch(() => {});

  const root = document.documentElement;
  const introDone = new Promise(resolve => {
    if (!root.classList.contains('intro')) return resolve();
    const observer = new MutationObserver(() => {
      if (root.classList.contains('intro')) return;
      observer.disconnect();
      setTimeout(resolve, 900);
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    addEventListener('scroll', resolve, { once: true, passive: true });
  });

  about.classList.add('will-reveal');
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    Promise.all([photoReady, introDone]).then(() => about.classList.add('in-view'));
  });
  observer.observe(about);
})();

aboutPhotos.then(slides => {
  const carousel = document.querySelector('.about-photo');
  if (!carousel) return;
  const dots = carousel.querySelector('.carousel-dots');

  const credit = document.getElementById('carousel-credit');
  function showCredit(slide) {
    const name = slide?.dataset.credit;
    const url = slide?.dataset.creditUrl;
    credit.replaceChildren();
    credit.hidden = !name;
    if (!name) return;
    if (!url) {
      credit.textContent = `Photo: ${name}`;
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = `Photo: ${name}`;
    credit.append(link);
  }

  if (slides.length < 2) {
    if (!slides.length) carousel.querySelector('.carousel-controls')?.remove();
    carousel.querySelectorAll('.carousel-button, .carousel-dots').forEach(el => el.remove());
    showCredit(slides[0]);
    return;
  }

  const INTERVAL = 6000;
  let index = 0;
  let timer = null;
  let stopped = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false;
  let held = false;

  const dotButtons = slides.map((slide, i) => {
    const button = document.createElement('button');
    button.setAttribute('aria-label', `Show photo ${i + 1}`);
    button.addEventListener('click', () => { stop(); show(i); });
    dots.append(button);
    return button;
  });

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => {
      const active = n === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', !active);
    });
    dotButtons.forEach((button, n) => button.setAttribute('aria-current', n === index));
    showCredit(slides[index]);
  }

  function update() {
    clearInterval(timer);
    timer = !stopped && visible && !held ? setInterval(() => show(index + 1), INTERVAL) : null;
  }

  function stop() {
    stopped = true;
    update();
  }

  document.getElementById('carousel-prev').addEventListener('click', () => { stop(); show(index - 1); });
  document.getElementById('carousel-next').addEventListener('click', () => { stop(); show(index + 1); });

  let startX = null;
  carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) < 40) return;
    stop();
    show(dx < 0 ? index + 1 : index - 1);
  });

  const hold = value => () => { held = value; update(); };
  carousel.addEventListener('mouseenter', hold(true));
  carousel.addEventListener('mouseleave', hold(false));
  carousel.addEventListener('focusin', hold(true));
  carousel.addEventListener('focusout', hold(false));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.5 }).observe(carousel);
  }

  show(0);
});
