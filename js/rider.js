(() => {
  const section = document.getElementById('rider');
  if (!section) return;

  function group({ title, items }) {
    const div = document.createElement('div');
    div.className = 'rider-group';
    const heading = document.createElement('h4');
    heading.textContent = title;
    div.append(heading, groupItems(items));
    return div;
  }

  function groupItems(items) {
    const ul = document.createElement('ul');
    ul.className = 'rider-items';
    const counted = items.some(text => /^\d+ × /.test(text));
    items.forEach(text => {
      const li = document.createElement('li');
      const [, count, rest] = text.match(/^(?:(\d+) × )?(.*)$/);
      if (counted) {
        const qty = document.createElement('span');
        qty.className = 'rider-qty';
        qty.textContent = count ? `${count}×` : '';
        li.append(qty);
      }
      li.append(rest);
      ul.append(li);
    });
    return ul;
  }

  function list(items) {
    const ul = document.createElement('ul');
    ul.className = 'rider-list';
    items.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      ul.append(li);
    });
    return ul;
  }

  function inputRow(input) {
    const tr = document.createElement('tr');
    [input.ch, input.instrument, input.source, input.stand || '–', input.effects || '–', input.plot]
      .forEach(text => {
        const td = document.createElement('td');
        td.textContent = text;
        tr.append(td);
      });
    return tr;
  }

  function plotLabels({ width, height, labels }) {
    const layer = document.querySelector('#rider-plot .rider-plot-labels');
    if (!layer) return;
    layer.append(...labels.map(({ type, text, x, y, align }) => {
      const span = document.createElement('span');
      span.className = `rider-plot-label rider-plot-${type}`;
      if (align) span.classList.add(`rider-plot-${align}`);
      span.textContent = text;
      span.style.left = `${(x / width) * 100}%`;
      span.style.top = `${(y / height) * 100}%`;
      return span;
    }));
  }

  fetch('data/rider.json')
    .then(response => {
      if (!response.ok) throw new Error(`rider.json: ${response.status}`);
      return response.json();
    })
    .then(rider => {
      document.getElementById('rider-show').append(...rider.showInfo.map(group));
      document.getElementById('rider-equipment').append(...rider.equipment.map(group));
      document.getElementById('rider-comments').append(list(rider.comments));
      document.getElementById('rider-inputs').append(...rider.inputs.map(inputRow));
      if (rider.stagePlot) plotLabels(rider.stagePlot);
      section.classList.add('is-filled');
    })
    .catch(error => console.error(error));
})();
