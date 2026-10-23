// Phone menu: swaps the menu button's icon to a close icon while the menu is
// open, and closes the menu when one of its links is followed. Opening and
// closing are otherwise handled by the browser (popovertarget on the button).
(() => {
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  if (!menu || !toggle) return;

  // The music and social buttons each open a row to their left with their
  // links; opening one closes the other.
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
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.hidePopover()));
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
