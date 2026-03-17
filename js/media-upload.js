/* ──────────── MEDIA STORE ──────────── */
const store = { photos: [], videos: [] };

function fmt(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

/* Drag & drop for both zones */
['photo', 'video'].forEach(type => {
  const drop = document.getElementById(type + '-drop');
  const input = document.getElementById(type + '-input');
  if (!drop || !input) return;

  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
  drop.addEventListener('drop', e => {
    e.preventDefault(); drop.classList.remove('drag-over');
    handleFiles([...e.dataTransfer.files], type + 's');
  });
  input.addEventListener('change', e => {
    handleFiles([...e.target.files], type + 's');
    e.target.value = '';
  });
});

function handleFiles(files, type) {
  files.forEach(file => {
    const isPhoto = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (type === 'photos' && !isPhoto) return;
    if (type === 'videos' && !isVideo) return;
    addToProgress(file, type);
    const reader = new FileReader();
    reader.onload = ev => {
      const item = { id: Date.now() + '_' + Math.random(), name: file.name, size: file.size, url: ev.target.result, type };
      store[type].push(item);
      updateCount(type);
      renderGrid(type);
    };
    reader.readAsDataURL(file);
  });
}

function addToProgress(file, type) {
  const pId = type === 'photos' ? 'photo-progress' : 'video-progress';
  const pWrap = document.getElementById(pId);
  if (!pWrap) return;
  const div = document.createElement('div');
  div.className = 'up-item';
  const icon = type === 'photos'
    ? `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
    : `<svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;
  div.innerHTML = `
    <div class="up-icon">${icon}</div>
    <div class="up-info">
      <div class="up-name">${file.name}</div>
      <div class="up-bar-wrap"><div class="up-bar"></div></div>
    </div>
    <div class="up-status">Yükleniyor</div>`;
  pWrap.appendChild(div);
  const bar = div.querySelector('.up-bar');
  const status = div.querySelector('.up-status');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18 + 8;
    if (p >= 100) {
      p = 100;
      clearInterval(iv);
      status.textContent = 'Tamamlandı';
      status.classList.add('done');
      setTimeout(() => div.style.transition = 'opacity .4s', 50);
      setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 400); }, 2000);
    }
    bar.style.width = p + '%';
  }, 120);
}

function updateCount(type) {
  const count = store[type].length;
  const el = document.getElementById(type === 'photos' ? 'photo-count' : 'video-count');
  if (el) el.textContent = count;
}

function getPlaceholderHTML(type) {
  if (type === 'photos') {
    return '<div class="media-thumb-placeholder ph-1"></div><div class="media-thumb-placeholder ph-2"></div><div class="media-thumb-placeholder ph-3"></div><div class="media-thumb-placeholder ph-4"></div><div class="media-thumb-placeholder ph-5"></div><div class="media-thumb-placeholder ph-6"></div><div class="media-thumb-placeholder ph-7"></div><div class="media-thumb-placeholder ph-8"></div>';
  }
  return '<div class="media-thumb-placeholder pv-1"></div><div class="media-thumb-placeholder pv-2"></div><div class="media-thumb-placeholder pv-3"></div><div class="media-thumb-placeholder pv-4"></div><div class="media-thumb-placeholder pv-5"></div><div class="media-thumb-placeholder pv-6"></div>';
}

function renderGrid(type) {
  const grid = document.getElementById(type === 'photos' ? 'photo-grid' : 'video-grid');
  if (!grid) return;
  const empty = grid.querySelector('.media-empty');
  if (empty) empty.remove();
  grid.querySelectorAll('.media-thumb-placeholder').forEach(el => el.remove());

  const item = store[type][store[type].length - 1];
  const thumb = document.createElement('div');
  thumb.className = 'media-thumb';
  thumb.dataset.id = item.id;
  thumb.dataset.type = type;

  let mediaEl;
  if (type === 'photos') {
    mediaEl = `<img src="${item.url}" alt="${item.name}" loading="lazy"/>`;
  } else {
    mediaEl = `<video src="${item.url}" preload="metadata" muted></video>
    <div class="thumb-play"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg></div>`;
  }
  thumb.innerHTML = `
    ${mediaEl}
    <span class="thumb-type-badge">${type === 'photos' ? 'Fotoğraf' : 'Video'}</span>
    <div class="thumb-overlay">
      <div class="thumb-name">${item.name}</div>
      <div class="thumb-size">${fmt(item.size)}</div>
    </div>
    <button class="thumb-del" data-id="${item.id}" data-type="${type}" aria-label="Sil">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;

  thumb.addEventListener('click', e => {
    if (e.target.closest('.thumb-del')) return;
    const idx = store[type].findIndex(i => i.id === item.id);
    openLightbox(type, idx);
  });
  thumb.querySelector('.thumb-del').addEventListener('click', e => {
    e.stopPropagation();
    deleteMedia(item.id, type);
    thumb.style.transition = 'opacity .35s, transform .35s';
    thumb.style.opacity = '0';
    thumb.style.transform = 'scale(.9)';
    setTimeout(() => { thumb.remove(); checkEmpty(type); }, 350);
  });

  grid.appendChild(thumb);
  /* Cursor triggers handled in main.js generically or via re-attaching if needed */
}

function deleteMedia(id, type) {
  const idx = store[type].findIndex(i => i.id === id);
  if (idx > -1) { store[type].splice(idx, 1); updateCount(type); }
}

function checkEmpty(type) {
  const grid = document.getElementById(type === 'photos' ? 'photo-grid' : 'video-grid');
  if (!grid) return;
  if (!grid.querySelector('.media-thumb')) {
    grid.innerHTML = getPlaceholderHTML(type);
  }
}

/* ──────────── LIGHTBOX ──────────── */
const lb = document.getElementById('lightbox');
const lbContent = document.getElementById('lb-content');
let lbType = '', lbIdx = 0;

function openLightbox(type, idx) {
  if (!lb) return;
  lbType = type; lbIdx = idx;
  renderLightbox();
  lb.classList.add('open');
}

function renderLightbox() {
  const item = store[lbType][lbIdx];
  if (!item || !lbContent) return;
  lbContent.innerHTML = '';
  if (lbType === 'photos') {
    const img = document.createElement('img');
    img.src = item.url; img.alt = item.name;
    lbContent.appendChild(img);
  } else {
    const vid = document.createElement('video');
    vid.src = item.url; vid.controls = true; vid.autoplay = true;
    vid.style.maxWidth = '88vw'; vid.style.maxHeight = '78vh';
    lbContent.appendChild(vid);
  }
  const cap = document.createElement('div');
  cap.className = 'lb-caption';
  cap.textContent = `${item.name}  ·  ${fmt(item.size)}  ·  ${lbIdx + 1} / ${store[lbType].length}`;
  lbContent.appendChild(cap);
}

if (lb) {
  const closeBtn = document.getElementById('lb-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      lb.classList.remove('open');
      const vid = lbContent.querySelector('video');
      if (vid) { vid.pause(); vid.src = ''; }
    });
  }

  const prevBtn = document.getElementById('lb-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (store[lbType].length === 0) return;
      lbIdx = (lbIdx - 1 + store[lbType].length) % store[lbType].length;
      const vid = lbContent.querySelector('video'); if (vid) { vid.pause(); vid.src = ''; }
      renderLightbox();
    });
  }

  const nextBtn = document.getElementById('lb-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (store[lbType].length === 0) return;
      lbIdx = (lbIdx + 1) % store[lbType].length;
      const vid = lbContent.querySelector('video'); if (vid) { vid.pause(); vid.src = ''; }
      renderLightbox();
    });
  }

  lb.addEventListener('click', e => {
    if (e.target === lb) {
      lb.classList.remove('open');
      const vid = lbContent.querySelector('video'); if (vid) { vid.pause(); vid.src = ''; }
    }
  });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') {
      lb.classList.remove('open');
      const vid = lbContent.querySelector('video'); if (vid) { vid.pause(); vid.src = ''; }
    }
    if (e.key === 'ArrowLeft') document.getElementById('lb-prev').click();
    if (e.key === 'ArrowRight') document.getElementById('lb-next').click();
  });
}

/* ──────────── TABS ──────────── */
document.querySelectorAll('.mtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.upload-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('pane-' + tab.dataset.tab);
    if (target) target.classList.add('active');
  });
});
