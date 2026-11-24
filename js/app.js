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
          <div class="logo-text">FULL COURT</div>
          <div class="logo-sub">CMPT 201</div>
        </div>
        <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" title="Toggle light/dark" aria-label="Toggle light/dark theme">${icon('moon',18)}</button>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Arena</div>
        ${navItem('dashboard','Home','dashboard','house')}
        <div class="nav-section-label">Training</div>
        ${navItem('learn','Learn','learn','book-open')}
        ${navItem('gameday','Game Day','gameday','dribbble','Game')}
        <div class="nav-section-label">Roster</div>
        ${navItem('team','My Team','team','users','Team')}
        ${navItem('collection','Collection','collection','layers','Cards')}
        <div class="nav-item" id="nav-packs" onclick="openPacksIfAny()" style="cursor:pointer">
          <span class="nav-ico">${icon('gift',22)}</span><span class="nav-lbl">Open Packs</span>
          <span class="nav-badge" id="packBadge" style="display:none">0</span>
        </div>
        <div class="nav-section-label">Season</div>
        ${navItem('season','Season Progress','season','trophy','Season')}
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
      <div id="view-gameday"   class="view"></div>
      <div id="view-team"      class="view"></div>
      <div id="view-collection" class="view"></div>
      <div id="view-season"    class="view"></div>
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
  if (view === 'season')      renderSeason();
  if (view === 'learn')       showLearnView();
  if (view === 'gameday')     renderGameDayLocked();
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
    alert('No packs to open! Complete lessons to earn packs.');
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
  const nextPack = getNextPackProgress();
  const ovr = teamOVR(team);

  v.innerHTML = `
    <div class="topbar">
      <div class="topbar-title">FULL COURT</div>
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
              <div style="font-size:14px;color:var(--dim);margin-top:8px">${prog} / ${total} lessons · ${sp.doneChapters}/${sp.totalChapters} chapters</div>
            </div>
          </div>
          ${CHAPTERS.slice(0,3).map(ch => {
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
              <button class="btn btn-secondary btn-sm" onclick="showLesson('${(ch.lessons.find(l => !isLessonDone(AppState, l.id)) || ch.lessons[0]).id}')">Train</button>
            </div>`;
          }).join('')}
          <button class="btn btn-primary" style="margin-top:6px" onclick="navigate('learn')">View All Chapters →</button>
          <button class="btn btn-gold" style="margin-top:6px;margin-left:8px" onclick="showExamIntro()">Final exam</button>
        </div>

        <div class="db-stack">
          ${reviewPanelHtml()}
          <!-- Next Reward -->
          <div class="panel">
            <div class="panel-title">${icon('gift',20)} Next Reward</div>
            ${nextPack
              ? `<div style="font-size:16px;font-weight:600;color:var(--white)">${nextPack.type}</div>
                 <div style="font-size:14px;color:var(--dim);margin-top:2px">${nextPack.current} / ${nextPack.target} XP</div>
                 <div class="progress-bar"><div class="progress-fill" style="width:${nextPack.pct}%"></div></div>`
              : `<div style="text-align:center;padding:12px;color:var(--ok);font-family:'Bebas Neue',sans-serif;font-size:22px;">ALL MILESTONES HIT</div>`}
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

function getNextPackProgress() {
  const milestones = PACK_MILESTONES;
  const xp = AppState.player.xp;
  for (const m of milestones) {
    if (xp < m) {
      let type = 'Bronze Pack';
      if (m >= 6000) type = 'Diamond Premium';
      else if (m >= 3000) type = 'Gold Pack';
      else if (m >= 1500) type = 'Gold Pack';
      else if (m >= 700) type = 'Silver Pack';
      const prev = milestones[milestones.indexOf(m)-1] || 0;
      const current = xp - prev;
      const target  = m - prev;
      return { type, current: xp, target: m, pct: Math.round(xp/m*100) };
    }
  }
  return null;
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

function renderCollection() {
  const v = document.getElementById('view-collection');
  const all = [...AppState.collection, ...AppState.team];
  const filtered = collFilter ? all.filter(p => p.rarity === collFilter) : all;
  v.innerHTML = `
    <div class="topbar">
      <div class="topbar-title">${icon('layers',22)} COLLECTION</div>
    </div>
    <div class="page-wrap">
      <div class="page-hdr">
        <h2>PLAYER COLLECTION</h2>
        <p>${all.length} cards · ${AppState.stats.packsOpened} packs opened</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;margin-bottom:18px">
        ${TIER_NAMES.map(r => {
          const count = all.filter(c=>c.rarity===r).length;
          return `<div class="stat-pill"><div class="stat-num" style="color:${rarityColor(r)};font-size:22px">${count}</div><div class="stat-lbl">${r}</div></div>`;
        }).join('')}
      </div>
      <div class="coll-filter">
        <button class="filter-btn${!collFilter?' active':''}" onclick="setCollFilter(null,this)">All</button>
        ${TIER_NAMES.map(r => `<button class="filter-btn${collFilter===r?' active':''}" onclick="setCollFilter('${r}',this)">${r}</button>`).join('')}
      </div>
      <div class="collection-grid">
        ${filtered.length === 0
          ? `<div class="empty-state"><div class="empty-icon">${icon('layers',48)}</div><h3>NO CARDS YET</h3><p>Complete lessons to earn packs!</p></div>`
          : filtered.map(pl => buildCard(pl)).join('')}
      </div>
    </div>`;
}

function setCollFilter(r, btn) {
  collFilter = r;
  document.querySelectorAll('.coll-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCollection();
}

// ── SEASON PAGE ───────────────────────────────────────────────────

function renderSeason() {
  const v  = document.getElementById('view-season');
  const sp = getSeasonProgress(AppState);
  const stages = [
    { name:'TRAINING CAMP', desc:'Learn the fundamentals — C, Pointers, Memory', icon:'dumbbell', chId:'ch1' },
    { name:'SEASON OPENER', desc:'Processes, threads, and synchronization', icon:'cpu', chId:'ch2' },
    { name:'MID-SEASON', desc:'Master the file system', icon:'folder', chId:'ch3' },
    { name:'PLAYOFFS', desc:'Networking — sockets and IPC', icon:'globe', chId:'ch4' },
    { name:'CHAMPIONSHIP', desc:'Complete IPC mastery — shared memory', icon:'trophy', chId:'ch5' },
  ];

  v.innerHTML = `
    <div class="topbar">
      <div class="topbar-title">SEASON PROGRESS</div>
    </div>
    <div class="page-wrap">
      <div class="page-hdr">
        <h2>SEASON 01</h2>
        <p>ROAD TO THE CHAMPIONSHIP</p>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap">
        <div class="stat-pill"><div class="stat-num">${sp.doneLessons}</div><div class="stat-lbl">Lessons Done</div></div>
        <div class="stat-pill"><div class="stat-num">${sp.doneChapters}</div><div class="stat-lbl">Chapters</div></div>
        <div class="stat-pill"><div class="stat-num">${AppState.stats.gamesPlayed}</div><div class="stat-lbl">Games Played</div></div>
        <div class="stat-pill"><div class="stat-num">${AppState.stats.gamesWon}</div><div class="stat-lbl">Wins</div></div>
        <div class="stat-pill"><div class="stat-num">${AppState.stats.packsOpened}</div><div class="stat-lbl">Packs Opened</div></div>
      </div>
      <div class="progress-bar" style="height:10px;margin-bottom:24px">
        <div class="progress-fill" style="width:${Math.round(sp.doneLessons/sp.totalLessons*100)}%"></div>
      </div>
      ${stages.map((st, i) => {
        const ch   = CHAPTERS.find(c => c.id === st.chId);
        const done = ch && isChapterComplete(AppState, ch);
        const doneLs = ch ? ch.lessons.filter(l => isLessonDone(AppState, l.id)).length : 0;
        const isActive = ch && doneLs > 0 && !done;
        return `<div class="season-stage${done?' done':isActive?' active':''}">
          <div class="stage-icon">${icon(st.icon,36)}</div>
          <div class="stage-info">
            <div class="stage-name">${st.name}</div>
            <div class="stage-desc">${st.desc}</div>
            ${ch ? `<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
              ${done?'<span class="tag ok">✓ COMPLETE</span>':''}
              ${!done && ch ? `<span style="font-size:13px;color:var(--dim)">${doneLs}/${ch.lessons.length} lessons</span>`:''}
            </div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            ${done
              ? `<button class="btn btn-secondary btn-sm" onclick="showGameDay('${st.chId}')">Game Day</button>`
              : `<button class="btn btn-primary btn-sm" onclick="showChapter('${st.chId}');navigate('learn')">Train →</button>`}
            ${done ? '<span class="tag ok">CLEARED</span>' : ''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

// ── BOOT ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initApp);
