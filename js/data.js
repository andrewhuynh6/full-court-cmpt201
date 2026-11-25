// FULL COURT — Course Data & Player Generation

const POSITIONS = ['PG','SG','SF','PF','C'];

// ── Card tiers (assigned from OVR) ──────────────────────────────────
const TIERS = [
  { name:'Rookie',       min:60 },
  { name:'Bench Player', min:65 },
  { name:'Starter',      min:70 },
  { name:'Sixth Man',    min:75 },
  { name:'All-Star',     min:80 },
  { name:'Superstar',    min:87 },
  { name:'MVP',          min:93 },
  { name:'Hall of Fame', min:97 },
];
const TIER_NAMES = TIERS.map(t => t.name);
function tierFor(ovr) {
  let name = TIERS[0].name;
  for (const t of TIERS) if (ovr >= t.min) name = t.name;
  return name;
}
function tierSlug(name) { return 'tier-' + String(name).toLowerCase().replace(/[^a-z]+/g, '-'); }

// ── Hand-rated stars; the rest of the league comes from js/players.js ─
const NBA_PLAYERS = [
  { id:'p_jokic',    nbaId:203999,  name:'Nikola Jokic',              pos:'C',  ovr:99, pts:26, reb:12, ast:9,  num:15, team:'DEN' },
  { id:'p_sga',      nbaId:1628983, name:'Shai Gilgeous-Alexander',   pos:'PG', ovr:97, pts:32, reb:5,  ast:6,  num:2,  team:'OKC' },
  { id:'p_luka',     nbaId:1629029, name:'Luka Doncic',               pos:'PG', ovr:96, pts:28, reb:8,  ast:8,  num:77, team:'LAL' },
  { id:'p_giannis',  nbaId:203507,  name:'Giannis Antetokounmpo',     pos:'PF', ovr:95, pts:28, reb:11, ast:6,  num:7, team:'MIA' },
  { id:'p_tatum',    nbaId:1628369, name:'Jayson Tatum',              pos:'SF', ovr:94, pts:27, reb:8,  ast:5,  num:0,  team:'BOS' },
  { id:'p_wemby',    nbaId:1641705, name:'Victor Wembanyama',         pos:'C',  ovr:94, pts:25, reb:11, ast:4,  num:1,  team:'SAS' },
  { id:'p_cade',     nbaId:1630595, name:'Cade Cunningham',           pos:'PG', ovr:93, pts:26, reb:5,  ast:9,  num:2,  team:'DET' },
  { id:'p_durant',   nbaId:201142,  name:'Kevin Durant',              pos:'SF', ovr:91, pts:27, reb:6,  ast:4,  num:7, team:'HOU' },
  { id:'p_adavis',   nbaId:203076,  name:'Anthony Davis',             pos:'C',  ovr:91, pts:26, reb:12, ast:3,  num:23,  team:'WAS' },
  { id:'p_embiid',   nbaId:203954,  name:'Joel Embiid',               pos:'C',  ovr:90, pts:24, reb:11, ast:4,  num:21, team:'PHI' },
  { id:'p_curry',    nbaId:201939,  name:'Stephen Curry',             pos:'PG', ovr:90, pts:26, reb:4,  ast:6,  num:30, team:'GSW' },
  { id:'p_lebron',   nbaId:2544,    name:'LeBron James',              pos:'SF', ovr:88, pts:24, reb:7,  ast:8,  num:23, team:'PHI' },
  { id:'p_booker',   nbaId:1626164, name:'Devin Booker',              pos:'SG', ovr:88, pts:26, reb:5,  ast:6,  num:15,  team:'PHX' },
  { id:'p_lamelo',   nbaId:1630163, name:'LaMelo Ball',               pos:'PG', ovr:88, pts:28, reb:6,  ast:9,  num:1,  team:'MIN' },
  { id:'p_morant',   nbaId:1629630, name:'Ja Morant',                 pos:'PG', ovr:87, pts:25, reb:5,  ast:9,  num:1, team:'POR' },
  { id:'p_haliburton',nbaId:1630169,name:'Tyrese Haliburton',         pos:'PG', ovr:87, pts:19, reb:4,  ast:11, num:0,  team:'IND' },
  { id:'p_lillard',  nbaId:203081,  name:'Damian Lillard',            pos:'PG', ovr:86, pts:25, reb:4,  ast:7,  num:0,  team:'POR' },
  { id:'p_towns',    nbaId:1626157, name:'Karl-Anthony Towns',        pos:'C',  ovr:86, pts:25, reb:13, ast:4,  num:32, team:'NYK' },
  { id:'p_mitchell', nbaId:1628378, name:'Donovan Mitchell',          pos:'SG', ovr:86, pts:25, reb:4,  ast:5,  num:45, team:'CLE' },
  { id:'p_mobley',   nbaId:1630596, name:'Evan Mobley',               pos:'PF', ovr:85, pts:19, reb:10, ast:3,  num:4,  team:'CLE' },
  { id:'p_adebayo',  nbaId:1628389, name:'Bam Adebayo',               pos:'C',  ovr:85, pts:19, reb:11, ast:4,  num:13, team:'MIA' },
  { id:'p_kyrie',    nbaId:202681,  name:'Kyrie Irving',              pos:'PG', ovr:85, pts:25, reb:5,  ast:6,  num:11, team:'DAL' },
  { id:'p_trae',     nbaId:1629027, name:'Trae Young',                pos:'PG', ovr:84, pts:23, reb:3,  ast:11, num:3, team:'WAS' },
  { id:'p_garland',  nbaId:1629636, name:'Darius Garland',            pos:'PG', ovr:83, pts:22, reb:3,  ast:7,  num:10, team:'LAC' },
  { id:'p_banchero', nbaId:1631094, name:'Paolo Banchero',            pos:'PF', ovr:83, pts:25, reb:7,  ast:5,  num:5,  team:'ORL' },
  { id:'p_sengun',   nbaId:1630578, name:'Alperen Sengun',            pos:'C',  ovr:83, pts:22, reb:9,  ast:4,  num:28, team:'HOU' },
  { id:'p_pg',       nbaId:202331,  name:'Paul George',               pos:'SF', ovr:82, pts:19, reb:5,  ast:3,  num:13,  team:'BOS' },
  { id:'p_butler',   nbaId:202710,  name:'Jimmy Butler',              pos:'SF', ovr:81, pts:19, reb:5,  ast:5,  num:10, team:'GSW' },
  { id:'p_dafox',    nbaId:1628368, name:"De'Aaron Fox",              pos:'PG', ovr:80, pts:24, reb:4,  ast:6,  num:4,  team:'SAS' },
  { id:'p_herro',    nbaId:1629639, name:'Tyler Herro',               pos:'SG', ovr:79, pts:22, reb:4,  ast:5,  num:11, team:'MIL' },
  { id:'p_anunoby',  nbaId:1628384, name:'OG Anunoby',                pos:'SF', ovr:79, pts:15, reb:5,  ast:2,  num:8,  team:'NYK' },
  { id:'p_barnes',   nbaId:1630567, name:'Scottie Barnes',            pos:'PF', ovr:79, pts:19, reb:7,  ast:5,  num:4,  team:'TOR' },
  { id:'p_franz',    nbaId:1630532, name:'Franz Wagner',              pos:'SF', ovr:79, pts:24, reb:5,  ast:4,  num:22, team:'ORL' },
  { id:'p_jallen',   nbaId:1628386, name:'Jarrett Allen',             pos:'C',  ovr:78, pts:14, reb:11, ast:2,  num:31, team:'CLE' },
  { id:'p_jgreen',   nbaId:1630224, name:'Jalen Green',               pos:'SG', ovr:78, pts:22, reb:4,  ast:4,  num:4,  team:'PHX' },
  { id:'p_barrett',  nbaId:1629628, name:'RJ Barrett',                pos:'SG', ovr:77, pts:19, reb:5,  ast:4,  num:9,  team:'TOR' },
  { id:'p_draymond', nbaId:203110,  name:'Draymond Green',            pos:'PF', ovr:76, pts:9,  reb:7,  ast:7,  num:23, team:'GSW' },
  { id:'p_mturner',  nbaId:1626167, name:'Myles Turner',              pos:'C',  ovr:75, pts:14, reb:7,  ast:1,  num:3, team:'MIL' },
  { id:'p_sochan',   nbaId:1631110, name:'Jeremy Sochan',             pos:'PF', ovr:73, pts:14, reb:6,  ast:4,  num:10, team:'NYK' },
  { id:'p_ivey',     nbaId:1631093, name:'Jaden Ivey',                pos:'PG', ovr:72, pts:15, reb:4,  ast:5,  num:23, team:'FA' },
  { id:'p_smith',    nbaId:1631095, name:'Jabari Smith Jr.',          pos:'PF', ovr:71, pts:14, reb:7,  ast:2,  num:10,  team:'HOU' },
  { id:'p_brogdon',  nbaId:1627763, name:'Malcolm Brogdon',           pos:'PG', ovr:68, pts:12, reb:3,  ast:4,  num:7,  team:'WAS' },
  { id:'p_dosunmu',  nbaId:1630245, name:'Ayo Dosunmu',               pos:'SG', ovr:67, pts:12, reb:3,  ast:4,  num:13, team:'MIN' },
  { id:'p_vucevic',  nbaId:202696,  name:'Nikola Vucevic',            pos:'C',  ovr:66, pts:14, reb:10, ast:3,  num:9,  team:'ORL' },
  { id:'p_okoro',    nbaId:1630171, name:'Isaac Okoro',               pos:'SG', ovr:66, pts:9,  reb:3,  ast:2,  num:35, team:'CHI' },
  { id:'p_walker',   nbaId:1629638, name:'Nickeil Alexander-Walker',  pos:'SF', ovr:63, pts:9,  reb:2,  ast:3,  num:7,  team:'ATL' },
  { id:'p_thad',     nbaId:201152,  name:'Thaddeus Young',            pos:'PF', ovr:62, pts:7,  reb:4,  ast:2,  num:21, team:'PHX' },
];

// Add every other NBA player (rows: nbaId, name, pos, ovr, pts, reb, ast, jersey, team), then tier everyone.
EXTRA_PLAYER_ROWS.forEach(r => NBA_PLAYERS.push({
  id:'n_' + r[0], nbaId:r[0], name:r[1], pos:r[2], ovr:r[3], pts:r[4], reb:r[5], ast:r[6], num:r[7], team:r[8],
}));
NBA_PLAYERS.forEach(p => { p.rarity = tierFor(p.ovr); });

const STARTER_IDS = { PG:'p_brogdon', SG:'p_okoro', SF:'p_walker', PF:'p_thad', C:'p_vucevic' };

function genStarterTeam() {
  return POSITIONS.map(pos => {
    const t = NBA_PLAYERS.find(p => p.id === STARTER_IDS[pos]);
    return { ...t, id: 'st_' + pos + '_' + t.id };
  });
}

// Packs hold 5 cards. Each pack type rolls its cards from weighted tiers, and one "hit" card is guaranteed
// to be at least the pack's minimum tier. Better packs shift every roll upward. A pack never holds one tier only.
const PACK_ODDS = {
  'Bronze Pack':     { 'Rookie':50, 'Bench Player':35, 'Starter':12, 'Sixth Man':3 },
  'Silver Pack':     { 'Bench Player':25, 'Starter':40, 'Sixth Man':25, 'All-Star':10 },
  'Gold Pack':       { 'Starter':15, 'Sixth Man':35, 'All-Star':35, 'Superstar':13, 'MVP':2 },
  'Diamond Premium': { 'All-Star':25, 'Superstar':40, 'MVP':25, 'Hall of Fame':10 },
};
const PACK_MIN_TIER = { 'Bronze Pack':'Bench Player', 'Silver Pack':'Starter', 'Gold Pack':'All-Star', 'Diamond Premium':'Superstar' };
const PACK_SIZE = 5;
const PACK_ORDER = ['Bronze Pack', 'Silver Pack', 'Gold Pack', 'Diamond Premium'];

function rollTier(odds, minTier) {
  const floor = minTier ? TIER_NAMES.indexOf(minTier) : 0;
  const live = Object.entries(odds).filter(([t]) => TIER_NAMES.indexOf(t) >= floor && NBA_PLAYERS.some(p => p.rarity === t));
  let roll = Math.random() * live.reduce((s, [, w]) => s + w, 0);
  for (const [t, w] of live) { if ((roll -= w) < 0) return t; }
  return live[live.length - 1][0];
}

function cardOfTier(tier) {
  const pool = NBA_PLAYERS.filter(p => p.rarity === tier);
  const template = pool[Math.floor(Math.random() * pool.length)];
  return { ...template, id: 'card_' + Date.now() + '_' + Math.floor(Math.random() * 99999) };
}

// Returns PACK_SIZE cards, weakest first so the best one is revealed last.
function genPack(packType) {
  const odds = PACK_ODDS[packType] || PACK_ODDS['Bronze Pack'];
  const tiers = [];
  for (let i = 0; i < PACK_SIZE - 1; i++) tiers.push(rollTier(odds));
  tiers.push(rollTier(odds, PACK_MIN_TIER[packType]));
  if (tiers.every(t => t === tiers[0])) {          // mixed tiers: lift the hit card one tier if it would match the rest
    const up = Object.keys(odds).find(t => TIER_NAMES.indexOf(t) > TIER_NAMES.indexOf(tiers[0]) && NBA_PLAYERS.some(p => p.rarity === t));
    if (up) tiers[tiers.length - 1] = up;
  }
  return tiers.map(cardOfTier).sort((a, b) => TIER_NAMES.indexOf(a.rarity) - TIER_NAMES.indexOf(b.rarity) || a.ovr - b.ovr);
}

// ── COURSE CONTENT ──────────────────────────────────────────────

const CHAPTERS = [
  { id:'t1', num:'01', title:'Systems & Processes', subtitle:'OS stack, fork, exec, wait, signals', icon:'cpu', color:'#CD7F32', roundPack:'Bronze Pack', lessons:[] },
  { id:'t2', num:'02', title:'Scheduling & Memory', subtitle:'CPU scheduling, allocators, virtual memory', icon:'layers', color:'#C0C0C0', roundPack:'Silver Pack', lessons:[] },
  { id:'t3', num:'03', title:'Threads & Synchronization', subtitle:'pthreads, mutexes, condition variables, semaphores', icon:'zap', color:'#C0C0C0', roundPack:'Silver Pack', lessons:[] },
  { id:'t4', num:'04', title:'File I/O', subtitle:'System calls, buffering, inodes, links', icon:'folder', color:'#FFD700', roundPack:'Gold Pack', lessons:[] },
  { id:'t5', num:'05', title:'Networking', subtitle:'Sockets, AF_INET, many clients', icon:'globe', color:'#B9F2FF', roundPack:'Gold Pack', lessons:[] },
  { id:'t6', num:'06', title:'Inter-Process Communication', subtitle:'Pipes, FIFOs, memory mapping, shared memory', icon:'share-2', color:'#9B59B6', roundPack:'Gold Pack', lessons:[] },
  { id:'tb', num:'07', title:'Security & Crypto', subtitle:'Bonus topic: CIA, keys, hashes, signatures', icon:'shield-check', color:'#0F766E', roundPack:'Silver Pack', bonus:true, lessons:[] },
];
