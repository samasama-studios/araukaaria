// Logo colour effect and entry glitch. Loads the #logo-fx and #word-fx filters
// (for the logo and the wordmark under it) into the page, then drives them:
// swings the coloured copies behind the white artwork out and jitters the
// artwork itself (or, in the vivid look, splits it into R, G and B), then eases
// everything back onto the resting look.
//
// After the entry it also offers, for logo-charge.js, glitches of the logo
// alone (the branch, not the name under it):
// - window.glitchLogo(duration, strength): a shorter, weaker glitch of the
//   same kind (on each click);
// - window.glitchLogoOut(duration, done): the entry played backwards, the
//   glitch growing and the logo blinking out more and more until it's gone
//   (when the bar is full). The logo stays hidden afterwards, until
//   window.showLogo().
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
  const allEffects = ['logo-fx', 'word-fx']
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .map(filter => ({
      id: filter.id,
      shift: filter.querySelector('.fx-shift'),
      splits: [...filter.querySelectorAll('.fx-split')],
      fringes: [...filter.querySelectorAll('.fx-fringe')].map(el => ({
        el,
        dx: parseFloat(el.getAttribute('dx')),
        dy: parseFloat(el.getAttribute('dy')),
      })),
    }));

  // What the glitch running now moves: the whole mark and both filters for
  // the entry, or the logo alone and its filter (see glitch below).
  const logo = document.getElementById('araukaaria');
  let target = mark;
  let effects = allEffects;

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

  // t runs from wild (0) to calm (1). strength scales how far everything
  // swings (1 for the entry); blink is the chance the logo is hidden on this
  // frame.
  function burst(t, strength, blink) {
    const decay = (1 - t) ** 2;
    const amp = MAX_SWING * decay * strength;

    // Calm frames get more frequent as the logo settles.
    if (Math.random() < 0.2 + t * 0.5) {
      rest();
      target.style.transform = '';
      target.style.clipPath = '';
      target.style.opacity = Math.random() < blink ? 0 : 1;
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

    const px = target.offsetWidth * amp;
    target.style.transform = `translateX(${rand(px * 0.5)}px) skewX(${rand(10 * decay)}deg)`;

    if (Math.random() < 0.35 * Math.min(strength, 1)) {
      const top = Math.random() * 60;
      const bottom = Math.random() * (60 - top);
      target.style.clipPath = `inset(${top}% 0 ${bottom}% 0)`;
    } else {
      target.style.clipPath = '';
    }

    target.style.opacity = Math.random() < blink ? 0 : 1;
  }

  function settle() {
    rest();
    target.style.transform = '';
    target.style.clipPath = '';
    target.style.opacity = '';
  }

  // Runs one glitch for duration ms, then settles and calls done. A new one
  // replaces any glitch still running. blink(p) gives the chance the logo is
  // hidden at p (0 to 1 through the glitch); out plays it backwards, from
  // calm to wild, and leaves the logo hidden at the end. alone glitches the
  // logo without the name under it.
  let current = 0;
  function glitch(duration, { strength = 1, blink = () => 0, out = false, alone = false, done } = {}) {
    const id = ++current;
    settle();
    target = alone ? logo : mark;
    effects = alone ? allEffects.filter(e => e.id === 'logo-fx') : allEffects;
    let start;
    let last = -Infinity;
    requestAnimationFrame(function frame(now) {
      if (id !== current) return;
      start ??= now;
      const p = (now - start) / duration;
      if (p >= 1) {
        settle();
        if (out) target.style.opacity = 0;
        return done?.();
      }
      if (now - last >= STEP) {
        last = now;
        burst(out ? 1 - p : p, strength, blink(p));
      }
      requestAnimationFrame(frame);
    });
  }

  function run() {
    mark.classList.remove('glitch-pending');
    // Flicker in and out during the first part of the entry.
    glitch(DURATION, {
      blink: p => (p < 0.35 ? 0.5 - p : 0),
      done: () => {
        reveal();
        window.glitchLogo = (duration, strength) => glitch(duration, { strength, alone: true });
        window.glitchLogoOut = (duration, done) => glitch(duration, { out: true, alone: true, blink: p => 0.9 * p ** 2, done });
        window.showLogo = () => { current++; settle(); };
      },
    });
  }

  Promise.all([...mark.querySelectorAll('img')].map(img => img.decode()))
    .then(run)
    .catch(() => {
      mark.classList.remove('glitch-pending');
      reveal();
    });
})();
