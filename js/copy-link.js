(() => {
  const buttons = document.querySelectorAll('.video-copy');
  if (!buttons.length) return;

  buttons.forEach(button => {
    const link = button.closest('figure')?.querySelector('.video-cover');
    if (!link) return;

    const printed = document.createElement('a');
    printed.className = 'print-only video-print-link';
    printed.href = link.href;
    printed.textContent = link.href.replace(/^https?:\/\/(www\.)?/, '');
    button.closest('figcaption').after(printed);

    if (!navigator.clipboard) return;
    const text = button.querySelector('.video-copy-text');
    const label = text.textContent;
    let timer;
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(link.href);
      } catch (error) {
        console.error(error);
        return;
      }
      button.classList.add('copied');
      text.textContent = 'Copied';
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.classList.remove('copied');
        text.textContent = label;
      }, 2000);
    });
  });
})();
