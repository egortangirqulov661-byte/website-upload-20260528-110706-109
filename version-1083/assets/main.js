(function () {
  function toggleMenu() {
    var panel = document.querySelector("[data-mobile-panel]");
    if (panel) {
      panel.classList.toggle("open");
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    if (button) {
      button.addEventListener("click", toggleMenu);
    }
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });

    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupPageFilter() {
    var filterInput = document.querySelector("[data-page-filter]");
    if (!filterInput) {
      return;
    }
    var targetSelector = filterInput.getAttribute("data-page-filter");
    var grid = document.querySelector(targetSelector);
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var selectedType = "";

    function applyFilter() {
      var term = normalize(filterInput.value);
      cards.forEach(function (card) {
        var meta = normalize(card.getAttribute("data-meta") + " " + card.getAttribute("data-title"));
        var type = card.getAttribute("data-type") || "";
        var matchedText = !term || meta.indexOf(term) !== -1;
        var matchedType = !selectedType || type === selectedType;
        card.classList.toggle("hidden-by-filter", !(matchedText && matchedType));
      });
    }

    filterInput.addEventListener("input", applyFilter);

    var filterWrap = document.querySelector("[data-type-filters] ");
    if (!filterWrap) {
      filterWrap = document.querySelector("[data-type-filters] ".trim());
    }
    if (filterWrap) {
      Array.prototype.slice.call(filterWrap.querySelectorAll("[data-filter-value]")).forEach(function (button) {
        button.addEventListener("click", function () {
          selectedType = button.getAttribute("data-filter-value") || "";
          Array.prototype.slice.call(filterWrap.querySelectorAll("[data-filter-value]")).forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          applyFilter();
        });
      });
    }
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    var desc = movie.one_line || movie.summary || "";
    return "<article class=\"movie-card\">" +
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"movie-link\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<span class=\"movie-cover\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"movie-year\">" + escapeHtml(movie.year) + "</span></span>" +
      "<span class=\"movie-info\"><strong class=\"movie-title\">" + escapeHtml(movie.title) + "</strong>" +
      "<span class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</span>" +
      "<span class=\"movie-desc\">" + escapeHtml(desc.slice(0, 76)) + "</span>" +
      "<span class=\"tag-row\">" + tags + "</span></span></a></article>";
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var form = document.querySelector("[data-search-form]");
    var query = getQuery();
    if (input) {
      input.value = query;
    }

    function render(value) {
      var term = normalize(value);
      var movies = window.SITE_MOVIES.filter(function (movie) {
        if (!term) {
          return true;
        }
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category_name,
          (movie.tags || []).join(" "),
          movie.one_line
        ].join(" "));
        return haystack.indexOf(term) !== -1;
      }).slice(0, 120);
      results.innerHTML = movies.map(movieCard).join("");
    }

    render(query);

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render(input ? input.value : "");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupPageFilter();
    setupSearchPage();
  });
})();
