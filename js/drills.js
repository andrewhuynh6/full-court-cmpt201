// CMPT201 LAB — Daily drills: quick side tasks that each earn one random 5-card pack.
// Harder drills earn higher pack tiers. Each drill pays out once per day; you can retry as often as you like.
// Questions come only from lessons you have already studied, so drills reward what you learned.

const DRILLS = [
  { id: 'warmup',  title: 'Warm-up shots',     icon: 'target',         pack: 'Bronze Pack',     n: 5,  need: 3, types: ['mcq'],
    desc: '5 multiple-choice questions. Get 3 right.' },
  { id: 'cleanup', title: 'Fix your mistakes', icon: 'triangle-alert', pack: 'Silver Pack',     n: 4,  need: 3, source: 'review',
    desc: 'Re-answer questions you missed before. Get 3 of 4 right.' },
  { id: 'handson', title: 'Film study',        icon: 'dribbble',       pack: 'Silver Pack',     n: 4,  need: 3, types: ['bug', 'blank', 'order'],
    desc: 'Find the bug, fill the blank, put lines in order. Get 3 of 4.' },
  { id: 'written', title: 'Free throws',       icon: 'zap',            pack: 'Gold Pack',       n: 2,  need: 2, types: ['short'],
    desc: 'Write 2 short answers, then grade yourself. Cover most key points in both.' },
  { id: 'speed',   title: 'Two-minute drill',  icon: 'gem',            pack: 'Diamond Premium', n: 10, need: 9, minutes: 4, types: ['mcq', 'bug', 'blank', 'order'],
    desc: '10 mixed questions in 4 minutes. Get 9 right.' },
];

let drill = null;

function drillDay() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

function drillState() {
  const s = AppState.drills || (AppState.drills = { day: '', done: {} });
  if (s.day !== drillDay()) { s.day = drillDay(); s.done = {}; saveState(AppState); }
  return s;
}

function drillDoneCount() { const s = drillState(); return DRILLS.filter(d => s.done[d.id]).length; }

// Questions from lessons whose Learn stage is done.
function studiedQuestions() {
  return CHAPTERS.flatMap(ch => ch.lessons.filter(l => isLearnDone(AppState, l.id)).flatMap(l => [...(l.practice || []), ...(l.quiz || [])]));
}

function drillPool(d) {
  if (d.source === 'review') return reviewIds().map(id => QUESTION_INDEX[id].q).filter(q => !isSelfGraded(q));
  return studiedQuestions().filter(q => d.types.includes(q.type || 'mcq'));
}

function drillStatus(d) {
  const s = drillState();
  if (s.done[d.id]) return { state: 'done' };
  const pool = drillPool(d);
  const need = d.source === 'review' ? 1 : d.n;
  if (pool.length < need) {
    return { state: 'locked', reason: d.source === 'review' ? 'Nothing to fix yet. Questions you miss show up here.' : 'Finish the Learn stage of a lesson to unlock.' };
  }
  return { state: 'ready' };
}

function renderDrills() {
  stopDrillTimer();
  drill = null;
  const v = document.getElementById('view-drills');
  const done = drillDoneCount();
  v.innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('target', 22)} DAILY DRILLS</div>
      ${AppState.packQueue.length ? `<div class="topbar-actions"><button class="btn btn-gold btn-sm" onclick="openPack(0)">Open pack (${AppState.packQueue.length})</button></div>` : ''}</div>
    <div class="page-wrap">
      <div class="page-hdr"><h2>SIDE TASKS</h2>
        <p>Short drills, each worth one pack of ${PACK_SIZE} cards. Harder drills earn better packs. They reset every day, and you can retry any drill until you pass.</p></div>
      <div class="drill-count">${done} of ${DRILLS.length} cleared today</div>
      <div class="drill-grid">
        ${DRILLS.map(d => {
          const st = drillStatus(d);
          const cls = d.pack.split(' ')[0];
          return `<div class="drill-card ${st.state}">
            <div class="drill-ico ${cls}">${icon(d.icon, 26)}</div>
            <div class="drill-info">
              <div class="drill-title">${d.title}</div>
              <div class="drill-desc">${st.state === 'locked' ? st.reason : d.desc}</div>
              <div class="drill-reward"><span class="pack-pill ${cls}">${icon('gift', 14)} ${d.pack}</span>${d.minutes ? `<span class="tag">${d.minutes} min</span>` : ''}</div>
            </div>
            ${st.state === 'done' ? '<span class="tag ok">CLEARED</span>' : st.state === 'locked' ? `<button class="btn btn-secondary btn-sm" onclick="navigate('learn')">Study</button>` : `<button class="btn btn-primary btn-sm" onclick="startDrill('${d.id}')">Start</button>`}
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

function stopDrillTimer() { if (drill && drill.timer) { clearInterval(drill.timer); drill.timer = null; } }

function startDrill(id) {
  const d = DRILLS.find(x => x.id === id);
  if (!d || drillStatus(d).state !== 'ready') return;
  const pool = shuffled(drillPool(d));
  const qs = pool.slice(0, d.n).map(shuffleQuestion);
  const need = d.source === 'review' ? Math.min(d.need, qs.length) : d.need;
  drill = { d, qs, need, idx: 0, ok: 0, endsAt: d.minutes ? Date.now() + d.minutes * 60000 : 0, timer: null, finished: false };
  if (d.minutes) drill.timer = setInterval(drillTick, 500);
  renderDrillQuestion();
}

function drillTick() {
  const el = document.getElementById('drill-timer');
  if (!drill || drill.finished || !el) { stopDrillTimer(); return; }
  const left = drill.endsAt - Date.now();
  el.textContent = fmtClock(left);
  el.classList.toggle('low', left < 60000);
  if (left <= 0) finishDrill(true);
}

function renderDrillQuestion() {
  const v = document.getElementById('view-drills');
  const { d, qs, idx } = drill;
  const q = qs[idx];
  const kind = KIND_LABEL[q.type || 'mcq'];
  const last = idx === qs.length - 1;
  v.innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon(d.icon, 22)} ${d.title.toUpperCase()}</div>
      <div class="topbar-actions">${d.minutes ? '<div class="exam-timer" id="drill-timer"></div>' : ''}<button class="btn btn-secondary btn-sm" onclick="renderDrills()">Quit</button></div></div>
    <div class="page-wrap"><div class="mcq-wrap">
      <div class="step-top"><span class="step-count">Question ${idx + 1} of ${qs.length} · ${drill.ok} right</span>
        <div class="progress-bar step-bar"><div class="progress-fill" style="width:${Math.round(idx / qs.length * 100)}%"></div></div></div>
      <div class="mcq-question">
        ${kind ? `<div class="step-check-label">${kind}</div>` : ''}
        <div class="mcq-q-text">${qBody(q)}</div>
        <div id="q-host"></div>
      </div>
      <div class="mcq-nav"><button class="btn btn-primary" id="drill-next" disabled onclick="drillNext()">${last ? 'Finish' : 'Next →'}</button></div>
    </div></div>`;
  if (d.minutes) drillTick();
  renderQuestion(document.getElementById('q-host'), q, ok => {
    if (ok) drill.ok++;
    recordReview(q, ok);
    document.getElementById('drill-next').disabled = false;
  });
  window.scrollTo(0, 0);
}

function drillNext() {
  if (!drill || drill.finished) return;
  if (drill.idx < drill.qs.length - 1) { drill.idx++; renderDrillQuestion(); }
  else finishDrill(false);
}

function finishDrill(timeUp) {
  if (!drill || drill.finished) return;
  drill.finished = true;
  stopDrillTimer();
  const { d, ok, need, qs } = drill;
  const passed = ok >= need;
  let packIdx = -1;
  const s = drillState();
  if (passed && !s.done[d.id]) {
    s.done[d.id] = true;
    givePack(AppState, d.pack, d.title);
    packIdx = AppState.packQueue.length - 1;
    addXP(AppState, 25);
    updateSidebar();
  }
  saveState(AppState);
  updatePackBadge();
  document.getElementById('view-drills').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon(d.icon, 22)} ${d.title.toUpperCase()}</div></div>
    <div class="page-wrap"><div class="step-wrap"><div class="final-screen" style="padding-top:8px">
      <div class="final-score">${ok}/${qs.length}</div>
      <div class="final-grade ${passed ? 'A' : 'D'}">${passed ? 'DRILL CLEARED' : timeUp ? "TIME'S UP" : 'NOT QUITE'}</div>
      ${passed ? `<div class="final-xp-earned">+25 XP · ${d.pack} earned</div>` : `<div class="exam-meta">You needed ${need}. Try again with fresh questions.</div>`}
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">
        ${packIdx >= 0 ? `<button class="btn btn-gold" data-pack-btn onclick="openPack(${packIdx})">${icon('gift', 18)} Open pack</button>` : `<button class="btn btn-primary" onclick="startDrill('${d.id}')">Try again</button>`}
        <button class="btn btn-secondary" onclick="renderDrills()">All drills</button>
      </div>
    </div></div></div>`;
  window.scrollTo(0, 0);
  countUp(document.querySelector('.final-score'));
  if (passed) celebrate();
}
