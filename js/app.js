// FULL COURT — Main App, Dashboard, Navigation, Team

// Global app state
let AppState;

// ── INIT ──────────────────────────────────────────────────────────

function initApp() {
  AppState = loadState();
  if (!AppState.team) {
    AppState.team = genStarterTeam();
    saveState(AppState);
  }
  buildLayout();
  applyTheme();
  navigate('dashboard');
  updateSidebar();
  updatePackBadge();
}

// ── LAYOUT ───────────────────────────────────────────────────────

function buildLayout() {
  document.getElementById('app').innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-words">
          <div class="logo-text">CMPT201 LAB</div>
          <div class="logo-sub">STUDY GAME</div>
        </div>
        <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" title="Toggle light/dark" aria-label="Toggle light/dark theme">${icon('moon',18)}</button>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Arena</div>
        ${navItem('dashboard','Home','dashboard','house')}
        <div class="nav-section-label">Training</div>
        ${navItem('learn','Learn','learn','book-open')}
        ${navItem('playoffs','Playoffs','playoffs','trophy')}
        ${navItem('drills','Daily Drills','drills','target','Drills')}
        <div class="nav-section-label">Roster</div>
        ${navItem('team','My Team','team','users','Team')}
        ${navItem('collection','Collection','collection','layers','Cards')}
        <div class="nav-item" id="nav-packs" onclick="openPacksIfAny()" style="cursor:pointer">
          <span class="nav-ico">${icon('gift',22)}</span><span class="nav-lbl">Open Packs</span>
          <span class="nav-badge" id="packBadge" style="display:none">0</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-player-name" id="sb-name">Rookie</div>
        <div class="sidebar-rank" id="sb-rank">Rookie</div>
        <div class="sidebar-xp-label" id="sb-xp">0 XP</div>
        <div class="sidebar-xp-bar"><div class="sidebar-xp-fill" id="sb-xpfill" style="width:0%"></div></div>
      </div>
    </aside>
    <main class="main">
      <div id="view-dashboard" class="view active"></div>
      <div id="view-learn"     class="view"></div>
      <div id="view-playoffs"  class="view"></div>
      <div id="view-drills"    class="view"></div>
      <div id="view-team"      class="view"></div>
      <div id="view-collection" class="view"></div>
    </main>`;
  renderDashboard();
}

function navItem(viewId, label, action, ico, short) {
  return `<div class="nav-item" id="nav-${viewId}" onclick="navigate('${action}')">
    <span class="nav-ico">${icon(ico,22)}</span><span class="nav-lbl">${label}</span><span class="nav-short">${short || label}</span>
  </div>`;
}

// Light is the default theme; dark is applied only when chosen.
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = theme === 'dark' ? icon('sun',18) : icon('moon',18);
}

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(next);
  try { localStorage.setItem('fc_theme', next); } catch(e) {}
}

function applyTheme() {
  let saved = 'light';
  try { saved = localStorage.getItem('fc_theme') || 'light'; } catch(e) {}
  setTheme(saved === 'dark' ? 'dark' : 'light');
}

function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const vEl = document.getElementById('view-' + view);
  const nEl = document.getElementById('nav-' + view);
  if (vEl) vEl.classList.add('active');
  if (nEl) nEl.classList.add('active');
  if (view === 'dashboard')   renderDashboard();
  if (view === 'team')        renderTeamPage();
  if (view === 'collection')  renderCollection();
  if (view === 'playoffs')    renderPlayoffs();
  if (view === 'drills')      renderDrills();
  if (view === 'learn')       showLearnView();
  window.scrollTo(0,0);
}

function updateSidebar() {
  const p = AppState.player;
  const fill = Math.round(p.xp / p.xpToNext * 100);
  document.getElementById('sb-name').textContent  = p.name;
  document.getElementById('sb-rank').textContent  = p.rank;
  document.getElementById('sb-xp').textContent    = p.xp + ' / ' + p.xpToNext + ' XP';
  document.getElementById('sb-xpfill').style.width = Math.min(fill,100) + '%';
}

function openPacksIfAny() {
  if (!AppState.packQueue.length) {
    showXPPopup(0, 'No packs yet. Clear a daily drill or win a playoff round to earn one.');
    return;
  }
  openPack(0);
}

// ── XP POPUP ──────────────────────────────────────────────────────

function showXPPopup(amount, msg) {
  const existing = document.getElementById('xpPopup');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'xpPopup';
  el.className = 'xp-popup';
  el.innerHTML = amount
    ? `<span class="xp-num">+${amount}</span><span style="font-size:12px;color:var(--dim)">XP EARNED</span>`
    : `<span style="font-size:13px;color:var(--gold)">${msg || ''}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ── DASHBOARD ────────────────────────────────────────────────────

function renderDashboard() {
  const v = document.getElementById('view-dashboard');
  if (!v.classList.contains('active')) return;
  const p     = AppState.player;
  const team  = AppState.team;
  const sp    = getSeasonProgress(AppState);
  const prog  = sp.doneLessons;
  const total = sp.totalLessons;
  const pct   = Math.round(prog / total * 100);
  const ovr = teamOVR(team);

  v.innerHTML = `
    <div class="topbar">
      <div class="topbar-title">CMPT201 LAB</div>
      <div class="topbar-actions">
        ${AppState.packQueue.length > 0
          ? `<button class="btn btn-gold btn-sm" onclick="openPack(0)">Open Pack (${AppState.packQueue.length})</button>`
          : ''}
      </div>
    </div>
    <div class="db-wrap">
      <div class="dashboard-grid">

        <!-- Profile -->
        <div class="panel hero db-span3">
          <svg class="court-art" viewBox="0 0 300 200" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="296" height="196" rx="6"/><rect x="100" y="2" width="100" height="112"/><path d="M100 114a50 50 0 0 0 100 0"/><path d="M100 114a50 50 0 0 1 100 0" stroke-dasharray="6 6"/><path d="M36 2v38a114 114 0 0 0 228 0V2"/><circle cx="150" cy="30" r="9"/><path d="M130 16h40"/></svg>
          <div class="profile-panel">
            <div class="profile-info" style="flex:1;min-width:0">
              <div class="level">LVL ${p.level} · SEASON 01</div>
              <div class="name">${p.name}</div>
              <div class="rank">${p.rank}</div>
              <div class="profile-xp-row">
                <span class="profile-xp-label">${p.xp} / ${p.xpToNext} XP</span>
                <span class="profile-xp-label">${p.xpToNext - p.xp} XP to next level</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(Math.round(p.xp/p.xpToNext*100),100)}%"></div></div>
            </div>
            <div class="profile-stats">
              <div class="stat-pill"><div class="stat-num">${AppState.stats.lessonsCompleted}</div><div class="stat-lbl">Lessons</div></div>
              <div class="stat-pill"><div class="stat-num">${AppState.stats.quizzesPassed}</div><div class="stat-lbl">Quizzes</div></div>
              <div class="stat-pill"><div class="stat-num">${AppState.collection.length}</div><div class="stat-lbl">Cards</div></div>
            </div>
          </div>
        </div>

        <!-- Team OVR -->
        <div class="panel db-span3">
          <div class="panel-title" style="justify-content:space-between">
            <span>My Team</span>
            <button class="btn btn-secondary btn-sm" onclick="navigate('team')">Manage Lineup →</button>
          </div>
          <div class="team-hero">
            <div class="team-ovr-big">
              <div class="ovr-badge">${ovr}</div>
              <div class="lbl">Team Overall</div>
            </div>
            <div class="team-row">
              ${team.slice(0,5).map(pl => buildCard(pl)).join('')}
            </div>
          </div>
        </div>

        <!-- Training Progress -->
        <div class="panel db-span2">
          <div class="panel-title">Training Progress</div>
          <div style="display:flex;gap:18px;align-items:center;margin-bottom:20px">
            <div class="stat-pill"><div class="stat-num">${pct}%</div><div class="stat-lbl">Complete</div></div>
            <div style="flex:1;min-width:0">
              <div class="progress-bar" style="margin-top:0"><div class="progress-fill" style="width:${pct}%"></div></div>
              <div style="font-size:14px;color:var(--dim);margin-top:8px">${prog} / ${total} lessons · ${sp.doneChapters}/${sp.totalChapters} topics</div>
            </div>
          </div>
          ${CHAPTERS.filter(c => !c.bonus).map(ch => {
            const done = isChapterComplete(AppState, ch);
            const doneLs = ch.lessons.filter(l => isLessonDone(AppState, l.id)).length;
            const p = Math.round(doneLs/ch.lessons.length*100);
            return `<div class="ch-row">
              <div class="ch-num${done?' done':''}">${ch.num}</div>
              <div style="flex:1;min-width:0">
                <div class="ch-title">${ch.title}</div>
                <div class="progress-bar" style="height:8px;margin-top:6px"><div class="progress-fill" style="width:${p}%"></div></div>
              </div>
              ${done?'<span class="tag ok">✓ Done</span>':'<span class="ch-pct">'+p+'%</span>'}
              <button class="btn btn-secondary btn-sm" onclick="showLesson('${(ch.lessons.find(l => !isLessonDone(AppState, l.id)) || ch.lessons[0]).id}')">${done ? 'Review' : 'Train'}</button>
            </div>`;
          }).join('')}
          <div class="db-actions">
            <button class="btn btn-primary" onclick="navigate('learn')">All topics →</button>
            <button class="btn btn-gold" onclick="navigate('playoffs')">Playoffs</button>
          </div>
        </div>

        <div class="db-stack">
          ${reviewPanelHtml()}
          <!-- Daily drills -->
          <div class="panel">
            <div class="panel-title">${icon('target',20)} Daily Drills</div>
            <div style="font-size:16px;font-weight:600;color:var(--white)">${drillDoneCount()} of ${DRILLS.length} cleared today</div>
            <div style="font-size:14px;color:var(--dim);margin:2px 0 4px">Each drill earns a pack of ${PACK_SIZE} cards.</div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(drillDoneCount()/DRILLS.length*100)}%"></div></div>
            <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="navigate('drills')">Start a drill →</button>
          </div>

          <!-- Collection Preview -->
          <div class="panel">
            <div class="panel-title">${icon('layers',20)} Collection</div>
            <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:12px">
              <div class="stat-num" style="font-size:44px">${AppState.collection.length}</div>
              <div style="font-size:14px;color:var(--dim)">cards collected</div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:16px">
              ${TIER_NAMES.map(r => {
                const count = AppState.collection.filter(c=>c.rarity===r).length;
                return `<div style="text-align:center;min-width:52px">
                  <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:${rarityColor(r)}">${count}</div>
                  <div style="font-size:12px;color:var(--dim)">${r}</div>
                </div>`;
              }).join('')}
            </div>
            <button class="btn btn-secondary btn-sm" onclick="navigate('collection')">View Collection →</button>
          </div>
        </div>

      </div>
    </div>`;
}

function rarityColor(r) {
  return 'var(--' + tierSlug(r) + ')';
}

// ── TEAM PAGE ──────────────────────────────────────────────────────

let selectedSlotIdx = null;

function renderTeamPage() {
  const v = document.getElementById('view-team');
  const team  = AppState.team;
  const ovr   = teamOVR(team);
  const bench = AppState.collection;

  v.innerHTML = `
    <div class="topbar">
      <div class="topbar-title">MY TEAM</div>
    </div>
    <div class="page-wrap">
      <div class="page-hdr">
        <h2>LINEUP MANAGEMENT</h2>
        <p>Upgrade your starting five with collected cards</p>
      </div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
        <div class="ovr-badge">${ovr}</div>
        <div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1px;color:var(--dim)">TEAM OVERALL</div>
          <div style="font-size:12px;color:var(--dim);margin-top:2px">Click a player to swap them</div>
        </div>
      </div>

      <div class="team-grid" id="team-grid">
        ${team.map((pl,i) => `
          <div class="team-slot-panel" id="slot-${i}">
            <div class="team-slot-pos">${pl.pos}</div>
            <div onclick="selectSlot(${i})" style="cursor:pointer">${buildCard(pl)}</div>
            <div class="team-slot-name">${pl.name}</div>
            <button class="btn btn-secondary btn-sm" onclick="selectSlot(${i})">Swap Player</button>
          </div>`).join('')}
      </div>

      <div id="bench-section" style="margin-top:28px">
        <div class="panel-title">Available Cards (${bench.length})</div>
        ${bench.length === 0
          ? `<div class="empty-state"><h3>NO CARDS YET</h3><p>Complete lessons to earn player packs!</p></div>`
          : `<div class="coll-filter" id="bench-filter">
              <button class="filter-btn active" onclick="filterBench(null,this)">All</button>
              ${['PG','SG','SF','PF','C'].map(pos => `<button class="filter-btn" onclick="filterBench('${pos}',this)">${pos}</button>`).join('')}
            </div>
            <div class="collection-grid" id="bench-grid">
              ${bench.map((pl,i) => `<div onclick="swapPlayer(${i})" style="cursor:pointer;position:relative">
                ${buildCard(pl)}
                <div style="text-align:center;margin-top:4px;font-size:12px;color:var(--dim)">${pl.pos}</div>
              </div>`).join('')}
            </div>`}
      </div>
    </div>`;
}

function selectSlot(idx) {
  selectedSlotIdx = idx;
  document.querySelectorAll('.team-slot-panel').forEach((el,i) => {
    el.style.outline = i === idx ? '2px solid var(--ball)' : '';
  });
  // Scroll to bench
  document.getElementById('bench-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterBench(pos, btn) {
  document.querySelectorAll('#bench-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('bench-grid');
  if (!grid) return;
  const bench = AppState.collection;
  const filtered = pos ? bench.filter(p => p.pos === pos) : bench;
  grid.innerHTML = filtered.map((pl,i) => {
    const realIdx = bench.indexOf(pl);
    return `<div onclick="swapPlayer(${realIdx})" style="cursor:pointer;position:relative">
      ${buildCard(pl)}
      <div style="text-align:center;margin-top:4px;font-size:12px;color:var(--dim)">${pl.pos}</div>
    </div>`;
  }).join('');
}

function swapPlayer(benchIdx) {
  if (selectedSlotIdx === null) {
    alert('First click "Swap Player" on a team slot!');
    return;
  }
  const teamPlayer   = AppState.team[selectedSlotIdx];
  const benchPlayer  = AppState.collection[benchIdx];
  if (!benchPlayer) return;
  // Swap
  AppState.team[selectedSlotIdx] = benchPlayer;
  AppState.collection.splice(benchIdx, 1);
  AppState.collection.push(teamPlayer);
  selectedSlotIdx = null;
  saveState(AppState);
  renderTeamPage();
  renderDashboard();
  showXPPopup(0, '✓ Lineup updated! Team OVR: ' + teamOVR(AppState.team));
}

// ── COLLECTION PAGE ───────────────────────────────────────────────

let collFilter = null;
let collView = 'owned';      // 'owned' | 'locked'
let collLimit = 60;          // how many locked cards to show before "Show more"

function ownedPlayerIds() {
  return new Set([...AppState.collection, ...AppState.team].map(c => c.nbaId));
}

function renderCollection() {
  const v = document.getElementById('view-collection');
  const all = [...AppState.collection, ...AppState.team];
  const owned = ownedPlayerIds();
  const locked = NBA_PLAYERS.filter(p => !owned.has(p.nbaId)).sort((a, b) => b.ovr - a.ovr);
  const base = collView === 'locked' ? locked : all;
  const filtered = collFilter ? base.filter(p => p.rarity === collFilter) : base;
  const shown = collView === 'locked' ? filtered.slice(0, collLimit) : filtered;
  const pctUnlocked = Math.round(owned.size / NBA_PLAYERS.length * 100);
  v.innerHTML = `
    <div class="topbar">
      <div class="topbar-title">${icon('layers',22)} COLLECTION</div>
    </div>
    <div class="page-wrap">
      <div class="page-hdr">
        <h2>PLAYER COLLECTION</h2>
        <p>${owned.size} of ${NBA_PLAYERS.length} players unlocked · ${all.length} cards · ${AppState.stats.packsOpened} packs opened</p>
      </div>
      <div class="progress-bar" style="margin-bottom:18px"><div class="progress-fill" style="width:${pctUnlocked}%"></div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;margin-bottom:18px">
        ${TIER_NAMES.map(r => {
          const have = all.filter(c => c.rarity === r).length;
          const left = locked.filter(c => c.rarity === r).length;
          return `<div class="stat-pill"><div class="stat-num" style="color:${rarityColor(r)};font-size:22px">${have}</div><div class="stat-lbl">${r}</div><div class="stat-sub">${left} locked</div></div>`;
        }).join('')}
      </div>
      <div class="seg" role="tablist">
        <button class="seg-btn${collView === 'owned' ? ' active' : ''}" onclick="setCollView('owned')">Owned (${all.length})</button>
        <button class="seg-btn${collView === 'locked' ? ' active' : ''}" onclick="setCollView('locked')">${icon('lock', 15)} Locked (${locked.length})</button>
      </div>
      <div class="coll-filter">
        <button class="filter-btn${!collFilter?' active':''}" onclick="setCollFilter(null,this)">All</button>
        ${TIER_NAMES.map(r => `<button class="filter-btn${collFilter===r?' active':''}" onclick="setCollFilter('${r}',this)">${r}</button>`).join('')}
      </div>
      ${collView === 'locked' ? `<div class="coll-note">These are the players you have not pulled yet, best first. Open packs to unlock them.</div>` : ''}
      <div class="collection-grid">
        ${filtered.length === 0
          ? (collView === 'locked'
              ? `<div class="empty-state"><div class="empty-icon">${icon('trophy',48)}</div><h3>ALL UNLOCKED</h3><p>You own every player${collFilter ? ' in this tier' : ''}.</p></div>`
              : `<div class="empty-state"><div class="empty-icon">${icon('layers',48)}</div><h3>NO CARDS YET</h3><p>Clear a daily drill or win a playoff round to earn a pack.</p></div>`)
          : shown.map(pl => collView === 'locked' ? `<div class="locked-card">${buildCard(pl)}<div class="lock-badge">${icon('lock', 22)}</div></div>` : buildCard(pl)).join('')}
      </div>
      ${collView === 'locked' && filtered.length > shown.length ? `<div style="text-align:center;margin-top:18px"><button class="btn btn-secondary" onclick="collLimit += 60; renderCollection()">Show more (${filtered.length - shown.length} left)</button></div>` : ''}
    </div>`;
}

function setCollView(view) {
  collView = view;
  collLimit = 60;
  renderCollection();
}

function setCollFilter(r, btn) {
  collFilter = r;
  collLimit = 60;
  renderCollection();
}

// ── BOOT ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initApp);
