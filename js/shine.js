(() => {
  const buttons = document.querySelectorAll('.kit-shine');
  if (!buttons.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.remove('is-shining');
      void target.offsetWidth;
      target.classList.add('is-shining');
    });
  }, { threshold: 1 });

  buttons.forEach(button => {
    const layer = document.createElement('span');
    layer.className = 'kit-shine-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = button.innerHTML;
    button.append(layer);
    button.addEventListener('animationend', () => button.classList.remove('is-shining'));
    observer.observe(button);
  });
})();
