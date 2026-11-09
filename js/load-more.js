function addLoadMore(list, rows, step) {
  rows.slice(step).forEach(row => { row.hidden = true; });
  if (rows.length <= step) return;

  const button = document.createElement('button');
  button.className = 'load-more';
  button.textContent = 'Load more';
  list.after(button);

  button.addEventListener('click', () => {
    const next = rows.filter(row => row.hidden).slice(0, step);
    next.forEach((row, i) => {
      row.hidden = false;
      row.style.setProperty('--i', i);
      row.classList.add('is-new');
    });
    if (!rows.some(row => row.hidden)) {
      next[0].tabIndex = -1;
      next[0].focus({ preventScroll: true });
      button.remove();
    }
  });
}
