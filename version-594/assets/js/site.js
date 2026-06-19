(function () {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, position) {
      slide.classList.toggle('active', position === currentSlide);
    });

    dots.forEach(function (dot, position) {
      dot.classList.toggle('active', position === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.slide || 0));
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 6000);
  }

  const buttons = Array.from(document.querySelectorAll('.filter-button'));
  const filterCards = Array.from(document.querySelectorAll('.filter-container .movie-card'));

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      const value = button.dataset.filter || 'all';

      buttons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      filterCards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.category,
          card.dataset.tags
        ].join(' ');

        const matched = value === 'all' || haystack.indexOf(value) !== -1;
        card.classList.toggle('hidden', !matched);
      });
    });
  });

  const searchInput = document.getElementById('movieSearch');
  const categorySelect = document.getElementById('categorySelect');
  const searchCards = Array.from(document.querySelectorAll('#searchGrid .movie-card'));

  function runSearch() {
    if (!searchCards.length) {
      return;
    }

    const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const category = categorySelect ? categorySelect.value : 'all';

    searchCards.forEach(function (card) {
      const text = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.tags
      ].join(' ').toLowerCase();

      const matchedText = !term || text.indexOf(term) !== -1;
      const matchedCategory = category === 'all' || card.dataset.category === category;
      card.classList.toggle('hidden', !(matchedText && matchedCategory));
    });
  }

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q');

    if (initial) {
      searchInput.value = initial;
    }

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', runSearch);
  }
})();
