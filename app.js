const lockScreen = document.getElementById('lock-screen');
const main = document.getElementById('main');
const lockForm = document.getElementById('lock-form');
const lockError = document.getElementById('lock-error');
const codeInput = document.getElementById('access-code');

function renderContent(data) {
  const placeholder = document.getElementById('video-placeholder');
  const frame = document.getElementById('video-frame');

  if (data.video && data.video.youtubeId) {
    frame.innerHTML =
      `<iframe src="https://www.youtube.com/embed/${data.video.youtubeId}" ` +
      `title="Exotic Nutrition Episode 3" allow="accelerometer; autoplay; clipboard-write; ` +
      `encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    frame.hidden = false;
    placeholder.hidden = true;
  }

  const ep = data.episode;
  document.getElementById('ep-guest').textContent = ep.guest;
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

// Curtain reveal
const stage = document.getElementById('stage');
const revealBtn = document.getElementById('reveal-btn');
revealBtn.addEventListener('click', () => {
  stage.classList.add('open');
});

// Feedback notes
const notesForm = document.getElementById('notes-form');
const notesText = document.getElementById('notes-text');
const notesConfirm = document.getElementById('notes-confirm');
const notesReset = document.getElementById('notes-reset');

notesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = notesText.value.trim();
  if (!message) return;

  await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'notes', message }),
  });

  notesForm.hidden = true;
  notesConfirm.hidden = false;
});

notesReset.addEventListener('click', () => {
  notesText.value = '';
  notesForm.hidden = false;
  notesConfirm.hidden = true;
});

// Approval
const approveBtn = document.getElementById('approve-btn');
const approveConfirm = document.getElementById('approve-confirm');

approveBtn.addEventListener('click', async () => {
  approveBtn.disabled = true;

  await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'approved' }),
  });

  approveBtn.hidden = true;
  approveConfirm.hidden = false;
});
