// Photos for the About carousel, from data/photos.json: builds one slide per
// photo (a <picture> with WebP and JPEG sizes from assets/photos/web, named
// "<file>-<width>.jpg/.webp") into the carousel, in the order of the JSON.
// A photo can have a "portrait" crop for portrait screens, and a "position"
// (object-position) saying what to keep when it is cropped. Resolves with the
// slides once they are in the page (an empty list if the JSON can't load).
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
    // The first photo loads with the page (after the hero); the rest when
    // the carousel gets near.
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

// Fades the About section's photo and text in as it scrolls into view, once
// the first photo has loaded (it starts loading with the page, after the
// hero).
// Skipped for visitors who prefer less motion (the section is then just shown).
(() => {
  const about = document.getElementById('about');
  if (!about || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const photoReady = aboutPhotos
    .then(slides => slides[0]?.querySelector('img').decode())
    .catch(() => {});

  about.classList.add('will-reveal');
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    photoReady.then(() => about.classList.add('in-view'));
  }); // as soon as any of it peeks in under the hero
  observer.observe(about);
})();

// Photo carousel in the About section: cross-fades between the photos. It
// moves on by itself every few seconds while the section is on screen,
// pausing while the pointer or keyboard focus is on it, and stops for good
// once someone uses the arrows, the indicators or a swipe. Visitors who
// prefer less motion only get the manual controls.
aboutPhotos.then(slides => {
  const carousel = document.querySelector('.about-photo');
  if (!carousel) return;
  const dots = carousel.querySelector('.carousel-dots');
  if (slides.length < 2) {
    carousel.querySelector('.carousel-controls')?.remove();
    return;
  }

  const INTERVAL = 6000; // ms per photo
  let index = 0;
  let timer = null;
  let stopped = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false;
  let held = false; // pointer or focus on the carousel

  // One indicator per photo.
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

  // Swipe left or right on touch screens.
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
