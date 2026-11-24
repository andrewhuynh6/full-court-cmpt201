// FULL COURT — Interactive visualizations (inline SVG, no libraries).
// Each viz returns frames [{ svg, cap }]; the runner adds Back / Step / Play / Reset.

const VIZ = (() => {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const t = (x, y, s, cls = '', anchor = 'middle') =>
    `<text x="${x}" y="${y}" class="vz-t ${cls}" text-anchor="${anchor}">${esc(s)}</text>`;
  const box = (x, y, w, h, cls = '', r = 8) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="vz-box ${cls}"/>`;
  const line = (x1, y1, x2, y2, cls = '', head = true) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="vz-line ${cls}"${head ? ` marker-end="url(#vz-ar-${cls.split(' ')[0] || 'n'})"` : ''}/>`;
  const path = (d, cls = '', head = true) =>
    `<path d="${d}" class="vz-line ${cls}"${head ? ` marker-end="url(#vz-ar-${cls.split(' ')[0] || 'n'})"` : ''}/>`;
  const defs = ['n', 'a', 'b', 'ok'].map(k =>
    `<marker id="vz-ar-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="vz-mk vz-mk-${k}"/></marker>`).join('');

  // ── 1. Pointers: stack and heap ────────────────────────────────
  function memory() {
    const frame = (s, cap) => {
      let o = t(150, 24, 'STACK', 's') + t(490, 24, 'HEAP', 's');
      const cell = (y, name, val, cls, addr) =>
        box(40, y, 220, 46, cls) + t(54, y + 28, name, 'm b', 'start') + t(246, y + 28, val, 'm', 'end') + t(150, y + 62, addr, 's m');
      o += cell(40, 'int x', s.x === null ? '?' : s.x, s.xHi ? 'a' : '', '0x7ffc10');
      o += cell(112, 'int *p', s.p ? '0x7ffc10' : '?', s.p ? 'a' : '', '0x7ffc18');
      const arrCls = s.arr === 'dangling' ? 'bad' : s.arr === 'null' ? '' : s.arr ? 'a' : '';
      o += cell(184, 'int *arr', s.arr === null ? '?' : s.arr === 'null' ? 'NULL' : '0x5581a0', arrCls, '0x7ffc20');
      if (s.p) o += path('M40 135 C 8 135 8 63 40 63', 'a');
      if (s.heap) {
        o += box(380, 92, 220, 96, s.heap === 'freed' ? 'bad dim' : 'a');
        o += t(490, 128, s.heap === 'freed' ? 'FREED' : 'malloc(4 * sizeof(int))', s.heap === 'freed' ? 'b bad' : 'm b');
        o += t(490, 152, s.heap === 'freed' ? 'memory returned to the OS' : '16 bytes · 0x5581a0', 's');
        o += t(490, 208, '0x5581a0', 's m');
      }
      if (s.heap && s.arr && s.arr !== 'null') o += line(260, 207, 380, 150, s.arr === 'dangling' ? 'b' : 'a');
      return { svg: o, cap };
    };
    return [
      frame({ x: 42, xHi: true }, 'int x = 42; — x is a variable on the stack with its own address (0x7ffc10).'),
      frame({ x: 42, p: true }, 'int *p = &x; — p holds the ADDRESS of x. The arrow means "points to".'),
      frame({ x: 7, xHi: true, p: true }, '*p = 7; — follow the arrow and write. x is now 7, without ever naming x.'),
      frame({ x: 7, p: true, arr: 'heap', heap: 'alloc' }, 'arr = malloc(...) — the block lives on the HEAP. arr (on the stack) stores its address.'),
      frame({ x: 7, p: true, arr: 'dangling', heap: 'freed' }, 'free(arr) — the block is gone, but arr still holds the old address. That is a dangling pointer.'),
      frame({ x: 7, p: true, arr: 'null', heap: 'freed' }, 'arr = NULL; — now the pointer is obviously invalid. Dereferencing it crashes loudly instead of corrupting memory.'),
    ];
  }

  // ── 2. fork() and the process tree ─────────────────────────────
  function forkViz() {
    const proc = (x, y, title, lines, cls = '') => {
      let o = box(x, y, 250, 130, cls) + t(x + 125, y + 24, title, 'b');
      lines.forEach((l, i) => { o += t(x + 16, y + 52 + i * 22, l[0], 'm ' + (l[1] || ''), 'start'); });
      return o;
    };
    return [
      { svg: proc(195, 60, 'Process 100', [['pid = fork();', 'a'], ['...', 's']], 'a'),
        cap: 'One process (PID 100) is about to call fork().' },
      { svg: proc(20, 60, 'Parent · PID 100', [['pid = 101', 'a'], ['waitpid(pid)', '']], '') + proc(370, 60, 'Child · PID 101', [['pid = 0', 'a'], ['exit(0)', '']], 'a') + line(270, 125, 370, 125, 'a'),
        cap: 'fork() returns TWICE: the parent gets the child\'s PID (101), the child gets 0. Same code, two processes.' },
      { svg: proc(20, 60, 'Parent · PID 100', [['pid = 101', ''], ['waitpid(pid)  zzz', 'a']], '') + proc(370, 60, 'Child · PID 101', [['pid = 0', ''], ['exit(0) → done', 'a']], 'a'),
        cap: 'The parent blocks in waitpid(); the child runs its work and calls exit(0).' },
      { svg: proc(20, 60, 'Parent · PID 100', [['pid = 101', ''], ['waitpid(pid)  zzz', 'a']], '') + proc(370, 60, 'Child · PID 101 (zombie)', [['exited, status 0', 'bad'], ['entry kept in table', 's']], 'bad dim'),
        cap: 'The child has exited but still has a process-table entry: a ZOMBIE. It stays until the parent collects its status.' },
      { svg: proc(195, 60, 'Parent · PID 100', [['waitpid returned 101', 'ok'], ['WEXITSTATUS = 0', 'ok']], 'ok'),
        cap: 'waitpid() reaps the zombie: the entry is freed and the parent learns the exit status. Never skip wait().' },
    ];
  }

  // ── 3. Threads and the race condition ──────────────────────────
  function race() {
    const f = (s, cap) => {
      let o = box(250, 20, 140, 64, s.bad ? 'bad' : 'a') + t(320, 46, 'counter', 'b') + t(320, 72, s.counter, 'm b ' + (s.bad ? 'bad' : ''));
      const lane = (x, name, reg, ops, active) => {
        let l = box(x, 120, 200, 150, active ? 'a' : '') + t(x + 100, 144, name, 'b') + t(x + 100, 166, 'reg = ' + (reg === null ? '–' : reg), 'm s');
        ops.forEach((op, i) => { l += t(x + 18, 192 + i * 22, op[0], 'm ' + op[1], 'start'); });
        return l;
      };
      o += lane(40, 'Thread A', s.a, s.aOps, s.who === 'A') + lane(400, 'Thread B', s.b, s.bOps, s.who === 'B');
      if (s.who === 'A') o += line(240, 150, 280, 90, 'a');
      if (s.who === 'B') o += line(400, 150, 360, 90, 'a');
      if (s.final) o += t(236, 46, 'Expected: 2', 's', 'end') + t(236, 68, 'Got: 1', 'b bad', 'end');
      return { svg: o, cap };
    };
    const ops = (done, cur) => ['load', 'add 1', 'store'].map((n, i) => [(i + 1) + '. ' + n, i < done ? 'ok' : i === cur ? 'a' : 's']);
    return [
      f({ counter: 0, a: null, b: null, aOps: ops(0, -1), bOps: ops(0, -1) }, 'counter++ looks like one step, but the CPU does three: load, add, store. Two threads each run it once.'),
      f({ counter: 0, a: 0, b: null, who: 'A', aOps: ops(1, 1), bOps: ops(0, -1) }, 'A loads counter (0) into its register.'),
      f({ counter: 0, a: 0, b: 0, who: 'B', aOps: ops(1, 1), bOps: ops(1, 1) }, 'The scheduler switches to B before A stores. B also loads 0.'),
      f({ counter: 0, a: 1, b: 0, who: 'A', aOps: ops(2, 2), bOps: ops(1, 1) }, 'A adds 1 in its register (1).'),
      f({ counter: 1, a: 1, b: 0, who: 'A', aOps: ops(3, -1), bOps: ops(1, 1) }, 'A stores 1 into counter. So far so good.'),
      f({ counter: 1, a: 1, b: 1, who: 'B', aOps: ops(3, -1), bOps: ops(2, 2) }, 'B adds 1 to its STALE copy (0), getting 1.'),
      f({ counter: 1, a: 1, b: 1, who: 'B', bad: true, final: true, aOps: ops(3, -1), bOps: ops(3, -1) }, 'B stores 1, overwriting A\'s work. Two increments, one result: a lost update. This is a race condition.'),
    ];
  }

  // ── 4. Mutex ───────────────────────────────────────────────────
  function mutex() {
    const f = (s, cap) => {
      let o = box(250, 14, 140, 56, s.lock ? 'a' : 'ok') + t(320, 38, 'mutex', 'b') + t(320, 60, s.lock ? 'LOCKED by ' + s.lock : 'unlocked', 'm ' + (s.lock ? 'a' : 'ok'));
      o += box(250, 96, 140, 56, '') + t(320, 120, 'counter', 'b') + t(320, 142, s.counter, 'm b');
      const lane = (x, n, st, cls, note) => box(x, 150, 200, 110, cls) + t(x + 100, 176, n, 'b') + t(x + 100, 206, st, 'm') + t(x + 100, 234, note || '', 's');
      o += lane(40, 'Thread A', s.aSt, s.aCls || '', s.aNote);
      o += lane(400, 'Thread B', s.bSt, s.bCls || '', s.bNote);
      return { svg: o, cap };
    };
    return [
      f({ counter: 0, aSt: 'ready', bSt: 'ready' }, 'Two threads want to run counter++. The mutex guards the critical section.'),
      f({ counter: 0, lock: 'A', aSt: 'pthread_mutex_lock()', aCls: 'ok', aNote: 'got the lock', bSt: 'ready' }, 'A calls lock() first and gets it. A is inside the critical section.'),
      f({ counter: 0, lock: 'A', aSt: 'in critical section', aCls: 'ok', bSt: 'lock() … blocked', bCls: 'bad', bNote: 'sleeping until unlock' }, 'B calls lock() too, but the mutex is taken. B goes to sleep: it cannot touch counter.'),
      f({ counter: 1, lock: 'A', aSt: 'counter++  → 1', aCls: 'ok', bSt: 'blocked', bCls: 'bad' }, 'A increments safely. Nobody can interleave.'),
      f({ counter: 1, aSt: 'unlock()', aCls: '', bSt: 'woken up', bCls: 'a' }, 'A unlocks. The mutex is free and B is woken up.'),
      f({ counter: 1, lock: 'B', aSt: 'done', bSt: 'lock() acquired', bCls: 'ok' }, 'B acquires the lock.'),
      f({ counter: 2, lock: 'B', aSt: 'done', bSt: 'counter++  → 2', bCls: 'ok' }, 'B increments the up-to-date value (1 → 2).'),
      f({ counter: 2, aSt: 'done', bSt: 'unlock()  done' }, 'Final counter = 2, every time. The mutex turned a race into an orderly queue.'),
    ];
  }

  // ── 5. Deadlock ────────────────────────────────────────────────
  function deadlock() {
    const f = (s, cap) => {
      let o = box(40, 90, 150, 80, s.t1 || '') + t(115, 122, 'Thread 1', 'b') + t(115, 148, s.t1s || '', 's');
      o += box(450, 90, 150, 80, s.t2 || '') + t(525, 122, 'Thread 2', 'b') + t(525, 148, s.t2s || '', 's');
      o += box(245, 14, 150, 52, s.m1 || '') + t(320, 46, 'Lock M1', 'b');
      o += box(245, 194, 150, 52, s.m2 || '') + t(320, 226, 'Lock M2', 'b');
      (s.arrows || []).forEach(a => { o += a; });
      if (s.label) o += t(320, 142, s.label, 'b ' + (s.labelCls || ''));
      return { svg: o, cap };
    };
    const holds1 = line(250, 50, 170, 92, 'ok'), holds2 = line(390, 210, 470, 168, 'ok');
    const wants1 = line(190, 150, 250, 205, 'a'), wants2 = line(450, 110, 390, 60, 'a');
    const wants1b = line(190, 150, 250, 205, 'b'), wants2b = line(450, 110, 390, 60, 'b');
    return [
      f({ s: 1 }, 'Two threads, two locks. Each thread will need BOTH locks.'),
      f({ t1: 'ok', t1s: 'holds M1', m1: 'ok', arrows: [holds1] }, 'Thread 1 locks M1. Arrow M1 → T1 means "T1 holds M1".'),
      f({ t1: 'ok', t1s: 'holds M1', t2: 'ok', t2s: 'holds M2', m1: 'ok', m2: 'ok', arrows: [holds1, holds2] }, 'Thread 2 locks M2. Both have one lock.'),
      f({ t1: 'a', t1s: 'waits for M2', t2: 'ok', t2s: 'holds M2', m1: 'ok', m2: 'ok', arrows: [holds1, holds2, wants1] }, 'Thread 1 now asks for M2. Dashed arrow = "waiting for". M2 is taken, so T1 sleeps while still holding M1.'),
      f({ t1: 'bad', t1s: 'waits for M2', t2: 'bad', t2s: 'waits for M1', m1: 'bad', m2: 'bad', arrows: [holds1, holds2, wants1b, wants2b], label: 'DEADLOCK', labelCls: 'bad' }, 'Thread 2 asks for M1. T1 waits for T2, T2 waits for T1: a cycle. Neither can ever continue.'),
      f({ t1: 'ok', t1s: 'holds M1, then M2', t2: 'a', t2s: 'waits for M1 (holds nothing)', m1: 'ok', m2: 'ok', arrows: [holds1, line(250, 210, 170, 160, 'ok'), wants2], label: 'No cycle', labelCls: 'ok' }, 'The fix: every thread locks in the SAME order (M1 then M2). T2 waits holding nothing, so T1 finishes and releases both.'),
    ];
  }

  // ── 6. Semaphores: producer / consumer ─────────────────────────
  function semaphore() {
    const f = (items, empty, full, pSt, cSt, cap, pCls = '', cCls = '') => {
      let o = t(320, 22, 'Shared buffer (4 slots)', 's');
      for (let i = 0; i < 4; i++) {
        const x = 170 + i * 76;
        o += box(x, 34, 68, 56, items[i] ? 'a' : '') + t(x + 34, 68, items[i] ? '#' + items[i] : '', 'm b');
      }
      o += box(40, 118, 170, 56, 'a') + t(125, 142, 'empty', 'b') + t(125, 164, 'sem = ' + empty, 'm');
      o += box(430, 118, 170, 56, 'a') + t(515, 142, 'full', 'b') + t(515, 164, 'sem = ' + full, 'm');
      o += box(40, 198, 200, 60, pCls) + t(140, 222, 'Producer', 'b') + t(140, 244, pSt, 's');
      o += box(400, 198, 200, 60, cCls) + t(500, 222, 'Consumer', 'b') + t(500, 244, cSt, 's');
      return { svg: o, cap };
    };
    return [
      f([], 4, 0, 'idle', 'idle', 'empty = free slots (4), full = filled slots (0). Producer waits on empty; consumer waits on full.'),
      f([1], 3, 1, 'put #1', 'idle', 'sem_wait(&empty) → 3, put item, sem_post(&full) → 1.', 'ok'),
      f([1, 2], 2, 2, 'put #2', 'idle', 'Again: empty 2, full 2.', 'ok'),
      f([1, 2, 3], 1, 3, 'put #3', 'idle', 'empty 1, full 3.', 'ok'),
      f([1, 2, 3, 4], 0, 4, 'put #4', 'idle', 'The buffer is now full: empty = 0.', 'ok'),
      f([1, 2, 3, 4], 0, 4, 'sem_wait(&empty) BLOCKED', 'idle', 'Producer wants to add #5, but empty = 0. It sleeps: no busy-waiting, no overflow.', 'bad'),
      f([2, 3, 4], 1, 3, 'wakes up', 'took #1', 'Consumer takes #1: sem_wait(&full), then sem_post(&empty) bumps empty to 1, waking the producer.', 'a', 'ok'),
      f([2, 3, 4, 5], 0, 4, 'put #5', 'idle', 'Producer finally adds #5. The semaphores kept both sides in step.', 'ok'),
    ];
  }

  // ── 7. Pipes ───────────────────────────────────────────────────
  function pipe() {
    const f = (s, cap) => {
      let o = box(20, 20, 190, 220, s.p ? 'a' : '') + t(115, 44, s.fork ? 'Parent' : 'Process', 'b');
      if (s.fork) o += box(430, 20, 190, 220, '') + t(525, 44, 'Child', 'b');
      o += box(250, 112, 140, 44, s.full ? 'a' : '', 22) + t(320, 108, 'kernel pipe buffer', 's') + t(320, 139, s.data || 'empty', 'm b');
      const chip = (x, y, label, st) => box(x, y, 150, 36, st === 'closed' ? 'bad dim' : '') + t(x + 75, y + 23, label + (st === 'closed' ? ' ✕' : ''), 'm ' + (st === 'closed' ? 'bad' : ''));
      const P = s.pc || {}, C = s.cc || {};
      o += chip(40, 70, 'fd[1] write', P.w) + chip(40, 166, 'fd[0] read', P.r);
      o += line(190, 88, 255, 122, P.w === 'closed' ? 'n' : s.flowW ? 'a' : 'n');
      o += line(255, 146, 190, 184, P.r === 'closed' ? 'n' : 'n');
      if (s.fork) {
        o += chip(450, 70, 'fd[1] write', C.w) + chip(450, 166, 'fd[0] read', C.r);
        o += line(450, 88, 385, 122, C.w === 'closed' ? 'n' : 'n');
        o += line(385, 146, 450, 184, C.r === 'closed' ? 'n' : s.flowR ? 'a' : 'n');
      }
      return { svg: o, cap };
    };
    return [
      f({ p: 1 }, 'pipe(fd) asks the kernel for a one-way buffer. fd[1] is the WRITE end, fd[0] the READ end. Data flows in at fd[1], out at fd[0].'),
      f({ fork: 1 }, 'fork() copies the descriptor table: now BOTH processes hold both ends of the same pipe (4 open ends).'),
      f({ fork: 1, pc: { r: 'closed' }, cc: { w: 'closed' } }, 'Close what you do not use: the parent only writes (closes fd[0]), the child only reads (closes fd[1]).'),
      f({ fork: 1, pc: { r: 'closed' }, cc: { w: 'closed' }, data: '"Hi!"', full: 1, flowW: 1 }, 'Parent: write(fd[1], "Hi!", 3). The bytes wait in the kernel buffer.'),
      f({ fork: 1, pc: { r: 'closed' }, cc: { w: 'closed' }, data: 'empty', flowR: 1 }, 'Child: read(fd[0], buf, ...) returns 3 and gets "Hi!". Reading removes the bytes from the pipe.'),
      f({ fork: 1, pc: { r: 'closed', w: 'closed' }, cc: { w: 'closed' }, data: 'empty' }, 'Parent closes fd[1]. With no writers left, the child\'s read() returns 0 = EOF. If anyone kept a write end open, read() would block forever.'),
    ];
  }

  // ── 8. Shared memory ───────────────────────────────────────────
  function shm() {
    const f = (s, cap) => {
      let o = box(20, 14, 220, 100, s.m1 ? 'a' : '') + t(130, 38, 'Process 1', 'b') + t(130, 64, 'virtual 0x7f10000', 's m') + t(130, 92, s.m1 ? 'p = mmap(...)' : 'no mapping', 'm');
      o += box(400, 14, 220, 100, s.m2 ? 'a' : '') + t(510, 38, 'Process 2', 'b') + t(510, 64, 'virtual 0x7e80000', 's m') + t(510, 92, s.m2 ? 'q = mmap(...)' : 'no mapping', 'm');
      o += box(235, 160, 170, 84, s.obj ? (s.bad ? 'bad' : 'ok') : 'dim') + t(320, 184, 'Physical page', 's') + t(320, 214, s.obj ? (s.val === null ? '/myshm  4096 B' : 'value = ' + s.val) : 'not created', 'm b');
      if (s.m1) o += line(130, 114, 290, 160, s.w ? 'a' : 'n');
      if (s.m2) o += line(510, 114, 350, 160, s.r ? 'a' : 'n');
      return { svg: o, cap };
    };
    return [
      f({ obj: 1, val: null }, 'shm_open("/myshm") + ftruncate(fd, 4096) create a named object in the kernel: one physical page that any process may map.'),
      f({ obj: 1, val: null, m1: 1 }, 'Process 1 calls mmap(MAP_SHARED): its virtual address 0x7f10000 now points at that page.'),
      f({ obj: 1, val: null, m1: 1, m2: 1 }, 'Process 2 maps the same object. Different virtual addresses, SAME physical page.'),
      f({ obj: 1, val: 42, m1: 1, m2: 1, w: 1 }, 'Process 1 writes *p = 42. It is a plain memory write: no system call, no copy.'),
      f({ obj: 1, val: 42, m1: 1, m2: 1, r: 1 }, 'Process 2 reads *q and sees 42 immediately. Fastest IPC there is.'),
      f({ obj: 1, val: '??', bad: 1, m1: 1, m2: 1, w: 1, r: 1 }, 'But if both write at once you get a race. Put a process-shared mutex or semaphore inside the shared page.'),
    ];
  }

  const DEFS = {
    memory:    { title: 'Stack, heap and pointers',            vb: '0 0 640 270', frames: memory },
    fork:      { title: 'fork(), wait() and zombies',           vb: '0 44 640 166', frames: forkViz },
    race:      { title: 'Race condition: a lost update',        vb: '0 0 640 290', frames: race },
    mutex:     { title: 'A mutex serializes the critical section', vb: '0 0 640 270', frames: mutex },
    deadlock:  { title: 'Deadlock: a cycle of waiting',         vb: '0 0 640 260', frames: deadlock },
    semaphore: { title: 'Semaphores: producer and consumer',    vb: '0 0 640 270', frames: semaphore },
    pipe:      { title: 'A pipe between parent and child',      vb: '0 0 640 260', frames: pipe },
    shm:       { title: 'Shared memory between two processes',  vb: '0 0 640 260', frames: shm },
  };

  function mount(el, name) {
    const def = DEFS[name];
    if (!def) return;
    const frames = def.frames();
    let i = 0, timer = null;
    el.innerHTML = `<div class="viz">
      <div class="viz-title">${def.title}</div>
      <div class="viz-hint">Swipe sideways to see the whole diagram</div>
      <div class="viz-stage"><svg viewBox="${def.vb}" role="img" aria-label="${def.title}"><defs>${defs}</defs><g class="vz-g"></g></svg></div>
      <div class="viz-cap" aria-live="polite"></div>
      <div class="viz-ctl">
        <button class="btn btn-secondary btn-sm" data-a="back">Back</button>
        <button class="btn btn-secondary btn-sm" data-a="step">Step</button>
        <button class="btn btn-primary btn-sm" data-a="play">Play</button>
        <button class="btn btn-secondary btn-sm" data-a="reset">Reset</button>
        <span class="viz-count"></span>
      </div></div>`;
    const g = el.querySelector('.vz-g'), cap = el.querySelector('.viz-cap'),
      count = el.querySelector('.viz-count'), play = el.querySelector('[data-a=play]');
    const stop = () => { clearInterval(timer); timer = null; play.textContent = i >= frames.length - 1 ? 'Replay' : 'Play'; };
    const draw = () => {
      g.innerHTML = frames[i].svg;
      cap.textContent = frames[i].cap;
      count.textContent = (i + 1) + ' / ' + frames.length;
      if (i >= frames.length - 1 && timer) stop();
    };
    el.querySelector('.viz-ctl').addEventListener('click', e => {
      const a = e.target.closest('button')?.dataset.a;
      if (!a) return;
      if (a === 'back') { stop(); i = Math.max(0, i - 1); draw(); }
      if (a === 'step') { stop(); i = Math.min(frames.length - 1, i + 1); draw(); }
      if (a === 'reset') { stop(); i = 0; draw(); play.textContent = 'Play'; }
      if (a === 'play') {
        if (timer) { stop(); return; }
        if (i >= frames.length - 1) i = 0;
        draw(); play.textContent = 'Pause';
        timer = setInterval(() => {
          if (!el.isConnected) { clearInterval(timer); return; }
          i++; draw();
        }, 2200);
      }
    });
    draw();
  }

  function mountAll(root) {
    (root || document).querySelectorAll('[data-viz]').forEach(el => { if (!el.dataset.mounted) { el.dataset.mounted = 1; mount(el, el.dataset.viz); } });
  }

  return { mount, mountAll, names: Object.keys(DEFS) };
})();
