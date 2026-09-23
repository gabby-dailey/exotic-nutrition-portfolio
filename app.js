const main = document.getElementById('main');

let ytPlayer = null;
let currentObserver = null;

function loadYouTubeApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previous) previous();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
}

function teardownVideo() {
  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }
  if (ytPlayer && ytPlayer.destroy) {
    ytPlayer.destroy();
  }
  ytPlayer = null;
}

function watchPanelVisibility(onFullyVisible, onPartlyOrNotVisible) {
  const panel = document.getElementById('video-panel');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.999) {
          onFullyVisible();
        } else {
          onPartlyOrNotVisible();
        }
      });
    },
    { threshold: 1.0 }
  );
  observer.observe(panel);
  currentObserver = observer;
}

function buildYoutubeVideo(mount, youtubeId) {
  const poster = document.createElement('img');
  poster.className = 'video-poster';
  poster.alt = 'Video preview frame';
  poster.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  const playBtn = document.createElement('button');
  playBtn.className = 'play-btn';
  playBtn.type = 'button';
  playBtn.setAttribute('aria-label', 'Play video');
  playBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="56" height="56"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';

  const frame = document.createElement('div');
  frame.className = 'video-frame';
  frame.hidden = true;

  mount.appendChild(poster);
  mount.appendChild(playBtn);
  mount.appendChild(frame);

  playBtn.addEventListener('click', async () => {
    poster.hidden = true;
    playBtn.hidden = true;

    await loadYouTubeApi();
    frame.innerHTML = '<div id="yt-player"></div>';
    frame.hidden = false;

    ytPlayer = new YT.Player('yt-player', {
      videoId: youtubeId,
      playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: () => {
          watchPanelVisibility(
            () => ytPlayer && ytPlayer.playVideo(),
            () => ytPlayer && ytPlayer.pauseVideo()
          );
        },
      },
    });
  });
}

function buildFileVideo(mount, src) {
  const video = document.createElement('video');
  video.src = src;
  video.controls = true;
  video.preload = 'metadata';
  video.playsInline = true;

  let started = false;
  video.addEventListener('play', () => {
    started = true;
  });

  mount.appendChild(video);

  watchPanelVisibility(
    () => {
      if (started) video.play();
    },
    () => {
      if (started) video.pause();
    }
  );
}

function renderEpisode(episode) {
  teardownVideo();

  const mount = document.getElementById('video-mount');
  mount.innerHTML = '';

  if (episode.video.type === 'youtube') {
    buildYoutubeVideo(mount, episode.video.youtubeId);
  } else if (episode.video.type === 'file') {
    buildFileVideo(mount, episode.video.src);
  }

  const performanceEl = document.getElementById('intro-performance');
  if (episode.intro.performance) {
    performanceEl.textContent = episode.intro.performance;
    performanceEl.hidden = false;
  } else {
    performanceEl.textContent = '';
    performanceEl.hidden = true;
  }

  document.getElementById('intro-personal').textContent = episode.intro.personal;
  document.getElementById('intro-watch').textContent = episode.intro.watch;
  document.getElementById('hero-caption').textContent = episode.meta || '';

  document.querySelectorAll('.archive-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.episodeId === episode.id);
  });
}

function renderArchiveList(episodeList) {
  const section = document.getElementById('archive-section');
  const list = document.getElementById('archive-list');
  list.innerHTML = '';

  section.hidden = episodeList.length <= 1;

  episodeList.forEach((episode) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'archive-item';
    btn.textContent = episode.label;
    btn.dataset.episodeId = episode.id;
    btn.addEventListener('click', () => renderEpisode(episode));
    list.appendChild(btn);
  });
}

function renderContent(data) {
  const episodes = data.episodes;
  const current = episodes.find((e) => e.current) || episodes[0];
  renderArchiveList(episodes);
  renderEpisode(current);
}

async function init() {
  const res = await fetch('/api/content', { cache: 'no-store' });
  const data = await res.json();
  renderContent(data);
  main.hidden = false;
}
init();
