(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var inputs = document.querySelectorAll('.filter-input');
  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilters(input.closest('main') || document);
    });
  });

  var yearButtons = document.querySelectorAll('[data-filter-year]');
  yearButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.closest('[data-year-filters]');
      if (group) {
        group.querySelectorAll('button').forEach(function (item) {
          item.classList.remove('is-active');
        });
      }
      button.classList.add('is-active');
      applyFilters(button.closest('main') || document);
    });
  });

  function applyFilters(scope) {
    var input = scope.querySelector('.filter-input');
    var query = input ? input.value.trim().toLowerCase() : '';
    var activeYear = scope.querySelector('[data-filter-year].is-active');
    var year = activeYear ? activeYear.getAttribute('data-filter-year') : 'all';
    var cards = scope.querySelectorAll('[data-card]');

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var matchesText = !query || haystack.indexOf(query) !== -1;
      var matchesYear = year === 'all' || haystack.indexOf(year) !== -1;
      card.classList.toggle('is-hidden-by-filter', !(matchesText && matchesYear));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dots] button'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }
}());
