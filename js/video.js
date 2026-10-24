// Live video in the About section: the page shows only a cover image with a
// play button, so nothing is loaded from YouTube until someone presses play.
// Pressing it swaps the cover for YouTube's player (the privacy-enhanced
// youtube-nocookie.com one), playing straight away.
(() => {
  document.querySelectorAll('.video-cover[data-video]').forEach(cover => {
    cover.addEventListener('click', event => {
      event.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.className = 'video-player';
      iframe.src = `https://www.youtube-nocookie.com/embed/${cover.dataset.video}?autoplay=1&rel=0`;
      iframe.title = cover.getAttribute('aria-label').replace(/^Play video: /, '');
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      cover.replaceWith(iframe);
      iframe.focus();
    });
  });
})();
