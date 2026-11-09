(() => {
  const section = document.getElementById('rider');
  if (!section) return;

  function group({ title, items }) {
    const div = document.createElement('div');
    div.className = 'rider-group';
    const heading = document.createElement('h4');
    heading.textContent = title;
    div.append(heading, list(items));
    return div;
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
      section.classList.add('is-filled');
    })
    .catch(error => console.error(error));
})();
