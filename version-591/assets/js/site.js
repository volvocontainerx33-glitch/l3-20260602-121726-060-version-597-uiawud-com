const rootPath = document.body.dataset.root || "./";

function selectAll(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function selectOne(selector, scope = document) {
  return scope.querySelector(selector);
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    };

    return entities[char] || char;
  });
}

function joinUrl(root, path) {
  return `${root}${path}`.replace(/\/+/g, "/");
}

function initMobileNavigation() {
  const toggle = selectOne(".mobile-menu-toggle");
  const nav = selectOne(".mobile-nav");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function initHeroCarousel() {
  const slides = selectAll("[data-hero-slide]");
  const dots = selectAll("[data-hero-dot]");
  const prev = selectOne("[data-hero-prev]");
  const next = selectOne("[data-hero-next]");

  if (slides.length === 0) {
    return;
  }

  let currentIndex = 0;
  let timer = null;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentIndex);
    });
  }

  function startTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      showSlide(currentIndex + 1);
    }, 5200);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.heroDot || 0));
      startTimer();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      showSlide(currentIndex - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      showSlide(currentIndex + 1);
      startTimer();
    });
  }

  startTimer();
}

function initGlobalSearch() {
  const panel = selectOne("#globalSearch");
  const input = selectOne(".search-input", panel || document);
  const results = selectOne(".search-results", panel || document);
  const openButtons = selectAll(".search-toggle");
  const closeButtons = selectAll(".search-close");
  const searchIndex = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];

  if (!panel || !input || !results) {
    return;
  }

  function openPanel() {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => input.focus(), 20);
    renderResults(input.value);
  }

  function closePanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderResults(query) {
    const keyword = normalizeText(query);
    const items = searchIndex
      .filter((item) => {
        if (!keyword) {
          return item.id <= 16;
        }

        const haystack = normalizeText([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          ...(item.tags || [])
        ].join(" "));

        return haystack.includes(keyword);
      })
      .slice(0, 60);

    if (items.length === 0) {
      results.innerHTML = '<p class="empty-state">没有找到匹配影片，请换一个关键词。</p>';
      return;
    }

    results.innerHTML = items.map((item) => {
      const url = joinUrl(rootPath, item.url);
      const cover = joinUrl(rootPath, item.cover);

      return `
        <a class="search-result-item" href="${url}">
          <img src="${cover}" alt="${escapeHtml(item.title)}封面" loading="lazy">
          <span>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.year)} · ${escapeHtml(item.region)} · ${escapeHtml(item.type)} · ${escapeHtml(item.category)}</span>
          </span>
        </a>
      `;
    }).join("");
  }

  openButtons.forEach((button) => button.addEventListener("click", openPanel));
  closeButtons.forEach((button) => button.addEventListener("click", closePanel));
  input.addEventListener("input", () => renderResults(input.value));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      closePanel();
    }
  });
}

function initLocalFilters() {
  const input = selectOne("[data-local-filter]");
  const cards = selectAll("[data-card]");

  if (!input || cards.length === 0) {
    return;
  }

  input.addEventListener("input", () => {
    const keyword = normalizeText(input.value);

    cards.forEach((card) => {
      const haystack = normalizeText([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.category
      ].join(" "));

      card.classList.toggle("is-filter-hidden", keyword && !haystack.includes(keyword));
    });
  });
}

async function getHlsClass() {
  if (window.Hls) {
    return window.Hls;
  }

  const module = await import("../vendor/hls-vendor-dru42stk.js");
  return module.H;
}

function destroyPreviousHls(video) {
  if (video.__hlsInstance) {
    video.__hlsInstance.destroy();
    video.__hlsInstance = null;
  }
}

async function attachHls(video, url) {
  destroyPreviousHls(video);
  video.removeAttribute("src");
  video.load();

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.load();
    return;
  }

  const Hls = await getHlsClass();

  if (!Hls || !Hls.isSupported()) {
    throw new Error("当前浏览器不支持 HLS 播放");
  }

  await new Promise((resolve, reject) => {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 60
    });

    video.__hlsInstance = hls;

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(url);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      resolve();
    });

    hls.on(Hls.Events.ERROR, (eventName, data) => {
      if (data && data.fatal) {
        reject(new Error("视频加载失败，请稍后重试"));
      }
    });

    hls.attachMedia(video);
  });
}

function initPlayers() {
  selectAll("[data-player-shell]").forEach((shell) => {
    const video = selectOne(".movie-player", shell);
    const startButton = selectOne(".player-start", shell);
    const errorBox = selectOne(".player-error", shell);
    const sourceButtons = selectAll(".source-btn", shell.parentElement || document);

    if (!video || !startButton) {
      return;
    }

    let preparedUrl = "";

    async function playUrl(url) {
      try {
        if (errorBox) {
          errorBox.textContent = "";
          errorBox.classList.remove("is-visible");
        }

        if (preparedUrl !== url) {
          await attachHls(video, url);
          preparedUrl = url;
        }

        await video.play();
        startButton.classList.add("is-hidden");
      } catch (error) {
        if (errorBox) {
          errorBox.textContent = error.message || "视频播放失败，请稍后重试";
          errorBox.classList.add("is-visible");
        }
      }
    }

    startButton.addEventListener("click", () => {
      playUrl(video.dataset.videoUrl || "");
    });

    video.addEventListener("play", () => {
      startButton.classList.add("is-hidden");
    });

    video.addEventListener("pause", () => {
      if (video.currentTime === 0 || video.ended) {
        startButton.classList.remove("is-hidden");
      }
    });

    sourceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        sourceButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        video.dataset.videoUrl = button.dataset.source || "";
        playUrl(video.dataset.videoUrl);
      });
    });
  });
}

initMobileNavigation();
initHeroCarousel();
initGlobalSearch();
initLocalFilters();
initPlayers();
