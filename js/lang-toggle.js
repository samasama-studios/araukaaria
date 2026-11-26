(() => {
  const toggle = document.querySelector('.kit-lang');
  const kit = toggle?.closest('[data-lang-scope]');
  if (!toggle || !kit) return;
  const images = [...kit.querySelectorAll('img[data-alt-en]')];
  images.forEach(img => { img.dataset.altEt = img.alt; });

  const setLang = lang => {
    kit.lang = lang;
    toggle.setAttribute('aria-checked', String(lang === 'en'));
    images.forEach(img => { img.alt = lang === 'en' ? img.dataset.altEn : img.dataset.altEt; });
  };

  toggle.hidden = false;
  toggle.addEventListener('click', () => setLang(kit.lang === 'en' ? 'et' : 'en'));
  if (new URLSearchParams(location.search).get('lang') === 'en') setLang('en');
})();
