(function () {
  const input = document.getElementById('siteSearchInput');
  const category = document.getElementById('siteCategoryFilter');
  const sort = document.getElementById('siteSortFilter');
  const button = document.getElementById('siteSearchButton');
  const results = document.getElementById('searchResults');
  const summary = document.getElementById('searchSummary');
  const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

  if (!input || !category || !sort || !button || !results || !summary) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  input.value = params.get('q') || '';

  const formatViews = function (views) {
    return views >= 10000 ? (views / 10000).toFixed(1) + '万' : String(views);
  };

  const createCard = function (movie) {
    const tags = movie.tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a href="' + movie.url + '" class="poster-link" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="play-badge">▶</span>' +
      '<span class="rating-badge">' + escapeHtml(movie.rating) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<a href="' + movie.url + '" class="movie-title">' + escapeHtml(movie.title) + '</a>' +
      '<p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</p>' +
      '<p class="movie-desc">' + escapeHtml(movie.description) + '</p>' +
      '<div class="movie-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  };

  const escapeHtml = function (value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  };

  const render = function () {
    const query = input.value.trim().toLowerCase();
    const selectedCategory = category.value;
    const selectedSort = sort.value;

    let filtered = movies.filter(function (movie) {
      const haystack = [movie.title, movie.year, movie.region, movie.genre, movie.category, movie.description].concat(movie.tags).join(' ').toLowerCase();
      const queryMatch = !query || haystack.includes(query);
      const categoryMatch = !selectedCategory || movie.category === selectedCategory;
      return queryMatch && categoryMatch;
    });

    filtered.sort(function (a, b) {
      if (selectedSort === 'rating') {
        return parseFloat(b.rating) - parseFloat(a.rating);
      }
      if (selectedSort === 'newest') {
        return String(b.publishDate).localeCompare(String(a.publishDate));
      }
      return b.views - a.views;
    });

    const visible = filtered.slice(0, 120);
    results.innerHTML = visible.map(createCard).join('');
    summary.textContent = '找到 ' + filtered.length + ' 部，当前显示 ' + visible.length + ' 部，最高热度 ' + (filtered[0] ? formatViews(filtered[0].views) : '0') + '。';
  };

  input.addEventListener('input', render);
  category.addEventListener('change', render);
  sort.addEventListener('change', render);
  button.addEventListener('click', render);
  render();
})();
