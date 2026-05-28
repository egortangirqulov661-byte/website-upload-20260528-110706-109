import { H as Hls } from './hls-vendor-dru42stk.js';

function preparePlayer(video) {
  if (!video || video.dataset.ready === 'true') {
    return;
  }

  var source = video.getAttribute('data-src');
  if (!source) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.ready = 'true';
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video.dataset.ready = 'true';
    return;
  }

  video.src = source;
  video.dataset.ready = 'true';
}

function bindPlayer(button) {
  var target = button.getAttribute('data-play-target');
  var video = document.getElementById(target);
  if (!video) {
    return;
  }

  var hideOverlay = function () {
    button.classList.add('is-hidden');
  };

  button.addEventListener('click', function () {
    preparePlayer(video);
    video.play().then(hideOverlay).catch(function () {
      hideOverlay();
      video.controls = true;
    });
  });

  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('is-hidden');
    }
  });
  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });

  video.addEventListener('pointerdown', function () {
    preparePlayer(video);
  }, { once: true });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-play-target]').forEach(bindPlayer);
});
