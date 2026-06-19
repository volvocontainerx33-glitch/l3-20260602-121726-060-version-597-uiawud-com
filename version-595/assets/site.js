(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-site-nav]");
  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.heroDot));
      });
    });

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  const lists = Array.from(document.querySelectorAll("[data-card-list]"));
  const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  let activeFilter = "";

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter() {
    const keyword = normalize(searchInputs.map(function (input) {
      return input.value;
    }).find(Boolean) || "");
    const filter = normalize(activeFilter);

    lists.forEach(function (list) {
      const cards = Array.from(list.querySelectorAll(".movie-card"));
      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(" "));
        const matchKeyword = !keyword || text.includes(keyword);
        const matchFilter = !filter || text.includes(filter);
        card.classList.toggle("is-hidden-card", !(matchKeyword && matchFilter));
      });
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyFilter);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filter || "";
      filterButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button && activeFilter);
      });
      applyFilter();
    });
  });
}());
