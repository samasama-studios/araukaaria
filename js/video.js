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
