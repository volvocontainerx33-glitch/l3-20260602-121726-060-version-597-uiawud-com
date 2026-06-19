(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  filterForms.forEach(function (scope) {
    var searchInput = scope.querySelector('[data-filter-input]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var genreSelect = scope.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
    var empty = scope.querySelector('[data-empty]');

    function applyFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var genre = genreSelect ? genreSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var textMatch = !query || title.indexOf(query) > -1 || cardGenre.indexOf(query) > -1 || cardRegion.indexOf(query) > -1;
        var yearMatch = !year || cardYear === year;
        var genreMatch = !genre || cardGenre.indexOf(genre) > -1;
        var show = textMatch && yearMatch && genreMatch;

        card.style.display = show ? '' : 'none';
        if (show) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.style.display = visibleCount ? 'none' : 'block';
      }
    }

    [searchInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
