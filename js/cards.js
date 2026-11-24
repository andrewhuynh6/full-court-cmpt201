// FULL COURT — Card & Pack System

function playerSVG(pos, num) {
  // Silhouette art per position
  const silhouettes = {
    PG: `<ellipse cx="45" cy="22" rx="12" ry="12" fill="currentColor"/>
         <path d="M25 55 Q35 35 45 34 Q55 35 65 55 L68 90 Q60 95 45 95 Q30 95 22 90 Z" fill="currentColor"/>
         <path d="M25 55 L10 80 L18 85 L30 65" fill="currentColor"/>
         <path d="M65 55 L80 80 L72 85 L60 65" fill="currentColor"/>
         <path d="M32 90 L28 115 L38 115 L45 100 L52 115 L62 115 L58 90" fill="currentColor"/>`,
    SG: `<ellipse cx="45" cy="22" rx="12" ry="12" fill="currentColor"/>
         <path d="M22 58 Q35 36 45 34 Q55 36 68 58 L65 92 Q55 98 45 98 Q35 98 25 92 Z" fill="currentColor"/>
         <path d="M22 58 L5 75 Q8 85 16 82 L30 65" fill="currentColor"/>
         <path d="M68 58 L85 75 Q82 85 74 82 L60 65" fill="currentColor"/>
         <path d="M30 92 L26 118 L36 118 L45 102 L54 118 L64 118 L60 92" fill="currentColor"/>`,
    SF: `<ellipse cx="45" cy="20" rx="13" ry="13" fill="currentColor"/>
         <path d="M20 56 Q34 34 45 32 Q56 34 70 56 L67 94 Q56 100 45 100 Q34 100 23 94 Z" fill="currentColor"/>
         <path d="M20 56 L4 70 Q5 82 15 80 L28 62" fill="currentColor"/>
         <path d="M70 56 L86 70 Q85 82 75 80 L62 62" fill="currentColor"/>
         <path d="M28 94 L24 120 L35 120 L45 104 L55 120 L66 120 L62 94" fill="currentColor"/>`,
    PF: `<ellipse cx="45" cy="20" rx="14" ry="14" fill="currentColor"/>
         <path d="M17 58 Q32 34 45 32 Q58 34 73 58 L70 96 Q58 102 45 102 Q32 102 20 96 Z" fill="currentColor"/>
         <path d="M17 58 L2 72 Q3 86 14 82 L26 64" fill="currentColor"/>
         <path d="M73 58 L88 72 Q87 86 76 82 L64 64" fill="currentColor"/>
         <path d="M26 96 L22 122 L34 122 L45 106 L56 122 L68 122 L64 96" fill="currentColor"/>`,
    C:  `<ellipse cx="45" cy="18" rx="15" ry="15" fill="currentColor"/>
         <path d="M14 58 Q30 32 45 30 Q60 32 76 58 L72 98 Q59 105 45 105 Q31 105 18 98 Z" fill="currentColor"/>
         <path d="M14 58 L0 70 Q0 86 12 82 L24 64" fill="currentColor"/>
         <path d="M76 58 L90 70 Q90 86 78 82 L66 64" fill="currentColor"/>
         <path d="M24 98 L20 124 L33 124 L45 108 L57 124 L70 124 L66 98" fill="currentColor"/>`,
  };
  const posColor = { PG:'#4A9EFF', SG:'#FF6B6B', SF:'#4AFF90', PF:'#FFB800', C:'#CC44FF' };
  const color = posColor[pos] || '#888';
  return `<svg viewBox="0 0 90 130" xmlns="http://www.w3.org/2000/svg" style="color:${color}">
    ${silhouettes[pos] || silhouettes.SF}
    <text x="45" y="140" text-anchor="middle" font-family="'Bebas Neue',sans-serif" font-size="22" fill="rgba(255,255,255,.18)">${num}</text>
  </svg>`;
}

function buildCard(player, size='') {
  const cls = size === 'lg' ? 'card ' + player.rarity + ' card-lg' : 'card ' + player.rarity;
  const imgSize = size === 'lg' ? '1040x760' : '260x190';
  let artHTML;
  if (player.nbaId) {
    const src = `https://cdn.nba.com/headshots/nba/latest/${imgSize}/${player.nbaId}.png`;
    artHTML = `<img class="player-headshot" src="${src}" alt="${player.name}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="card-art-fallback">${playerSVG(player.pos, player.num)}</div>`;
  } else {
    artHTML = `<div class="card-art-fallback" style="display:flex">${playerSVG(player.pos, player.num)}</div>`;
  }
  return `<div class="${cls}" data-id="${player.id}">
    <div class="card-inner">
      <div class="card-ovr">${player.ovr}</div>
      <div class="card-pos">${player.pos}</div>
      <div class="card-art">${artHTML}</div>
      <div class="card-footer">
        <div class="card-name">${player.name}</div>
        <div class="card-rarity">${player.rarity}${player.team ? ' · ' + player.team : ''}</div>
        <div class="card-stats">
          <span class="card-stat">PTS <span>${player.pts}</span></span>
          <span class="card-stat">REB <span>${player.reb}</span></span>
          <span class="card-stat">AST <span>${player.ast}</span></span>
        </div>
      </div>
    </div>
  </div>`;
}

function buildPackCard(pack, index) {
  const icons = { 'Bronze Pack':icon('package',48), 'Silver Pack':icon('circle',48), 'Gold Pack':icon('medal',48), 'Diamond Premium':icon('gem',48) };
  const cls   = pack.type.split(' ')[0];
  const icon  = icons[pack.type] || icon('package',48);
  return `<div class="pack-card ${cls}" data-idx="${index}" onclick="openPack(${index})">
    <div class="pack-icon">${icon}</div>
    <div class="pack-title">${pack.type}</div>
    <div class="pack-count">Tap to open</div>
  </div>`;
}

// Pack opening overlay
let _currentRevealedCard = null;

function openPack(idx) {
  const pack = AppState.packQueue[idx];
  if (!pack) return;
  const card = genPackCard(pack.type);
  _currentRevealedCard = { card, idx };
  showPackOverlay(pack, card);
}

function showPackOverlay(pack, card) {
  let overlay = document.getElementById('packOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'packOverlay';
    overlay.className = 'pack-open-overlay';
    document.body.appendChild(overlay);
  }
  const icons = { 'Bronze Pack':icon('package',48), 'Silver Pack':icon('circle',48), 'Gold Pack':icon('medal',48), 'Diamond Premium':icon('gem',48) };
  const cls   = pack.type.split(' ')[0];
  overlay.innerHTML = `
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:3px;color:var(--dim)">YOU EARNED A PACK</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;color:var(--ball)">${pack.type}</div>
    </div>
    <div id="packRevealArea">
      <div class="pack-card ${cls}" id="packClickable" onclick="revealCard()" style="cursor:pointer">
        <div class="pack-icon">${icons[pack.type]||icon('package',48)}</div>
        <div class="pack-title">${pack.type}</div>
        <div class="pack-count">Click to reveal!</div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--dim);margin-top:14px">Click the pack to reveal your player</div>
  `;
  overlay.classList.remove('hidden');
}

function revealCard() {
  if (!_currentRevealedCard) return;
  const { card, idx } = _currentRevealedCard;
  const area = document.getElementById('packRevealArea');
  if (!area) return;
  area.innerHTML = `<div class="pack-reveal">${buildCard(card, 'lg')}</div>
    <div style="text-align:center;margin-top:16px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--gold);letter-spacing:2px">NEW PLAYER!</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--white);letter-spacing:1px;margin-top:4px">${card.name}</div>
      <div style="font-size:11px;color:var(--dim);margin-top:2px">${card.rarity} · OVR ${card.ovr}</div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:18px">
        <button class="btn btn-primary" onclick="collectCard()">Add to Collection</button>
      </div>
    </div>`;
}

function collectCard() {
  if (!_currentRevealedCard) return;
  const { card, idx } = _currentRevealedCard;
  // Add to collection
  AppState.collection.push(card);
  // Remove pack from queue
  AppState.packQueue.splice(idx, 1);
  AppState.stats.packsOpened++;
  saveState(AppState);
  _currentRevealedCard = null;
  // Close overlay
  document.getElementById('packOverlay').classList.add('hidden');
  // Update nav badge & dashboard
  updatePackBadge();
  renderDashboard();
  showXPPopup(0, 'New Player: ' + card.name + ' (OVR ' + card.ovr + ')');
}

function updatePackBadge() {
  const badge = document.getElementById('packBadge');
  if (!badge) return;
  const count = AppState.packQueue.length;
  badge.textContent = count;
  badge.style.display = count > 0 ? '' : 'none';
}
