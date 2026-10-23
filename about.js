// Fades the About section's photo and text in as it scrolls into view, once
// the photo has loaded (it starts loading with the page, after the hero).
// Skipped for visitors who prefer less motion (the section is then just shown).
(() => {
  const about = document.getElementById('about');
  if (!about || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const photo = about.querySelector('.about-photo img');
  const photoReady = photo.decode().catch(() => {});

  about.classList.add('will-reveal');
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    photoReady.then(() => about.classList.add('in-view'));
  }, { threshold: 0.2 });
  observer.observe(about);
})();

// Photo carousel in the About section: cross-fades between the photos. It
// moves on by itself every few seconds while the section is on screen,
// pausing while the pointer or keyboard focus is on it, and stops for good
// once someone uses the arrows, the indicators or a swipe. Visitors who
// prefer less motion only get the manual controls.
(() => {
  const carousel = document.querySelector('.about-photo');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.about-slide')];
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
})();
