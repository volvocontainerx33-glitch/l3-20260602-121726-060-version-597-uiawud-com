(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const showSlide = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  const filterInput = document.querySelector('[data-card-filter]');
  const genreSelect = document.querySelector('[data-genre-filter]');
  const cardList = document.querySelector('[data-card-list]');
  const countTarget = document.querySelector('[data-filter-count]');

  if (cardList && (filterInput || genreSelect)) {
    const cards = Array.from(cardList.querySelectorAll('.movie-card'));

    const applyFilter = function () {
      const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
      const genre = genreSelect ? genreSelect.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const title = (card.dataset.title || '').toLowerCase();
        const cardGenre = (card.dataset.genre || '').toLowerCase();
        const region = (card.dataset.region || '').toLowerCase();
        const year = (card.dataset.year || '').toLowerCase();
        const textMatch = !query || title.includes(query) || cardGenre.includes(query) || region.includes(query) || year.includes(query);
        const genreMatch = !genre || cardGenre === genre;
        const isVisible = textMatch && genreMatch;
        card.classList.toggle('hidden-card', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (countTarget) {
        countTarget.textContent = visible + ' 部';
      }
    };

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (genreSelect) {
      genreSelect.addEventListener('change', applyFilter);
    }
  }
})();
