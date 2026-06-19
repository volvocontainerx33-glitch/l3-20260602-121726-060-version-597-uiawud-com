(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var input = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var list = document.querySelector("[data-filter-list]");
    var empty = document.querySelector("[data-empty-state]");

    if (input && window.location.search) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }

    function applyFilter() {
      if (!list) {
        return;
      }

      var queryText = normalize(input ? input.value : "");
      var yearValue = normalize(yearFilter ? yearFilter.value : "");
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var matchesQuery = !queryText || haystack.indexOf(queryText) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        var show = matchesQuery && matchesYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilter);
    }

    applyFilter();
  });

  window.initMoviePlayer = function (videoUrl) {
    var video = document.getElementById("movieVideo");
    var button = document.querySelector(".player-start");
    var attached = false;
    var hlsInstance = null;

    if (!video || !videoUrl) {
      return;
    }

    function attachVideo() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = videoUrl;
    }

    function startPlayback() {
      attachVideo();
      if (button) {
        button.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
