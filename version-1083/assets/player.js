(function () {
  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function initVideoPlayer(videoId, triggerId, playbackUrl) {
    var video = document.getElementById(videoId);
    var trigger = document.getElementById(triggerId);
    var ready = false;
    var hls = null;

    if (!video || !trigger || !playbackUrl) {
      return;
    }

    function begin() {
      trigger.classList.add("is-hidden");
      video.controls = true;
      playVideo(video);
    }

    function prepare() {
      if (ready) {
        begin();
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playbackUrl;
        video.addEventListener("loadedmetadata", begin, { once: true });
        video.load();
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playbackUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          begin();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        ready = true;
        return;
      }

      video.src = playbackUrl;
      video.load();
      ready = true;
      begin();
    }

    trigger.addEventListener("click", prepare);
    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        prepare();
      }
    });
    video.addEventListener("play", function () {
      trigger.classList.add("is-hidden");
    });
  }

  window.initVideoPlayer = initVideoPlayer;
})();
