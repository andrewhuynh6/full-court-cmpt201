// CMPT201 LAB — Lesson authoring kit. Lessons follow the course slides, one lesson per slide deck.
// Every question is written from the lesson's own steps, so nothing is asked that was not taught.
//   mc(q, [correct, wrong, wrong, wrong], exp, code?)   multiple choice (the correct option goes first; options are shuffled at runtime)
//   step(title, html, why, mistake, check, viz?)        one teaching step with a quick check

const H_esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const codeBlock = s => `<div class="code-block">${H_esc(s.replace(/^\n/, '').replace(/\n$/, ''))}</div>`;
const tipBox = s => `<div class="tip-box">{{i:lightbulb}}${s}</div>`;
const warnBox = s => `<div class="tip-box">{{i:triangle-alert}}${s}</div>`;

const mc = (q, opts, exp, code) => ({ q, opts, ans: 0, exp, ...(code ? { code: H_esc(code.replace(/^\n/, '').replace(/\n$/, '')) } : {}) });
const step = (title, html, why, mistake, check, viz, trace) => ({ title, html, why, mistake, check, ...(viz ? { viz } : {}), ...(trace ? { trace } : {}) });
const bug = (q, lines, ans, exp) => ({ type: 'bug', q, lines, ans, exp });
const blank = (q, code, opts, exp) => ({ type: 'blank', q, code, opts, ans: 0, exp });
const order = (q, lines, exp) => ({ type: 'order', q, lines, exp });

function defLesson(chId, L) {
  const ch = CHAPTERS.find(c => c.id === chId);
  const intro = { kind: 'intro', title: 'The big picture',
    html: `<p class="lead">${L.analogy}</p><div class="step-label">By the end of this lesson you can</div><ul>${L.goals.map(g => `<li>${g}</li>`).join('')}</ul>` };
  const recap = { kind: 'recap', title: 'Recap',
    html: `<div class="step-label">Cheat sheet</div><ul class="recap-list">${L.recap.map(r => `<li>${r}</li>`).join('')}</ul>` };
  const mixed = [];
  const m = L.practice, h = L.hands || [];
  for (let i = 0; i < Math.max(m.length, h.length); i++) { if (m[i]) mixed.push(m[i]); if (h[i]) mixed.push(h[i]); }
  ch.lessons.push({ id: L.id, title: L.title, deck: L.deck || '', learn: '', steps: [intro, ...L.steps, recap], practice: mixed, quiz: L.quiz, deepened: true, handsOn: true });
}
