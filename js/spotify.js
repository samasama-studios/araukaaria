// Spotify player for the band's released songs at the bottom of the home page,
// using Spotify's embed API. It stays hidden until the "Canto Oscuro, out now"
// line under the logo is clicked, which opens it and plays Canto Oscuro. While
// the player is open, Spotify's card is the only playback control: the line
// turns into a quiet "now playing" label. Closing the player pauses it and
// turns the line back into a play button. The site's own previous/next buttons
// beside the card switch songs, and it moves on to the next one when a song
// ends. Visitors who aren't logged into Spotify in their browser hear
// 30-second previews.
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

  // The line under the logo: a play button while the player is closed, a
  // "now playing" label for the current song while it's open.
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
    // The line is no longer a button, so move keyboard focus to the player.
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
    // theme: 'dark' is Spotify's own dark card, close to the site's background.
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

        // A song that stopped at its end: move on to the next one. Spotify
        // doesn't always say so the same way: the stop can come at the end,
        // or with the position already back at the start (and previews end
        // after 30 seconds, before the song's full length).
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
