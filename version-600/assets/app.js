(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");

    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        mobile.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;

      function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      if (slides.length) {
        dots.forEach(function (dot) {
          dot.addEventListener("click", function () {
            show(Number(dot.getAttribute("data-hero-dot")) || 0);
          });
        });

        if (prev) {
          prev.addEventListener("click", function () {
            show(active - 1);
          });
        }

        if (next) {
          next.addEventListener("click", function () {
            show(active + 1);
          });
        }

        window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }
    }

    var list = document.querySelector("[data-filter-list]");
    var input = document.querySelector("[data-filter-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");

    if (list && input) {
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var years = [];
      var types = [];

      cards.forEach(function (card) {
        var year = card.getAttribute("data-year") || "";
        var type = card.getAttribute("data-type") || "";

        if (year && years.indexOf(year) === -1) {
          years.push(year);
        }

        if (type && types.indexOf(type) === -1) {
          types.push(type);
        }
      });

      years.sort(function (a, b) {
        return Number(b) - Number(a);
      });
      types.sort();

      if (yearFilter) {
        years.forEach(function (year) {
          var option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearFilter.appendChild(option);
        });
      }

      if (typeFilter) {
        types.forEach(function (type) {
          var option = document.createElement("option");
          option.value = type;
          option.textContent = type;
          typeFilter.appendChild(option);
        });
      }

      function apply() {
        var query = input.value.trim().toLowerCase();
        var selectedYear = yearFilter ? yearFilter.value : "";
        var selectedType = typeFilter ? typeFilter.value : "";

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" ").toLowerCase();
          var ok = true;

          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }

          if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
            ok = false;
          }

          if (selectedType && card.getAttribute("data-type") !== selectedType) {
            ok = false;
          }

          card.classList.toggle("is-hidden-card", !ok);
        });
      }

      input.addEventListener("input", apply);

      if (yearFilter) {
        yearFilter.addEventListener("change", apply);
      }

      if (typeFilter) {
        typeFilter.addEventListener("change", apply);
      }

      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");

      if (initial) {
        input.value = initial;
        apply();
      }
    }
  });

  window.initMoviePlayer = function (source) {
    var box = document.querySelector("[data-player]");

    if (!box) {
      return;
    }

    var video = box.querySelector("video");
    var button = box.querySelector("[data-play]");
    var attached = false;

    function attach() {
      if (attached || !video || !source) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls) {
        var hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();

      if (button) {
        button.classList.add("is-hidden");
      }

      if (video) {
        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }
  };
})();
