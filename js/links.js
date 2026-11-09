// Links: fills every list of the band's links from data/links.json, so each
// address is written only there. A list is an element with data-links (one or
// more of the JSON's lists, e.g. "music social") and a <template> for one
// link inside it, copied per link: the <a> gets the address, the <img> the
// icon (assets/icons/<icon, or the link's key>.svg) and the name goes in the
// [data-name] elements or, without any, in the <a>'s aria-label. Each list
// after the first starts with class "links-group-start", and data-separator
// goes between the links (for a list in running text). A link without a
// "url" is left out. A single <a data-link="<key>"> gets its address, and
// with data-link-text also shows it (for the email address).
(() => {
  const lists = document.querySelectorAll('[data-links]');
  const singles = document.querySelectorAll('[data-link]');
  if (!lists.length && !singles.length) return;

  function item(template, link, key) {
    const node = template.content.firstElementChild.cloneNode(true);
    const a = node.matches('a') ? node : node.querySelector('a');
    a.href = link.url;
    const img = node.querySelector('img');
    if (img) img.src = `assets/icons/${link.icon || key}.svg`;
    const names = [node, ...node.querySelectorAll('[data-name]')].filter(el => el.hasAttribute('data-name'));
    names.forEach(el => { el.textContent = link.name; });
    if (!names.length) a.setAttribute('aria-label', link.name);
    return node;
  }

  function fill(list, data) {
    const template = list.querySelector('template');
    const separator = list.dataset.separator;
    let first = true;
    list.dataset.links.split(' ').forEach((name, group) => {
      const keys = (data[name] || []).filter(key => data.links[key]?.url);
      keys.forEach((key, i) => {
        const node = item(template, data.links[key], key);
        if (group && !i) node.classList.add('links-group-start');
        if (separator && !first) list.append(separator);
        list.append(node);
        first = false;
      });
    });
  }

  fetch('data/links.json')
    .then(response => {
      if (!response.ok) throw new Error(`links.json: ${response.status}`);
      return response.json();
    })
    .then(data => {
      lists.forEach(list => fill(list, data));
      singles.forEach(a => {
        const link = data.links[a.dataset.link];
        if (!link?.url) return;
        a.href = link.url;
        if (a.hasAttribute('data-link-text')) a.textContent = link.url.replace(/^mailto:/, '');
      });
    })
    .catch(error => console.error(error));
})();
