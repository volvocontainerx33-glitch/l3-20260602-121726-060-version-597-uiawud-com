(function () {
  window.initMoviePlayer = function (box, stream) {
    if (!box || !stream) {
      return;
    }

    var video = box.querySelector('video');
    var overlay = box.querySelector('.watch-overlay');
    var loaded = false;

    function bindStream() {
      if (loaded || !video) {
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      bindStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }
  };
})();
