// Logo colour effect and entry glitch. Loads the #logo-fx and #word-fx filters
// (for the logo and the wordmark under it) into the page, then drives them:
// swings the coloured copies behind the white artwork out and jitters the
// artwork itself (or, in the vivid look, splits it into R, G and B), then eases
// everything back onto the resting look.
//
// Two looks: assets/icons/logo-fx.svg (muted, the default) and
// assets/icons/logo-fx-vivid.svg (open the site with ?look=vivid).
(async () => {
  // Fades in the rest of the page (see the "intro" class in index.html).
  const reveal = () => document.documentElement.classList.replace('intro', 'revealed');

  const mark = document.getElementById('logo-mark');
  if (!mark) return reveal();

  // Keep the logo hidden until the filters are in place, so it never shows
  // plain white first.
  mark.classList.add('glitch-pending');
  try {
    const vivid = new URLSearchParams(location.search).get('look') === 'vivid';
    const res = await fetch(vivid ? 'assets/icons/logo-fx-vivid.svg' : 'assets/icons/logo-fx.svg');
    if (res.ok) document.body.insertAdjacentHTML('beforeend', await res.text());
  } catch {
    // Without the filters the logo just shows plain white.
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mark.classList.remove('glitch-pending');
    return reveal();
  }

  // Offsets are fractions of each element's size (the filters use
  // objectBoundingBox). The muted look moves the white artwork as one piece
  // (.fx-shift); the vivid look splits it into channels (.fx-split). Each
  // filter has one or the other.
  const effects = ['logo-fx', 'word-fx']
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .map(filter => ({
      shift: filter.querySelector('.fx-shift'),
      splits: [...filter.querySelectorAll('.fx-split')],
      fringes: [...filter.querySelectorAll('.fx-fringe')].map(el => ({
        el,
        dx: parseFloat(el.getAttribute('dx')),
        dy: parseFloat(el.getAttribute('dy')),
      })),
    }));

  const DURATION = 1400; // ms
  const STEP = 60;       // ms between glitch frames
  const MAX_SWING = 0.07; // how far the coloured copies swing out
  const rand = max => (Math.random() * 2 - 1) * max;

  function setOffset(el, dx, dy) {
    el.setAttribute('dx', dx);
    el.setAttribute('dy', dy);
  }

  function rest() {
    for (const { shift, splits, fringes } of effects) {
      if (shift) setOffset(shift, 0, 0);
      splits.forEach(el => setOffset(el, 0, 0));
      fringes.forEach(f => setOffset(f.el, f.dx, f.dy));
    }
  }

  function burst(t) {
    const decay = (1 - t) ** 2;
    const amp = MAX_SWING * decay;

    // Calm frames get more frequent as the logo settles.
    if (Math.random() < 0.2 + t * 0.5) {
      rest();
      mark.style.transform = '';
      mark.style.clipPath = '';
      mark.style.opacity = 1;
      return;
    }

    const dir = Math.random() < 0.5 ? 1 : -1;
    for (const { shift, splits, fringes } of effects) {
      // The coloured copies swing out around their resting spots, sideways
      // more than up and down, so by the end they are already close to where
      // they settle.
      fringes.forEach(f => setOffset(f.el, f.dx + rand(amp), f.dy + rand(amp * 0.3)));
      if (shift) setOffset(shift, rand(amp * 0.2), 0);
      if (splits.length) {
        const [r, g, b] = splits;
        setOffset(r, dir * amp * (0.5 + Math.random() * 0.5), rand(amp * 0.3));
        setOffset(g, rand(amp * 0.2), 0);
        setOffset(b, -dir * amp * (0.5 + Math.random() * 0.5), rand(amp * 0.3));
      }
    }

    const px = mark.offsetWidth * amp;
    mark.style.transform = `translateX(${rand(px * 0.5)}px) skewX(${rand(10 * decay)}deg)`;

    if (Math.random() < 0.35) {
      const top = Math.random() * 60;
      const bottom = Math.random() * (60 - top);
      mark.style.clipPath = `inset(${top}% 0 ${bottom}% 0)`;
    } else {
      mark.style.clipPath = '';
    }

    // Flicker in and out during the first part of the entry.
    mark.style.opacity = t < 0.35 && Math.random() < 0.5 - t ? 0 : 1;
  }

  function finish() {
    rest();
    mark.style.transform = '';
    mark.style.clipPath = '';
    mark.style.opacity = '';
    reveal();
  }

  function run() {
    let start;
    let last = -Infinity;

    mark.classList.remove('glitch-pending');

    requestAnimationFrame(function frame(now) {
      start ??= now;
      const t = (now - start) / DURATION;
      if (t >= 1) return finish();
      if (now - last >= STEP) {
        last = now;
        burst(t);
      }
      requestAnimationFrame(frame);
    });
  }

  Promise.all([...mark.querySelectorAll('img')].map(img => img.decode()))
    .then(run)
    .catch(() => {
      mark.classList.remove('glitch-pending');
      reveal();
    });
})();
