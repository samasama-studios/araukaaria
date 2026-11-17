(() => {
  const SKIP = ['email', 'website', 'linktree'];

  Promise.all(['data/band.json', 'data/links.json'].map(url => fetch(url).then(response => {
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    return response.json();
  })))
    .then(([band, data]) => {
      band.sameAs = Object.entries(data.links)
        .filter(([key, link]) => !SKIP.includes(key) && link.url)
        .map(([, link]) => link.url.replace(/\?si=.*$/, ''));
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(band);
      document.head.append(script);
    })
    .catch(error => console.error(error));
})();
