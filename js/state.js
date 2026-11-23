// FULL COURT — State Management (localStorage)

const STATE_KEY = 'fullcourt_v1';

const DEFAULT_STATE = {
  version: 1,
  player: {
    name: 'Rookie',
    level: 1,
    xp: 0,
    xpToNext: 200,
    rank: 'Undrafted',
    season: 'SEASON 01',
  },
  team: null,          // set on first load
  collection: [],      // all player cards earned
  packQueue: [],       // packs waiting to be opened
  lessons: {},         // { lessonId: { learn, practice, quiz } }
  chapters: {},        // { chapterId: { completed, gameday } }
  stats: {
    totalXP: 0,
    lessonsCompleted: 0,
    quizzesPassed: 0,
    packsOpened: 0,
    gamesPlayed: 0,
    gamesWon: 0,
  }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      // Merge defaults for any missing keys
      return deepMerge(DEFAULT_STATE, s);
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch(e) {
    console.warn('Could not save state:', e);
  }
}

function deepMerge(defaults, stored) {
  const result = JSON.parse(JSON.stringify(defaults));
  for (const key in stored) {
    if (stored[key] !== null && typeof stored[key] === 'object' && !Array.isArray(stored[key])) {
      result[key] = deepMerge(defaults[key] || {}, stored[key]);
    } else {
      result[key] = stored[key];
    }
  }
  return result;
}

function resetState() {
  localStorage.removeItem(STATE_KEY);
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

// XP & Leveling
const LEVELS = [
  { level:1,  min:0,    max:200,  rank:'Undrafted' },
  { level:2,  min:200,  max:500,  rank:'G-League' },
  { level:3,  min:500,  max:1000, rank:'Rookie' },
  { level:4,  min:1000, max:2000, rank:'Starter' },
  { level:5,  min:2000, max:4000, rank:'All-Star' },
  { level:6,  min:4000, max:8000, rank:'MVP Candidate' },
  { level:7,  min:8000, max:Infinity, rank:'Champion' },
];

function addXP(state, amount) {
  state.player.xp += amount;
  state.player.totalXP = (state.player.totalXP || 0) + amount;
  state.stats.totalXP += amount;
  // Level up
  for (const lvl of LEVELS) {
    if (state.player.xp < lvl.max) {
      state.player.level = lvl.level;
      state.player.rank = lvl.rank;
      state.player.xpToNext = lvl.max;
      break;
    }
  }
  return state;
}

// XP rewards
const XP_REWARDS = {
  learn:    50,
  practice: 75,
  quiz:    100,
};

// Pack thresholds (every N XP earned triggers a pack check)
const PACK_MILESTONES = [300, 700, 1500, 3000, 6000];
function checkPackMilestone(state, prevXP, newXP) {
  for (const milestone of PACK_MILESTONES) {
    if (prevXP < milestone && newXP >= milestone) {
      let packType = 'Bronze Pack';
      if (milestone >= 6000) packType = 'Diamond Premium';
      else if (milestone >= 3000) packType = 'Gold Pack';
      else if (milestone >= 1500) packType = 'Gold Pack';
      else if (milestone >= 700) packType = 'Silver Pack';
      state.packQueue.push({ type: packType, earned: Date.now() });
    }
  }
  return state;
}

// Lesson progress helpers
function isLearnDone(state, lessonId)    { return state.lessons[lessonId]?.learn; }
function isPracticeDone(state, lessonId) { return state.lessons[lessonId]?.practice; }
function isQuizDone(state, lessonId)     { return state.lessons[lessonId]?.quiz; }
function isLessonDone(state, lessonId)   {
  const l = state.lessons[lessonId];
  return l && l.learn && l.practice && l.quiz;
}

function markLearn(state, lessonId) {
  if (!state.lessons[lessonId]) state.lessons[lessonId] = {};
  if (!state.lessons[lessonId].learn) {
    state.lessons[lessonId].learn = true;
    const prev = state.player.xp;
    addXP(state, XP_REWARDS.learn);
    checkPackMilestone(state, prev, state.player.xp);
    state.stats.lessonsCompleted++;
  }
  return state;
}

function markPractice(state, lessonId, score, total) {
  if (!state.lessons[lessonId]) state.lessons[lessonId] = {};
  if (!state.lessons[lessonId].practice) {
    state.lessons[lessonId].practice = true;
    const prev = state.player.xp;
    addXP(state, XP_REWARDS.practice);
    checkPackMilestone(state, prev, state.player.xp);
  }
  return state;
}

function markQuiz(state, lessonId, score, total) {
  if (!state.lessons[lessonId]) state.lessons[lessonId] = {};
  if (!state.lessons[lessonId].quiz) {
    state.lessons[lessonId].quiz = true;
    state.stats.quizzesPassed++;
    const prev = state.player.xp;
    const bonus = Math.round(XP_REWARDS.quiz * (score/total));
    addXP(state, bonus);
    checkPackMilestone(state, prev, state.player.xp);
  }
  return state;
}

function markChapter(state, chapterId, packType) {
  if (!state.chapters[chapterId]) state.chapters[chapterId] = {};
  if (!state.chapters[chapterId].completed) {
    state.chapters[chapterId].completed = true;
    state.packQueue.push({ type: packType, earned: Date.now() });
  }
  return state;
}

function isChapterComplete(state, chapter) {
  return chapter.lessons.every(l => isLessonDone(state, l.id));
}

function teamOVR(team) {
  if (!team || !team.length) return 0;
  return Math.round(team.reduce((s,p) => s + p.ovr, 0) / team.length);
}

// Get season progress info
function getSeasonProgress(state) {
  let totalLessons = 0, doneLessons = 0, doneChapters = 0;
  CHAPTERS.forEach(ch => {
    totalLessons += ch.lessons.length;
    ch.lessons.forEach(l => { if (isLessonDone(state, l.id)) doneLessons++; });
    if (isChapterComplete(state, ch)) doneChapters++;
  });
  return { totalLessons, doneLessons, doneChapters, totalChapters: CHAPTERS.length };
}
