// CMPT201 LAB — Attach one written (short-answer) question from the bank to each lesson's practice.
CHAPTERS.forEach(ch => ch.lessons.forEach(l => {
  const w = (WRITTEN.short || []).find(q => q.lesson === l.id);
  if (w && !(l.practice || []).includes(w)) (l.practice = l.practice || []).push(w);
}));
