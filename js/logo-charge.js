(() => {
  const mark = document.getElementById('logo-mark');
  const group = mark?.closest('.hero-group');
  const logo = document.getElementById('araukaaria');
  if (!group || !logo) return;

  const GAIN = 0.1;
  const DRAIN = 0.2;
  const DRAIN_IDLE = 0.6;
  const IDLE_AFTER = 300;
  const HOLD = 900;

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
