// State
let soundboards = [];
let selectedSoundboardId = null;

// DOM Elements
const soundboardsPage = document.getElementById('soundboardsPage');
const soundboardDetailPage = document.getElementById('soundboardDetailPage');
const soundboardsList = document.getElementById('soundboardsList');
const audiosGrid = document.getElementById('audiosGrid');
const emptyAudiosText = document.getElementById('emptyAudiosText');
const addSoundboardBtn = document.getElementById('addSoundboardBtn');
const addAudioBtn = document.getElementById('addAudioBtn');
const audioFileInput = document.getElementById('audioFileInput');
const backToSoundboardsBtn = document.getElementById('backToSoundboardsBtn');
const soundboardNameTitle = document.getElementById('soundboardName');
const pageTitle = document.getElementById('pageTitle');

// Generate unique ID
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Save/load localStorage
function saveState() {
  localStorage.setItem('darkSoundboards', JSON.stringify({ soundboards, selectedSoundboardId }));
}

function loadState() {
  const data = localStorage.getItem('darkSoundboards');
  if (data) {
    const parsed = JSON.parse(data);
    soundboards = parsed.soundboards || [];
    selectedSoundboardId = parsed.selectedSoundboardId || null;
  } else {
    // No starter soundboard created here as per your request
    soundboards = [];
    selectedSoundboardId = null;
    saveState();
  }
}

// Render soundboards list
function renderSoundboards() {
  soundboardsList.innerHTML = '';
  if (soundboards.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No soundboards yet. Click 📁 to add one.';
    li.style.fontStyle = 'italic';
    li.style.color = '#888';
    li.style.cursor = 'default';
    soundboardsList.appendChild(li);
    return;
  }
  soundboards.forEach(sb => {
    const li = document.createElement('li');
    li.textContent = sb.name;
    li.className = sb.id === selectedSoundboardId ? 'selected' : '';
    li.onclick = () => {
      selectedSoundboardId = sb.id;
      saveState();
      openSoundboardDetail();
    };
    soundboardsList.appendChild(li);
  });
}

// Render audios grid for selected soundboard
function renderAudios() {
  audiosGrid.innerHTML = '';
  const sb = soundboards.find(s => s.id === selectedSoundboardId);
  if (!sb) return;

  soundboardNameTitle.textContent = sb.name;

  if (!sb.sounds || sb.sounds.length === 0) {
    emptyAudiosText.classList.remove('hidden');
  } else {
    emptyAudiosText.classList.add('hidden');
    sb.sounds.forEach(sound => {
      const btn = document.createElement('button');
      btn.className = 'button-sound';
      btn.innerHTML = headphoneSVG() + `<span>${sound.name}</span>`;
      btn.onclick = () => playAudio(sound);
      audiosGrid.appendChild(btn);
    });
  }
}

// Headphone SVG icon
function headphoneSVG() {
  return `
    <svg class="headphone-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="40" height="40" fill="white">
      <path d="M12 1a9 9 0 0 0-9 9v5a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H6v-2a6 6 0 0 1 12 0v2h-1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1a3 3 0 0 0 3-3v-5a9 9 0 0 0-9-9z"/>
    </svg>
  `;
}

// Play audio with restart-on-repeat behavior
const playingAudios = {};

function playAudio(sound) {
  if (playingAudios[sound.id]) {
    playingAudios[sound.id].currentTime = 0;
    playingAudios[sound.id].play();
  } else {
    const audio = new Audio(sound.audioData);
    playingAudios[sound.id] = audio;
    audio.play();
    audio.onended = () => {
      delete playingAudios[sound.id];
    };
  }
}

// Open soundboard detail page
function openSoundboardDetail() {
  pageTitle.textContent = 'Audios';
  soundboardsPage.classList.add('hidden');
  soundboardDetailPage.classList.remove('hidden');
  renderAudios();
}

// Back to soundboards list
backToSoundboardsBtn.onclick = () => {
  pageTitle.textContent = 'Soundboards';
  soundboardDetailPage.classList.add('hidden');
  soundboardsPage.classList.remove('hidden');
  selectedSoundboardId = null;
  saveState();
  renderSoundboards();
};

// Add new soundboard
addSoundboardBtn.onclick = () => {
  const name = prompt('Enter soundboard name:');
  if (!name) return;
  soundboards.push({ id: generateId(), name, sounds: [] });
  saveState();
  renderSoundboards();
};

// Add audio files to selected soundboard
addAudioBtn.onclick = () => {
  audioFileInput.click();
};

audioFileInput.onchange = async (e) => {
  const files = e.target.files;
  if (!files.length) return;
  const sb = soundboards.find(s => s.id === selectedSoundboardId);
  if (!sb) return alert('No soundboard selected.');

  for (const file of files) {
    const base64 = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
    sb.sounds.push({ id: generateId(), name: file.name, audioData: base64 });
  }
  saveState();
  renderAudios();
  e.target.value = '';
};

// Initial load
loadState();
renderSoundboards();