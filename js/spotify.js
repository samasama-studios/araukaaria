(() => {
  const tracks = [
    { title: 'Canto Oscuro', uri: 'spotify:track:6XsbDFfa12v06c7PNjo5TP' },
    { title: 'Slow Down', uri: 'spotify:track:5YoP8dBNFkRsmrQSOWctD2' },
    { title: 'What Makes Us?', uri: 'spotify:track:0Wy8jWxJ5OlUw0zJSr0jkE' },
    { title: 'Mi Jardín', uri: 'spotify:track:2PwPCkQVcD9FevOtXfMODw' },
    { title: 'El Don del Águila', uri: 'spotify:track:26vaytHeUNgEjmIKaZaLSs' },
    { title: 'Sigamos (Radio Edit)', uri: 'spotify:track:4AtmcUhfRWPasmRHTBBQma' },
  ];

  const bar = document.getElementById('spotify-bar');
  const cta = document.getElementById('cta');
  if (!bar || !cta) return;
  const ctaTitle = document.getElementById('cta-title');
  const ctaNote = document.getElementById('cta-note');

  let controller = null;
  let playWhenReady = false;
  let index = 0;
  let paused = true;
  let wasPlaying = false;
  let lastPosition = 0;
  let lastDuration = 0;

  function play(i) {
    index = (i + tracks.length) % tracks.length;
    wasPlaying = false;
    lastPosition = 0;
    lastDuration = 0;
    controller.loadUri(tracks[index].uri);
    controller.play();
    updateLine();
  }

  function updateLine() {
    const open = bar.classList.contains('open');
    cta.disabled = open;
    cta.classList.toggle('now-playing', open);
    cta.classList.toggle('paused', paused);
    if (open) {
      cta.removeAttribute('aria-label');
      ctaTitle.textContent = tracks[index].title;
      ctaNote.textContent = paused ? 'Paused' : 'Now playing';
    } else {
      cta.setAttribute('aria-label', 'Play Canto Oscuro');
      ctaTitle.textContent = 'Canto Oscuro';
      ctaNote.textContent = 'Out now';
    }
  }

  cta.addEventListener('click', () => {
    bar.classList.add('open');
    if (!controller) playWhenReady = true;
    else if (index === 0) controller.play();
    else play(0);
    updateLine();
    bar.querySelector('iframe')?.focus();
  });

  document.getElementById('spotify-close').addEventListener('click', () => {
    controller?.pause();
    playWhenReady = false;
    bar.classList.remove('open');
    updateLine();
    cta.focus();
  });

  window.onSpotifyIframeApiReady = IFrameAPI => {
    const options = { uri: tracks[0].uri, width: '100%', height: 80, theme: 'dark' };
    IFrameAPI.createController(document.getElementById('spotify-embed'), options, ready => {
      controller = ready;
      if (playWhenReady) controller.play();

      controller.addListener('playback_update', ({ data }) => {
        paused = data.isPaused;
        if (!paused) {
          wasPlaying = true;
          lastPosition = data.position;
          lastDuration = data.duration;
        }

        const ended = paused && wasPlaying && (
          (data.duration > 0 && data.position >= data.duration - 1500) ||
          (lastDuration > 0 && lastPosition >= lastDuration - 3000) ||
          (data.position === 0 && lastPosition > 0));
        if (ended) {
          play(index + 1);
          return;
        }
        updateLine();
      });

      document.getElementById('spotify-prev').addEventListener('click', () => play(index - 1));
      document.getElementById('spotify-next').addEventListener('click', () => play(index + 1));
    });
  };
})();
