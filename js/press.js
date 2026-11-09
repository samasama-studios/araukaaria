(() => {
  const list = document.getElementById('press-list');
  const template = document.getElementById('press-row');
  if (!list || !template) return;

  const STEP = 4;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
      items.sort((a, b) => b.date.localeCompare(a.date));
      const rows = items.map(row);
      list.append(...rows);
      addLoadMore(list, rows, STEP);
    })
    .catch(error => console.error(error));
})();
