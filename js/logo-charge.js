// Hidden link behind the logo: a single click doesn't follow it. Each click
// charges a thin bar along the top of the screen and fades the page to black
// around the logo; the charge drains away on its own, faster once the clicks
// stop, so it takes about three seconds of steady clicking to fill. Each
// click also glitches the logo (glitch.js), harder as the bar fills. When
// it's full the logo glitches out of sight, leaving only black and the bar,
// and the link opens. Clicks with a modifier key (to open it in a new tab)
// follow the link straight away, and without this script it's a plain link.
(() => {
  const mark = document.getElementById('logo-mark');
  const group = mark?.closest('.hero-group');
  const logo = document.getElementById('araukaaria');
  if (!group || !logo) return;

  const GAIN = 0.1;        // charge per click
  const DRAIN = 0.2;       // charge lost per second while clicking
  const DRAIN_IDLE = 0.6;  // ...and once the clicks stop
  const IDLE_AFTER = 300;  // ms without a click before it counts as stopped
  const HOLD = 900;        // ms for the logo to glitch out before the link opens

  const root = document.documentElement;
  const shade = document.createElement('div');
  const bar = document.createElement('div');
  shade.className = 'charge-shade';
  bar.className = 'charge-bar';
  shade.setAttribute('aria-hidden', 'true');
  bar.setAttribute('aria-hidden', 'true');
  group.append(shade, bar);

  let charge = 0;
  let lastClick = 0;
  let lastFrame = 0;
  let running = false;
  let done = false;

  function render() {
    root.style.setProperty('--charge', charge);
    root.classList.toggle('charging', charge > 0);
  }

  function frame(now) {
    const dt = (now - lastFrame) / 1000;
    lastFrame = now;
    if (!done) {
      const drain = now - lastClick > IDLE_AFTER ? DRAIN_IDLE : DRAIN;
      charge = Math.max(0, charge - drain * dt);
    }
    render();
    if (charge > 0 && !done) requestAnimationFrame(frame);
    else running = false;
  }

  mark.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (done) return;

    lastClick = performance.now();
    charge = Math.min(1, charge + GAIN);
    if (charge === 1) {
      done = true;
      render();
      const go = () => { location.href = mark.href; };
      if (window.glitchLogoOut) window.glitchLogoOut(HOLD, go);
      else {
        // No glitch for visitors who prefer less motion: a plain fade.
        logo.style.transition = `opacity ${HOLD}ms`;
        logo.style.opacity = 0;
        setTimeout(go, HOLD);
      }
      return;
    }
    window.glitchLogo?.(200 + 300 * charge, 0.3 + 0.9 * charge);
    if (!running) {
      running = true;
      lastFrame = lastClick;
      requestAnimationFrame(frame);
    }
  });

  // Coming back with the browser's back button can restore the page as it
  // was left, on full black: start again from nothing.
  addEventListener('pageshow', event => {
    if (!event.persisted) return;
    charge = 0;
    done = false;
    render();
    window.showLogo?.();
    logo.style.transition = '';
    logo.style.opacity = '';
  });
})();
