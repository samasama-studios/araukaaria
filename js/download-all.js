(() => {
  const buttons = document.querySelectorAll('[data-zip]');
  if (!buttons.length) return;

  const folders = { light: 'for-dark-backgrounds', dark: 'for-light-backgrounds' };
  const tone = /-(light|dark)(\.\w+)$/;
  let library;

  const loadZip = () => library ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'js/vendor/jszip.min.js';
    script.onload = () => resolve(window.JSZip);
    script.onerror = () => {
      library = null;
      reject(new Error('jszip.min.js failed to load'));
    };
    document.head.append(script);
  });

  function files(list) {
    return [...new Set([...list.querySelectorAll('a[download]')].map(a => a.getAttribute('href')))];
  }

  function zipName(button, urls) {
    const match = urls.map(url => url.match(tone)).find(Boolean);
    return match ? `${button.dataset.zip}-${folders[match[1]]}.zip` : `${button.dataset.zip}.zip`;
  }

  buttons.forEach(button => {
    const list = document.querySelector(button.dataset.zipFrom);
    if (!list) return;
    const label = button.textContent;
    button.hidden = false;
    button.addEventListener('click', async () => {
      button.disabled = true;
      button.textContent = 'Preparing…';
      try {
        const JSZip = await loadZip();
        const zip = new JSZip();
        const urls = files(list);
        await Promise.all(urls.map(async url => {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`${url}: ${response.status}`);
          zip.file(url.split('/').pop(), await response.blob());
        }));
        const link = document.createElement('a');
        link.href = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }));
        link.download = zipName(button, urls);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      } catch (error) {
        console.error(error);
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  });
})();
