// Press: builds the list of press quotes from data/press.json, one row per
// quote from the row template in index.html, newest first (the order in the
// JSON doesn't matter). A quote with a "url" gets a working button to
// the full piece; without one the button is faded and does nothing, as with
// the shows' tickets buttons. Dates can be a full date ("2026-03-08"), a
// month ("2026-03") or just a year ("2026"). Only the newest few are shown at
// first, behind "Load more" (load-more.js).
(() => {
  const list = document.getElementById('press-list');
  const template = document.getElementById('press-row');
  if (!list || !template) return;

  const STEP = 4; // quotes shown at first, and revealed per click
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Fills the <time> with up to two spans, "08 Mar" and "2026", so phones
  // can stack them like the shows' dates.
  function fillDate(time, date) {
    const [year, month, day] = date.split('-');
    time.dateTime = date;
    const parts = [];
    if (month) parts.push([day, MONTHS[month - 1]].filter(Boolean).join(' '));
    parts.push(year);
    parts.forEach((text, i) => {
      const span = document.createElement('span');
      span.textContent = text;
      if (i) time.append(' ');
      time.append(span);
    });
  }

  function row(item) {
    const li = template.content.firstElementChild.cloneNode(true);
    fillDate(li.querySelector('.press-date'), item.date);
    const quote = li.querySelector('.press-quote');
    quote.textContent = `“${item.quote}”`;
    if (item.lang) quote.lang = item.lang;
    // Quotes in another language ("lang") can carry an English "translation".
    const translation = li.querySelector('.press-translation');
    if (item.translation) translation.textContent = item.translation;
    else translation.remove();
    li.querySelector('.press-outlet').textContent = item.outlet;
    const author = li.querySelector('.press-author');
    if (item.author) author.textContent = item.author;
    else author.remove();

    const link = li.querySelector('.press-link');
    if (item.url) {
      link.href = item.url;
      quote.cite = item.url;
      link.setAttribute('aria-label', `Read “${item.title || item.outlet}” on ${item.outlet} (opens in a new tab)`);
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('aria-hidden', 'true');
    }
    return li;
  }

  fetch('data/press.json')
    .then(response => {
      if (!response.ok) throw new Error(`press.json: ${response.status}`);
      return response.json();
    })
    .then(items => {
      // Newest first. Dates are ISO strings, so they sort as plain text.
      items.sort((a, b) => b.date.localeCompare(a.date));
      const rows = items.map(row);
      list.append(...rows);
      addLoadMore(list, rows, STEP);
    })
    .catch(error => console.error(error));
})();
