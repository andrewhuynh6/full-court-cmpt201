// FULL COURT — Small celebratory effects. All respect prefers-reduced-motion.

function celebrate() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#E8622A', '#FFB800', '#2DD4BF', '#60A5FA', '#C084FC', '#3DDC84'];
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < 36; i++) {
    const s = document.createElement('span');
    s.style.left = (10 + Math.random() * 80) + '%';
    s.style.background = colors[i % colors.length];
    s.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    s.style.animationDelay = (Math.random() * 0.25) + 's';
    s.style.animationDuration = (1.1 + Math.random() * 0.8) + 's';
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2400);
}

// Count a number up from 0 inside an element such as "5/8" or "80%".
function countUp(el) {
  if (!el || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  const m = el.textContent.match(/^(\d+)(.*)$/);
  if (!m) return;
  const to = +m[1], rest = m[2], t0 = performance.now(), D = 700;
  const step = now => {
    const p = Math.min(1, (now - t0) / D);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + rest;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
