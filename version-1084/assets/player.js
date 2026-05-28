function startMoviePlayer(source) {
  var video = document.getElementById('movieVideo');
  var cover = document.getElementById('playerCover');
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function bindSource() {
    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
    } else if (video.src !== source) {
      video.src = source;
    }
  }

  function play() {
    bindSource();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  bindSource();

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });
}
