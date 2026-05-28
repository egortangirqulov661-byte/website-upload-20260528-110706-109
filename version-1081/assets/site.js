(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function norm(value) {
    return String(value || '').toLowerCase().trim();
  }

  function openMobileMenu() {
    var button = qs('[data-mobile-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
      button.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('active', pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('active', pos === current);
      });
    }
    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        show(pos);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function initFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = qs('[data-live-search]', panel);
      var typeSelect = qs('[data-type-filter]', panel);
      var yearSelect = qs('[data-year-filter]', panel);
      var targetSelector = panel.getAttribute('data-filter-panel');
      var cards = qsa(targetSelector + ' .movie-card');
      var empty = qs('[data-empty-state]');

      function apply() {
        var query = norm(input && input.value);
        var typeValue = norm(typeSelect && typeSelect.value);
        var yearValue = norm(yearSelect && yearSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = norm(card.getAttribute('data-search'));
          var cardType = norm(card.getAttribute('data-type'));
          var cardYear = norm(card.getAttribute('data-year'));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (typeValue && cardType !== typeValue) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initSearchPage() {
    var input = qs('[data-live-search]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
  }

  function prepareImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-missing');
      });
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = qs('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (box) {
      var video = qs('video', box);
      var button = qs('[data-play-button]', box);
      var cover = qs('[data-player-cover]', box);
      var message = qs('[data-player-message]', box);
      var streamUrl = box.getAttribute('data-stream');
      var ready = false;

      function setMessage(value) {
        if (message) {
          message.textContent = value || '';
        }
      }

      function startVideo() {
        if (!video || !streamUrl) {
          setMessage('播放失败，请稍后重试');
          return;
        }
        if (cover) {
          cover.classList.add('hidden');
        }
        if (ready) {
          video.play().catch(function () {
            setMessage('点击视频继续播放');
          });
          return;
        }
        setMessage('正在加载');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          ready = true;
          video.play().then(function () {
            setMessage('');
          }).catch(function () {
            setMessage('点击视频继续播放');
          });
          return;
        }
        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              ready = true;
              video.play().then(function () {
                setMessage('');
              }).catch(function () {
                setMessage('点击视频继续播放');
              });
            });
            hls.on(window.Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                setMessage('播放失败，请稍后重试');
              }
            });
          } else {
            video.src = streamUrl;
            ready = true;
            video.play().then(function () {
              setMessage('');
            }).catch(function () {
              setMessage('点击视频继续播放');
            });
          }
        });
      }

      if (button) {
        button.addEventListener('click', startVideo);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            startVideo();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    openMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
    prepareImages();
    initPlayers();
  });
})();
