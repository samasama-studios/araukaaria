(() => {
  const section = document.getElementById('shows');
  const template = document.getElementById('show-row');
  if (!section || !template) return;

  const upcomingList = document.getElementById('upcoming-shows');
  const noUpcoming = document.getElementById('no-upcoming');
  const pastHeading = document.getElementById('past-heading');
  const pastList = document.getElementById('past-shows');

  const STEP = 5;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDate(date) {
    const [year, month, day] = date.split('-');
    return `${day} ${MONTHS[month - 1]} ${year}`;
  }

  function row(show, upcoming) {
    const item = template.content.firstElementChild.cloneNode(true);
    const time = item.querySelector('.show-date');
    time.dateTime = show.date;
    const [dayMonth, year] = [formatDate(show.date).slice(0, -5), show.date.slice(0, 4)];
    const dayMonthSpan = document.createElement('span');
    const yearSpan = document.createElement('span');
    dayMonthSpan.className = 'show-day';
    yearSpan.className = 'show-year';
    dayMonthSpan.textContent = dayMonth;
    yearSpan.textContent = year;
    time.append(dayMonthSpan, ' ', yearSpan);
    item.querySelector('.show-event').textContent = show.event;
    const place = item.querySelector('.show-place');
    place.textContent = [show.city, show.country].filter(Boolean).join(', ');
    if (show.venue) {
      const venueSpan = document.createElement('span');
      venueSpan.className = 'show-venue';
      venueSpan.textContent = show.venue === 'TBA' ? 'Venue TBA' : show.venue;
      const separator = document.createElement('span');
      separator.className = 'show-venue-separator';
      separator.textContent = ' · ';
      place.prepend(venueSpan, separator);
    }

    const tickets = item.querySelector('.show-tickets');
    if (!upcoming) {
      tickets.remove();
    } else if (show.tickets) {
      tickets.href = show.tickets;
      tickets.setAttribute('aria-label', `Tickets for ${show.event}, ${formatDate(show.date)} (opens in a new tab)`);
    } else {
      tickets.removeAttribute('target');
      tickets.removeAttribute('rel');
      tickets.setAttribute('aria-hidden', 'true');
    }
    return item;
  }

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  fetch('data/shows.json')
    .then(response => {
      if (!response.ok) throw new Error(`shows.json: ${response.status}`);
      return response.json();
    })
    .then(shows => {
      const upcoming = shows.filter(show => show.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));
      const past = shows.filter(show => show.date < today)
        .sort((a, b) => b.date.localeCompare(a.date));

      if (upcoming.length) {
        upcomingList.append(...upcoming.map(show => row(show, true)));
        upcomingList.hidden = false;
        noUpcoming.hidden = true;
      }

      if (past.length) {
        const rows = past.map(show => row(show, false));
        pastList.append(...rows);
        pastHeading.hidden = false;
        pastList.hidden = false;
        addLoadMore(pastList, rows, STEP);
      }
    })
    .catch(error => console.error(error));
})();
