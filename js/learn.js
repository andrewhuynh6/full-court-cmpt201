// FULL COURT — Learning System

let currentLesson = null;
let currentStage  = 'learn'; // 'learn' | 'practice' | 'quiz'
let currentChapter = null;

// MCQ state
let mcq = { q: 0, answered: false, score: 0, done: false, questions: [], source: null };

// Step-by-step lesson state (reset per lesson)
let currentStep = 0;
let stepState = { passed: {}, q: {}, max: 0 };

// Shuffle options at runtime so the right answer is not always in the same slot.
function shuffleQuestion(q) {
  if (!q.opts) return q;
  const idx = q.opts.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return { ...q, opts: idx.map(i => q.opts[i]), ans: idx.indexOf(q.ans) };
}

const KIND_LABEL = { mcq: '', bug: 'Find the bug', blank: 'Fill the blank', order: 'Put in order', short: 'Short answer', code: 'Write the code' };
const SELF_PASS = 0.67;                       // share of key points you must hit to count a written answer as correct
const isSelfGraded = q => q.type === 'short' || q.type === 'code';

function modelAnswerHtml(q) {
  const model = q.type === 'code' ? codeBlock(q.model) : `<div class="model-text">${q.model}</div>`;
  return `<div class="model-label">Model answer</div>${model}`;
}
function pointsHtml(q, name) {
  return `<div class="model-label">Tick every key point your answer covered</div>` + q.points.map((p, i) => `<label class="pt-row"><input type="checkbox" name="${name}" data-i="${i}"><span>${p}</span></label>`).join('');
}

function qBody(q) {
  const isMcq = !q.type || q.type === 'mcq';
  return q.q + (q.code && isMcq ? `<div class="code-block">${q.code}</div>` : '');
}

// ── Shared question renderer: mcq, bug (tap the line), blank (fill in), order (arrange lines) ──
function renderQuestion(host, q, done, opts = {}) {
  const quiet = !!opts.quiet;   // exam mode: record the answer but do not reveal it
  const type = q.type || 'mcq';
  const L = ['A', 'B', 'C', 'D'];
  let finished = false;
  const finish = ok => {
    if (finished) return;
    finished = true;
    const lead = isSelfGraded(q) ? (ok ? '✓ Good answer. ' : '✗ Study the model answer again. ') : (ok ? '✓ Correct! ' : '✗ Not quite. ');
    host.querySelector('.q-fb').innerHTML = quiet ? '<div class="q-recorded">Answer recorded</div>' : `<div class="mcq-fb ${ok ? 'c' : 'w'}">${lead}${q.exp || ''}</div>`;
    done(ok);
  };

  if (type === 'mcq') {
    host.innerHTML = `<div class="mcq-opts">${q.opts.map((o, i) => `<button class="mcq-opt" data-i="${i}"><span class="mcq-ol">${L[i]}</span><span>${o}</span></button>`).join('')}</div><div class="q-fb"></div>`;
    host.querySelector('.mcq-opts').addEventListener('click', e => {
      const b = e.target.closest('.mcq-opt');
      if (!b || finished) return;
      const i = +b.dataset.i, opts = host.querySelectorAll('.mcq-opt');
      opts.forEach(o => { o.disabled = true; });
      if (quiet) b.classList.add('picked'); else if (i === q.ans) b.classList.add('cor'); else { b.classList.add('wrg'); opts[q.ans].classList.add('show'); }
      finish(i === q.ans);
    });
  }

  if (isSelfGraded(q)) {
    const code = type === 'code';
    host.innerHTML = `<textarea class="ans-box${code ? ' code' : ''}" rows="${code ? 10 : q.long ? 7 : 4}" spellcheck="false" placeholder="${code ? 'Write your code here. Closed book: no peeking!' : 'Answer in 2-3 sentences.'}">${opts.initial ? H_esc(opts.initial) : ''}</textarea>
      ${quiet ? '' : '<button class="btn btn-primary ans-show">Show model answer</button>'}<div class="ans-reveal"></div><div class="q-fb"></div>`;
    const ta = host.querySelector('.ans-box');
    if (quiet) { ta.addEventListener('input', () => opts.onText && opts.onText(ta.value)); return; }
    host.querySelector('.ans-show').addEventListener('click', e => {
      e.target.remove(); ta.readOnly = true;
      host.querySelector('.ans-reveal').innerHTML = modelAnswerHtml(q) + pointsHtml(q, 'pt') + '<button class="btn btn-gold ans-submit" style="margin-top:12px">Done grading myself</button>';
      host.querySelector('.ans-submit').addEventListener('click', ev => {
        const n = host.querySelectorAll('input[name=pt]:checked').length;
        ev.target.disabled = true;
        host.querySelectorAll('input[name=pt]').forEach(c => { c.disabled = true; });
        finish(n / q.points.length >= SELF_PASS);
      });
    });
    return;
  }

  if (type === 'bug') {
    host.innerHTML = `<div class="q-hint">Tap the line.</div><div class="code-lines">${q.lines.map((ln, i) => `<button class="code-line" data-i="${i}"><span class="ln">${i + 1}</span><span class="lt">${H_esc(ln) || '&nbsp;'}</span></button>`).join('')}</div><div class="q-fb"></div>`;
    host.querySelector('.code-lines').addEventListener('click', e => {
      const b = e.target.closest('.code-line');
      if (!b || finished) return;
      const i = +b.dataset.i, rows = host.querySelectorAll('.code-line');
      rows.forEach(r => { r.disabled = true; });
      if (quiet) b.classList.add('picked'); else if (i === q.ans) b.classList.add('cor'); else { b.classList.add('wrg'); rows[q.ans].classList.add('show'); }
      finish(i === q.ans);
    });
  }

  if (type === 'blank') {
    const parts = q.code.split('____');
    host.innerHTML = `<div class="code-block">${H_esc(parts[0])}<span class="blank-slot">?</span>${H_esc(parts[1] || '')}</div><div class="chips">${q.opts.map((o, i) => `<button class="chip" data-i="${i}">${H_esc(o)}</button>`).join('')}</div><div class="q-fb"></div>`;
    host.querySelector('.chips').addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b || finished) return;
      const i = +b.dataset.i, chips = host.querySelectorAll('.chip'), slot = host.querySelector('.blank-slot');
      chips.forEach(c => { c.disabled = true; });
      slot.textContent = q.opts[i];
      slot.classList.add(quiet ? 'picked' : i === q.ans ? 'cor' : 'wrg');
      if (quiet) b.classList.add('picked'); else if (i !== q.ans) chips[q.ans].classList.add('show');
      finish(i === q.ans);
    });
  }

  if (type === 'order') {
    const n = q.lines.length;
    let pool = q.lines.map((_, i) => i), chosen = [];
    do { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; } }
    while (pool.every((v, i) => v === i) && n > 1);
    const cls = q.prose ? 'order-chip prose' : 'order-chip';
    const draw = () => {
      host.querySelector('.order-body').innerHTML = `
        <div class="order-label">Your order (tap a line to remove it)</div>
        <div class="order-answer">${chosen.length ? chosen.map((idx, k) => `<button class="${cls} placed" data-k="${k}"><span class="ln">${k + 1}</span><span class="lt">${H_esc(q.lines[idx])}</span></button>`).join('') : '<div class="order-empty">Tap lines below in the right order</div>'}</div>
        <div class="order-label">Lines</div>
        <div class="order-pool">${pool.map(idx => `<button class="${cls}" data-p="${idx}"><span class="lt">${H_esc(q.lines[idx])}</span></button>`).join('')}</div>
        <button class="btn btn-primary order-check" ${pool.length ? 'disabled' : ''}>Check order</button>`;
    };
    host.innerHTML = `<div class="order-body"></div><div class="q-fb"></div>`;
    draw();
    host.addEventListener('click', e => {
      if (finished) return;
      const p = e.target.closest('[data-p]'), pl = e.target.closest('[data-k]'), chk = e.target.closest('.order-check');
      if (p) { const idx = +p.dataset.p; pool = pool.filter(v => v !== idx); chosen.push(idx); draw(); }
      else if (pl) { const k = +pl.dataset.k; pool.push(chosen[k]); chosen.splice(k, 1); draw(); }
      else if (chk && !chk.disabled) {
        const ok = chosen.every((idx, k) => idx === k);
        host.querySelectorAll('.order-answer .order-chip').forEach((el, k) => { el.disabled = true; if (!quiet) el.classList.add(chosen[k] === k ? 'cor' : 'wrg'); });
        chk.disabled = true;
        if (!ok && !quiet) host.querySelector('.q-fb').insertAdjacentHTML('beforebegin', `<div class="order-label">Correct order</div><div class="code-lines">${q.lines.map((ln, i) => `<div class="code-line static"><span class="ln">${i + 1}</span><span class="lt${q.prose ? ' prose' : ''}">${H_esc(ln)}</span></div>`).join('')}</div>`);
        finish(ok);
      }
    });
  }
}

function showLearnView() {
  renderChapterList();
}

function renderChapterList() {
  currentLesson = null;
  currentChapter = null;
  const v = document.getElementById('view-learn');
  v.innerHTML = `
    <div class="topbar">
      <div class="topbar-title">${icon('dumbbell',22)} TRAINING ROOM</div>
    </div>
    <div class="page-wrap">
      <div class="page-hdr">
        <h2>LEARN</h2>
        <p>Work through each topic. Finishing a topic's lessons unlocks its playoff round.</p>
      </div>
      ${reviewBannerHtml()}
      <div class="chapter-map">
      ${CHAPTERS.map(ch => {
        const done = isChapterComplete(AppState, ch);
        const isCurrent = !done && CHAPTERS.find(c => !isChapterComplete(AppState, c)) === ch;
        const doneLessons = ch.lessons.filter(l => isLessonDone(AppState, l.id)).length;
        return `<div class="chapter-item${done?' done':''}${isCurrent?' current':''}" onclick="showChapter('${ch.id}')">
          <div class="chapter-num">${ch.num}</div>
          <div class="chapter-info">
            <div class="chapter-title">${icon(ch.icon,20)} ${ch.title}</div>
            <div class="chapter-sub">${ch.subtitle}</div>
            <div class="chapter-prog">${doneLessons}/${ch.lessons.length} lessons${ch.bonus ? ' · Bonus topic' : ''}</div>
          </div>
          ${done ? '<span class="tag ok">✓ COMPLETE</span>' : ''}
          <div class="chapter-arrow">${done ? '✓' : '›'}</div>
        </div>`;
      }).join('')}
      </div>
      <div class="learn-foot"><button class="btn btn-secondary" onclick="navigate('playoffs')">${icon('trophy', 18)} Go to the playoffs</button></div>
    </div>`;
}

function showChapter(chId) {
  currentChapter = CHAPTERS.find(c => c.id === chId);
  if (!currentChapter) return;
  const v = document.getElementById('view-learn');
  const done = isChapterComplete(AppState, currentChapter);
  v.innerHTML = `
    <div class="topbar">
      <div class="topbar-title">${icon(currentChapter.icon,22)} ${currentChapter.title}</div>
      <div class="topbar-actions">
        <button class="btn btn-secondary btn-sm" onclick="renderChapterList()">← Back</button>
      </div>
    </div>
    <div class="page-wrap">
      <div class="page-hdr">
        <h2>${currentChapter.title.toUpperCase()}</h2>
        <p>${currentChapter.subtitle}${currentChapter.bonus ? ' · Bonus topic' : ''}</p>
      </div>
      ${currentChapter.lessons.map((lesson, i) => {
        const lrn = isLearnDone(AppState, lesson.id);
        const prc = isPracticeDone(AppState, lesson.id);
        const qz  = isQuizDone(AppState, lesson.id);
        const ldone = lrn && prc && qz;
        return `<div class="lesson-item${ldone?' done':''}" onclick="showLesson('${lesson.id}')">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--dim);min-width:28px">${String(i+1).padStart(2,'0')}</div>
          <div class="lesson-title">${lesson.title}${reviewCountForLesson(lesson.id) ? ` <span class="tag">${reviewCountForLesson(lesson.id)} to review</span>` : ''}</div>
          <div class="lesson-stages">
            <div class="stage-dot${lrn?' done':''}" title="Learn">L</div>
            <div class="stage-dot${prc?' done':''}" title="Practice">P</div>
            <div class="stage-dot${qz?' done':''}" title="Quiz">Q</div>
          </div>
        </div>`;
      }).join('')}
      ${done ? `<div class="panel round-nudge"><div><strong>Topic complete.</strong> ${currentChapter.bonus ? 'The bonus round is open.' : 'Round ' + roundNo(currentChapter) + ' of the playoffs is ready.'}</div><button class="btn btn-gold btn-sm" onclick="navigate('playoffs')">Go to playoffs</button></div>`
        : `<div class="learn-foot-note">Finish all lessons to unlock ${currentChapter.bonus ? 'the bonus round' : 'Round ' + roundNo(currentChapter)} of the playoffs.</div>`}
    </div>`;
}

function showLesson(lessonId) {
  currentLesson = null;
  for (const ch of CHAPTERS) {
    const l = ch.lessons.find(x => x.id === lessonId);
    if (l) { currentLesson = l; currentChapter = ch; break; }
  }
  if (!currentLesson) return;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view-learn').classList.add('active');
  const navLearn = document.getElementById('nav-learn');
  if (navLearn) navLearn.classList.add('active');
  window.scrollTo(0, 0);

  currentStep = 0;
  stepState = { passed: {}, q: {}, max: 0 };
  mcq = { q: 0, answered: false, score: 0, done: false, questions: [], source: null };
  currentStage = 'learn';
  if (isLearnDone(AppState, lessonId)) currentStage = 'practice';
  if (isPracticeDone(AppState, lessonId)) currentStage = 'quiz';
  if (isQuizDone(AppState, lessonId))    currentStage = 'learn';

  renderLesson();
}

function renderLesson() {
  if (!currentLesson) return;
  const id = currentLesson.id;
  const v  = document.getElementById('view-learn');
  const lrn = isLearnDone(AppState, id);
  const prc = isPracticeDone(AppState, id);
  const qz  = isQuizDone(AppState, id);

  v.innerHTML = `
    <div class="topbar">
      <div class="topbar-title">${currentLesson.title}</div>
      <div class="topbar-actions">
        <button class="btn btn-secondary btn-sm" onclick="showChapter('${currentChapter.id}')">← Back</button>
      </div>
    </div>
    <div class="page-wrap">
      <div class="stage-tabs">
        <button class="stage-tab${currentStage==='learn'?' active':''}${lrn?' done':''}" onclick="switchStage('learn')">${lrn?'✓ ':''}Learn</button>
        <button class="stage-tab${currentStage==='practice'?' active':''}${prc?' done':''}" onclick="switchStage('practice')" ${!lrn&&!prc?'disabled':''}>${prc?'✓ ':''}Practice</button>
        <button class="stage-tab${currentStage==='quiz'?' active':''}${qz?' done':''}" onclick="switchStage('quiz')" ${!prc&&!qz?'disabled':''}>${qz?'✓ ':''}Quiz</button>
      </div>
      <div id="stage-content"></div>
    </div>`;
  renderStage();
}

function switchStage(stage) {
  currentStage = stage;
  document.querySelectorAll('.stage-tab').forEach(t => t.classList.remove('active'));
  const tabs = { learn:0, practice:1, quiz:2 };
  const all  = document.querySelectorAll('.stage-tab');
  if (all[tabs[stage]]) all[tabs[stage]].classList.add('active');
  renderStage();
}

function renderStage() {
  const sc = document.getElementById('stage-content');
  if (!sc) return;
  if (currentStage === 'learn')    renderLearnStage(sc);
  if (currentStage === 'practice') renderMCQ(sc, currentLesson.practice, 'practice');
  if (currentStage === 'quiz')     renderMCQ(sc, currentLesson.quiz, 'quiz');
}

function renderLearnStage(sc) {
  if (currentLesson.steps && currentLesson.steps.length) { renderStepsStage(sc); return; }
  renderLegacyLearn(sc);
}

function renderStepsStage(sc) {
  const steps = currentLesson.steps;
  const n = steps.length, s = steps[currentStep];
  const last = currentStep === n - 1;
  const done = isLearnDone(AppState, currentLesson.id);
  const passed = !s.check || stepState.passed[currentStep];
  if (s.check && !stepState.q[currentStep]) stepState.q[currentStep] = shuffleQuestion(s.check);
  const chk = s.check ? stepState.q[currentStep] : null;
  const letters = ['A', 'B', 'C', 'D'];
  const nextLabel = last ? (done ? 'Go to Practice →' : `Finish lesson (+${XP_REWARDS.learn} XP)`) : 'Next →';
  stepState.max = Math.max(stepState.max || 0, currentStep);
  const outline = steps.map((st, i) => {
    const cls = i === currentStep ? 'current' : i < stepState.max ? 'done' : i === stepState.max ? '' : 'locked';
    return `<button class="outline-item ${cls}" ${i > stepState.max ? 'disabled' : ''} onclick="gotoStep(${i})"><span class="oi-dot">${i < stepState.max && i !== currentStep ? '✓' : i + 1}</span><span class="oi-title">${st.title}</span></button>`;
  }).join('');
  sc.innerHTML = `<div class="step-layout"><aside class="step-outline" aria-label="Lesson steps"><div class="step-label" style="margin-top:0">In this lesson</div>${outline}</aside><div class="step-wrap">
    <div class="step-top">
      <span class="step-count">Step ${currentStep + 1} of ${n}</span>
      <div class="progress-bar step-bar"><div class="progress-fill" style="width:${Math.round((currentStep + (passed ? 1 : 0)) / n * 100)}%"></div></div>
    </div>
    <div class="learn-content step-card">
      <div class="step-kicker">${s.kind === 'intro' ? 'Start here' : s.kind === 'recap' ? 'Lesson complete' : 'Concept'}</div>
      <h3>${s.title}</h3>
      ${expandIcons(s.html)}
      ${s.viz ? `<div data-viz="${s.viz}"></div>` : ''}
      ${s.trace ? `<div class="step-trace"><div class="step-label">Trace it</div><p>${s.trace}</p></div>` : ''}
      ${s.why ? `<div class="tip-box">{{i:lightbulb}}<strong>Why it matters:</strong> ${s.why}</div>`.replace(/\{\{i:([a-z-]+)\}\}/g, (m, n) => icon(n, 18)) : ''}
      ${s.mistake ? `<div class="tip-box mistake">{{i:triangle-alert}}<strong>Common mistake:</strong> ${s.mistake}</div>`.replace(/\{\{i:([a-z-]+)\}\}/g, (m, n) => icon(n, 18)) : ''}
      ${chk ? `<div class="step-check">
        <div class="step-check-label">Quick check</div>
        <div class="mcq-q-text">${qBody(chk)}</div>
        <div class="mcq-opts" id="step-opts">
          ${chk.opts.map((o, i) => `<button class="mcq-opt${stepState.passed[currentStep] && i === chk.ans ? ' cor' : ''}" ${stepState.passed[currentStep] ? 'disabled' : ''} onclick="answerStep(${i})"><span class="mcq-ol">${letters[i]}</span><span>${o}</span></button>`).join('')}
        </div>
        <div id="step-fb">${stepState.passed[currentStep] ? `<div class="mcq-fb c">✓ ${chk.exp}</div>` : ''}</div>
      </div>` : ''}
    </div>
    <div class="step-nav">
      <button class="btn btn-secondary" onclick="stepBack()" ${currentStep === 0 ? 'disabled' : ''}>← Back</button>
      <button class="btn btn-primary" id="step-next" onclick="stepNext()" ${passed ? '' : 'disabled'}>${nextLabel}</button>
    </div>
  </div></div>`;
  VIZ.mountAll(sc);
}

function answerStep(i) {
  const chk = stepState.q[currentStep];
  if (!chk || stepState.passed[currentStep]) return;
  const opts = document.querySelectorAll('#step-opts .mcq-opt');
  const fb = document.getElementById('step-fb');
  if (i === chk.ans) {
    stepState.passed[currentStep] = true;
    opts.forEach(o => { o.disabled = true; });
    opts[i].classList.add('cor');
    fb.innerHTML = `<div class="mcq-fb c">✓ ${chk.exp}</div>`;
    document.getElementById('step-next').disabled = false;
    const bar = document.querySelector('.step-bar .progress-fill');
    if (bar) bar.style.width = Math.round((currentStep + 1) / currentLesson.steps.length * 100) + '%';
  } else {
    opts[i].classList.add('wrg');
    opts[i].disabled = true;
    fb.innerHTML = `<div class="mcq-fb w">Not quite. ${chk.hint || 'Re-read this step and try another answer.'}</div>`;
  }
}

function stepNext() {
  const steps = currentLesson.steps;
  if (currentStep < steps.length - 1) {
    currentStep++;
    renderStage();
    window.scrollTo(0, 0);
  } else if (isLearnDone(AppState, currentLesson.id)) {
    switchStage('practice');
  } else {
    completeLearn();
  }
}

function gotoStep(i) {
  if (i <= stepState.max && i !== currentStep) { currentStep = i; renderStage(); window.scrollTo(0, 0); }
}

function stepBack() {
  if (currentStep > 0) { currentStep--; renderStage(); window.scrollTo(0, 0); }
}

function renderLegacyLearn(sc) {
  const id   = currentLesson.id;
  const done = isLearnDone(AppState, id);
  sc.innerHTML = `
    <div class="learn-content">
      ${expandIcons(currentLesson.learn)}
      <div style="margin-top:24px">
        ${done
          ? `<button class="btn btn-secondary btn-lg" onclick="switchStage('practice')">Go to Practice →</button>`
          : `<button class="btn btn-primary btn-lg" onclick="completeLearn()">✓ I've Read This (+${XP_REWARDS.learn} XP)</button>`}
      </div>
    </div>`;
}

function completeLearn() {
  const id = currentLesson.id;
  if (isLearnDone(AppState, id)) return;
  markLearn(AppState, id);
  checkChapterComplete();
  saveState(AppState);
  showXPPopup(XP_REWARDS.learn);
  celebrate();
  updateSidebar();
  renderLesson();
  setTimeout(() => switchStage('practice'), 400);
}

function newMCQ(questions) {
  return { q: 0, answered: false, score: 0, done: false, source: questions, questions: questions.map(shuffleQuestion) };
}

function renderMCQ(sc, questions, mode) {
  const id   = currentLesson.id;
  const done = mode === 'practice' ? isPracticeDone(AppState, id) : isQuizDone(AppState, id);
  if (mcq.source !== questions) {
    if (done) {
      mcq = { q: 0, answered: false, score: 0, done: false, questions: [], source: null };
      sc.innerHTML = `<div class="mcq-wrap">
        <div style="text-align:center;padding:32px 20px">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:48px;color:var(--ok)">✓</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--white);letter-spacing:1px">ALREADY COMPLETED</div>
          <div style="font-size:14px;color:var(--dim);margin-top:6px;margin-bottom:20px">XP already earned. Replay for practice?</div>
          <button class="btn btn-secondary" onclick="startMCQReplay('${mode}')">Replay</button>
          ${mode==='practice' ? `<button class="btn btn-primary" style="margin-left:10px" onclick="switchStage('quiz')">Go to Quiz →</button>` : ''}
        </div>
      </div>`;
      return;
    }
    mcq = newMCQ(questions);
  }
  if (mcq.done) { renderMCQFinal(sc, mode); return; }
  renderMCQQuestion(sc, mode);
}

function startMCQReplay(mode) {
  const src = mode === 'practice' ? currentLesson.practice : currentLesson.quiz;
  mcq = newMCQ(src);
  renderStage();
}

function renderMCQQuestion(sc, mode) {
  const q = mcq.questions[mcq.q];
  const kind = KIND_LABEL[q.type || 'mcq'];
  sc.innerHTML = `<div class="mcq-wrap">
    <div class="mcq-score-bar">
      <div><div class="mcq-score-num">${mcq.score}/${mcq.questions.length}</div><div class="mcq-score-lbl">Score</div></div>
      <div class="mcq-topic">${mode === 'quiz' ? 'QUIZ' : mode === 'review' ? 'REVIEW' : 'PRACTICE'}</div>
      <div class="mcq-qnum">${mcq.q+1}/${mcq.questions.length}</div>
    </div>
    <div class="mcq-question">
      ${kind ? `<div class="step-check-label">${kind}</div>` : ''}
      <div class="mcq-q-text">Q${mcq.q+1}. ${qBody(q)}</div>
      <div id="q-host"></div>
    </div>
    <div class="mcq-nav">
      <button class="btn btn-primary" id="mcq-next" onclick="nextMCQ('${mode}')" disabled>Next →</button>
      <span class="mcq-prog">Q ${mcq.q+1} of ${mcq.questions.length}</span>
    </div>
  </div>`;
  renderQuestion(document.getElementById('q-host'), q, ok => {
    mcq.answered = true;
    if (ok) mcq.score++;
    recordReview(q, ok);
    document.getElementById('mcq-next').disabled = false;
  });
}

function nextMCQ(mode) {
  mcq.q++;
  if (mcq.q < mcq.questions.length) {
    mcq.answered = false;
    const sc = document.getElementById('stage-content');
    renderMCQQuestion(sc, mode);
  } else if (mode === 'review') {
    finishReview();
  } else {
    mcq.done = true;
    const sc = document.getElementById('stage-content');
    // Award XP only once
    const id = currentLesson.id;
    let xpEarned = 0;
    if (mode === 'practice') {
      if (!isPracticeDone(AppState, id)) {
        markPractice(AppState, id, mcq.score, mcq.questions.length);
        xpEarned = XP_REWARDS.practice;
      }
    } else {
      if (!isQuizDone(AppState, id)) {
        markQuiz(AppState, id, mcq.score, mcq.questions.length);
        xpEarned = Math.round(XP_REWARDS.quiz * (mcq.score / mcq.questions.length));
      }
    }
    checkChapterComplete();
    saveState(AppState);
    if (xpEarned) showXPPopup(xpEarned);
    if (mcq.score === mcq.questions.length) celebrate();
    updateSidebar();
    renderMCQFinal(sc, mode);
  }
}

function renderMCQFinal(sc, mode) {
  const pct  = Math.round(mcq.score / mcq.questions.length * 100);
  const grade = pct===100?'A':pct>=80?'B':pct>=60?'C':'D';
  const msg   = pct===100?'NOTHING BUT NET':pct>=80?'GREAT SHOT!':pct>=60?'KEEP TRAINING!':'BACK TO THE FILM ROOM';
  const xpEarned = mode==='quiz' ? Math.round(XP_REWARDS.quiz*(mcq.score/mcq.questions.length)) : XP_REWARDS.practice;
  sc.innerHTML = `<div class="mcq-wrap">
    <div class="final-screen">
      <div class="final-score">${mcq.score}/${mcq.questions.length}</div>
      <div class="final-grade ${grade}">${msg}</div>
      <div class="final-xp-earned">+${xpEarned} XP EARNED</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="startMCQReplay('${mode}')">Try Again</button>
        ${mode==='practice'
          ? `<button class="btn btn-primary" onclick="switchStage('quiz')">Go to Quiz →</button>`
          : `<button class="btn btn-gold" onclick="showChapter('${currentChapter.id}')">Back to Chapter</button>`}
      </div>
    </div>
  </div>`;
  countUp(document.querySelector('.final-score'));
}

function checkChapterComplete() {
  if (!currentChapter) return;
  if (isChapterComplete(AppState, currentChapter) && !AppState.chapters[currentChapter.id]?.completed) {
    markChapter(AppState, currentChapter.id);
    setTimeout(() => {
      showXPPopup(0, 'Topic complete! ' + (currentChapter.bonus ? 'Bonus round unlocked.' : 'Playoff Round ' + roundNo(currentChapter) + ' unlocked.'));
    }, 800);
  }
}
