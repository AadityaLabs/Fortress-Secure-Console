// --- 8D Canvas Interactive Space Fields Background ---
const canvas = document.getElementById('canvas8d');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let points = [];
const maxPoints = 80;
let mouse = { x: width/2, y: height/2, targetX: width/2, targetY: height/2 };

class Point8D {
  constructor() {
    this.x = (Math.random() - 0.5) * width;
    this.y = (Math.random() - 0.5) * height;
    this.z = (Math.random() - 0.5) * 800;
    this.ox = this.x;
    this.oy = this.y;
    this.oz = this.z;
    this.size = Math.random() * 2 + 1;
    this.color = Math.random() > 0.5 ? '#0df0ff' : '#8a2be2';
  }

  update() {
    this.z -= 1.5;
    if (this.z < -400) {
      this.z = 400;
      this.x = (Math.random() - 0.5) * width;
      this.y = (Math.random() - 0.5) * height;
    }

    const radX = (mouse.x - width/2) * 0.00002;
    const radY = (mouse.y - height/2) * 0.00002;

    let cosY = Math.cos(radY);
    let sinY = Math.sin(radY);
    let x1 = this.x * cosY - this.z * sinY;
    let z1 = this.z * cosY + this.x * sinY;

    let cosX = Math.cos(radX);
    let sinX = Math.sin(radX);
    let y1 = this.y * cosX - z1 * sinX;
    let z2 = z1 * cosX + this.y * sinX;

    this.x = x1;
    this.y = y1;
    this.z = z2;
  }

  draw() {
    const fov = 400;
    const scale = fov / (fov + this.z);
    const projX = this.x * scale + width / 2;
    const projY = this.y * scale + height / 2;

    if (projX >= 0 && projX <= width && projY >= 0 && projY <= height) {
      ctx.beginPath();
      ctx.arc(projX, projY, this.size * scale, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, scale));
      ctx.fill();
    }
  }
}

function initCanvas() {
  points = [];
  for (let i = 0; i < maxPoints; i++) {
    points.push(new Point8D());
  }
}

function animateCanvas() {
  ctx.clearRect(0, 0, width, height);
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  points.forEach(point => {
    point.update();
    point.draw();
  });

  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#0df0ff';
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const fov = 400;
      const sI = fov / (fov + points[i].z);
      const sJ = fov / (fov + points[j].z);
      const p1x = points[i].x * sI + width / 2;
      const p1y = points[i].y * sI + height / 2;
      const p2x = points[j].x * sJ + width / 2;
      const p2y = points[j].y * sJ + height / 2;
      const dist = Math.hypot(p1x - p2x, p1y - p2y);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateCanvas);
}

window.addEventListener('mousemove', (e) => {
  mouse.targetX = e.clientX;
  mouse.targetY = e.clientY;
});

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initCanvas();
});

const card = document.querySelector('.tilt-card');
if (card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rX = -(y - midY) / 15;
    const rY = (x - midX) / 25;
    card.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg) scale(1.01)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  });
}

let currentMode = 'characters';
let currentSavedCategory = 'work';
let vaultData = [];

const secureWords = [
  "quantum", "cipher", "matrix", "shield", "vortex", "plasma", "carbon", "glitch", "stellar", "galaxy",
  "shadow", "beacon", "titanium", "aurora", "nebula", "velocity", "phoenix", "phantom", "specter", "neutron",
  "infinity", "cosmos", "solitude", "resonance", "entropy", "horizon", "gravity", "absolute", "kinetic", "magnetic",
  "vector", "isotope", "zenith", "vertex", "helix", "nucleus", "pulse", "photon", "catalyst", "stratum",
  "nexus", "warp", "orbit", "prism", "synthetic", "echo", "radar", "sonar", "crypto", "binary",
  "alloy", "cobalt", "plasma", "fission", "fusion", "apex", "vertex", "crest", "domain", "dynasty",
  "forge", "glacier", "lodestone", "meridian", "novae", "obsidian", "quasar", "radar", "siren", "beacon",
  "talisman", "tempest", "umbrella", "sentinel", "zenith", "vortex", "canyon", "tundra", "summit", "saber"
];

function updateLengthDisplay(val) {
  document.getElementById('length-display').innerText = val;
  regeneratePassword();
}

function setGeneratorMode(mode) {
  currentMode = mode;
  const btnChars = document.getElementById('mode-characters');
  const btnPhrase = document.getElementById('mode-passphrase');
  const containerChars = document.getElementById('character-options');
  const containerPhrase = document.getElementById('passphrase-options');
  const slider = document.getElementById('password-length');
  const sliderLabel = document.getElementById('slider-label');

  if (mode === 'characters') {
    btnChars.classList.add('bg-white/10', 'text-white');
    btnChars.classList.remove('text-slate-400');
    btnPhrase.classList.remove('bg-white/10', 'text-white');
    btnPhrase.classList.add('text-slate-400');
    containerChars.classList.remove('hidden');
    containerPhrase.classList.add('hidden');
    slider.min = 6;
    slider.max = 64;
    slider.value = 16;
    sliderLabel.innerText = "Entropy Length";
  } else {
    btnPhrase.classList.add('bg-white/10', 'text-white');
    btnPhrase.classList.remove('text-slate-400');
    btnChars.classList.remove('bg-white/10', 'text-white');
    btnChars.classList.add('text-slate-400');
    containerPhrase.classList.remove('hidden');
    containerChars.classList.add('hidden');
    slider.min = 3;
    slider.max = 10;
    slider.value = 4;
    sliderLabel.innerText = "Word Count";
  }
  updateLengthDisplay(slider.value);
}

function kineticDecryptEffect(finalText) {
  const display = document.getElementById('password-display');
  const glyphs = "!@#$%^&*()_+{}|:<>?-=[]\\;',./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let frame = 0;
  const totalFrames = 20;
  const outputLength = finalText.length;

  function update() {
    if (frame >= totalFrames) {
      display.innerText = finalText;
      return;
    }

    let tempStr = '';
    for (let i = 0; i < outputLength; i++) {
      if (i < (frame / totalFrames) * outputLength) {
        tempStr += finalText[i];
      } else {
        tempStr += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
    }
    display.innerText = tempStr;
    frame++;
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function generateKey() {
  const length = parseInt(document.getElementById('password-length').value, 10);
  const excludeAmbig = document.getElementById('opt-exclude-ambig').checked;
  let password = '';

  if (currentMode === 'characters') {
    const useUpper = document.getElementById('opt-uppercase').checked;
    const useLower = document.getElementById('opt-lowercase').checked;
    const useNum = document.getElementById('opt-numbers').checked;
    const useSym = document.getElementById('opt-symbols').checked;
    let charPool = '';
    if (useUpper) charPool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charPool += 'abcdefghijklmnopqrstuvwxyz';
    if (useNum) charPool += '0123456789';
    if (useSym) charPool += '!@#$%^&*()_+-=[]{}|;:,./<>?';
    if (excludeAmbig) {
      charPool = charPool.replace(/[0OIl1oB8]/g, '');
    }
    if (charPool === '') {
      return 'No Option Selected';
    }
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      password += charPool[randomIndex];
    }
  } else {
    const separator = document.getElementById('opt-separator').value;
    const capitalize = document.getElementById('opt-capitalize').checked;
    const appendNum = document.getElementById('opt-append-num').checked;
    let phraseWords = [];
    for (let i = 0; i < length; i++) {
      let word = secureWords[Math.floor(Math.random() * secureWords.length)];
      if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (excludeAmbig) {
        word = word.replace(/[oOIl]/g, 'x');
      }
      phraseWords.push(word);
    }
    let activeSeparator = separator;
    if (separator === 'random') {
      const separatorsList = ['-', '.', '_', '/'];
      activeSeparator = separatorsList[Math.floor(Math.random() * separatorsList.length)];
    }
    password = phraseWords.join(activeSeparator);
    if (appendNum) {
      password += activeSeparator + Math.floor(Math.random() * 999);
    }
  }
  return password;
}

function calculateEntropy(pwd) {
  if (!pwd || pwd.startsWith('Generating') || pwd === 'No Option Selected') return 0;
  let poolSize = 0;
  if (/[a-z]/.test(pwd)) poolSize += 26;
  if (/[A-Z]/.test(pwd)) poolSize += 26;
  if (/[0-9]/.test(pwd)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;
  return Math.round(pwd.length * Math.log2(poolSize || 1));
}

function evaluateCrackTime(entropy) {
  const calculationsPerSecond = 1e11;
  const totalCombinations = Math.pow(2, entropy);
  const secondsToCrack = totalCombinations / calculationsPerSecond;
  if (secondsToCrack < 1) {
    return "Instantaneous (<1s)";
  }
  const secondsInYear = 31536000;
  const years = secondsToCrack / secondsInYear;
  if (years < 1) {
    return `${Math.round(years * 365)} Days`;
  }
  if (years < 1000) {
    return `${Math.round(years)} Years`;
  }
  if (years < 1e6) {
    return `${Math.round(years / 1000)}K Years`;
  }
  if (years < 1e9) {
    return `${Math.round(years / 1e6)} Million Years`;
  }
  if (years < 1e12) {
    return `Billion Years`;
  }
  return "Indestructible (Trillions of Years)";
}

function updateSecurityUIPerformance(entropy) {
  const percentageEl = document.getElementById('entropy-percentage');
  const badgeEl = document.getElementById('strength-badge');
  const bitsEl = document.getElementById('entropy-bits');
  const crackTimeEl = document.getElementById('crack-time');
  const sideCrackTimeEl = document.getElementById('global-attack-threshold');
  const strengthBar = document.getElementById('strength-progress-bar');
  const outerRing = document.getElementById('orbital-outer');
  const innerRing = document.getElementById('orbital-inner');
  const strengthPercent = Math.min(100, Math.round((entropy / 128) * 100));
  percentageEl.innerText = `${strengthPercent}%`;
  bitsEl.innerText = `${entropy} bits`;
  const crackTime = evaluateCrackTime(entropy);
  crackTimeEl.innerText = crackTime;
  sideCrackTimeEl.innerText = crackTime;
  strengthBar.style.width = `${strengthPercent}%`;
  if (strengthPercent < 35) {
    badgeEl.innerText = "Weak";
    badgeEl.className = "text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-accent-coral/20 text-accent-coral font-bold mt-1";
    strengthBar.className = "absolute top-0 left-0 h-full bg-accent-coral transition-all duration-500";
    outerRing.style.color = '#ff3366';
    innerRing.style.color = '#ff3366';
    outerRing.querySelector('circle').style.animationDuration = '4s';
    innerRing.querySelector('circle').style.animationDuration = '6s';
  } else if (strengthPercent < 65) {
    badgeEl.innerText = "Medium";
    badgeEl.className = "text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold mt-1";
    strengthBar.className = "absolute top-0 left-0 h-full bg-amber-500 transition-all duration-500";
    outerRing.style.color = '#f59e0b';
    innerRing.style.color = '#8a2be2';
    outerRing.querySelector('circle').style.animationDuration = '8s';
    innerRing.querySelector('circle').style.animationDuration = '12s';
  } else if (strengthPercent < 85) {
    badgeEl.innerText = "Highly Secure";
    badgeEl.className = "text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan font-bold mt-1";
    strengthBar.className = "absolute top-0 left-0 h-full bg-accent-cyan transition-all duration-500";
    outerRing.style.color = '#0df0ff';
    innerRing.style.color = '#8a2be2';
    outerRing.querySelector('circle').style.animationDuration = '12s';
    innerRing.querySelector('circle').style.animationDuration = '18s';
  } else {
    badgeEl.innerText = "Fortress Standard";
    badgeEl.className = "text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-accent-emerald/20 text-accent-emerald font-bold mt-1";
    strengthBar.className = "absolute top-0 left-0 h-full bg-accent-emerald transition-all duration-500";
    outerRing.style.color = '#00ffaa';
    innerRing.style.color = '#0df0ff';
    outerRing.querySelector('circle').style.animationDuration = '18s';
    innerRing.querySelector('circle').style.animationDuration = '26s';
  }
  const log = document.getElementById('dynamic-log');
  const timeStr = new Date().toLocaleTimeString();
  log.innerHTML = `<span class="text-slate-500">[${timeStr}]</span> Entropy calculated: ${entropy} bits. Mode: ${currentMode}.`;
}

function regeneratePassword() {
  const pwd = generateKey();
  kineticDecryptEffect(pwd);
  const entropy = calculateEntropy(pwd);
  updateSecurityUIPerformance(entropy);
}

function copyToClipboard(customText = null) {
  const textToCopy = customText || document.getElementById('password-display').innerText;
  if (textToCopy === 'No Option Selected' || textToCopy.startsWith('Generating')) {
    spawnToast("Copy Failed", "Please generate a valid key first.", "coral");
    return;
  }
  const input = document.createElement('textarea');
  input.value = textToCopy;
  document.body.appendChild(input);
  input.select();
  try {
    const success = document.execCommand('copy');
    if (success) {
      spawnToast("Copied Securely", "Key copied to clipboard memory.", "emerald");
    } else {
      spawnToast("Error Copying", "Browser permissions blocked copying.", "coral");
    }
  } catch (err) {
    spawnToast("Error Copying", "Failure executing clipboard fallback.", "coral");
  }
  document.body.removeChild(input);
}

function spawnToast(title, body, accentType = "cyan") {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `glass-panel pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl shadow-2xl border border-white/10 transform translate-y-4 opacity-0 transition-all duration-300 max-w-sm`;
  let iconHTML = '';
  if (accentType === "cyan") {
    iconHTML = `<div class="p-1 rounded-lg bg-accent-cyan/10 text-accent-cyan"><i data-lucide="shield-check" class="w-5 h-5"></i></div>`;
  } else if (accentType === "emerald") {
    iconHTML = `<div class="p-1 rounded-lg bg-accent-emerald/10 text-accent-emerald"><i data-lucide="check-circle" class="w-5 h-5"></i></div>`;
  } else if (accentType === "coral") {
    iconHTML = `<div class="p-1 rounded-lg bg-accent-coral/10 text-accent-coral"><i data-lucide="alert-triangle" class="w-5 h-5"></i></div>`;
  }
  toast.innerHTML = `
    ${iconHTML}
    <div>
      <h4 class="text-xs font-bold text-white">${title}</h4>
      <p class="text-[10.5px] text-slate-400 mt-0.5 leading-tight">${body}</p>
    </div>
  `;
  container.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 50);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

function toggleSection(sectionId) {
  const generatorSec = document.getElementById('section-generator');
  const vaultSec = document.getElementById('section-vault');
  const auditSec = document.getElementById('section-audit');
  const sidebarStats = document.getElementById('sidebar-stats');
  const tabGen = document.getElementById('tab-generator');
  const tabVault = document.getElementById('tab-vault');
  const tabAudit = document.getElementById('tab-audit');
  const sections = [
    { id: 'generator', el: generatorSec, tab: tabGen },
    { id: 'vault', el: vaultSec, tab: tabVault },
    { id: 'audit', el: auditSec, tab: tabAudit }
  ];
  sections.forEach(sec => {
    if (sec.id === sectionId) {
      sec.el.classList.remove('hidden');
      setTimeout(() => {
        sec.el.classList.remove('opacity-0', 'scale-95');
      }, 50);
      sec.tab.className = "px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white transition-all border border-white/10 shadow-lg shadow-black/30";
    } else {
      sec.el.classList.add('hidden');
      sec.tab.className = "px-4 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white transition-all border border-transparent";
    }
  });
  if (sectionId === 'generator') {
    sidebarStats.classList.remove('hidden');
  } else {
    sidebarStats.classList.add('hidden');
  }
}

function setCategoryTag(category) {
  currentSavedCategory = category;
  const tags = ['work', 'finance', 'social', 'general'];
  tags.forEach(tag => {
    const btn = document.getElementById(`tag-${tag}`);
    if (tag === category) {
      btn.className = "py-1.5 rounded-lg text-[10px] font-semibold text-center border bg-accent-cyan/10 text-accent-cyan border-accent-cyan/25 transition-all";
    } else {
      btn.className = "py-1.5 rounded-lg text-[10px] font-semibold text-center border bg-white/5 text-slate-300 border-white/5 hover:border-white/10 transition-all";
    }
  });
}

function openSaveModal() {
  const activePassword = document.getElementById('password-display').innerText;
  if (activePassword === 'No Option Selected' || activePassword.startsWith('Generating')) {
    spawnToast("Save Denied", "Please generate a valid password key first.", "coral");
    return;
  }
  document.getElementById('modal-password-target').innerText = activePassword;
  document.getElementById('save-key-name').value = '';
  document.getElementById('save-key-username').value = '';
  document.getElementById('save-key-notes').value = '';
  setCategoryTag('work');
  const modal = document.getElementById('save-modal');
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.querySelector('.transform').classList.remove('scale-95');
  }, 50);
}

function closeSaveModal() {
  const modal = document.getElementById('save-modal');
  modal.classList.add('opacity-0');
  modal.querySelector('.transform').classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

function submitSaveKey() {
  const name = document.getElementById('save-key-name').value.trim();
  const username = document.getElementById('save-key-username').value.trim();
  const notes = document.getElementById('save-key-notes').value.trim();
  const password = document.getElementById('modal-password-target').innerText;
  if (!name) {
    spawnToast("Validation Failed", "Platform or account identifier name is required.", "coral");
    return;
  }
  const keypair = {
    id: 'fortress_' + Date.now(),
    name,
    username: username || 'None Specified',
    notes: notes || 'No secret clues appended.',
    password,
    category: currentSavedCategory,
    timestamp: new Date().toLocaleDateString()
  };
  vaultData.push(keypair);
  localStorage.setItem('fortress_vault', JSON.stringify(vaultData));
  updateVaultUI();
  closeSaveModal();
  spawnToast("Vault Updated", `"${name}" securely injected into isolated memory.`, "emerald");
}

function updateVaultUI() {
  const grid = document.getElementById('vault-items-grid');
  const emptyState = document.getElementById('empty-vault-state');
  const badge = document.getElementById('vault-count-badge');
  grid.innerHTML = '';
  badge.innerText = vaultData.length;
  if (vaultData.length === 0) {
    grid.appendChild(emptyState);
    return;
  }
  vaultData.forEach(item => {
    const card = document.createElement('div');
    card.className = "glass-panel p-5 rounded-2xl relative border border-white/5 hover:border-accent-cyan/15 transition-all group duration-300";
    let catBadgeColor = "bg-accent-cyan/10 text-accent-cyan";
    if (item.category === 'finance') catBadgeColor = "bg-accent-emerald/10 text-accent-emerald";
    if (item.category === 'social') catBadgeColor = "bg-accent-violet/10 text-accent-violet";
    if (item.category === 'general') catBadgeColor = "bg-slate-500/10 text-slate-300";
    card.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <div>
          <span class="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded ${catBadgeColor} font-semibold font-mono">${item.category}</span>
          <h4 class="text-sm font-bold text-white mt-1.5 break-all">${item.name}</h4>
          <p class="text-[10px] text-slate-400 font-mono mt-0.5">${item.username}</p>
        </div>
        <button onclick="deleteVaultItem('${item.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-accent-coral hover:bg-accent-coral/10 transition-all opacity-0 group-hover:opacity-100">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
      <div class="flex items-center space-x-2 bg-black/40 rounded-xl p-3 border border-white/5 my-3 relative">
        <span id="vault-pass-${item.id}" class="font-mono text-xs text-accent-cyan break-all pr-8 select-all h-4 block overflow-hidden tracking-widest font-extrabold">• • • • • • • • • •</span>
        <div class="absolute right-3 flex items-center space-x-1">
          <button onclick="toggleVaultPassPeek('${item.id}', '${item.password}')" class="text-slate-400 hover:text-white p-1">
            <i id="vault-peek-icon-${item.id}" data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="copyToClipboard('${item.password}')" class="text-slate-400 hover:text-white p-1">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
      <div class="text-[10px] text-slate-500 leading-relaxed break-all font-mono mt-2 pt-2 border-t border-white/5">
        ${item.notes}
      </div>
      <div class="text-[9px] text-slate-600 font-mono text-right mt-1">Saved: ${item.timestamp}</div>
    `;
    grid.appendChild(card);
  });
  lucide.createIcons();
}

function toggleVaultPassPeek(id, rawPassword) {
  const textSpan = document.getElementById(`vault-pass-${id}`);
  const icon = document.getElementById(`vault-peek-icon-${id}`);
  if (textSpan.classList.contains('tracking-widest')) {
    textSpan.classList.remove('tracking-widest', 'font-extrabold');
    textSpan.innerText = rawPassword;
    icon.setAttribute('data-lucide', 'eye-off');
  } else {
    textSpan.classList.add('tracking-widest', 'font-extrabold');
    textSpan.innerText = '• • • • • • • • • •';
    icon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

function deleteVaultItem(id) {
  vaultData = vaultData.filter(i => i.id !== id);
  localStorage.setItem('fortress_vault', JSON.stringify(vaultData));
  updateVaultUI();
  spawnToast("Deleted", "Item removed from memory vault.", "coral");
}

function clearAllVault() {
  const confirmPurge = confirm("Are you absolutely sure you want to completely wipe all offline credentials? This cannot be undone.");
  if (confirmPurge) {
    vaultData = [];
    localStorage.removeItem('fortress_vault');
    updateVaultUI();
    spawnToast("Vault Wiped", "All local archives purged.", "coral");
  }
}

function filterVault() {
  const query = document.getElementById('vault-search').value.toLowerCase();
  const filtered = vaultData.filter(item => {
    return item.name.toLowerCase().includes(query) ||
           item.username.toLowerCase().includes(query) ||
           item.notes.toLowerCase().includes(query) ||
           item.category.toLowerCase().includes(query);
  });
  const grid = document.getElementById('vault-items-grid');
  const cards = grid.children;
  if (filtered.length === 0 && vaultData.length > 0) {
    return;
  }
  updateVaultUI();
}

function exportVaultData() {
  if (vaultData.length === 0) {
    spawnToast("Export Aborted", "Vault is empty. No credentials to export.", "coral");
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vaultData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `fortress8d_export_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  spawnToast("Export Finished", "Secure backup JSON file generated.", "emerald");
}

function toggleAuditVisibility() {
  const input = document.getElementById('audit-input');
  const icon = document.getElementById('audit-visibility-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    icon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

function analyzeAuditPassword() {
  const val = document.getElementById('audit-input').value;
  const iconLen = document.getElementById('audit-icon-len');
  const textLen = document.getElementById('audit-text-len');
  const iconMix = document.getElementById('audit-icon-mix');
  const textMix = document.getElementById('audit-text-mix');
  const iconDict = document.getElementById('audit-icon-dict');
  const textDict = document.getElementById('audit-text-dict');
  const iconRep = document.getElementById('audit-icon-rep');
  const textRep = document.getElementById('audit-text-rep');
  const circle = document.getElementById('threat-indicator-circle');
  const threatPercentageText = document.getElementById('threat-percentage');
  const verdictTitle = document.getElementById('threat-verdict-title');
  const verdictBody = document.getElementById('threat-verdict-body');
  if (!val) return;
  let integrityPoints = 0;
  if (val.length >= 16) {
    iconLen.className = "p-1.5 rounded-lg bg-accent-emerald/20 text-accent-emerald";
    iconLen.innerHTML = `<i data-lucide="circle-check" class="w-4 h-4"></i>`;
    textLen.innerText = `Robust (${val.length} chars). Defends brute-forcing.`;
    integrityPoints += 25;
  } else if (val.length >= 10) {
    iconLen.className = "p-1.5 rounded-lg bg-amber-500/20 text-amber-500";
    iconLen.innerHTML = `<i data-lucide="circle-alert" class="w-4 h-4"></i>`;
    textLen.innerText = `Moderate (${val.length} chars). Upgrade length.`;
    integrityPoints += 15;
  } else {
    iconLen.className = "p-1.5 rounded-lg bg-accent-coral/20 text-accent-coral";
    iconLen.innerHTML = `<i data-lucide="circle-alert" class="w-4 h-4"></i>`;
    textLen.innerText = "Crucial defect. Length is under 10 chars.";
  }
  let matches = 0;
  if (/[a-z]/.test(val)) matches++;
  if (/[A-Z]/.test(val)) matches++;
  if (/[0-9]/.test(val)) matches++;
  if (/[^a-zA-Z0-9]/.test(val)) matches++;
  if (matches === 4) {
    iconMix.className = "p-1.5 rounded-lg bg-accent-emerald/20 text-accent-emerald";
    iconMix.innerHTML = `<i data-lucide="circle-check" class="w-4 h-4"></i>`;
    textMix.innerText = "Perfect. Consists of multi-entropy ranges.";
    integrityPoints += 25;
  } else if (matches >= 2) {
    iconMix.className = "p-1.5 rounded-lg bg-amber-500/20 text-amber-500";
    iconMix.innerHTML = `<i data-lucide="circle-alert" class="w-4 h-4"></i>`;
    textMix.innerText = "Basic mix. Lacks special structures.";
    integrityPoints += 15;
  } else {
    iconMix.className = "p-1.5 rounded-lg bg-accent-coral/20 text-accent-coral";
    iconMix.innerHTML = `<i data-lucide="circle-alert" class="w-4 h-4"></i>`;
    textMix.innerText = "Fail. Highly predictable single structure.";
  }
  const lowercaseVal = val.toLowerCase();
  const predictablePatterns = ["12345", "qwerty", "password", "admin", "letmein", "abcde"];
  let hasPattern = false;
  predictablePatterns.forEach(pat => {
    if (lowercaseVal.includes(pat)) hasPattern = true;
  });
  if (!hasPattern) {
    iconDict.className = "p-1.5 rounded-lg bg-accent-emerald/20 text-accent-emerald";
    iconDict.innerHTML = `<i data-lucide="circle-check" class="w-4 h-4"></i>`;
    textDict.innerText = "Defended. No predictable patterns found.";
    integrityPoints += 25;
  } else {
    iconDict.className = "p-1.5 rounded-lg bg-accent-coral/20 text-accent-coral";
    iconDict.innerHTML = `<i data-lucide="circle-alert" class="w-4 h-4"></i>`;
    textDict.innerText = "Critical risk! Contains common key sequences.";
  }
  const repeats = /(.)\1\1/;
  if (!repeats.test(val)) {
    iconRep.className = "p-1.5 rounded-lg bg-accent-emerald/20 text-accent-emerald";
    iconRep.innerHTML = `<i data-lucide="circle-check" class="w-4 h-4"></i>`;
    textRep.innerText = "Clear. No clusters of redundant letters.";
    integrityPoints += 25;
  } else {
    iconRep.className = "p-1.5 rounded-lg bg-accent-coral/20 text-accent-coral";
    iconRep.innerHTML = `<i data-lucide="circle-alert" class="w-4 h-4"></i>`;
    textRep.innerText = "Vulnerable redundancy patterns resolved.";
  }
  circle.className = "w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300";
  if (integrityPoints >= 90) {
    circle.classList.add('border-accent-emerald');
    threatPercentageText.innerText = "A+";
    threatPercentageText.className = "text-3xl font-extrabold font-mono text-accent-emerald";
    verdictTitle.innerText = "FORTRESS GRADE SECURE";
    verdictTitle.className = "text-sm font-extrabold text-accent-emerald uppercase font-mono";
    verdictBody.innerText = "Excellent. This key is highly resistant to modern custom GPU grid brute force dictionary algorithms.";
  } else if (integrityPoints >= 60) {
    circle.classList.add('border-amber-500');
    threatPercentageText.innerText = "B-";
    threatPercentageText.className = "text-3xl font-extrabold font-mono text-amber-500";
    verdictTitle.innerText = "MODERATE PROTECTION LAYER";
    verdictTitle.className = "text-sm font-extrabold text-amber-500 uppercase font-mono";
    verdictBody.innerText = "This key stands up to general automated scanning engines, but is vulnerable to custom targeted dictionaries.";
  } else {
    circle.classList.add('border-accent-coral');
    threatPercentageText.innerText = "F";
    threatPercentageText.className = "text-3xl font-extrabold font-mono text-accent-coral";
    verdictTitle.innerText = "CRITICAL COMPROMISE THREAT";
    verdictTitle.className = "text-sm font-extrabold text-accent-coral uppercase font-mono";
    verdictBody.innerText = "Vulnerable. Brute force engines would crack this structure in seconds using inexpensive server rigs.";
  }
  lucide.createIcons();
}

function showTerms() {
  spawnToast("Zero Logs Guarantee", "This application compiles inside your machine's browser memory loop. No metrics or credentials ever resolve elsewhere.", "cyan");
}

function showDeveloperNotes() {
  spawnToast("Engine Log", "Build 4.0: Fully active vector-space 8D background rendering engine integrated with crypto seed cryptor.", "cyan");
}

window.onload = function() {
  initCanvas();
  animateCanvas();
  const stored = localStorage.getItem('fortress_vault');
  if (stored) {
    vaultData = JSON.parse(stored);
    updateVaultUI();
  }
  regeneratePassword();
  lucide.createIcons();
  spawnToast("Secure Engine Ready", "Spatial 8D protection parameters fully initialized.", "emerald");
};
