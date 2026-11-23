// FULL COURT — Course Data & Player Generation

const POSITIONS = ['PG','SG','SF','PF','C'];

// ── Real NBA Players (2024-25 season) ───────────────────────────────
// OVR tiers: Diamond 92+, Gold 82-91, Silver 70-81, Bronze 60-69
const NBA_PLAYERS = [
  // ── Diamond ──────────────────────────────────────────────────────
  { id:'p_jokic',    nbaId:203999,  name:'Nikola Jokic',              pos:'C',  ovr:99, rarity:'Diamond', pts:26, reb:12, ast:9,  num:15, team:'DEN' },
  { id:'p_sga',      nbaId:1628983, name:'Shai Gilgeous-Alexander',   pos:'PG', ovr:97, rarity:'Diamond', pts:32, reb:5,  ast:6,  num:2,  team:'OKC' },
  { id:'p_luka',     nbaId:1629029, name:'Luka Doncic',               pos:'PG', ovr:96, rarity:'Diamond', pts:28, reb:8,  ast:8,  num:77, team:'LAL' },
  { id:'p_giannis',  nbaId:203507,  name:'Giannis Antetokounmpo',     pos:'PF', ovr:95, rarity:'Diamond', pts:28, reb:11, ast:6,  num:34, team:'MIL' },
  { id:'p_tatum',    nbaId:1628369, name:'Jayson Tatum',              pos:'SF', ovr:94, rarity:'Diamond', pts:27, reb:8,  ast:5,  num:0,  team:'BOS' },
  { id:'p_wemby',    nbaId:1641705, name:'Victor Wembanyama',         pos:'C',  ovr:94, rarity:'Diamond', pts:25, reb:11, ast:4,  num:1,  team:'SAS' },
  { id:'p_cade',     nbaId:1630595, name:'Cade Cunningham',           pos:'PG', ovr:93, rarity:'Diamond', pts:26, reb:5,  ast:9,  num:2,  team:'DET' },
  // ── Gold ─────────────────────────────────────────────────────────
  { id:'p_durant',   nbaId:201142,  name:'Kevin Durant',              pos:'SF', ovr:91, rarity:'Gold',    pts:27, reb:6,  ast:4,  num:35, team:'PHX' },
  { id:'p_adavis',   nbaId:203076,  name:'Anthony Davis',             pos:'C',  ovr:91, rarity:'Gold',    pts:26, reb:12, ast:3,  num:3,  team:'LAL' },
  { id:'p_embiid',   nbaId:203954,  name:'Joel Embiid',               pos:'C',  ovr:90, rarity:'Gold',    pts:24, reb:11, ast:4,  num:21, team:'PHI' },
  { id:'p_curry',    nbaId:201939,  name:'Stephen Curry',             pos:'PG', ovr:90, rarity:'Gold',    pts:26, reb:4,  ast:6,  num:30, team:'GSW' },
  { id:'p_lebron',   nbaId:2544,    name:'LeBron James',              pos:'SF', ovr:88, rarity:'Gold',    pts:24, reb:7,  ast:8,  num:23, team:'LAL' },
  { id:'p_booker',   nbaId:1626164, name:'Devin Booker',              pos:'SG', ovr:88, rarity:'Gold',    pts:26, reb:5,  ast:6,  num:1,  team:'PHX' },
  { id:'p_lamelo',   nbaId:1630163, name:'LaMelo Ball',               pos:'PG', ovr:88, rarity:'Gold',    pts:28, reb:6,  ast:9,  num:1,  team:'CHA' },
  { id:'p_morant',   nbaId:1629630, name:'Ja Morant',                 pos:'PG', ovr:87, rarity:'Gold',    pts:25, reb:5,  ast:9,  num:12, team:'MEM' },
  { id:'p_haliburton',nbaId:1630169,name:'Tyrese Haliburton',         pos:'PG', ovr:87, rarity:'Gold',    pts:19, reb:4,  ast:11, num:0,  team:'IND' },
  { id:'p_lillard',  nbaId:203081,  name:'Damian Lillard',            pos:'PG', ovr:86, rarity:'Gold',    pts:25, reb:4,  ast:7,  num:0,  team:'MIL' },
  { id:'p_towns',    nbaId:1626157, name:'Karl-Anthony Towns',        pos:'C',  ovr:86, rarity:'Gold',    pts:25, reb:13, ast:4,  num:32, team:'NYK' },
  { id:'p_mitchell', nbaId:1628378, name:'Donovan Mitchell',          pos:'SG', ovr:86, rarity:'Gold',    pts:25, reb:4,  ast:5,  num:45, team:'CLE' },
  { id:'p_mobley',   nbaId:1630596, name:'Evan Mobley',               pos:'PF', ovr:85, rarity:'Gold',    pts:19, reb:10, ast:3,  num:4,  team:'CLE' },
  { id:'p_adebayo',  nbaId:1628389, name:'Bam Adebayo',               pos:'C',  ovr:85, rarity:'Gold',    pts:19, reb:11, ast:4,  num:13, team:'MIA' },
  { id:'p_kyrie',    nbaId:202681,  name:'Kyrie Irving',              pos:'PG', ovr:85, rarity:'Gold',    pts:25, reb:5,  ast:6,  num:11, team:'DAL' },
  { id:'p_trae',     nbaId:1629027, name:'Trae Young',                pos:'PG', ovr:84, rarity:'Gold',    pts:23, reb:3,  ast:11, num:11, team:'ATL' },
  { id:'p_garland',  nbaId:1629636, name:'Darius Garland',            pos:'PG', ovr:83, rarity:'Gold',    pts:22, reb:3,  ast:7,  num:10, team:'CLE' },
  { id:'p_banchero', nbaId:1631094, name:'Paolo Banchero',            pos:'PF', ovr:83, rarity:'Gold',    pts:25, reb:7,  ast:5,  num:5,  team:'ORL' },
  { id:'p_sengun',   nbaId:1630578, name:'Alperen Sengun',            pos:'C',  ovr:83, rarity:'Gold',    pts:22, reb:9,  ast:4,  num:28, team:'HOU' },
  { id:'p_pg',       nbaId:202331,  name:'Paul George',               pos:'SF', ovr:82, rarity:'Gold',    pts:19, reb:5,  ast:3,  num:8,  team:'PHI' },
  // ── Silver ───────────────────────────────────────────────────────
  { id:'p_butler',   nbaId:202710,  name:'Jimmy Butler',              pos:'SF', ovr:81, rarity:'Silver',  pts:19, reb:5,  ast:5,  num:22, team:'GSW' },
  { id:'p_dafox',    nbaId:1628368, name:"De'Aaron Fox",              pos:'PG', ovr:80, rarity:'Silver',  pts:24, reb:4,  ast:6,  num:5,  team:'SAC' },
  { id:'p_herro',    nbaId:1629638, name:'Tyler Herro',               pos:'SG', ovr:79, rarity:'Silver',  pts:22, reb:4,  ast:5,  num:14, team:'MIA' },
  { id:'p_anunoby',  nbaId:1628384, name:'OG Anunoby',                pos:'SF', ovr:79, rarity:'Silver',  pts:15, reb:5,  ast:2,  num:8,  team:'NYK' },
  { id:'p_barnes',   nbaId:1630567, name:'Scottie Barnes',            pos:'PF', ovr:79, rarity:'Silver',  pts:19, reb:7,  ast:5,  num:4,  team:'TOR' },
  { id:'p_franz',    nbaId:1630532, name:'Franz Wagner',              pos:'SF', ovr:79, rarity:'Silver',  pts:24, reb:5,  ast:4,  num:21, team:'ORL' },
  { id:'p_jallen',   nbaId:1628386, name:'Jarrett Allen',             pos:'C',  ovr:78, rarity:'Silver',  pts:14, reb:11, ast:2,  num:31, team:'CLE' },
  { id:'p_jgreen',   nbaId:1630224, name:'Jalen Green',               pos:'SG', ovr:78, rarity:'Silver',  pts:22, reb:4,  ast:4,  num:4,  team:'HOU' },
  { id:'p_barrett',  nbaId:1629628, name:'RJ Barrett',                pos:'SG', ovr:77, rarity:'Silver',  pts:19, reb:5,  ast:4,  num:9,  team:'TOR' },
  { id:'p_draymond', nbaId:203110,  name:'Draymond Green',            pos:'PF', ovr:76, rarity:'Silver',  pts:9,  reb:7,  ast:7,  num:23, team:'GSW' },
  { id:'p_mturner',  nbaId:1626167, name:'Myles Turner',              pos:'C',  ovr:75, rarity:'Silver',  pts:14, reb:7,  ast:1,  num:33, team:'IND' },
  { id:'p_sochan',   nbaId:1631109, name:'Jeremy Sochan',             pos:'PF', ovr:73, rarity:'Silver',  pts:14, reb:6,  ast:4,  num:10, team:'SAS' },
  { id:'p_ivey',     nbaId:1631093, name:'Jaden Ivey',                pos:'PG', ovr:72, rarity:'Silver',  pts:15, reb:4,  ast:5,  num:23, team:'DET' },
  { id:'p_smith',    nbaId:1631105, name:'Jabari Smith Jr.',          pos:'PF', ovr:71, rarity:'Silver',  pts:14, reb:7,  ast:2,  num:1,  team:'HOU' },
  // ── Bronze ───────────────────────────────────────────────────────
  { id:'p_brogdon',  nbaId:1627763, name:'Malcolm Brogdon',           pos:'PG', ovr:68, rarity:'Bronze',  pts:12, reb:3,  ast:4,  num:7,  team:'POR' },
  { id:'p_dosunmu',  nbaId:1630558, name:'Ayo Dosunmu',               pos:'SG', ovr:67, rarity:'Bronze',  pts:12, reb:3,  ast:4,  num:11, team:'CHI' },
  { id:'p_vucevic',  nbaId:203085,  name:'Nikola Vucevic',            pos:'C',  ovr:66, rarity:'Bronze',  pts:14, reb:10, ast:3,  num:9,  team:'CHI' },
  { id:'p_okoro',    nbaId:1630171, name:'Isaac Okoro',               pos:'SG', ovr:66, rarity:'Bronze',  pts:9,  reb:3,  ast:2,  num:35, team:'CLE' },
  { id:'p_walker',   nbaId:1629611, name:'Nickeil Alexander-Walker',  pos:'SF', ovr:63, rarity:'Bronze',  pts:9,  reb:2,  ast:3,  num:0,  team:'MIN' },
  { id:'p_thad',     nbaId:201152,  name:'Thaddeus Young',            pos:'PF', ovr:62, rarity:'Bronze',  pts:7,  reb:4,  ast:2,  num:21, team:'SAS' },
];

function genStarterTeam() {
  const used = new Set();
  return POSITIONS.map(pos => {
    // Pick lowest-OVR player at this position not yet used
    const candidates = NBA_PLAYERS
      .filter(p => p.pos === pos && !used.has(p.id))
      .sort((a, b) => a.ovr - b.ovr);
    const template = candidates[0] ||
      NBA_PLAYERS.filter(p => !used.has(p.id)).sort((a, b) => a.ovr - b.ovr)[0];
    if (!template) return { id:'st_'+pos, name:'Rookie', pos, ovr:60, rarity:'Bronze', pts:9, reb:3, ast:2, num:0 };
    used.add(template.id);
    return { ...template, id: 'st_' + pos + '_' + template.id };
  });
}

function genPackCard(packType) {
  const rarityMap = {
    'Diamond Premium': 'Diamond',
    'Gold Pack':       'Gold',
    'Silver Pack':     'Silver',
    'Bronze Pack':     'Bronze',
  };
  const rarity = rarityMap[packType] || 'Bronze';
  const pool = NBA_PLAYERS.filter(p => p.rarity === rarity);
  if (!pool.length) {
    // No real players for this tier — shouldn't happen but safe fallback
    return { id:'gen_'+Date.now(), name:'Unknown', pos:'PG', ovr:65, rarity, pts:10, reb:3, ast:3, num:0 };
  }
  const template = pool[Math.floor(Math.random() * pool.length)];
  return { ...template, id: 'card_' + Date.now() + '_' + Math.floor(Math.random()*9999) };
}

// ── COURSE CONTENT ──────────────────────────────────────────────

const CHAPTERS = [
{
  id:'ch1', num:'01', title:'Training Camp', subtitle:'C Fundamentals',
  icon:'🏋️', color:'#CD7F32', packReward:'Bronze Pack',
  lessons:[
  {
    id:'l1_1', title:'Pointers & Memory',
    learn:`<h3>What is a Pointer?</h3>
<p>A pointer is a variable that stores the <strong>memory address</strong> of another variable. Every variable lives somewhere in RAM — a pointer lets you hold and pass that location.</p>
<div class="code-block">int x = 42;
int *p = &amp;x;      // &x = address of x (e.g. 0x7ffd1234)
printf("%d", *p);  // dereference → 42
printf("%p", p);   // prints the address
*p = 99;           // changes x through the pointer
printf("%d", x);   // prints 99</div>
<h3>Key Operators</h3>
<ul>
<li><code>&amp;</code> — <em>address-of</em>: returns the memory address of a variable</li>
<li><code>*</code> — <em>dereference</em>: follows the address to get (or set) the value</li>
<li><code>-&gt;</code> — shorthand for <code>(*ptr).field</code> on structs</li>
</ul>
<h3>Pointer Types Matter</h3>
<p>The type tells the compiler how many bytes to read and how far to step in pointer arithmetic.</p>
<div class="code-block">int  *ip;   // 4 bytes per step
char *cp;   // 1 byte per step
double *dp; // 8 bytes per step
void *vp;   // generic — must cast before dereferencing</div>
<h3>Pointer Arithmetic & Arrays</h3>
<p>An array name <em>decays</em> to a pointer to its first element. Arithmetic scales by the pointed-to type's size.</p>
<div class="code-block">int arr[5] = {10,20,30,40,50};
int *p = arr;          // same as &arr[0]
printf("%d", *(p+2));  // 30  — same as arr[2]
printf("%d", p[3]);    // 40  — [] is syntactic sugar for *(p+3)
p++;                   // now points to arr[1]</div>
<h3>Pointers to Pointers</h3>
<div class="code-block">int x = 5;
int *p  = &amp;x;
int **pp = &amp;p;   // pointer to pointer
printf("%d", **pp); // 5 — double dereference</div>
<div class="tip-box">⚠️ <strong>Common Bugs:</strong> (1) Dereferencing NULL — always segfaults. (2) Using an uninitialized pointer — reads garbage address. (3) Returning a pointer to a local variable — the stack frame is gone after the function returns. Always initialize pointers to NULL if you don't have an address yet.</div>
<h3>Function Pointers</h3>
<p>Functions live in memory too. A function pointer stores a function's address, enabling callbacks and dispatch tables.</p>
<div class="code-block">int add(int a, int b) { return a + b; }
int (*fp)(int, int) = add;  // declare + assign
printf("%d", fp(3, 4));     // 7</div>`,
    practice:[
      {q:"What does the & operator do?",opts:["Dereferences a pointer","Gets the memory address of a variable","Performs bitwise AND","Allocates memory"],ans:1,exp:"& is the address-of operator. It returns the memory address where a variable is stored."},
      {q:"int *p = &x; What does *p do?",opts:["Gets address of p","Declares a new int","Accesses the value that p points to","Multiplies p by x"],ans:2,exp:"*p dereferences the pointer — it accesses the value stored at the address p holds."},
      {q:"If int *p = arr, what is *(p+1)?",opts:["arr[0]","arr[1]","arr[2]","&arr[1]"],ans:1,exp:"Pointer arithmetic: p+1 advances by sizeof(int), pointing to arr[1]. *(p+1) dereferences it, giving arr[1]."},
    ],
    quiz:[
      {q:"What is a pointer?",opts:["A variable that stores a value","A variable that stores a memory address","A function parameter","A type of array"],ans:1,exp:"A pointer stores the memory address of another variable."},
      {q:"Which operator gets the value at a pointer's address?",opts:["&","*","->","%"],ans:1,exp:"* is the dereference operator. It retrieves the value stored at the address the pointer holds."},
      {q:"int x=5; int *p=&x; *p=10; What is x now?",opts:["5","10","0","undefined"],ans:1,exp:"*p=10 writes 10 to the address p points to, which is x. So x becomes 10."},
      {q:"Pointer arithmetic p+2 advances by:",opts:["2 bytes always","2 × sizeof(*p) bytes","sizeof(p) bytes","1 byte"],ans:1,exp:"Pointer arithmetic scales by the size of the pointed-to type. p+2 advances by 2×sizeof(*p)."},
      {q:"A NULL pointer:",opts:["Points to address 0 (safe sentinel)","Points to the stack","Is always a valid memory location","Points to heap memory"],ans:0,exp:"NULL (0) is a sentinel value meaning the pointer points nowhere. Dereferencing NULL causes a segfault."},
    ]
  },
  {
    id:'l1_2', title:'Dynamic Memory Allocation',
    learn:`<h3>Stack vs Heap</h3>
<p><strong>Stack</strong> memory is automatic — the OS allocates and frees it as functions enter and return. It's fast but limited (~1–8 MB) and cannot outlive the function. <strong>Heap</strong> memory is manually managed via <code>malloc</code>/<code>free</code> — you control its lifetime and size.</p>
<div class="code-block">// Stack: automatic, fast, limited
void foo() {
    int arr[1000];  // gone when foo() returns
}

// Heap: manual, unlimited, persists until freed
int *arr = malloc(sizeof(int) * 1000000);
if (!arr) { perror("malloc"); exit(1); }
arr[0] = 42;
free(arr);  // REQUIRED</div>
<h3>The Four Heap Functions</h3>
<ul>
<li><code>malloc(size)</code> — allocate <em>size</em> bytes, <strong>uninitialized</strong> (may contain garbage)</li>
<li><code>calloc(n, size)</code> — allocate n×size bytes, <strong>zeroed</strong></li>
<li><code>realloc(ptr, newsize)</code> — grow or shrink an existing allocation; may move it</li>
<li><code>free(ptr)</code> — return memory to the heap; ptr must be from malloc/calloc/realloc</li>
</ul>
<div class="code-block">// Safe realloc pattern — never do ptr = realloc(ptr, n)
int *tmp = realloc(arr, sizeof(int) * new_size);
if (!tmp) { free(arr); exit(1); }  // keep old ptr valid!
arr = tmp;</div>
<h3>Common Memory Bugs</h3>
<ul>
<li><strong>Memory leak</strong> — malloc with no matching free; memory fills up over time</li>
<li><strong>Use-after-free</strong> — accessing memory after free(); undefined behavior</li>
<li><strong>Double-free</strong> — calling free() twice on same pointer; often crashes</li>
<li><strong>Buffer overflow</strong> — writing past the end of an allocation; corrupts heap</li>
<li><strong>Null dereference</strong> — not checking malloc's return value before using it</li>
</ul>
<div class="code-block">// WRONG — use-after-free
int *p = malloc(4);
free(p);
*p = 5;  // undefined behavior!

// WRONG — double-free
free(p);
free(p);  // crash!

// RIGHT — set to NULL after free
free(p);
p = NULL;  // safe: free(NULL) is a no-op</div>
<h3>Detecting Bugs with Valgrind</h3>
<div class="code-block">gcc -g prog.c -o prog
valgrind --leak-check=full ./prog
# Output: "definitely lost: 40 bytes in 1 blocks"
# → you malloc'd 40 bytes and never freed them</div>
<div class="tip-box">💡 <strong>Golden Rule:</strong> Every malloc() needs exactly one free(). Design your code so it's clear which function "owns" each allocation and is responsible for freeing it.</div>`,
    practice:[
      {q:"Which function allocates zeroed memory?",opts:["malloc","calloc","realloc","alloc"],ans:1,exp:"calloc(n, size) allocates n×size bytes and zeros them. malloc does not zero memory."},
      {q:"What must you always do after malloc?",opts:["Call realloc","Call free when done","Call calloc","Re-declare the pointer"],ans:1,exp:"Every malloc must have a matching free to avoid memory leaks."},
      {q:"malloc returns NULL when:",opts:["Allocation succeeds","Memory is unavailable","You pass 0","You call free first"],ans:1,exp:"malloc returns NULL on failure (out of memory). Always check the return value."},
    ],
    quiz:[
      {q:"Where does malloc allocate memory?",opts:["Stack","Heap","Data segment","Code segment"],ans:1,exp:"malloc allocates on the heap — dynamic memory that persists beyond function scope until freed."},
      {q:"What happens if you free() memory twice?",opts:["Nothing","Undefined behavior / crash","Memory is re-allocated","malloc returns NULL"],ans:1,exp:"Double-free is undefined behavior and typically causes corruption or a crash."},
      {q:"calloc(5, sizeof(int)) allocates:",opts:["5 bytes","sizeof(int) bytes","5×sizeof(int) zeroed bytes","5×sizeof(int) uninitialized bytes"],ans:2,exp:"calloc multiplies n×size and zeroes the result. So 5×4=20 bytes, all zeroed."},
      {q:"realloc(p, newsize) does what if p is NULL?",opts:["Returns NULL","Crashes","Behaves like malloc(newsize)","Frees memory"],ans:2,exp:"realloc(NULL, size) is equivalent to malloc(size) — a valid use case."},
      {q:"Valgrind is used to:",opts:["Compile C code","Detect memory leaks and errors","Format code","Debug segfaults only"],ans:1,exp:"Valgrind's memcheck tool tracks heap allocations and detects leaks, use-after-free, and other memory errors."},
    ]
  },
  ]
},
{
  id:'ch2', num:'02', title:'Season Opener', subtitle:'Processes & Threads',
  icon:'⚙️', color:'#C0C0C0', packReward:'Silver Pack',
  lessons:[
  {
    id:'l2_1', title:'Processes',
    learn:`<h3>What is a Process?</h3>
<p>A process is a running instance of a program with its own: virtual address space, file descriptor table, PID, environment variables, signal handlers, and resource limits. Processes are isolated — a crash in one does not affect another.</p>
<h3>fork() — Creating a Child</h3>
<p><code>fork()</code> creates an exact copy of the calling process. It returns <strong>twice</strong>: once in the parent (returns child's PID) and once in the child (returns 0).</p>
<div class="code-block">pid_t pid = fork();
if (pid == -1) { perror("fork"); exit(1); }  // error
if (pid == 0) {
    // --- CHILD ---
    printf("Child: PID=%d, parent=%d\\n", getpid(), getppid());
    exit(0);
} else {
    // --- PARENT ---
    int status;
    waitpid(pid, &amp;status, 0);  // wait for specific child
    if (WIFEXITED(status))
        printf("Child exited: %d\\n", WEXITSTATUS(status));
}</div>
<h3>exec() — Replacing a Process</h3>
<p><code>exec()</code> replaces the current process image with a new program. The PID stays the same but all code, data, and stack are replaced. The usual pattern is fork() then exec().</p>
<div class="code-block">// exec variants: execv, execl, execvp, execve
char *args[] = {"/bin/ls", "-l", NULL};
execv("/bin/ls", args);  // replaces this process
// If we get here, exec failed
perror("execv"); exit(1);</div>
<h3>Zombie vs Orphan Processes</h3>
<ul>
<li><strong>Zombie:</strong> child has exited but parent hasn't called wait(). The process table entry stays. Fix: always call wait()/waitpid().</li>
<li><strong>Orphan:</strong> parent exits before child. The child is adopted by init (PID 1) which will reap it.</li>
</ul>
<h3>Process States</h3>
<ul>
<li><strong>Running:</strong> executing on a CPU</li>
<li><strong>Sleeping (blocked):</strong> waiting for I/O, a signal, or a lock</li>
<li><strong>Stopped:</strong> paused by SIGSTOP or SIGTSTP</li>
<li><strong>Zombie:</strong> exited but not yet reaped</li>
</ul>
<div class="code-block">// waitpid options
waitpid(-1, &amp;status, 0);       // wait for any child
waitpid(pid, &amp;status, WNOHANG); // non-blocking check
// WIFEXITED(s), WEXITSTATUS(s), WIFSIGNALED(s), WTERMSIG(s)</div>
<div class="tip-box">💡 <strong>Key Rule:</strong> fork() copies the entire address space using copy-on-write (COW) — physical pages are shared until one process writes, then a private copy is made. This makes fork() cheap even for large processes.</div>`,
    practice:[
      {q:"What does fork() return to the parent?",opts:["0","Child's PID","-1","1"],ans:1,exp:"fork() returns the child's PID to the parent and 0 to the child. -1 means error."},
      {q:"What is a zombie process?",opts:["A process that loops forever","A process that has exited but hasn't been wait()ed","A process without a parent","A process consuming high CPU"],ans:1,exp:"A zombie is a terminated process whose parent hasn't called wait() yet. Its entry stays in the process table."},
      {q:"execv() does what?",opts:["Creates a new process","Replaces the current process with a new program","Forks a child","Sends a signal"],ans:1,exp:"exec() replaces the current process image with a new program. The original code doesn't resume."},
    ],
    quiz:[
      {q:"fork() returns what value to the child process?",opts:["Parent's PID","0","-1","1"],ans:1,exp:"fork() returns 0 to the newly created child process."},
      {q:"After fork(), do parent and child share the same memory?",opts:["Yes, same physical memory","No, child gets a copy (COW)","Yes, but only the heap","No, they share nothing at all"],ans:1,exp:"fork() uses copy-on-write — child gets a logical copy. Physical pages are shared until one writes."},
      {q:"Why call wait() in the parent?",opts:["To create a child","To send signals","To reap the child and prevent zombies","To share file descriptors"],ans:2,exp:"wait() blocks until a child exits and cleans up its process table entry, preventing zombies."},
      {q:"SIGCHLD is sent to the parent when:",opts:["Parent calls fork()","A child terminates or stops","Parent calls exec()","A child calls malloc()"],ans:1,exp:"The kernel sends SIGCHLD to the parent whenever a child process terminates, stops, or resumes."},
      {q:"Which function replaces a process with a new program?",opts:["fork()","wait()","exec() family","clone()"],ans:2,exp:"The exec() family (execv, execl, execvp, etc.) replaces the calling process's image with a new program."},
    ]
  },
  {
    id:'l2_2', title:'Threads (pthreads)',
    learn:`<h3>Threads vs Processes</h3>
<p>A thread is an independent execution path within a process. Unlike processes, threads <strong>share</strong> heap, globals, and file descriptors — communication is easy but requires synchronization. Each thread has its <strong>own</strong> stack, registers, and program counter.</p>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin:10px 0">
<tr style="background:var(--panel3)"><th style="padding:6px;text-align:left">Feature</th><th style="padding:6px">Process</th><th style="padding:6px">Thread</th></tr>
<tr><td style="padding:6px">Address space</td><td style="padding:6px;text-align:center">Separate</td><td style="padding:6px;text-align:center">Shared</td></tr>
<tr style="background:var(--panel2)"><td style="padding:6px">Creation cost</td><td style="padding:6px;text-align:center">High (fork)</td><td style="padding:6px;text-align:center">Low</td></tr>
<tr><td style="padding:6px">Communication</td><td style="padding:6px;text-align:center">IPC needed</td><td style="padding:6px;text-align:center">Direct (shared mem)</td></tr>
<tr style="background:var(--panel2)"><td style="padding:6px">Failure isolation</td><td style="padding:6px;text-align:center">Strong</td><td style="padding:6px;text-align:center">Weak (crash = all die)</td></tr>
</table>
<h3>Creating & Joining Threads</h3>
<div class="code-block">// Compile: gcc prog.c -pthread
#include &lt;pthread.h&gt;

void *worker(void *arg) {
    int id = *(int*)arg;
    printf("Thread %d running\\n", id);
    int *result = malloc(sizeof(int));
    *result = id * 2;
    return result;  // returned to pthread_join
}

int main() {
    pthread_t tid;
    int arg = 5;
    pthread_create(&amp;tid, NULL, worker, &amp;arg);

    void *retval;
    pthread_join(tid, &amp;retval);  // blocks until thread exits
    printf("Result: %d\\n", *(int*)retval);
    free(retval);
    return 0;
}</div>
<h3>Multiple Threads with a Loop</h3>
<div class="code-block">#define N 4
pthread_t tids[N];
int ids[N];
for (int i = 0; i &lt; N; i++) {
    ids[i] = i;
    pthread_create(&amp;tids[i], NULL, worker, &amp;ids[i]);
}
for (int i = 0; i &lt; N; i++)
    pthread_join(tids[i], NULL);</div>
<h3>Race Conditions</h3>
<p>When two threads read-modify-write shared data without synchronization, results are non-deterministic:</p>
<div class="code-block">int counter = 0;  // shared global

void *increment(void *arg) {
    for (int i = 0; i &lt; 100000; i++)
        counter++;  // NOT atomic! read-modify-write
    return NULL;
}
// Two threads → counter might be 150000 instead of 200000!</div>
<div class="tip-box">⚠️ <strong>Thread safety rules:</strong> (1) Local variables are always safe — each thread has its own stack. (2) Read-only global data is safe. (3) Any write to shared data needs synchronization. (4) A detached thread (pthread_detach) cannot be joined and cleans up automatically.</div>`,
    practice:[
      {q:"What do threads share within a process?",opts:["Stack and registers","Heap and global variables","Program counter","Thread ID"],ans:1,exp:"Threads share heap, globals, file descriptors, and code. Each has its own stack, registers, and PC."},
      {q:"pthread_join() does what?",opts:["Creates a thread","Kills a thread","Blocks caller until the thread finishes","Detaches a thread"],ans:2,exp:"pthread_join blocks the calling thread until the specified thread terminates."},
      {q:"What flag links the pthreads library?",opts:["-lthread","-pthread / -lpthread","-threads","-pth"],ans:1,exp:"Compile with -pthread (preferred) or -lpthread to link the POSIX threads library."},
    ],
    quiz:[
      {q:"Which function creates a new POSIX thread?",opts:["fork()","pthread_create()","clone()","CreateThread()"],ans:1,exp:"pthread_create(&tid, attr, func, arg) creates a new thread."},
      {q:"Threads vs Processes: threads are lighter because:",opts:["They use less RAM","They share the process address space","They run faster CPU instructions","They skip OS scheduling"],ans:1,exp:"Threads share the address space, so creating one avoids duplicating the entire process memory."},
      {q:"pthread_exit(val) does what?",opts:["Terminates the entire process","Terminates just the calling thread, passing val","Pauses execution","Creates a detached thread"],ans:1,exp:"pthread_exit terminates only the calling thread and passes a return value collectible by pthread_join."},
      {q:"A race condition occurs when:",opts:["Threads run on different CPUs","Threads access shared mutable data non-atomically","A thread calls pthread_exit","Stack overflow"],ans:1,exp:"A race condition is when the result depends on the interleaving of thread operations on shared data."},
      {q:"What is a detached thread?",opts:["A thread with no stack","A thread whose resources are freed automatically on exit","A thread that runs faster","A thread attached to a process"],ans:1,exp:"A detached thread automatically frees its resources when it finishes; no pthread_join is needed (or possible)."},
    ]
  },
  {
    id:'l2_3', title:'Mutex Synchronization',
    learn:`<h3>What is a Mutex?</h3>
<p>A <strong>mutex</strong> (mutual exclusion lock) ensures that only one thread executes a <em>critical section</em> at a time. A critical section is any code that accesses shared mutable data.</p>
<div class="code-block">pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER; // static init

// Or dynamic init:
pthread_mutex_t lock;
pthread_mutex_init(&amp;lock, NULL);

// Use it:
pthread_mutex_lock(&amp;lock);    // blocks if another thread holds it
shared_counter++;              // critical section — now safe
pthread_mutex_unlock(&amp;lock);  // release

// Always destroy when done:
pthread_mutex_destroy(&amp;lock);</div>
<h3>Fixing the Race Condition</h3>
<div class="code-block">pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;
int counter = 0;

void *increment(void *arg) {
    for (int i = 0; i &lt; 100000; i++) {
        pthread_mutex_lock(&amp;mtx);
        counter++;              // now atomic
        pthread_mutex_unlock(&amp;mtx);
    }
    return NULL;
}
// Two threads → counter is always exactly 200000</div>
<h3>Deadlock</h3>
<p>Deadlock occurs when threads form a <em>circular wait</em> — each thread holds a lock and waits for another lock that another thread holds.</p>
<div class="code-block">// DEADLOCK SCENARIO:
// Thread A: lock(L1); lock(L2); ...
// Thread B: lock(L2); lock(L1); ...
// A holds L1, waits for L2. B holds L2, waits for L1. → Stuck forever.

// PREVENTION: Always acquire locks in the same order
// Thread A and B both: lock(L1) then lock(L2)</div>
<h3>trylock and timed variants</h3>
<div class="code-block">// Non-blocking: returns EBUSY immediately if locked
if (pthread_mutex_trylock(&amp;lock) == 0) {
    // got the lock
    pthread_mutex_unlock(&amp;lock);
} else {
    // lock was busy, do something else
}</div>
<h3>Read-Write Locks</h3>
<p>When reads are frequent and writes are rare, a read-write lock allows multiple concurrent readers but exclusive writers:</p>
<div class="code-block">pthread_rwlock_t rwl = PTHREAD_RWLOCK_INITIALIZER;
// Multiple threads can hold the read lock simultaneously:
pthread_rwlock_rdlock(&amp;rwl);  // shared
// ... read shared data ...
pthread_rwlock_unlock(&amp;rwl);

// Only one thread gets the write lock:
pthread_rwlock_wrlock(&amp;rwl);  // exclusive
// ... modify shared data ...
pthread_rwlock_unlock(&amp;rwl);</div>
<div class="tip-box">💡 <strong>Best practices:</strong> Keep critical sections as short as possible. Never call a blocking function (sleep, I/O) while holding a mutex. Set to NULL after destroy. Prefer PTHREAD_MUTEX_INITIALIZER for globals.</div>`,
    practice:[
      {q:"What does pthread_mutex_lock() do when the mutex is locked?",opts:["Returns -1","Crashes","Blocks until available","Steals the lock"],ans:2,exp:"mutex_lock blocks the calling thread until the mutex is released."},
      {q:"What is a deadlock?",opts:["A slow thread","Circular wait where no thread can proceed","A thread holding a lock too long","A mutex not initialized"],ans:1,exp:"Deadlock is a circular wait: each thread holds a lock and waits for another lock held by another thread."},
      {q:"PTHREAD_MUTEX_INITIALIZER is used for:",opts:["Dynamic init at runtime","Static compile-time init of a global mutex","Creating recursive mutexes","Destroying a mutex"],ans:1,exp:"PTHREAD_MUTEX_INITIALIZER is a macro for initializing a static global mutex at compile time."},
    ],
    quiz:[
      {q:"What is a critical section?",opts:["Any code that runs slowly","Code accessing shared mutable data","Code that must only run once","Code that creates threads"],ans:1,exp:"A critical section is any code that accesses shared data that must not be interrupted by another thread."},
      {q:"pthread_mutex_trylock() returns EBUSY when:",opts:["Success","The mutex is already locked","Memory error","Invalid argument"],ans:1,exp:"trylock returns EBUSY if the mutex is already locked — it never blocks."},
      {q:"Keeping critical sections short is important because:",opts:["It's a compiler requirement","Longer sections reduce parallelism","Short sections use less memory","It prevents memory leaks"],ans:1,exp:"Long critical sections serialize execution, reducing concurrency benefits and increasing contention."},
      {q:"pthread_mutex_destroy() should be called:",opts:["Before init","Instead of unlock","When done using the mutex","Every time you lock"],ans:2,exp:"pthread_mutex_destroy frees resources associated with the mutex after you're done using it."},
      {q:"What prevents deadlock?",opts:["Using semaphores","Always acquiring locks in the same order","Locking faster","Using more threads"],ans:1,exp:"Consistent lock ordering prevents circular wait — the classic deadlock prevention strategy."},
    ]
  },
  {
    id:'l2_4', title:'Semaphores & Condition Variables',
    learn:`<h3>Semaphores</h3>
<p>A semaphore is an integer counter with two atomic operations: <code>sem_wait()</code> (decrement; block if zero) and <code>sem_post()</code> (increment; wake a waiter). Unlike a mutex, a semaphore can be signaled from a different thread than the one that waited — great for signaling events.</p>
<div class="code-block">#include &lt;semaphore.h&gt;
sem_t sem;
sem_init(&amp;sem, 0, 1);  // pshared=0 (threads), initial=1
sem_wait(&amp;sem);  // P (down): blocks if value==0, then decrements
// ... critical work ...
sem_post(&amp;sem);  // V (up): increments and wakes one waiter
sem_destroy(&amp;sem);</div>
<h3>Producer-Consumer with Semaphores</h3>
<p>Classic pattern: producer fills a bounded buffer, consumer drains it. Three semaphores coordinate access:</p>
<div class="code-block">#define N 10
int buf[N]; int in=0, out=0;
sem_t empty, full;    pthread_mutex_t mtx;
sem_init(&amp;empty, 0, N);  // N slots free
sem_init(&amp;full,  0, 0);  // 0 items ready
pthread_mutex_init(&amp;mtx, NULL);

// Producer:
sem_wait(&amp;empty);         // wait for free slot
pthread_mutex_lock(&amp;mtx);
buf[in] = item; in = (in+1)%N;
pthread_mutex_unlock(&amp;mtx);
sem_post(&amp;full);          // signal item added

// Consumer:
sem_wait(&amp;full);          // wait for item
pthread_mutex_lock(&amp;mtx);
item = buf[out]; out = (out+1)%N;
pthread_mutex_unlock(&amp;mtx);
sem_post(&amp;empty);         // signal slot freed</div>
<h3>Condition Variables</h3>
<p>A condition variable lets a thread sleep until some condition becomes true. It is <em>always used with a mutex</em>. <code>cond_wait</code> atomically unlocks the mutex and sleeps — preventing the race between checking and sleeping.</p>
<div class="code-block">pthread_cond_t  cond = PTHREAD_COND_INITIALIZER;
pthread_mutex_t mtx  = PTHREAD_MUTEX_INITIALIZER;
int ready = 0;

// Waiter thread:
pthread_mutex_lock(&amp;mtx);
while (!ready)                     // ALWAYS while, never if!
    pthread_cond_wait(&amp;cond, &amp;mtx); // atomically unlock+sleep
// condition is now true, mutex is re-held
pthread_mutex_unlock(&amp;mtx);

// Signaler thread:
pthread_mutex_lock(&amp;mtx);
ready = 1;
pthread_cond_signal(&amp;cond);     // wake ONE waiter
// pthread_cond_broadcast(&amp;cond); // wake ALL waiters
pthread_mutex_unlock(&amp;mtx);</div>
<div class="tip-box">⚠️ <strong>Why while and not if?</strong> Spurious wakeups — a thread can wake from cond_wait even when no one signaled it (POSIX allows this). The while loop re-checks the condition and goes back to sleep if it's still false. This is mandatory.</div>`,
    practice:[
      {q:"sem_wait() blocks when the semaphore value is:",opts:["Positive","Negative","Zero","Greater than 1"],ans:2,exp:"sem_wait blocks if the value is 0 and decrements it atomically once > 0."},
      {q:"Why use while() instead of if() with cond_wait?",opts:["Compiler requirement","Handle spurious wakeups","Performance","Mutex must be re-acquired manually"],ans:1,exp:"Spurious wakeups can occur — the while loop re-checks the condition after every wakeup."},
      {q:"pthread_cond_broadcast() wakes:",opts:["One waiting thread","All waiting threads","The next thread in queue","A randomly selected thread"],ans:1,exp:"broadcast wakes ALL threads waiting on the condition. signal wakes exactly one."},
    ],
    quiz:[
      {q:"What does sem_post() do?",opts:["Decrements and blocks if 0","Increments the semaphore, waking a waiter","Destroys the semaphore","Locks a mutex"],ans:1,exp:"sem_post (the V operation) increments the semaphore and unblocks a waiter if any."},
      {q:"Producer-Consumer: the 'empty' semaphore starts at:",opts:["0","1","Buffer size N","Infinity"],ans:2,exp:"'empty' tracks free slots, so it starts at N (buffer capacity). The producer sem_wait(empty) before inserting."},
      {q:"pthread_cond_wait atomically:",opts:["Locks the mutex and sleeps","Unlocks the mutex and sleeps","Signals and unlocks","Signals and locks"],ans:1,exp:"cond_wait atomically unlocks the mutex and puts the thread to sleep, preventing the race between checking and sleeping."},
      {q:"sem_init(sem, 0, 1) — the second arg 0 means:",opts:["Initial value is 0","Shared between threads, not processes","Not recursive","Binary semaphore"],ans:1,exp:"pshared=0 means the semaphore is shared between threads of the same process. pshared=1 allows cross-process sharing."},
      {q:"What synchronization pattern prevents a consumer from reading empty data?",opts:["Mutex alone","Semaphore 'full' that starts at 0","Deadlock","Busy waiting"],ans:1,exp:"The 'full' semaphore starts at 0. The consumer sem_wait(full) blocks until a producer sem_post(full) after inserting."},
    ]
  },
  ]
},
{
  id:'ch3', num:'03', title:'Mid-Season', subtitle:'File Systems',
  icon:'📁', color:'#FFD700', packReward:'Gold Pack',
  lessons:[
  {
    id:'l3_1', title:'File I/O System Calls',
    learn:`<h3>File Descriptors</h3>
<p>"Everything is a file" in Unix — files, pipes, sockets, terminals, and devices are all accessed through <strong>file descriptors (fds)</strong>: small non-negative integers. Every process starts with three open: 0 = stdin, 1 = stdout, 2 = stderr.</p>
<h3>The Core System Calls</h3>
<div class="code-block">// Open
int fd = open("file.txt", O_RDWR|O_CREAT|O_TRUNC, 0644);
if (fd == -1) { perror("open"); exit(1); }

// Read — may return fewer bytes than requested!
char buf[1024];
ssize_t n;
while ((n = read(fd, buf, sizeof(buf))) &gt; 0) {
    // process n bytes
}
if (n == -1) { perror("read"); }  // n==0 means EOF

// Write — may also be partial!
ssize_t written = write(fd, buf, n);
if (written != n) { perror("write"); }

// Seek
lseek(fd, 0,    SEEK_SET);  // go to start
lseek(fd, 0,    SEEK_END);  // go to EOF
lseek(fd, -10,  SEEK_CUR);  // go back 10 bytes

// Close — always close! leaking fds causes resource exhaustion
close(fd);</div>
<h3>Open Flags</h3>
<ul>
<li><code>O_RDONLY</code>, <code>O_WRONLY</code>, <code>O_RDWR</code> — access mode (required)</li>
<li><code>O_CREAT</code> — create if doesn't exist (needs mode argument, e.g. 0644)</li>
<li><code>O_TRUNC</code> — truncate existing file to zero length</li>
<li><code>O_APPEND</code> — all writes go to end atomically (safe for concurrent writers)</li>
<li><code>O_NONBLOCK</code> — don't block on open or I/O (useful for pipes/FIFOs)</li>
</ul>
<h3>Buffered stdio vs Raw Syscalls</h3>
<p><code>stdio</code> (printf, fread, fgets) adds a userspace buffer that batches syscalls. Raw syscalls (read, write) go straight to the kernel. Use stdio for text files, syscalls for binary/network/pipes.</p>
<div class="code-block">// stdio — buffered, easier API
FILE *f = fopen("data.txt", "r");
char line[256];
while (fgets(line, sizeof(line), f))
    printf("%s", line);
fclose(f);

// int fd = fileno(f);  // get the underlying fd from FILE*</div>
<h3>File Descriptor Duplication</h3>
<div class="code-block">// dup2(oldfd, newfd): make newfd point to same file as oldfd
// Classic: redirect stdout to a file
int logfd = open("out.log", O_WRONLY|O_CREAT|O_TRUNC, 0644);
dup2(logfd, STDOUT_FILENO);  // stdout now writes to out.log
close(logfd);</div>
<div class="tip-box">⚠️ <strong>Always check return values!</strong> read() returns 0 on EOF, -1 on error, and may return fewer bytes than requested on pipes/sockets. Use a loop for complete I/O.</div>`,
    practice:[
      {q:"open() returns what on success?",opts:["The file size","A file pointer (FILE*)","A file descriptor (int)","0"],ans:2,exp:"open() returns a non-negative integer (file descriptor) on success, or -1 on error."},
      {q:"What does read() return at EOF?",opts:["-1","EOF constant","0","Buffer size"],ans:2,exp:"read() returns 0 at end-of-file, positive for bytes read, and -1 on error."},
      {q:"stdin, stdout, stderr are fds:",opts:["1,2,3","0,1,2","0,1,3","-1,0,1"],ans:1,exp:"0=stdin, 1=stdout, 2=stderr — always open when a process starts."},
    ],
    quiz:[
      {q:"Which flag creates a file if it doesn't exist?",opts:["O_RDWR","O_CREAT","O_NEW","O_MAKE"],ans:1,exp:"O_CREAT creates the file if it doesn't exist. It requires a mode argument (like 0644)."},
      {q:"lseek(fd, 0, SEEK_END) positions to:",opts:["Start of file","One byte before end","Exactly at EOF","Current position"],ans:2,exp:"SEEK_END with offset 0 seeks to exactly after the last byte (the EOF position)."},
      {q:"Why loop when calling read()?",opts:["read() always returns -1 first","read() may return fewer bytes than requested","read() blocks forever","Compiler requirement"],ans:1,exp:"Partial reads are normal — especially on pipes and sockets. Loop until you've read all needed bytes."},
      {q:"close() does what?",opts:["Flushes the buffer","Releases the file descriptor","Deletes the file","Resets the file position"],ans:1,exp:"close() releases the file descriptor so it can be reused. The file data is NOT deleted."},
      {q:"O_APPEND ensures:",opts:["File is created if absent","Writes always go to the end atomically","File is read-only","File is opened non-blocking"],ans:1,exp:"O_APPEND atomically seeks to end and writes, preventing concurrent writers from overwriting each other."},
    ]
  },
  {
    id:'l3_2', title:'Inodes & File Systems',
    learn:`<h3>Filesystem Structure</h3>
<p>A Unix filesystem has three layers: <strong>directories</strong> (name → inode mappings), <strong>inodes</strong> (file metadata), and <strong>data blocks</strong> (file contents). The filename only lives in the directory entry.</p>
<h3>Inodes</h3>
<p>An <strong>inode</strong> stores everything about a file <em>except its name</em>: file type, permissions (mode), owner (uid/gid), size, timestamps (atime/mtime/ctime), hard link count, and pointers to data blocks.</p>
<div class="code-block">struct stat st;
stat("file.txt", &amp;st);    // follows symlinks
lstat("link.txt", &amp;st);   // stats the link itself
fstat(fd, &amp;st);            // stats an open file descriptor

printf("inode:   %lu\\n",  st.st_ino);
printf("size:    %ld\\n",  st.st_size);
printf("links:   %lu\\n",  st.st_nlink);
printf("mode:    %o\\n",   st.st_mode);  // octal permissions
printf("uid:     %d\\n",   st.st_uid);
printf("blocks:  %ld\\n",  st.st_blocks); // 512-byte blocks</div>
<h3>Permission Bits</h3>
<div class="code-block">// Mode: type (4 bits) + setuid/setgid/sticky (3 bits) + rwxrwxrwx (9 bits)
// 0644 = rw-r--r-- (owner rw, group r, others r)
// 0755 = rwxr-xr-x (owner rwx, group rx, others rx)

// Check type
S_ISREG(st.st_mode)   // regular file
S_ISDIR(st.st_mode)   // directory
S_ISLNK(st.st_mode)   // symlink (use lstat!)
S_ISFIFO(st.st_mode)  // named pipe</div>
<h3>Hard Links vs Symlinks</h3>
<ul>
<li><strong>Hard link:</strong> <code>link(old, new)</code> — creates a new directory entry pointing to the <em>same inode</em>. Same data, same permissions. Cannot cross filesystems. File deleted only when link count → 0 AND all fds closed.</li>
<li><strong>Symbolic link:</strong> <code>symlink(target, path)</code> — a special file containing a path string. Can cross filesystems. Can <em>dangle</em> if the target is deleted.</li>
</ul>
<div class="code-block">// Hard link
link("original.txt", "hardlink.txt");
// Both now have st_nlink == 2, same inode number
unlink("original.txt"); // decrements link count → 1; data survives

// Symlink
symlink("/etc/hostname", "mylink");
readlink("mylink", buf, sizeof(buf)); // reads the target path
unlink("mylink");  // removes the symlink, not the target</div>
<h3>Directories</h3>
<p>A directory is a special file: a table mapping filenames to inode numbers. <code>.</code> is the directory itself, <code>..</code> is the parent. Each has at least link count 2 (itself + its own <code>.</code> entry).</p>
<div class="code-block">DIR *dir = opendir(".");
struct dirent *entry;
while ((entry = readdir(dir)) != NULL)
    printf("%s\\n", entry-&gt;d_name);
closedir(dir);</div>
<div class="tip-box">💡 <strong>Key fact:</strong> <code>ls -li</code> shows inode numbers in the first column. Two names with the same inode number are hard links to the same file. Data is freed only when link count reaches 0 AND all open file descriptors are closed.</div>`,
    practice:[
      {q:"What does an inode NOT store?",opts:["File size","Permissions","The filename","Timestamps"],ans:2,exp:"Inodes store metadata but NOT the filename. Filenames live in directory entries mapping names to inode numbers."},
      {q:"Two hard links to the same file will have:",opts:["Different inode numbers","The same inode number","Different sizes","Different permissions"],ans:1,exp:"Hard links point to the same inode, so they share the same inode number, size, and permissions."},
      {q:"When is file data actually freed?",opts:["When unlink() is called","When link count reaches 0 AND all fds are closed","When the file is renamed","On next reboot"],ans:1,exp:"Data is freed only when BOTH the link count is 0 (no directory entries) AND all open file descriptors are closed."},
    ],
    quiz:[
      {q:"st_nlink in struct stat represents:",opts:["File size","Hard link count","Inode number","Number of open fds"],ans:1,exp:"st_nlink is the hard link count — how many directory entries point to this inode."},
      {q:"A dangling symlink is:",opts:["A symlink to a hard link","A symlink pointing to a deleted/moved target","A broken hard link","A symlink with no permissions"],ans:1,exp:"A dangling (stale) symlink points to a path that no longer exists."},
      {q:"Directories in Unix are:",opts:["Special kernel structures","Files that map names to inode numbers","Binary trees","Fixed-size arrays"],ans:1,exp:"A directory is a special file — essentially a table mapping filenames to inode numbers."},
      {q:"Which syscall gets file metadata without following symlinks?",opts:["stat()","fstat()","lstat()","open()"],ans:2,exp:"lstat() returns info about the symlink itself, not its target. stat() follows the link."},
      {q:"Hard links cannot cross:",opts:["Directory boundaries","File systems","Permissions boundaries","User boundaries"],ans:1,exp:"Hard links must be on the same filesystem because they reference inode numbers, which are filesystem-local."},
    ]
  },
  ]
},
{
  id:'ch4', num:'04', title:'Playoffs', subtitle:'Networking',
  icon:'🌐', color:'#B9F2FF', packReward:'Gold Pack',
  lessons:[
  {
    id:'l4_1', title:'Sockets & Server Flow',
    learn:`<h3>What is a Socket?</h3>
<p>A socket is a file descriptor for bidirectional network communication. It abstracts TCP/IP into a simple read/write interface. <code>AF_INET</code> = IPv4, <code>SOCK_STREAM</code> = TCP (reliable, ordered), <code>SOCK_DGRAM</code> = UDP (connectionless).</p>
<h3>Server-Side Flow (TCP)</h3>
<div class="code-block">int sfd = socket(AF_INET, SOCK_STREAM, 0);

// Allow port reuse after crash (highly recommended!)
int opt = 1;
setsockopt(sfd, SOL_SOCKET, SO_REUSEADDR, &amp;opt, sizeof(opt));

struct sockaddr_in addr = {0};
addr.sin_family      = AF_INET;
addr.sin_port        = htons(8080);
addr.sin_addr.s_addr = INADDR_ANY;  // all interfaces

bind(sfd, (struct sockaddr*)&amp;addr, sizeof(addr));
listen(sfd, 10);  // backlog: max queued connections

// Accept loop
while (1) {
    struct sockaddr_in client;
    socklen_t clen = sizeof(client);
    int cfd = accept(sfd, (struct sockaddr*)&amp;client, &amp;clen);
    // cfd is a NEW fd just for this client
    // inet_ntoa(client.sin_addr) gives client IP
    char buf[1024];
    ssize_t n = read(cfd, buf, sizeof(buf));
    write(cfd, buf, n);  // echo back
    close(cfd);
}</div>
<h3>Client-Side Flow (TCP)</h3>
<div class="code-block">int cfd = socket(AF_INET, SOCK_STREAM, 0);
struct sockaddr_in srv = {0};
srv.sin_family = AF_INET;
srv.sin_port   = htons(8080);
inet_pton(AF_INET, "127.0.0.1", &amp;srv.sin_addr);

connect(cfd, (struct sockaddr*)&amp;srv, sizeof(srv));
write(cfd, "Hello!", 6);
char buf[64];
read(cfd, buf, sizeof(buf));
close(cfd);</div>
<h3>Socket Types Summary</h3>
<ul>
<li><code>AF_INET + SOCK_STREAM</code> — TCP/IPv4: reliable, ordered, connection-based</li>
<li><code>AF_INET + SOCK_DGRAM</code> — UDP/IPv4: fast, no guarantees, no connection</li>
<li><code>AF_UNIX</code> — Unix domain: local IPC only, faster than TCP loopback</li>
</ul>
<div class="tip-box">💡 <strong>Key insight:</strong> accept() creates a NEW socket fd for each client — the original listening socket stays open to accept more connections. Always setsockopt SO_REUSEADDR on server sockets to avoid "Address already in use" errors during development.</div>`,
    practice:[
      {q:"What does accept() return?",opts:["The listening fd","A new fd for the client","The client's IP","Number of connections"],ans:1,exp:"accept() returns a NEW socket file descriptor specifically for communicating with the connected client."},
      {q:"SOCK_STREAM provides:",opts:["Datagrams","Reliable, ordered, connection-based communication","Broadcast","Raw packets"],ans:1,exp:"SOCK_STREAM is TCP-like: reliable, ordered, with error correction."},
      {q:"Correct server sequence?",opts:["socket→connect→read","socket→bind→listen→accept","socket→listen→bind→accept","bind→socket→listen"],ans:1,exp:"socket() → bind() → listen() → accept() is the correct server setup order."},
    ],
    quiz:[
      {q:"AF_UNIX sockets communicate:",opts:["Over IPv4","Only locally on the same machine","Over IPv6","Over the internet"],ans:1,exp:"AF_UNIX (AF_LOCAL) sockets communicate only between processes on the same machine."},
      {q:"listen() backlog parameter:",opts:["Max data size","Max total connections","Max pending connection queue length","Timeout seconds"],ans:2,exp:"The backlog sets the max number of connections queued waiting to be accepted."},
      {q:"SOCK_DGRAM vs SOCK_STREAM:",opts:["Both are identical","DGRAM is connection-based, STREAM is not","DGRAM is connectionless UDP-like; STREAM is reliable TCP-like","STREAM has no guarantees"],ans:2,exp:"SOCK_DGRAM is connectionless (UDP-like, no guarantees). SOCK_STREAM is connection-based (TCP-like, reliable)."},
      {q:"After accept(), the original listening fd:",opts:["Is closed automatically","Stays open to accept more clients","Becomes the client fd","Returns -1"],ans:1,exp:"The listening socket stays open. accept() creates a new fd per client, so the server can accept more connections."},
      {q:"bind() assigns:",opts:["A thread to the socket","An address/port to the socket","A file to the socket","A client to the socket"],ans:1,exp:"bind() associates the socket with a specific local address and port number."},
    ]
  },
  {
    id:'l4_2', title:'AF_INET & Multiple Clients',
    learn:`<h3>Byte Order — htons/htonl</h3>
<p>Network protocol uses <strong>big-endian</strong> byte order. Intel CPUs are little-endian. Always convert:</p>
<ul>
<li><code>htons(port)</code> — host to network short (16-bit port number)</li>
<li><code>htonl(addr)</code> — host to network long (32-bit IP address)</li>
<li><code>ntohs/ntohl</code> — reverse (network to host)</li>
<li><code>inet_pton(AF_INET, "1.2.3.4", &amp;addr)</code> — string IP to binary</li>
<li><code>inet_ntop(AF_INET, &amp;addr, buf, len)</code> — binary to string IP</li>
</ul>
<h3>Strategy 1: fork-per-client</h3>
<p>After accept(), fork a child to handle the client. Parent immediately loops back to accept more. Classic, simple, isolated — but costly for many clients.</p>
<div class="code-block">while (1) {
    int cfd = accept(sfd, NULL, NULL);
    pid_t pid = fork();
    if (pid == 0) {
        close(sfd);         // child doesn't need listening fd
        handle_client(cfd); // do the work
        close(cfd);
        exit(0);
    }
    close(cfd);             // parent doesn't need this client fd
    // parent loops to accept next connection
}</div>
<h3>Strategy 2: select() — I/O Multiplexing</h3>
<p>One thread monitors multiple fds. When any becomes readable, handle it. No fork overhead.</p>
<div class="code-block">fd_set master_fds, readfds;
FD_ZERO(&amp;master_fds);
FD_SET(sfd, &amp;master_fds);  // watch the listening socket
int max_fd = sfd;

while (1) {
    readfds = master_fds;    // COPY — select() modifies it
    select(max_fd + 1, &amp;readfds, NULL, NULL, NULL);

    if (FD_ISSET(sfd, &amp;readfds)) {   // new connection
        int cfd = accept(sfd, NULL, NULL);
        FD_SET(cfd, &amp;master_fds);
        if (cfd &gt; max_fd) max_fd = cfd;
    }
    // check each client fd...
    for (int fd = 3; fd &lt;= max_fd; fd++) {
        if (fd != sfd &amp;&amp; FD_ISSET(fd, &amp;readfds)) {
            char buf[1024];
            int n = read(fd, buf, sizeof(buf));
            if (n &lt;= 0) { close(fd); FD_CLR(fd, &amp;master_fds); }
            else write(fd, buf, n);
        }
    }
}</div>
<div class="tip-box">⚠️ <strong>select() limits:</strong> Can only monitor up to FD_SETSIZE (1024) fds. For large-scale servers use poll() (no limit) or epoll (Linux, O(1) scaling). The fd_set must be re-copied every iteration because select() destroys it.</div>`,
    practice:[
      {q:"htons() converts:",opts:["Host-to-network short (16-bit port)","Network-to-host short","Host-to-network long","Decimal to hex"],ans:0,exp:"htons converts a 16-bit value from host byte order to network byte order (big-endian)."},
      {q:"Why copy master_fds before select()?",opts:["select() doesn't work otherwise","select() modifies the fd_set, clearing unready fds","Stack overflow","Compiler requirement"],ans:1,exp:"select() MODIFIES the fd_set — it clears bits for fds that aren't ready. Keep master_fds as the full watch list."},
      {q:"INADDR_ANY means:",opts:["Localhost only","Bind to all network interfaces","Any random port","Auto-assign address"],ans:1,exp:"INADDR_ANY (0.0.0.0) accepts connections on any available network interface."},
    ],
    quiz:[
      {q:"First argument to select() is:",opts:["The fd_set","Number of fd_sets","max_fd + 1","Timeout ms"],ans:2,exp:"select(nfds,...) where nfds = highest_fd + 1. It checks fds 0 through nfds-1."},
      {q:"inet_pton() converts:",opts:["Port to network order","IP string like '127.0.0.1' to binary","Binary to string","Hostname to IP"],ans:1,exp:"inet_pton(AF_INET, '127.0.0.1', &addr) converts dotted-decimal string to binary network byte order."},
      {q:"select() returns 0 when:",opts:["Error","A timeout occurs (no fds ready)","One fd is ready","All fds are ready"],ans:1,exp:"select() returns 0 on timeout (no fds became ready), positive for the count of ready fds, -1 on error."},
      {q:"In fork-per-client, the child should close(sfd) because:",opts:["Required by POSIX","The child doesn't need the listening socket","Frees memory","Prevents fork bomb"],ans:1,exp:"The child only handles its one client. The listening socket is only needed in the parent to accept future connections."},
      {q:"getaddrinfo() is preferred over manual struct setup because:",opts:["It's faster","Handles DNS, byte order, IPv4+IPv6 automatically","It doesn't need a socket","It uses less memory"],ans:1,exp:"getaddrinfo() does DNS resolution, handles byte order, and works for both IPv4 and IPv6 — the modern portable way."},
    ]
  },
  ]
},
{
  id:'ch5', num:'05', title:'Championship', subtitle:'IPC',
  icon:'🏆', color:'#9B59B6', packReward:'Diamond Premium',
  lessons:[
  {
    id:'l5_1', title:'Pipes & FIFOs',
    learn:`<h3>Anonymous Pipes</h3>
<p>A pipe is a unidirectional kernel buffer. <code>pipe(fd)</code> creates two ends: <code>fd[0]</code> = read end, <code>fd[1]</code> = write end. Data flows in one direction: write to fd[1], read from fd[0].</p>
<div class="code-block">int fd[2];
pipe(fd);  // create pipe BEFORE fork so both ends exist in parent+child

if (fork() == 0) {
    // --- CHILD reads ---
    close(fd[1]);            // close write end — not needed
    char buf[64];
    int n = read(fd[0], buf, sizeof(buf));  // blocks until data
    buf[n] = '\\0';
    printf("Child got: %s\\n", buf);
    close(fd[0]);
    exit(0);
} else {
    // --- PARENT writes ---
    close(fd[0]);            // close read end — not needed
    write(fd[1], "Hello!", 6);
    close(fd[1]);            // CRITICAL: signals EOF to child
    wait(NULL);
}</div>
<h3>Why You MUST Close Unused Ends</h3>
<p>A pipe has EOF only when <strong>all write ends are closed</strong>. If the parent keeps fd[0] open (or child keeps fd[1] open), read() will block forever waiting for more data that will never arrive.</p>
<div class="code-block">// Shell pipeline: ls | grep txt
// The shell does:
int fd[2];
pipe(fd);
if (fork() == 0) {         // child runs grep
    dup2(fd[0], STDIN_FILENO);  // stdin = pipe read end
    close(fd[0]); close(fd[1]);
    execlp("grep", "grep", "txt", NULL);
} else {                   // parent runs ls
    dup2(fd[1], STDOUT_FILENO); // stdout = pipe write end
    close(fd[0]); close(fd[1]);
    execlp("ls", "ls", NULL);
}</div>
<h3>Named Pipes (FIFOs)</h3>
<p>FIFOs have a filesystem path so <em>unrelated</em> processes can open them without fork. They block on open until both ends are connected.</p>
<div class="code-block">// Process A (writer):
mkfifo("/tmp/my.fifo", 0666);
int fd = open("/tmp/my.fifo", O_WRONLY);  // blocks until reader opens
write(fd, "data", 4);
close(fd);

// Process B (reader) — in a different program:
int fd = open("/tmp/my.fifo", O_RDONLY);  // blocks until writer opens
char buf[64];
read(fd, buf, sizeof(buf));
close(fd);
unlink("/tmp/my.fifo");  // clean up</div>
<div class="tip-box">💡 <strong>Pipe capacity:</strong> On Linux, the pipe buffer is 64 KB. Writes ≤ PIPE_BUF (4 KB) are atomic. write() blocks when the buffer is full; read() blocks when it's empty.</div>`,
    practice:[
      {q:"After pipe(fd), fd[0] is used for:",opts:["Writing","Reading","Both","Closing"],ans:1,exp:"fd[0] is the read end, fd[1] is the write end. Data flows fd[1] → pipe → fd[0]."},
      {q:"Why close unused pipe ends?",opts:["To save fds","So read() gets EOF when all writers close","Security requirement","Performance"],ans:1,exp:"If parent keeps fd[0] open, the pipe still has a reader after parent closes fd[1], preventing child from seeing EOF."},
      {q:"FIFOs differ from anonymous pipes in that:",opts:["FIFOs are bidirectional","FIFOs can be used between unrelated processes","FIFOs have no blocking","FIFOs don't use fds"],ans:1,exp:"FIFOs have a filesystem path so any process can open them by name, unlike anonymous pipes which require fork."},
    ],
    quiz:[
      {q:"read() on a pipe with all write ends closed returns:",opts:["Blocks forever","-1","0 (EOF)","EAGAIN"],ans:2,exp:"When all write ends are closed, reading returns 0 (EOF) — just like a file at its end."},
      {q:"Writes ≤ PIPE_BUF are guaranteed to be:",opts:["Non-blocking","Atomic (not interleaved)","Compressed","Encrypted"],ans:1,exp:"POSIX guarantees atomic writes ≤ PIPE_BUF — they won't be interleaved with other writers."},
      {q:"mkfifo() creates:",opts:["An anonymous pipe","A named pipe (FIFO) in the filesystem","A socket","A shared memory object"],ans:1,exp:"mkfifo creates a named pipe with a filesystem path, allowing unrelated processes to communicate."},
      {q:"pipe() returns how many fds?",opts:["1","2","3","4"],ans:1,exp:"pipe() fills an array of 2 fds: fd[0] for reading and fd[1] for writing."},
      {q:"Which is NOT true about anonymous pipes?",opts:["They're unidirectional","They work between unrelated processes","They're created with pipe()","Data is FIFO"],ans:1,exp:"Anonymous pipes only work between processes related by fork(). FIFOs allow unrelated processes to communicate."},
    ]
  },
  {
    id:'l5_2', title:'Shared Memory',
    learn:`<h3>Why Shared Memory?</h3>
<p>All other IPC (pipes, sockets, message queues) copy data through the kernel. Shared memory maps the <em>same physical pages</em> into multiple processes' address spaces — communicating is just a pointer read/write, no copies at all. This makes it the fastest IPC for large data.</p>
<h3>POSIX Shared Memory: 5-Step Pattern</h3>
<div class="code-block">#include &lt;sys/mman.h&gt;    // mmap, munmap, shm_open, shm_unlink
#include &lt;fcntl.h&gt;       // O_CREAT, O_RDWR
#include &lt;sys/stat.h&gt;    // mode_t
#include &lt;unistd.h&gt;      // ftruncate, close

typedef struct { int counter; char message[64]; } SharedData;

// === PROCESS A: Creator ===
// Step 1: create/open the named object
int fd = shm_open("/myshm", O_CREAT | O_RDWR, 0644);
if (fd == -1) { perror("shm_open"); exit(1); }

// Step 2: set its size (must do this before mapping)
ftruncate(fd, sizeof(SharedData));

// Step 3: map it into this process's address space
SharedData *shm = mmap(NULL, sizeof(SharedData),
    PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
close(fd);  // fd no longer needed after mmap

// Step 4: use it — Process B sees these writes immediately
shm->counter = 42;
strcpy(shm->message, "hello from A");

// Step 5: cleanup
munmap(shm, sizeof(SharedData));
shm_unlink("/myshm");  // remove name from filesystem</div>
<div class="code-block">// === PROCESS B: Consumer (runs simultaneously) ===
int fd = shm_open("/myshm", O_RDWR, 0644);  // no O_CREAT — A made it
SharedData *shm = mmap(NULL, sizeof(SharedData),
    PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
close(fd);

printf("counter=%d msg=%s\\n", shm->counter, shm->message);

munmap(shm, sizeof(SharedData));
// Don't unlink — only the last user should call shm_unlink</div>
<h3>MAP_SHARED vs MAP_PRIVATE</h3>
<p><strong>MAP_SHARED</strong>: writes are visible to all processes mapping the same region, and are written through to the underlying object. This is what you want for IPC.</p>
<p><strong>MAP_PRIVATE</strong>: creates a copy-on-write mapping. Writes are private to this process and not written back. Use it for read-only access to a file when you don't want to accidentally modify it.</p>
<h3>Synchronization is Mandatory</h3>
<p>Shared memory has <em>no built-in synchronization</em>. Without it you get race conditions and data corruption.</p>
<div class="code-block">// POSIX mutex in shared memory — must use PTHREAD_PROCESS_SHARED
pthread_mutex_t *mtx = &shm->mutex;
pthread_mutexattr_t attr;
pthread_mutexattr_init(&attr);
pthread_mutexattr_setpshared(&attr, PTHREAD_PROCESS_SHARED);
pthread_mutex_init(mtx, &attr);  // initialized by creator only
pthread_mutexattr_destroy(&attr);

// Both processes use it the same way:
pthread_mutex_lock(mtx);
shm->counter++;  // critical section
pthread_mutex_unlock(mtx);</div>
<h3>Anonymous Shared Memory with fork()</h3>
<p>When you just need parent+child to share memory (not arbitrary processes), use <code>MAP_ANONYMOUS | MAP_SHARED</code> <em>before</em> fork — no name needed, no <code>shm_open</code>.</p>
<div class="code-block">int *shared = mmap(NULL, sizeof(int),
    PROT_READ | PROT_WRITE,
    MAP_SHARED | MAP_ANONYMOUS,
    -1, 0);           // fd = -1 for anonymous

*shared = 0;
if (fork() == 0) {
    (*shared)++;      // child increments
    exit(0);
}
wait(NULL);
printf("value = %d\\n", *shared);  // prints 1
munmap(shared, sizeof(int));</div>
<div class="tip-box">💡 <strong>Compile flag:</strong> On Linux, link with <code>-lrt</code> for POSIX shared memory (<code>shm_open</code>, <code>shm_unlink</code>). On macOS, no extra flag is needed. <code>mmap</code> itself is in libc.</div>`,
    practice:[
      {q:"First step to create POSIX shared memory?",opts:["mmap()","ftruncate()","shm_open()","malloc()"],ans:2,exp:"shm_open() creates/opens the named shared memory object and returns a file descriptor."},
      {q:"Why is shared memory fastest IPC?",opts:["Uses the network","Processes access the same physical memory without kernel copies","OS pre-caches it","No fds needed"],ans:1,exp:"Processes map the same physical pages — communicating is just reading/writing memory, no kernel copies."},
      {q:"MAP_SHARED vs MAP_PRIVATE:",opts:["Both are identical","MAP_SHARED: writes visible to others; MAP_PRIVATE: creates a copy","MAP_PRIVATE is faster","MAP_SHARED requires root"],ans:1,exp:"MAP_SHARED writes are visible to other processes mapping the same region. MAP_PRIVATE uses copy-on-write."},
    ],
    quiz:[
      {q:"shm_unlink() does what?",opts:["Unmaps the memory","Removes the name so no new process can open it","Frees all physical memory","Closes the fd"],ans:1,exp:"shm_unlink removes the name. The shared memory persists until all mapping processes do munmap()."},
      {q:"What synchronization is needed for shared memory?",opts:["Nothing — it's thread-safe","A mutex or semaphore","File locking only","Signals"],ans:1,exp:"Shared memory has no built-in synchronization. Use PTHREAD_PROCESS_SHARED mutex or a named semaphore."},
      {q:"ftruncate() on a shared memory fd:",opts:["Closes it","Sets its size","Maps it","Opens it"],ans:1,exp:"ftruncate() sets the size of the shared memory object before mapping it."},
      {q:"Anonymous shared memory (MAP_ANONYMOUS) is used for:",opts:["Cross-machine communication","Parent-child sharing after fork","Unrelated processes","Network communication"],ans:1,exp:"MAP_ANONYMOUS creates shared memory without a name, suitable for parent-child communication after fork()."},
      {q:"Which header is needed for shm_open?",opts:["<stdlib.h>","<sys/mman.h>","<fcntl.h>","Both B and C"],ans:3,exp:"You need both <sys/mman.h> for mmap/munmap and <fcntl.h> for the O_* flags. Also <sys/stat.h> for the mode."},
    ]
  },
  ]
}
];
