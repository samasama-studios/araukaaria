(() => {
  const toggle = document.querySelector('.kit-logo-toggle');
  const logos = document.querySelector('.kit-logos');
  if (!toggle || !logos) return;

  const files = [...logos.querySelectorAll('img[src], a[href]')];
  const attr = el => (el.matches('img') ? 'src' : 'href');

  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const light = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', String(light));
    logos.classList.toggle('kit-logos-light', light);
    files.forEach(el => {
      const name = attr(el);
      el.setAttribute(name, el.getAttribute(name).replace(light ? /-light\./ : /-dark\./, light ? '-dark.' : '-light.'));
    });
  });
})();
