function initMoviePlayer(source) {
  const video = document.getElementById('movie-video');
  const layer = document.querySelector('.play-layer');
  let loaded = false;
  let hls = null;

  function attachSource() {
    if (!video || loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      loaded = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      loaded = true;
      return;
    }

    video.src = source;
    loaded = true;
  }

  function startPlay() {
    attachSource();

    if (layer) {
      layer.classList.add('hide');
    }

    if (video) {
      video.setAttribute('controls', 'controls');
      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
  }

  if (layer) {
    layer.addEventListener('click', startPlay);
  }

  if (video) {
    video.addEventListener('click', startPlay, { once: true });
    video.addEventListener('ended', function () {
      if (hls) {
        hls.stopLoad();
      }
    });
  }
}
