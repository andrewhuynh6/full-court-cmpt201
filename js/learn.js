// FULL COURT — Learning System

let currentLesson = null;
let currentStage  = 'learn'; // 'learn' | 'practice' | 'quiz'
let currentChapter = null;

// MCQ state
let mcq = { q: 0, answered: false, score: 0, done: false, questions: [], source: null };

// Step-by-step lesson state (reset per lesson)
let currentStep = 0;
let stepState = { passed: {}, q: {} };

// Shuffle options at runtime so the right answer is not always in the same slot.
function shuffleQuestion(q) {
  const idx = q.opts.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return { ...q, opts: idx.map(i => q.opts[i]), ans: idx.indexOf(q.ans) };
}

function qBody(q) {
  return q.q + (q.code ? `<div class="code-block">${q.code}</div>` : '');
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
        <p>Select a chapter to begin your training</p>
      </div>
      ${CHAPTERS.map(ch => {
        const done = isChapterComplete(AppState, ch);
        const doneLessons = ch.lessons.filter(l => isLessonDone(AppState, l.id)).length;
        return `<div class="chapter-item${done?' done':''}" onclick="showChapter('${ch.id}')">
          <div class="chapter-num">${ch.num}</div>
          <div class="chapter-info">
            <div class="chapter-title">${icon(ch.icon,20)} ${ch.title}</div>
            <div class="chapter-sub">${ch.subtitle}</div>
            <div class="chapter-prog">${doneLessons}/${ch.lessons.length} lessons · Reward: ${ch.packReward}</div>
          </div>
          ${done ? '<span class="tag ok">✓ COMPLETE</span>' : ''}
          <div class="chapter-arrow">${done ? '✓' : '›'}</div>
        </div>`;
      }).join('')}
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
        <p>${currentChapter.subtitle} · ${currentChapter.packReward} on completion</p>
      </div>
      ${currentChapter.lessons.map((lesson, i) => {
        const lrn = isLearnDone(AppState, lesson.id);
        const prc = isPracticeDone(AppState, lesson.id);
        const qz  = isQuizDone(AppState, lesson.id);
        const ldone = lrn && prc && qz;
        return `<div class="lesson-item${ldone?' done':''}" onclick="showLesson('${lesson.id}')">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--dim);min-width:28px">${String(i+1).padStart(2,'0')}</div>
          <div class="lesson-title">${lesson.title}</div>
          <div class="lesson-stages">
            <div class="stage-dot${lrn?' done':''}" title="Learn">L</div>
            <div class="stage-dot${prc?' done':''}" title="Practice">P</div>
            <div class="stage-dot${qz?' done':''}" title="Quiz">Q</div>
          </div>
        </div>`;
      }).join('')}
      ${done ? `<div style="margin-top:16px"><div class="tag ok" style="font-size:12px;padding:6px 14px">✓ Chapter Complete! Reward sent to your pack queue.</div></div>` : ''}
      ${!done ? `<div style="margin-top:12px;font-size:12px;color:var(--dim)">Complete all lessons to unlock ${currentChapter.packReward}.</div>` : ''}
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
  stepState = { passed: {}, q: {} };
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
  sc.innerHTML = `<div class="step-wrap">
    <div class="step-top">
      <span class="step-count">Step ${currentStep + 1} of ${n}</span>
      <div class="progress-bar step-bar"><div class="progress-fill" style="width:${Math.round((currentStep + (passed ? 1 : 0)) / n * 100)}%"></div></div>
    </div>
    <div class="learn-content step-card">
      <h3>${s.title}</h3>
      ${expandIcons(s.html)}
      ${s.viz ? `<div data-viz="${s.viz}"></div>` : ''}
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
  </div>`;
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
  const q  = mcq.questions[mcq.q];
  const letters = ['A','B','C','D'];
  sc.innerHTML = `<div class="mcq-wrap">
    <div class="mcq-score-bar">
      <div><div class="mcq-score-num">${mcq.score}/${mcq.questions.length}</div><div class="mcq-score-lbl">Score</div></div>
      <div class="mcq-topic">${mode === 'quiz' ? 'QUIZ' : 'PRACTICE'}</div>
      <div class="mcq-qnum">${mcq.q+1}/${mcq.questions.length}</div>
    </div>
    <div class="mcq-question">
      <div class="mcq-q-text">Q${mcq.q+1}. ${qBody(q)}</div>
      <div class="mcq-opts" id="mcq-opts">
        ${q.opts.map((o,i) => `<button class="mcq-opt" id="mop${i}" onclick="answerMCQ(${i},'${mode}')">
          <span class="mcq-ol">${letters[i]}</span><span>${o}</span>
        </button>`).join('')}
      </div>
      <div id="mcq-fb"></div>
    </div>
    <div class="mcq-nav">
      <button class="btn btn-primary" id="mcq-next" onclick="nextMCQ('${mode}')" disabled>Next →</button>
      <span class="mcq-prog">Q ${mcq.q+1} of ${mcq.questions.length}</span>
    </div>
  </div>`;
}

function answerMCQ(i, mode) {
  if (mcq.answered) return;
  mcq.answered = true;
  const q = mcq.questions[mcq.q];
  document.querySelectorAll('.mcq-opt').forEach(o => o.disabled = true);
  const opts = document.querySelectorAll('.mcq-opt');
  const fb   = document.getElementById('mcq-fb');
  if (i === q.ans) {
    opts[i].classList.add('cor');
    mcq.score++;
    if (fb) fb.innerHTML = `<div class="mcq-fb c">✓ Correct! ${q.exp}</div>`;
  } else {
    opts[i].classList.add('wrg');
    opts[q.ans].classList.add('show');
    if (fb) fb.innerHTML = `<div class="mcq-fb w">✗ Incorrect. ${q.exp}</div>`;
  }
  const nb = document.getElementById('mcq-next');
  if (nb) nb.disabled = false;
}

function nextMCQ(mode) {
  mcq.q++;
  if (mcq.q < mcq.questions.length) {
    mcq.answered = false;
    const sc = document.getElementById('stage-content');
    renderMCQQuestion(sc, mode);
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
}

function checkChapterComplete() {
  if (!currentChapter) return;
  if (isChapterComplete(AppState, currentChapter) && !AppState.chapters[currentChapter.id]?.completed) {
    markChapter(AppState, currentChapter.id, currentChapter.packReward);
    updatePackBadge();
    setTimeout(() => {
      showXPPopup(0, 'Chapter Complete! ' + currentChapter.packReward + ' added to your queue!');
    }, 800);
  }
}

// Game Day
let gameState = { pts: 0, opp: 0, q: 0, answered: false, questions: [], chapterId: null };

function showGameDay(chId) {
  navigate('gameday');
  const ch = CHAPTERS.find(c => c.id === chId);
  if (!ch) { renderGameDayLocked(); return; }
  if (!isChapterComplete(AppState, ch)) { renderGameDayLocked(); return; }

  // Build question pool from all chapter lessons
  const pool = [];
  ch.lessons.forEach(l => pool.push(...l.quiz));
  const shuffled = pool.sort(() => Math.random()-.5).slice(0, 10).map(shuffleQuestion);
  gameState = { pts: 0, opp: Math.floor(Math.random()*30+50), q: 0, answered: false, questions: shuffled, chapterId: chId, done: false };
  renderGameDayQuestion();
}

function renderGameDayLocked() {
  const v = document.getElementById('view-gameday');
  v.innerHTML = `<div class="topbar"><div class="topbar-title">GAME DAY</div></div>
  <div class="page-wrap">
    <div class="empty-state">
      <div class="empty-icon">${icon('lock',48)}</div>
      <h3>LOCKED</h3>
      <p>Complete a full chapter to unlock Game Day.</p>
      <button class="btn btn-primary" style="margin-top:16px" onclick="navigate('learn')">Go to Training</button>
    </div>
    <div style="margin-top:24px">
      ${CHAPTERS.map(ch => {
        const done = isChapterComplete(AppState, ch);
        return `<div class="chapter-item${done?'':' locked'}" onclick="${done?`showGameDay('${ch.id}')`:''}">
          <div class="chapter-num">${ch.num}</div>
          <div class="chapter-info">
            <div class="chapter-title">${icon(ch.icon,20)} ${ch.title} — Game Day</div>
            <div class="chapter-sub">${ch.subtitle}</div>
          </div>
          ${done ? '<span class="tag ok">AVAILABLE</span>' : '<span class="tag" style="color:var(--dim)">LOCKED</span>'}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function renderGameDayQuestion() {
  const v = document.getElementById('view-gameday');
  if (gameState.done) { renderGameDayResult(); return; }
  const q  = gameState.questions[gameState.q];
  const ch = CHAPTERS.find(c => c.id === gameState.chapterId);
  const letters = ['A','B','C','D'];
  v.innerHTML = `<div class="topbar"><div class="topbar-title">GAME DAY — ${ch?.title||''}</div></div>
  <div class="page-wrap">
    <div class="scoreboard">
      <div class="sb-team"><div class="sb-name">YOU</div><div class="sb-pts">${gameState.pts}</div><div class="sb-info">Points</div></div>
      <div class="sb-sep">VS</div>
      <div class="sb-team"><div class="sb-name">CPU</div><div class="sb-pts">${gameState.opp}</div><div class="sb-info">Points</div></div>
    </div>
    <div style="margin-bottom:12px;display:flex;gap:10px;align-items:center">
      <span class="mcq-prog" style="font-size:13px">Possession ${gameState.q+1} of ${gameState.questions.length}</span>
      <div class="progress-bar" style="flex:1;height:6px"><div class="progress-fill" style="width:${((gameState.q)/gameState.questions.length*100)}%"></div></div>
    </div>
    <div class="mcq-question">
      <div class="mcq-q-text">Q${gameState.q+1}. ${qBody(q)}</div>
      <div class="mcq-opts" id="gd-opts">
        ${q.opts.map((o,i) => `<button class="mcq-opt" id="gdop${i}" onclick="answerGameDay(${i})">
          <span class="mcq-ol">${letters[i]}</span><span>${o}</span>
        </button>`).join('')}
      </div>
      <div id="gd-fb"></div>
    </div>
    <div class="mcq-nav">
      <button class="btn btn-primary" id="gd-next" onclick="nextGameDay()" disabled>Next Possession →</button>
    </div>
  </div>`;
}

function answerGameDay(i) {
  if (gameState.answered) return;
  gameState.answered = true;
  const q = gameState.questions[gameState.q];
  document.querySelectorAll('.mcq-opt').forEach(o => o.disabled = true);
  const opts = document.querySelectorAll('.mcq-opt');
  const fb   = document.getElementById('gd-fb');
  if (i === q.ans) {
    opts[i].classList.add('cor');
    gameState.pts += Math.floor(Math.random()*3+2)*2; // 2-pt or 3-pt
    if (fb) fb.innerHTML = `<div class="mcq-fb c">${icon('dribbble',18)} SCORED! +${2} pts — ${q.exp}</div>`;
  } else {
    opts[i].classList.add('wrg');
    opts[q.ans].classList.add('show');
    if (fb) fb.innerHTML = `<div class="mcq-fb w">${icon('circle-x',18)} MISSED SHOT — ${q.exp}</div>`;
  }
  const nb = document.getElementById('gd-next');
  if (nb) nb.disabled = false;
}

function nextGameDay() {
  gameState.q++;
  gameState.answered = false;
  if (gameState.q >= gameState.questions.length) {
    gameState.done = true;
    AppState.stats.gamesPlayed++;
    if (gameState.pts > gameState.opp) AppState.stats.gamesWon++;
    // Award XP
    const xp = Math.round(gameState.pts * 1.5);
    const prev = AppState.player.xp;
    addXP(AppState, xp);
    checkPackMilestone(AppState, prev, AppState.player.xp);
    saveState(AppState);
    updateSidebar();
    updatePackBadge();
  }
  renderGameDayQuestion();
}

function renderGameDayResult() {
  const v    = document.getElementById('view-gameday');
  const win  = gameState.pts > gameState.opp;
  const pct  = Math.round(gameState.pts / (gameState.pts + gameState.opp) * 100);
  const xp   = Math.round(gameState.pts * 1.5);
  v.innerHTML = `<div class="topbar"><div class="topbar-title">FINAL BUZZER</div></div>
  <div class="page-wrap">
    <div class="scoreboard">
      <div class="sb-team"><div class="sb-name">YOU</div><div class="sb-pts" style="color:${win?'var(--ok)':'var(--bad)'}">${gameState.pts}</div></div>
      <div class="sb-sep">${win?icon('trophy',36):icon('frown',36)}</div>
      <div class="sb-team"><div class="sb-name">CPU</div><div class="sb-pts">${gameState.opp}</div></div>
    </div>
    <div class="final-screen">
      <div class="final-grade ${win?'A':'D'}">${win?'VICTORY!':'TOUGH LOSS'}</div>
      <div class="final-xp-earned">+${xp} XP EARNED</div>
      <div style="font-size:12px;color:var(--dim);margin-bottom:20px">${gameState.pts} pts scored · ${gameState.questions.length} possessions</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="showGameDay('${gameState.chapterId}')">Play Again</button>
        <button class="btn btn-primary" onclick="navigate('dashboard')">Back to Dashboard</button>
      </div>
    </div>
  </div>`;
}
