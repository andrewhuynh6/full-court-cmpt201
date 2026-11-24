// FULL COURT — Review mode: remember missed questions, re-ask them, show weak topics.
// AppState.review[qid] = { miss, streak, last }. A question retires after 2 correct answers in a row.

const QUESTION_INDEX = {};
CHAPTERS.forEach(ch => ch.lessons.forEach(l => {
  (l.practice || []).forEach((q, i) => { q.id = `${l.id}:p${i}`; QUESTION_INDEX[q.id] = { q, lessonId: l.id }; });
  (l.quiz || []).forEach((q, i) => { q.id = `${l.id}:q${i}`; QUESTION_INDEX[q.id] = { q, lessonId: l.id }; });
}));

function lessonTitle(id) {
  for (const ch of CHAPTERS) { const l = ch.lessons.find(x => x.id === id); if (l) return l.title; }
  return id;
}

function recordReview(q, ok) {
  if (!q || !q.id || !QUESTION_INDEX[q.id]) return;
  if (!AppState.review) AppState.review = {};
  const e = AppState.review[q.id];
  if (!ok) {
    AppState.review[q.id] = { miss: (e ? e.miss : 0) + 1, streak: 0, last: Date.now() };
  } else if (e) {
    e.streak++;
    if (e.streak >= 2) delete AppState.review[q.id];
  }
  saveState(AppState);
}

function reviewIds() { return Object.keys(AppState.review || {}).filter(id => QUESTION_INDEX[id]); }
function reviewCount() { return reviewIds().length; }
function reviewCountForLesson(lessonId) { return reviewIds().filter(id => QUESTION_INDEX[id].lessonId === lessonId).length; }

// Lessons ranked by how many questions are still unresolved, then by total misses.
function weakTopics(limit = 3) {
  const by = {};
  reviewIds().forEach(id => {
    const lid = QUESTION_INDEX[id].lessonId;
    by[lid] = by[lid] || { lessonId: lid, pending: 0, misses: 0 };
    by[lid].pending++;
    by[lid].misses += AppState.review[id].miss;
  });
  return Object.values(by).sort((a, b) => b.pending - a.pending || b.misses - a.misses).slice(0, limit);
}

function reviewPanelHtml() {
  const n = reviewCount();
  if (!n) {
    return `<div class="panel"><div class="panel-title">${icon('check', 20)} Review</div>
      <div style="font-size:15px;color:var(--dim)">No mistakes to review. Questions you miss in practice or quizzes show up here.</div></div>`;
  }
  const rows = weakTopics(3).map(t => `<div class="review-row">
      <div class="review-name">${lessonTitle(t.lessonId)}</div>
      <span class="tag">${t.pending} to review</span>
      <button class="btn btn-secondary btn-sm" onclick="showLesson('${t.lessonId}')">Study</button>
    </div>`).join('');
  return `<div class="panel"><div class="panel-title">${icon('triangle-alert', 20)} Review (${n})</div>
    <div class="review-sub">Weakest topics</div>${rows}
    <button class="btn btn-primary" style="margin-top:12px" onclick="startReview()">Review ${Math.min(n, 10)} mistake${Math.min(n, 10) === 1 ? '' : 's'}</button></div>`;
}

function reviewBannerHtml() {
  const n = reviewCount();
  if (!n) return '';
  return `<div class="review-banner"><div><strong>${n} question${n === 1 ? '' : 's'} to review</strong><div class="review-sub" style="margin:2px 0 0">Get each right twice in a row to clear it.</div></div>
    <button class="btn btn-primary" onclick="startReview()">Start review</button></div>`;
}

function startReview() {
  const ids = reviewIds().sort((a, b) => AppState.review[b].miss - AppState.review[a].miss || AppState.review[a].last - AppState.review[b].last).slice(0, 10);
  if (!ids.length) return;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view-learn').classList.add('active');
  const navLearn = document.getElementById('nav-learn');
  if (navLearn) navLearn.classList.add('active');
  window.scrollTo(0, 0);
  currentLesson = null;
  currentChapter = null;
  const qs = ids.map(id => QUESTION_INDEX[id].q);
  mcq = { q: 0, answered: false, score: 0, done: false, source: 'review', questions: qs.map(shuffleQuestion) };
  document.getElementById('view-learn').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('check', 22)} REVIEW MISTAKES</div>
      <div class="topbar-actions"><button class="btn btn-secondary btn-sm" onclick="renderChapterList()">← Back</button></div></div>
    <div class="page-wrap"><div id="stage-content"></div></div>`;
  renderMCQQuestion(document.getElementById('stage-content'), 'review');
}

function finishReview() {
  const sc = document.getElementById('stage-content');
  mcq.done = true;
  const xp = mcq.score * 5;
  if (xp) {
    const prev = AppState.player.xp;
    addXP(AppState, xp);
    checkPackMilestone(AppState, prev, AppState.player.xp);
    showXPPopup(xp);
    updateSidebar();
    updatePackBadge();
  }
  saveState(AppState);
  const left = reviewCount();
  sc.innerHTML = `<div class="mcq-wrap"><div class="final-screen">
    <div class="final-score">${mcq.score}/${mcq.questions.length}</div>
    <div class="final-grade ${mcq.score === mcq.questions.length ? 'A' : mcq.score >= mcq.questions.length / 2 ? 'B' : 'C'}">${left ? left + ' STILL TO REVIEW' : 'ALL CLEAR'}</div>
    <div class="final-xp-earned">+${xp} XP EARNED</div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      ${left ? `<button class="btn btn-primary" onclick="startReview()">Keep reviewing</button>` : ''}
      <button class="btn btn-secondary" onclick="navigate('dashboard')">Back to Home</button>
    </div></div></div>`;
}
