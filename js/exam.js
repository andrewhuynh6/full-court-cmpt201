// CMPT201 LAB — Playoffs and Championship.
// Each playoff round is an exam on one topic and unlocks only after you finish that topic's lessons and pass the previous round.
// The Championship mirrors the real final: 15 short answers (2 pts) + 5 long answers (4 pts), timed, self-graded against model answers.

const PLAYOFF = { roundCount: 10, roundMinutes: 15, passPct: 70, shortN: 15, longN: 5, finalMinutes: 180 };
const roundPackOf = id => (CHAPTERS.find(c => c.id === id) || {}).roundPack || 'Bronze Pack';
const FINAL_PACK = 'Diamond Premium';

let examState = null;

const coreChapters = () => CHAPTERS.filter(c => !c.bonus && c.lessons.length);
const roundRec = id => (AppState.playoffs && AppState.playoffs[id]) || { best: 0, attempts: 0, passed: false };
const finalRec = () => AppState.exam || { best: 0, attempts: 0, passed: false };
const roundNo = ch => coreChapters().indexOf(ch) + 1;

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ── Unlock rules ───────────────────────────────────────────────────

function roundStatus(ch) {
  const rec = roundRec(ch.id);
  const lessonsDone = ch.lessons.filter(l => isLessonDone(AppState, l.id)).length;
  if (rec.passed) return { state: 'passed', rec };
  if (lessonsDone < ch.lessons.length) return { state: 'locked', reason: `Finish all ${ch.lessons.length} lessons first (${lessonsDone}/${ch.lessons.length})`, rec };
  if (!ch.bonus) {
    const prev = coreChapters()[coreChapters().indexOf(ch) - 1];
    if (prev && !roundRec(prev.id).passed) return { state: 'locked', reason: `Pass Round ${roundNo(prev)} first`, rec };
  }
  return { state: 'ready', rec };
}

function finalStatus() {
  const left = coreChapters().filter(c => !roundRec(c.id).passed);
  if (left.length) return { state: 'locked', reason: `Pass every round first (${coreChapters().length - left.length}/${coreChapters().length})` };
  return { state: finalRec().passed ? 'passed' : 'ready' };
}

function activateView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  const nav = document.getElementById('nav-' + name);
  if (nav) nav.classList.add('active');
  window.scrollTo(0, 0);
}

// ── Playoffs view: the bracket ─────────────────────────────────────

function roundCardHtml(ch, label) {
  const st = roundStatus(ch);
  const rec = st.rec;
  const rw = roundPackOf(ch.id);
  const action = st.state === 'locked'
    ? `<button class="btn btn-secondary btn-sm" onclick="showChapter('${ch.id}');navigate('learn')">Study</button>`
    : `<button class="btn ${st.state === 'passed' ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="showRoundIntro('${ch.id}')">${st.state === 'passed' ? 'Retake' : 'Play round'}</button>`;
  return `<div class="round-card ${st.state}">
    <div class="round-badge">${st.state === 'passed' ? icon('check', 22) : st.state === 'locked' ? icon('lock', 20) : icon(ch.icon, 22)}</div>
    <div class="round-info">
      <div class="round-label">${label}</div>
      <div class="round-title">${ch.title}</div>
      <div class="round-sub">${st.state === 'locked' ? st.reason : st.state === 'passed' ? `Passed · best ${rec.best}%` : `Ready · ${PLAYOFF.roundCount} questions · ${PLAYOFF.roundMinutes} min`}</div>
      ${st.state !== 'passed' ? `<div class="round-reward">${icon('gift', 16)} First pass: ${rw}</div>` : ''}
    </div>
    ${action}
  </div>`;
}

function renderPlayoffs() {
  stopExamTimer();
  examState = null;
  const v = document.getElementById('view-playoffs');
  const fs = finalStatus(), fr = finalRec();
  const core = coreChapters();
  const passed = core.filter(c => roundRec(c.id).passed).length;
  v.innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('trophy', 22)} PLAYOFFS</div></div>
    <div class="page-wrap">
      <div class="page-hdr"><h2>ROAD TO THE CHAMPIONSHIP</h2>
        <p>Finish a topic's lessons, then win its round. Win every round to reach the Championship.</p></div>
      <div class="bracket">
        ${core.map((ch, i) => roundCardHtml(ch, 'ROUND ' + (i + 1))).join('')}
        <div class="champ-card ${fs.state}">
          <div class="champ-trophy">${icon('trophy', 34)}</div>
          <div class="round-info">
            <div class="round-label">CHAMPIONSHIP</div>
            <div class="round-title">The Final Exam</div>
            <div class="round-sub">${fs.state === 'locked' ? fs.reason : `${PLAYOFF.shortN} short answers + ${PLAYOFF.longN} long answers · ${PLAYOFF.finalMinutes / 60} hours${fr.attempts ? ` · best ${fr.best}%` : ''}`}</div>
            ${!fr.passed ? `<div class="round-reward">${icon('gift', 16)} First pass: ${FINAL_PACK}</div>` : ''}
          </div>
          ${fs.state === 'locked' ? `<span class="tag">${passed}/${core.length} rounds</span>` : `<button class="btn btn-gold" onclick="showFinalIntro()">${fr.passed ? 'Retake' : 'Start'}</button>`}
        </div>
      </div>
      ${CHAPTERS.filter(c => c.bonus).map(ch => `<div class="panel" style="margin-top:20px"><div class="panel-title">Bonus round (optional)</div>${roundCardHtml(ch, 'BONUS')}</div>`).join('')}
    </div>`;
}

// ── Intro screens ──────────────────────────────────────────────────

function showRoundIntro(chId) {
  const ch = CHAPTERS.find(c => c.id === chId);
  if (!ch || roundStatus(ch).state === 'locked') return;
  stopExamTimer(); examState = null;
  activateView('playoffs');
  document.getElementById('view-playoffs').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon(ch.icon, 22)} ${ch.bonus ? 'BONUS' : 'ROUND ' + roundNo(ch)}</div>
      <div class="topbar-actions"><button class="btn btn-secondary btn-sm" onclick="renderPlayoffs()">← Back</button></div></div>
    <div class="page-wrap"><div class="step-wrap">
      <div class="page-hdr"><h2>${ch.title.toUpperCase()}</h2><p>An exam on this whole topic.</p></div>
      <div class="panel">
        <ul class="exam-rules">
          <li><strong>${PLAYOFF.roundCount} questions</strong> drawn from every lesson in this topic.</li>
          <li><strong>${PLAYOFF.roundMinutes} minutes.</strong> Unanswered questions count as wrong.</li>
          <li><strong>No feedback until the end.</strong> You cannot go back.</li>
          <li><strong>Pass with ${PLAYOFF.passPct}%.</strong> The first pass earns a ${roundPackOf(ch.id)} and 100 XP.</li>
          <li>Leaving this screen ends the attempt. Misses go into your review queue.</li>
        </ul>
        <button class="btn btn-gold btn-lg" style="margin-top:16px" onclick="startRound('${ch.id}')">Tip off</button>
      </div></div></div>`;
}

function showFinalIntro() {
  if (finalStatus().state === 'locked') return;
  stopExamTimer(); examState = null;
  activateView('playoffs');
  const hasSec = CHAPTERS.some(c => c.bonus && roundRec(c.id).passed);
  document.getElementById('view-playoffs').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('trophy', 22)} CHAMPIONSHIP</div>
      <div class="topbar-actions"><button class="btn btn-secondary btn-sm" onclick="renderPlayoffs()">← Back</button></div></div>
    <div class="page-wrap"><div class="step-wrap">
      <div class="page-hdr"><h2>THE FINAL EXAM</h2><p>Built like the real thing. Write your answers, then grade yourself against model answers.</p></div>
      <div class="panel">
        <ul class="exam-rules">
          <li><strong>${PLAYOFF.shortN} short answers</strong> (2 pts each, 2-3 sentences) and <strong>${PLAYOFF.longN} long answers</strong> (4 pts each, code or reasoning).</li>
          <li><strong>${PLAYOFF.finalMinutes / 60} hours</strong>, closed book. No feedback until you finish.</li>
          <li>After you submit, you tick the key points each answer covered. That is your score.</li>
          <li><strong>Pass with ${PLAYOFF.passPct}%.</strong> The first pass earns a ${FINAL_PACK} and 300 XP.</li>
        </ul>
        ${CHAPTERS.some(c => c.bonus) ? `<label class="pt-row" style="margin-top:12px"><input type="checkbox" id="incl-sec" ${hasSec ? 'checked' : ''}><span>Include security and crypto questions (bonus topic)</span></label>` : ''}
        <button class="btn btn-gold btn-lg" style="margin-top:16px" onclick="startFinal()">Begin exam</button>
      </div></div></div>`;
}

// ── Building and running an exam ───────────────────────────────────

function drawBalanced(groups, n) {
  const g = groups.map(x => shuffled(x)).filter(x => x.length);
  const out = [];
  let i = 0;
  while (out.length < n && g.some(x => x.length)) {
    const bucket = g[i++ % g.length];
    if (bucket.length) out.push(bucket.pop());
  }
  return out;
}

function startRound(chId) {
  const ch = CHAPTERS.find(c => c.id === chId);
  const pool = ch.lessons.flatMap(l => [...(l.practice || []), ...(l.quiz || [])]).filter(q => !isSelfGraded(q));
  const items = shuffled(pool).slice(0, PLAYOFF.roundCount).map(q => ({ q: shuffleQuestion(q), chId, pts: 1, self: false }));
  beginExam({ kind: 'round', chId, title: ch.bonus ? 'BONUS' : 'ROUND ' + roundNo(ch), minutes: PLAYOFF.roundMinutes, items });
}

function startFinal() {
  const sec = document.getElementById('incl-sec');
  const incl = sec ? sec.checked : false;
  const chs = CHAPTERS.filter(c => incl || !c.bonus);
  const byCh = id => (WRITTEN.short || []).filter(q => q.ch === id);
  const shorts = drawBalanced(chs.map(c => byCh(c.id)), PLAYOFF.shortN);
  const longs = drawBalanced(chs.map(c => (WRITTEN.long || []).filter(q => q.ch === c.id)), PLAYOFF.longN);
  const items = [...shuffled(shorts), ...longs].map(q => ({ q, chId: q.ch, pts: q.type === 'code' || q.long ? 4 : 2, self: true }));
  if (!items.length) return;
  beginExam({ kind: 'final', title: 'CHAMPIONSHIP', minutes: PLAYOFF.finalMinutes, items });
}

function beginExam(cfg) {
  examState = { ...cfg, idx: 0, answers: [], endsAt: Date.now() + cfg.minutes * 60000, startedAt: Date.now(), timer: null, done: false, phase: 'run' };
  activateView('playoffs');
  document.getElementById('view-playoffs').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('trophy', 22)} ${cfg.title}</div>
      <div class="topbar-actions"><div class="exam-timer" id="exam-timer"></div></div></div>
    <div class="page-wrap"><div id="exam-body"></div></div>`;
  examState.timer = setInterval(examTick, 1000);
  examTick();
  renderExamQuestion();
}

function stopExamTimer() {
  if (examState && examState.timer) { clearInterval(examState.timer); examState.timer = null; }
}

function fmtClock(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
}

function examTick() {
  const el = document.getElementById('exam-timer');
  if (!examState || examState.done || examState.phase !== 'run' || !el) { stopExamTimer(); return; }
  const left = Math.max(0, examState.endsAt - Date.now());
  el.textContent = fmtClock(left);
  el.classList.toggle('low', left < Math.min(5 * 60000, examState.minutes * 6000));
  if (left <= 0) finishRun(true);
}

function renderExamQuestion() {
  const st = examState;
  const it = st.items[st.idx];
  const { q } = it;
  const n = st.items.length, last = st.idx === n - 1;
  const kind = KIND_LABEL[q.type || 'mcq'];
  document.getElementById('exam-body').innerHTML = `<div class="mcq-wrap">
    <div class="step-top"><span class="step-count">Question ${st.idx + 1} of ${n}${it.pts > 1 ? ` · ${it.pts} pts` : ''}</span>
      <div class="progress-bar step-bar"><div class="progress-fill" style="width:${Math.round(st.idx / n * 100)}%"></div></div></div>
    <div class="mcq-question">
      ${kind ? `<div class="step-check-label">${kind}</div>` : ''}
      <div class="mcq-q-text">${qBody(q)}</div>
      <div id="q-host"></div>
    </div>
    <div class="mcq-nav"><button class="btn btn-primary" id="exam-next" ${it.self ? '' : 'disabled'} onclick="examNext()">${last ? (st.kind === 'final' ? 'Submit exam' : 'Finish exam') : 'Next →'}</button></div>
  </div>`;
  const prev = st.answers[st.idx];
  renderQuestion(document.getElementById('q-host'), q, ok => {
    st.answers[st.idx] = ok;
    document.getElementById('exam-next').disabled = false;
  }, { quiet: true, initial: it.self && prev ? prev.text : '', onText: t => { st.answers[st.idx] = { text: t }; } });
  window.scrollTo(0, 0);
}

function examNext() {
  if (!examState || examState.done) return;
  if (examState.idx < examState.items.length - 1) { examState.idx++; renderExamQuestion(); }
  else finishRun(false);
}

// Auto-graded questions are scored now. Written ones go to a self-grading screen first.
function finishRun(timeUp) {
  const st = examState;
  if (!st || st.phase !== 'run') return;
  stopExamTimer();
  st.timeUp = timeUp;
  st.endedAt = Math.min(Date.now(), st.endsAt);
  if (st.items.some(i => i.self)) { st.phase = 'grade'; renderGrading(); }
  else finishExam();
}

function renderGrading() {
  const st = examState;
  const rows = st.items.map((it, i) => ({ it, i })).filter(x => x.it.self);
  document.getElementById('view-playoffs').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('trophy', 22)} GRADE YOURSELF</div></div>
    <div class="page-wrap"><div class="step-wrap">
      <div class="page-hdr"><h2>${st.timeUp ? "TIME'S UP. " : ''}GRADE YOUR ANSWERS</h2>
        <p>Compare each answer with the model answer, then tick the key points you covered. Be honest: this is how you find what to study.</p></div>
      ${rows.map(({ it, i }, k) => {
        const a = st.answers[i];
        const text = a && a.text ? a.text.trim() : '';
        return `<div class="panel grade-item" data-i="${i}">
          <div class="grade-head"><span class="step-count">Question ${k + 1} · ${it.pts} pts</span></div>
          <div class="mcq-q-text">${qBody(it.q)}</div>
          <div class="model-label">Your answer</div>
          ${it.q.type === 'code' ? `<div class="code-block">${text ? H_esc(text) : '(blank)'}</div>` : `<div class="your-answer">${text ? H_esc(text) : '(blank)'}</div>`}
          ${modelAnswerHtml(it.q)}
          ${pointsHtml(it.q, 'g' + i)}
        </div>`;
      }).join('')}
      <button class="btn btn-gold btn-lg" onclick="finishGrading()">See my score</button>
    </div></div>`;
  window.scrollTo(0, 0);
}

function finishGrading() {
  const st = examState;
  st.items.forEach((it, i) => {
    if (!it.self) return;
    const n = document.querySelectorAll(`input[name=g${i}]:checked`).length;
    st.answers[i] = { text: (st.answers[i] && st.answers[i].text) || '', ratio: n / it.q.points.length };
  });
  finishExam();
}

function correctAnswerHtml(q) {
  const t = q.type || 'mcq';
  if (t === 'mcq' || t === 'blank') return `<code>${H_esc(String(q.opts[q.ans]).replace(/<[^>]+>/g, ''))}</code>`;
  if (t === 'bug') return `line ${q.ans + 1}: <code>${H_esc(q.lines[q.ans])}</code>`;
  return q.lines.map(l => `<code>${H_esc(l.trim())}</code>`).join('<br>');
}

function finishExam() {
  const st = examState;
  if (!st || st.done) return;
  st.done = true;
  st.phase = 'done';
  stopExamTimer();
  let total = 0, earned = 0;
  const byCh = {};
  const missed = [];
  st.items.forEach((it, i) => {
    const a = st.answers[i];
    const frac = it.self ? ((a && a.ratio) || 0) : (a === true ? 1 : 0);
    total += it.pts; earned += it.pts * frac;
    const b = byCh[it.chId] = byCh[it.chId] || { got: 0, total: 0 };
    b.total += it.pts; b.got += it.pts * frac;
    const good = it.self ? frac >= SELF_PASS : frac === 1;
    if (!good) missed.push(it);
    if (it.self ? (a && a.ratio !== undefined) : (a !== undefined || st.timeUp)) recordReview(it.q, good);
  });
  const pct = Math.round(earned / total * 100);
  const passed = pct >= PLAYOFF.passPct;
  const isFinal = st.kind === 'final';
  const rec = isFinal ? (AppState.exam || (AppState.exam = { best: 0, attempts: 0, passed: false }))
    : ((AppState.playoffs = AppState.playoffs || {})[st.chId] = AppState.playoffs[st.chId] || { best: 0, attempts: 0, passed: false });
  const firstPass = passed && !rec.passed;
  rec.attempts++; rec.best = Math.max(rec.best, pct); if (passed) rec.passed = true;
  const packType = isFinal ? FINAL_PACK : roundPackOf(st.chId);
  let packIdx = -1;
  if (firstPass) { givePack(AppState, packType, isFinal ? 'Championship' : st.title); packIdx = AppState.packQueue.length - 1; }
  const xp = Math.round(earned * (isFinal ? 4 : 5)) + (firstPass ? (isFinal ? 300 : 100) : 0);
  if (xp) { addXP(AppState, xp); updateSidebar(); }
  saveState(AppState);
  updatePackBadge();

  const secs = Math.round(((st.endedAt || Date.now()) - st.startedAt) / 1000);
  const time = Math.floor(secs / 3600) ? Math.floor(secs / 3600) + 'h ' + String(Math.floor(secs / 60) % 60).padStart(2, '0') + 'm' : Math.floor(secs / 60) + 'm ' + String(secs % 60).padStart(2, '0') + 's';
  const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= PLAYOFF.passPct ? 'C' : 'D';
  const chRows = isFinal ? CHAPTERS.filter(c => byCh[c.id]).map(ch => {
    const r = byCh[ch.id], p = Math.round(r.got / r.total * 100);
    return `<div class="exam-ch"><div class="exam-ch-name">${icon(ch.icon, 18)} ${ch.title}</div><div class="exam-ch-bar"><div class="progress-bar" style="margin:0"><div class="progress-fill" style="width:${p}%"></div></div></div><div class="exam-ch-score">${Math.round(r.got * 10) / 10}/${r.total}</div></div>`;
  }).join('') : '';
  const weakest = isFinal ? Object.entries(byCh).map(([id, r]) => ({ id, p: r.got / r.total })).sort((a, b) => a.p - b.p)[0] : null;
  const weakCh = weakest && CHAPTERS.find(c => c.id === weakest.id);
  document.getElementById('view-playoffs').innerHTML = `
    <div class="topbar"><div class="topbar-title">${icon('trophy', 22)} ${isFinal ? 'CHAMPIONSHIP' : st.title} RESULTS</div>
      <div class="topbar-actions"><button class="btn btn-secondary btn-sm" onclick="renderPlayoffs()">Done</button></div></div>
    <div class="page-wrap"><div class="step-wrap">
      <div class="final-screen" style="padding-top:8px">
        <div class="final-score">${pct}%</div>
        <div class="final-grade ${grade}">${passed ? (isFinal ? 'CHAMPION' : 'ROUND WON') : 'NOT YET'}${st.timeUp ? ' · TIME UP' : ''}</div>
        <div class="final-xp-earned">+${xp} XP${firstPass ? ' · FIRST PASS BONUS' : ''}</div>
        <div class="exam-meta">${Math.round(earned * 10) / 10} of ${total} pts · ${time}${pct >= rec.best && rec.attempts > 1 ? ' · New best' : ''}</div>
        ${packIdx >= 0 ? `<button class="btn btn-gold" data-pack-btn style="margin-top:14px" onclick="openPack(${packIdx})">${icon('gift', 18)} Open your ${packType}</button>` : ''}
      </div>
      ${isFinal ? `<div class="panel"><div class="panel-title">Score by topic</div>${chRows}
        ${weakCh && weakest.p < 1 ? `<div class="exam-weak">Weakest: <strong>${weakCh.title}</strong>. Open that topic to study it.</div>` : ''}</div>` : ''}
      ${missed.length ? `<div class="panel" style="margin-top:16px"><div class="panel-title">Questions to learn from (${missed.length})</div>${missed.map(m => `<div class="exam-miss">
        <div class="exam-miss-q">${m.self ? m.q.q : qBody(m.q).replace(/<div class="code-block">[\s\S]*?<\/div>/, '')}</div>
        <div class="exam-miss-a"><span>${m.self ? 'Model answer' : 'Correct answer'}</span>${m.self ? (m.q.type === 'code' ? codeBlock(m.q.model) : m.q.model) : correctAnswerHtml(m.q)}</div>
        ${m.self ? '' : `<div class="exam-miss-e">${m.q.exp}</div>`}</div>`).join('')}
        <div class="review-sub" style="margin-top:12px">These are now in your review queue.</div></div>` : ''}
      <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
        <button class="btn btn-gold" onclick="${isFinal ? 'showFinalIntro()' : `showRoundIntro('${st.chId}')`}">Retake</button>
        ${missed.length ? `<button class="btn btn-primary" onclick="startReview()">Review mistakes</button>` : ''}
        <button class="btn btn-secondary" onclick="renderPlayoffs()">Back to bracket</button>
      </div>
    </div></div>`;
  window.scrollTo(0, 0);
  countUp(document.querySelector('.final-score'));
  if (passed) celebrate();
}
