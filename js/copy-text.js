(() => {
  const buttons = document.querySelectorAll('[data-copy]');
  if (!buttons.length || !navigator.clipboard) return;

  buttons.forEach(button => {
    const source = document.querySelector(button.dataset.copy);
    if (!source) return;
    let timer;
    button.hidden = false;
    button.addEventListener('click', async () => {
      const text = [...source.querySelectorAll('p')]
        .filter(p => p.getClientRects().length)
        .map(p => p.textContent.trim())
        .join('\n\n');
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error(error);
        return;
      }
      button.classList.add('copied');
      clearTimeout(timer);
      timer = setTimeout(() => button.classList.remove('copied'), 2000);
    });
  });
})();
