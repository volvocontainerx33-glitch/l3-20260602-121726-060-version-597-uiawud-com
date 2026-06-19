(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applySearch(area) {
    var input = area.querySelector('.search-input');
    var chips = Array.prototype.slice.call(area.querySelectorAll('.filter-chip'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var activeFilter = 'all';

    function update() {
      var keyword = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-genre'));
        var category = card.getAttribute('data-category') || '';
        var matchesText = !keyword || text.indexOf(keyword) !== -1;
        var matchesFilter = activeFilter === 'all' || category === activeFilter;
        card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener('input', update);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        update();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    Array.prototype.slice.call(document.querySelectorAll('.search-panel')).forEach(applySearch);

    var heroCards = Array.prototype.slice.call(document.querySelectorAll('.hero-card'));
    if (heroCards.length > 1) {
      var index = 0;
      heroCards[0].classList.add('is-active');
      setInterval(function () {
        heroCards[index].classList.remove('is-active');
        index = (index + 1) % heroCards.length;
        heroCards[index].classList.add('is-active');
      }, 4200);
    }
  });
})();
