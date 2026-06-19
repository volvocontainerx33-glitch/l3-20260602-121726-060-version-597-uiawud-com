(function () {
  const video = document.getElementById('videoPlayer');
  const playButton = document.querySelector('[data-play-button]');

  if (!video) {
    return;
  }

  const source = video.getAttribute('data-src');
  let hlsInstance = null;
  let ready = false;

  const attachSource = function () {
    if (ready || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      ready = true;
    }
  };

  const startPlayback = function () {
    attachSource();

    if (playButton) {
      playButton.classList.add('hidden');
    }

    const attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        video.controls = true;
      });
    }
  };

  if (playButton) {
    playButton.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
