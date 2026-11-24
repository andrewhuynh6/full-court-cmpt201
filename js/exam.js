// FULL COURT — Final Exam: 25 timed questions across all chapters, answers revealed at the end.

const EXAM = { count: 25, perChapter: 5, minutes: 30, passPct: 70 };
let examState = null;

function chapterOfLesson(lessonId) {
  return CHAPTERS.find(ch => ch.lessons.some(l => l.id === lessonId));
}

function examPool() {
  return CHAPTERS.map(ch => ({ ch, qs: ch.lessons.flatMap(l => [...(l.practice || []), ...(l.quiz || [])]) }));
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function examCardHtml() {
  const e = AppState.exam || { best: 0, attempts: 0 };
  return `<div class="exam-card">
    <div class="exam-card-main">
      <div class="exam-card-title">${icon('trophy', 22)} Final Exam</div>
      <div class="exam-card-sub">${EXAM.count} questions · ${EXAM.minutes} minutes · all ${CHAPTERS.length} chapters${e.attempts ? ` · Best ${e.best}%` : ''}</div>
    </div>
    <button class="btn btn-gold" onclick="showExamIntro()">${e.attempts ? 'Retake exam' : 'Start exam'}</button>
  </div>`;
}

function activateLearnView() {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view-learn').classList.add('active');
  const nl = document.getElementById('nav-learn');
  if (nl) nl.classList.add('active');
  window.scrollTo(0, 0);
  currentLesson = null;
  currentChapter = null;
}

function showExamIntro() {
  stopExamTimer();
  examState = null;
  activateLearnView();
  const e = AppState.exam || { best: 0, attempts: 0, passed: false };
  document.getElementById('view-learn').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('trophy', 22)} FINAL EXAM</div>
      <div class="topbar-actions"><button class="btn btn-secondary btn-sm" onclick="renderChapterList()">← Back</button></div></div>
    <div class="page-wrap"><div class="step-wrap">
      <div class="page-hdr"><h2>FINAL EXAM</h2><p>Show what you know across the whole course.</p></div>
      <div class="panel">
        <ul class="exam-rules">
          <li><strong>${EXAM.count} questions</strong>, ${EXAM.perChapter} from each chapter, in random order.</li>
          <li><strong>${EXAM.minutes} minutes.</strong> When time runs out the exam ends and unanswered questions count as wrong.</li>
          <li><strong>No feedback until the end.</strong> You cannot go back to a question.</li>
          <li><strong>Pass with ${EXAM.passPct}%.</strong> You earn 4 XP per correct answer, plus 100 XP the first time you pass.</li>
          <li>Every question you miss goes into your <strong>review queue</strong>.</li>
        </ul>
        ${e.attempts ? `<div class="exam-best">Best score: <strong>${e.best}%</strong> · Attempts: ${e.attempts}${e.passed ? ' · Passed' : ''}</div>` : ''}
        <button class="btn btn-gold btn-lg" style="margin-top:16px" onclick="startExam()">Begin exam</button>
      </div>
    </div></div>`;
}

function startExam() {
  const qs = [];
  examPool().forEach(({ ch, qs: pool }) => {
    shuffled(pool).slice(0, EXAM.perChapter).forEach(q => qs.push({ q: shuffleQuestion(q), chId: ch.id }));
  });
  examState = { qs: shuffled(qs).slice(0, EXAM.count), idx: 0, results: [], endsAt: Date.now() + EXAM.minutes * 60000, startedAt: Date.now(), timer: null, done: false };
  activateLearnView();
  document.getElementById('view-learn').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('trophy', 22)} FINAL EXAM</div>
      <div class="topbar-actions"><div class="exam-timer" id="exam-timer">30:00</div></div></div>
    <div class="page-wrap"><div id="exam-body"></div></div>`;
  examState.timer = setInterval(examTick, 1000);
  examTick();
  renderExamQuestion();
}

function stopExamTimer() {
  if (examState && examState.timer) { clearInterval(examState.timer); examState.timer = null; }
}

function examTick() {
  const el = document.getElementById('exam-timer');
  if (!examState || examState.done || !el) { stopExamTimer(); return; }
  const left = Math.max(0, examState.endsAt - Date.now());
  const m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
  el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  el.classList.toggle('low', left < 5 * 60000);
  if (left <= 0) finishExam(true);
}

function renderExamQuestion() {
  const st = examState;
  const { q } = st.qs[st.idx];
  const n = st.qs.length, last = st.idx === n - 1;
  const kind = { mcq: '', bug: 'Find the bug', blank: 'Fill the blank', order: 'Put in order' }[q.type || 'mcq'];
  document.getElementById('exam-body').innerHTML = `<div class="mcq-wrap">
    <div class="step-top"><span class="step-count">Question ${st.idx + 1} of ${n}</span>
      <div class="progress-bar step-bar"><div class="progress-fill" style="width:${Math.round(st.idx / n * 100)}%"></div></div></div>
    <div class="mcq-question">
      ${kind ? `<div class="step-check-label">${kind}</div>` : ''}
      <div class="mcq-q-text">${qBody(q)}</div>
      <div id="q-host"></div>
    </div>
    <div class="mcq-nav"><button class="btn btn-primary" id="exam-next" disabled onclick="examNext()">${last ? 'Finish exam' : 'Next →'}</button></div>
  </div>`;
  renderQuestion(document.getElementById('q-host'), q, ok => {
    st.results[st.idx] = ok;
    document.getElementById('exam-next').disabled = false;
  }, { quiet: true });
  window.scrollTo(0, 0);
}

function examNext() {
  if (!examState || examState.done) return;
  if (examState.idx < examState.qs.length - 1) { examState.idx++; renderExamQuestion(); }
  else finishExam(false);
}

function correctAnswerHtml(q) {
  const t = q.type || 'mcq';
  if (t === 'mcq' || t === 'blank') return `<code>${H_esc(String(q.opts[q.ans]).replace(/<[^>]+>/g, ''))}</code>`;
  if (t === 'bug') return `line ${q.ans + 1}: <code>${H_esc(q.lines[q.ans])}</code>`;
  return q.lines.map(l => `<code>${H_esc(l.trim())}</code>`).join('<br>');
}

function finishExam(timeUp) {
  const st = examState;
  if (!st || st.done) return;
  st.done = true;
  stopExamTimer();
  const n = st.qs.length;
  let correct = 0;
  const byCh = {};
  st.qs.forEach(({ q, chId }, i) => {
    const ok = st.results[i] === true;
    if (ok) correct++;
    byCh[chId] = byCh[chId] || { ok: 0, total: 0 };
    byCh[chId].total++;
    if (ok) byCh[chId].ok++;
    if (st.results[i] !== undefined || timeUp) recordReview(q, ok);
  });
  const pct = Math.round(correct / n * 100);
  const passed = pct >= EXAM.passPct;
  const e = AppState.exam || (AppState.exam = { best: 0, attempts: 0, passed: false });
  const firstPass = passed && !e.passed;
  e.attempts++;
  e.best = Math.max(e.best, pct);
  if (passed) e.passed = true;
  const xp = correct * 4 + (firstPass ? 100 : 0);
  if (xp) {
    const prev = AppState.player.xp;
    addXP(AppState, xp);
    checkPackMilestone(AppState, prev, AppState.player.xp);
    updateSidebar();
    updatePackBadge();
  }
  saveState(AppState);
  const secs = Math.round((Math.min(Date.now(), st.endsAt) - st.startedAt) / 1000);
  const time = Math.floor(secs / 60) + 'm ' + String(secs % 60).padStart(2, '0') + 's';
  const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= EXAM.passPct ? 'C' : 'D';
  const chRows = CHAPTERS.map(ch => {
    const r = byCh[ch.id] || { ok: 0, total: 0 };
    const p = r.total ? Math.round(r.ok / r.total * 100) : 0;
    return `<div class="exam-ch"><div class="exam-ch-name">${icon(ch.icon, 18)} ${ch.title}</div><div class="exam-ch-bar"><div class="progress-bar" style="margin:0"><div class="progress-fill" style="width:${p}%"></div></div></div><div class="exam-ch-score">${r.ok}/${r.total}</div></div>`;
  }).join('');
  const weakest = CHAPTERS.map(ch => ({ ch, p: byCh[ch.id] ? byCh[ch.id].ok / byCh[ch.id].total : 1 })).sort((a, b) => a.p - b.p)[0];
  const missed = st.qs.map((x, i) => ({ ...x, i })).filter(x => st.results[x.i] !== true);
  document.getElementById('view-learn').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('trophy', 22)} EXAM RESULTS</div>
      <div class="topbar-actions"><button class="btn btn-secondary btn-sm" onclick="renderChapterList()">Done</button></div></div>
    <div class="page-wrap"><div class="step-wrap">
      <div class="final-screen" style="padding-top:8px">
        <div class="final-score">${pct}%</div>
        <div class="final-grade ${grade}">${passed ? 'PASSED' : 'NOT YET'}${timeUp ? ' · TIME UP' : ''}</div>
        <div class="final-xp-earned">+${xp} XP EARNED${firstPass ? ' · FIRST PASS BONUS' : ''}</div>
        <div class="exam-meta">${correct} of ${n} correct · ${time}${pct >= e.best && e.attempts > 1 ? ' · New best' : ''}</div>
      </div>
      <div class="panel"><div class="panel-title">Score by chapter</div>${chRows}
        ${pct < 100 ? `<div class="exam-weak">Weakest: <strong>${weakest.ch.title}</strong>. Open that chapter to study it.</div>` : ''}</div>
      ${missed.length ? `<div class="panel" style="margin-top:16px"><div class="panel-title">Questions to learn from (${missed.length})</div>${missed.map(m => `<div class="exam-miss">
        <div class="exam-miss-q">${qBody(m.q).replace(/<div class="code-block">[\s\S]*?<\/div>/, '')}</div>
        <div class="exam-miss-a"><span>Correct answer</span>${correctAnswerHtml(m.q)}</div>
        <div class="exam-miss-e">${m.q.exp}</div></div>`).join('')}
        <div class="review-sub" style="margin-top:12px">These are now in your review queue.</div></div>` : ''}
      <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
        <button class="btn btn-gold" onclick="showExamIntro()">Retake exam</button>
        ${missed.length ? `<button class="btn btn-primary" onclick="startReview()">Review mistakes</button>` : ''}
        <button class="btn btn-secondary" onclick="navigate('dashboard')">Back to Home</button>
      </div>
    </div></div>`;
  window.scrollTo(0, 0);
}
