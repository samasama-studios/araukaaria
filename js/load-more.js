// "Load more" for long lists (shows.js and press.js): shows the first `step`
// rows of a list and puts a button under it that reveals the next `step`
// each time, fading them in one after another (see "is-new" in style.css).
// The button goes away once every row is shown.
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
      // Nothing left to load: hand focus to the first newly shown row so
      // keyboard users don't lose their place when the button goes.
      next[0].tabIndex = -1;
      next[0].focus({ preventScroll: true });
      button.remove();
    }
  });
}
