// Footer music player for the home page. Plays the band's own song files; the
// "Canto Oscuro, out now" line under the logo controls the same player.
(() => {
  const tracks = [
    { title: 'Canto Oscuro', src: 'assets/songs/Canto_Oscuro.mp3', cover: 'assets/songs/thumbs/Canto_Oscuro.jpg' },
    { title: 'Aconcagua', src: 'assets/songs/Aconcagua.mp3', cover: 'assets/songs/thumbs/Aconcagua.jpg' },
    { title: 'Silver Love', src: 'assets/songs/Silver_Love.mp3', cover: 'assets/songs/thumbs/Silver_Love.jpg' },
  ];

  const audio = document.getElementById('player-audio');
  if (!audio) return;
  const bar = document.getElementById('player-bar');
  const toggle = document.getElementById('player-toggle');
  const progress = document.getElementById('player-progress');
  const title = document.getElementById('player-title');
  const cover = document.getElementById('player-cover');
  const time = document.getElementById('player-time');
  const cta = document.getElementById('cta');

  let index = 0;
  let seeking = false;

  const formatTime = seconds => {
    if (!Number.isFinite(seconds)) return '0:00';
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  function load(i) {
    index = (i + tracks.length) % tracks.length;
    const track = tracks[index];
    audio.src = track.src;
    title.textContent = track.title;
    cover.src = track.cover;
    progress.value = 0;
    progress.style.setProperty('--progress', '0%');
    time.textContent = '0:00 / 0:00';
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: 'araukaaria',
        artwork: [{ src: track.cover, sizes: '160x160', type: 'image/jpeg' }],
      });
    }
  }

  function play(i = index) {
    if (i !== index || !audio.src) load(i);
    audio.play();
  }

  function update() {
    const playing = !audio.paused;
    bar.classList.toggle('playing', playing);
    toggle.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    // The line under the logo shows "playing" only for Canto Oscuro.
    const ctaPlaying = playing && index === 0;
    cta.classList.toggle('playing', ctaPlaying);
    cta.setAttribute('aria-label', ctaPlaying ? 'Pause Canto Oscuro' : 'Play Canto Oscuro');
  }

  toggle.addEventListener('click', () => (audio.paused ? play() : audio.pause()));
  document.getElementById('player-prev').addEventListener('click', () => {
    // Like most players: restart the song first, go back on a second press.
    if (audio.currentTime > 3) audio.currentTime = 0;
    else play(index - 1);
  });
  document.getElementById('player-next').addEventListener('click', () => play(index + 1));
  cta.addEventListener('click', () => (index === 0 && !audio.paused ? audio.pause() : play(0)));

  progress.addEventListener('input', () => {
    seeking = true;
    progress.style.setProperty('--progress', `${progress.value / 10}%`);
  });
  progress.addEventListener('change', () => {
    if (audio.duration) audio.currentTime = (progress.value / 1000) * audio.duration;
    seeking = false;
  });

  audio.addEventListener('timeupdate', () => {
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    if (seeking || !audio.duration) return;
    const fraction = audio.currentTime / audio.duration;
    progress.value = fraction * 1000;
    progress.style.setProperty('--progress', `${fraction * 100}%`);
  });
  audio.addEventListener('play', update);
  audio.addEventListener('pause', update);
  audio.addEventListener('ended', () => play(index + 1));

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', () => play(index - 1));
    navigator.mediaSession.setActionHandler('nexttrack', () => play(index + 1));
  }

  load(0);
})();
