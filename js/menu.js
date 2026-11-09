// Menu: on phones, swaps the menu button's icon to a close icon while the menu is
// open, and closes the menu when one of its links is followed. Opening and
// closing are otherwise handled by the browser (popovertarget on the button).
(() => {
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  if (!menu || !toggle) return;

  // The music button opens a row to its left with the streaming links.
  const rowToggles = [...menu.querySelectorAll('button[aria-controls]')];
  function closeRows(except) {
    rowToggles.forEach(button => {
      if (button === except) return;
      document.getElementById(button.getAttribute('aria-controls')).hidden = true;
      button.setAttribute('aria-expanded', false);
    });
  }
  rowToggles.forEach(button => button.addEventListener('click', () => {
    const row = document.getElementById(button.getAttribute('aria-controls'));
    closeRows(button);
    row.hidden = !row.hidden;
    button.setAttribute('aria-expanded', !row.hidden);
  }));

  const icon = toggle.querySelector('img');
  menu.addEventListener('toggle', event => {
    const open = event.newState === 'open';
    icon.src = open ? 'assets/icons/close.svg' : 'assets/icons/menu.svg';
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    if (!open) closeRows();
  });
  // On the menu rather than on each link, since the music links are added
  // later (links.js).
  menu.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    closeRows();
    if (menu.matches(':popover-open')) menu.hidePopover();
  });

  // On desktop the menu is always shown (no popover), so a click elsewhere
  // or Escape closes an open row of links.
  document.addEventListener('click', event => {
    if (!event.target.closest('.menu-item')) closeRows();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeRows();
  });
})();

// Sticky navbar: once the big logo has scrolled out of view, the navbar gets
// its background and small wordmark (see "nav-scrolled" in style.css).
(() => {
  const logo = document.getElementById('logo-mark');
  if (!logo || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(([entry]) => {
    const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    document.documentElement.classList.toggle('nav-scrolled', past);
  }).observe(logo);
})();

// Desktop: the vignettes behind the navbar's names fade in once the middle of
// the hero photo's top fade (where it reads as the edge) has scrolled up to
// the middle of the row of names (see "nav-over-photo" in style.css).
(() => {
  const hero = document.querySelector('.home #logo');
  const menu = document.getElementById('menu');
  if (!hero || !menu) return;

  let queued = false;
  const update = () => {
    queued = false;
    const fade = parseFloat(getComputedStyle(hero).getPropertyValue('--about-fade')) || 0;
    const photoTop = parseFloat(getComputedStyle(hero, '::before').top) || 0;
    const edge = hero.getBoundingClientRect().top + photoTop + fade / 2;
    const row = menu.getBoundingClientRect();
    document.documentElement.classList.toggle('nav-over-photo', edge <= row.top + row.height / 2);
  };
  const queue = () => {
    if (!queued) requestAnimationFrame(update);
    queued = true;
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
})();

// Desktop: the row of names' width, as --menu-width on <html>, so the navbar
// can keep the wordmark clear of it on narrower desktops (see style.css).
(() => {
  const menu = document.getElementById('menu');
  if (!menu || !('ResizeObserver' in window)) return;

  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--menu-width', `${menu.offsetWidth}px`);
  }).observe(menu);
})();
