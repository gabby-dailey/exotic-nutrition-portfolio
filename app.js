const lockScreen = document.getElementById('lock-screen');
const main = document.getElementById('main');
const lockForm = document.getElementById('lock-form');
const lockError = document.getElementById('lock-error');
const codeInput = document.getElementById('access-code');

let ytPlayer = null;
let ytPlayerReady = false;

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

function watchVisibilityForPlayback() {
  const panel = document.getElementById('video-panel');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!ytPlayerReady || !ytPlayer) return;
        if (entry.intersectionRatio >= 0.999) {
          ytPlayer.playVideo();
        } else {
          ytPlayer.pauseVideo();
        }
      });
    },
    { threshold: 1.0 }
  );
  observer.observe(panel);
}

async function startVideo(youtubeId) {
  await loadYouTubeApi();

  const frame = document.getElementById('video-frame');
  frame.innerHTML = '<div id="yt-player"></div>';
  frame.hidden = false;

  ytPlayer = new YT.Player('yt-player', {
    videoId: youtubeId,
    playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: () => {
        ytPlayerReady = true;
        watchVisibilityForPlayback();
      },
    },
  });
}

function renderContent(data) {
  const placeholder = document.getElementById('video-placeholder');
  const poster = document.getElementById('video-poster');
  const playBtn = document.getElementById('play-btn');

  const youtubeId = data.video && data.video.youtubeId;
  if (youtubeId) {
    poster.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
    poster.hidden = false;
    playBtn.hidden = false;
    placeholder.hidden = true;

    playBtn.addEventListener('click', () => {
      poster.hidden = true;
      playBtn.hidden = true;
      startVideo(youtubeId);
    });
  }

  const intro = data.intro;
  document.getElementById('intro-performance').textContent = intro.performance;
  document.getElementById('intro-personal').textContent = intro.personal;
  document.getElementById('intro-watch').textContent = intro.watch;

  const ep = data.episode;
  document.getElementById('ep-personality').textContent = ep.personality;
  document.getElementById('ep-premise').textContent = ep.premise;
  document.getElementById('ep-moment').textContent = ep.comedicMoment;
  document.getElementById('ep-cta').textContent = ep.cta;

  const productList = document.getElementById('ep-products');
  productList.innerHTML = '';
  ep.productTieIn.forEach((product) => {
    const li = document.createElement('li');
    li.textContent = product;
    productList.appendChild(li);
  });
}

async function tryLoadContent() {
  try {
    const res = await fetch('/api/content', { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    renderContent(data);
    return true;
  } catch {
    return false;
  }
}

async function init() {
  const authed = await tryLoadContent();
  if (authed) {
    lockScreen.hidden = true;
    main.hidden = false;
  }
}
init();

lockForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  lockError.hidden = true;
  const code = codeInput.value.trim();

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (res.ok) {
    const authed = await tryLoadContent();
    if (authed) {
      lockScreen.hidden = true;
      main.hidden = false;
      return;
    }
  }

  lockError.hidden = false;
  codeInput.value = '';
  codeInput.focus();
});
