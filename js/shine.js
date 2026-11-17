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
    button.addEventListener('animationend', () => button.classList.remove('is-shining'));
    observer.observe(button);
  });
})();
