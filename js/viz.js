// FULL COURT — Interactive visualizations (inline SVG, no libraries).
// Each viz returns frames [{ svg, cap }]. The runner morphs between frames: identical elements stay put,
// elements with the same data-k glide to their new position, new ones fade in, removed ones fade out.

const VIZ = (() => {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const t = (x, y, s, cls = '', anchor = 'middle') =>
    `<text x="${x}" y="${y}" class="vz-t ${cls}" text-anchor="${anchor}">${esc(s)}</text>`;
  const box = (x, y, w, h, cls = '', r = 8) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="vz-box ${cls}"/>`;
  const line = (x1, y1, x2, y2, cls = '', head = true, k = '') =>
    `<line${k ? ` data-k="${k}"` : ''} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="vz-line ${cls}"${head ? ` marker-end="url(#vz-ar-${cls.split(' ')[0] || 'n'})"` : ''}/>`;
  const path = (d, cls = '', head = true) =>
    `<path d="${d}" class="vz-line ${cls}"${head ? ` marker-end="url(#vz-ar-${cls.split(' ')[0] || 'n'})"` : ''}/>`;
  // Keyed token: a labelled rounded box that can glide between frames.
  const tok = (k, x, y, w, h, label, cls = 'a') =>
    `<rect data-k="${k}" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="vz-box ${cls}"/>` +
    `<text data-k="${k}-t" x="${x + w / 2}" y="${y + h / 2 + 5}" class="vz-t m b" text-anchor="middle">${esc(label)}</text>`;
  const ball = (k, x, y) =>
    `<circle data-k="${k}" cx="${x}" cy="${y}" r="13" class="vz-ball"/>`;
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

  // ── 4. Mutex (the ball is the lock) ────────────────────────────
  function mutex() {
    const f = (s, cap) => {
      let o = box(250, 14, 140, 56, s.lock ? 'a' : 'ok') + t(320, 38, 'mutex', 'b') + t(320, 60, s.lock ? 'LOCKED by ' + s.lock : 'unlocked', 'm ' + (s.lock ? 'a' : 'ok'));
      o += box(250, 96, 140, 56, '') + t(320, 120, 'counter', 'b') + t(320, 142, s.counter, 'm b');
      const lane = (x, n, st, cls, note) => box(x, 150, 200, 110, cls) + t(x + 100, 176, n, 'b') + t(x + 100, 206, st, 'm') + t(x + 100, 234, note || '', 's');
      o += lane(40, 'Thread A', s.aSt, s.aCls || '', s.aNote);
      o += lane(400, 'Thread B', s.bSt, s.bCls || '', s.bNote);
      const pos = s.lock === 'A' ? [66, 172] : s.lock === 'B' ? [426, 172] : [412, 42];
      o += ball('ball', pos[0], pos[1]);
      return { svg: o, cap };
    };
    return [
      f({ counter: 0, aSt: 'ready', bSt: 'ready' }, 'Two threads want to run counter++. The mutex is the ball: only the thread holding it may enter the critical section.'),
      f({ counter: 0, lock: 'A', aSt: 'pthread_mutex_lock()', aCls: 'ok', aNote: 'got the lock', bSt: 'ready' }, 'A calls lock() first and gets the ball. A is inside the critical section.'),
      f({ counter: 0, lock: 'A', aSt: 'in critical section', aCls: 'ok', bSt: 'lock() … blocked', bCls: 'bad', bNote: 'sleeping until unlock' }, 'B calls lock() too, but A has the ball. B goes to sleep: it cannot touch counter.'),
      f({ counter: 1, lock: 'A', aSt: 'counter++  → 1', aCls: 'ok', bSt: 'blocked', bCls: 'bad' }, 'A increments safely. Nobody can interleave.'),
      f({ counter: 1, aSt: 'unlock()', aCls: '', bSt: 'woken up', bCls: 'a' }, 'A unlocks: the ball goes back to the mutex and B is woken up.'),
      f({ counter: 1, lock: 'B', aSt: 'done', bSt: 'lock() acquired', bCls: 'ok' }, 'B takes the ball.'),
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

  // ── 6. Semaphores: producer / consumer (items slide through the buffer) ──
  function semaphore() {
    const slotX = i => 170 + i * 76;
    const f = (items, empty, full, pSt, cSt, cap, pCls = '', cCls = '', held = null) => {
      let o = t(320, 22, 'Shared buffer (4 slots)', 's');
      for (let i = 0; i < 4; i++) o += box(slotX(i), 34, 68, 56, '');
      items.forEach((n, i) => { o += tok('it' + n, slotX(i) + 6, 40, 56, 44, '#' + n, 'a'); });
      if (held) o += tok('it' + held, 330, 126, 56, 44, '#' + held, 'ok');
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
      f([2, 3, 4], 1, 3, 'wakes up', 'took #1', 'Consumer takes #1: sem_wait(&full), then sem_post(&empty) bumps empty to 1, waking the producer. The queue shifts forward.', 'a', 'ok', 1),
      f([2, 3, 4, 5], 0, 4, 'put #5', 'idle', 'Producer finally adds #5. The semaphores kept both sides in step.', 'ok'),
    ];
  }

  // ── 7. Pipes (a packet travels through the kernel buffer) ──────
  function pipe() {
    const f = (s, cap) => {
      let o = box(20, 20, 190, 220, s.p ? 'a' : '') + t(115, 44, s.fork ? 'Parent' : 'Process', 'b');
      if (s.fork) o += box(430, 20, 190, 220, '') + t(525, 44, 'Child', 'b');
      o += box(250, 112, 140, 44, s.full ? 'a' : '', 22) + t(320, 108, 'kernel pipe buffer', 's');
      if (!s.pkt || s.pkt === 'child') o += t(320, 139, 'empty', 'm s');
      const chip = (x, y, label, st) => box(x, y, 150, 36, st === 'closed' ? 'bad dim' : '') + t(x + 75, y + 23, label + (st === 'closed' ? ' ✕' : ''), 'm ' + (st === 'closed' ? 'bad' : ''));
      const P = s.pc || {}, C = s.cc || {};
      o += chip(40, 70, 'fd[1] write', P.w) + chip(40, 166, 'fd[0] read', P.r);
      o += line(190, 88, 255, 122, 'n');
      o += line(255, 146, 190, 184, 'n');
      if (s.fork) {
        o += chip(450, 70, 'fd[1] write', C.w) + chip(450, 166, 'fd[0] read', C.r);
        o += line(450, 88, 385, 122, 'n');
        o += line(385, 146, 450, 184, s.flowR ? 'a' : 'n');
      }
      if (s.pkt === 'parent') o += tok('pkt', 80, 112, 70, 30, '"Hi!"', 'a');
      if (s.pkt === 'tube') o += tok('pkt', 285, 118, 70, 30, '"Hi!"', 'a');
      if (s.pkt === 'child') o += tok('pkt', 490, 206, 70, 30, '"Hi!"', 'ok');
      return { svg: o, cap };
    };
    return [
      f({ p: 1 }, 'pipe(fd) asks the kernel for a one-way buffer. fd[1] is the WRITE end, fd[0] the READ end. Data flows in at fd[1], out at fd[0].'),
      f({ fork: 1 }, 'fork() copies the descriptor table: now BOTH processes hold both ends of the same pipe (4 open ends).'),
      f({ fork: 1, pc: { r: 'closed' }, cc: { w: 'closed' } }, 'Close what you do not use: the parent only writes (closes fd[0]), the child only reads (closes fd[1]).'),
      f({ fork: 1, pc: { r: 'closed' }, cc: { w: 'closed' }, pkt: 'parent' }, 'Parent prepares to write "Hi!" into fd[1].'),
      f({ fork: 1, pc: { r: 'closed' }, cc: { w: 'closed' }, pkt: 'tube', full: 1 }, 'write(fd[1], "Hi!", 3): the bytes now wait in the kernel buffer.'),
      f({ fork: 1, pc: { r: 'closed' }, cc: { w: 'closed' }, pkt: 'child', flowR: 1 }, 'Child: read(fd[0], buf, ...) returns 3 and gets "Hi!". Reading removes the bytes from the pipe.'),
      f({ fork: 1, pc: { r: 'closed', w: 'closed' }, cc: { w: 'closed' } }, 'Parent closes fd[1]. With no writers left, the child\'s read() returns 0 = EOF. If anyone kept a write end open, read() would block forever.'),
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

  // ── 9. Pointer arithmetic: the arrow steps by sizeof(int) ──────
  function ptrarith() {
    const cx = i => 110 + i * 150;
    const f = (p, cap, o = {}) => {
      let s = '';
      [10, 20, 30].forEach((v, i) => {
        s += box(cx(i), 80, 110, 58, o.hi === i ? 'a' : '') + t(cx(i) + 55, 116, v, 'm b');
        s += t(cx(i) + 55, 160, '0x' + (4096 + i * 4).toString(16), 's m') + t(cx(i) + 4, 72, 'a[' + i + ']', 's', 'start');
      });
      s += tok('ptr', cx(p) + 25, 14, 60, 28, 'p', 'a');
      s += line(cx(p) + 55, 44, cx(p) + 55, 78, 'a', true, 'parr');
      if (o.ghost !== undefined) s += tok('ghost', cx(o.ghost) + 25, 14, 60, 28, 'p + 1', 'ok') + line(cx(o.ghost) + 55, 44, cx(o.ghost) + 55, 78, 'ok', true, 'garr');
      if (o.step) s += t(cx(0) + 130, 196, '+ 4 bytes', 'b a') + t(cx(0) + 130, 216, '= sizeof(int)', 's');
      return { svg: s, cap };
    };
    return [
      f(0, 'int a[3]; int *p = a; — p points at a[0]. Addresses are 4 bytes apart because each int is 4 bytes.'),
      f(1, 'p++ moves p forward by ONE ELEMENT: 4 bytes, not 1. The compiler multiplies by sizeof(*p).', { step: 1 }),
      f(1, '*p now reads a[1] = 20. And p[1] is the same as *(p + 1).', { hi: 1 }),
      f(1, 'p + 1 (without changing p) would point at a[2]. A char * would step only 1 byte; a double * would step 8.', { ghost: 2 }),
    ];
  }

  // ── 10. Condition variable ─────────────────────────────────────
  function condvar() {
    const f = (s, cap) => {
      let o = box(250, 14, 140, 52, s.lock ? 'a' : 'ok') + t(320, 36, 'mutex', 'b') + t(320, 56, s.lock ? 'locked by ' + s.lock : 'unlocked', 'm ' + (s.lock ? 'a' : 'ok'));
      o += box(250, 92, 140, 52, s.ready ? 'ok' : '') + t(320, 114, 'ready', 'b') + t(320, 134, s.ready ? 'true' : 'false', 'm ' + (s.ready ? 'ok' : 'bad'));
      o += box(250, 172, 140, 76, s.sleeping ? 'a' : 'dim') + t(320, 194, 'wait queue', 's');
      o += box(20, 92, 200, 150, s.wAct ? 'a' : '') + t(120, 116, 'Waiter', 'b') + t(120, 146, s.wTxt || '', 'm') + t(120, 172, s.wTxt2 || '', 's');
      o += box(420, 92, 200, 150, s.sAct ? 'a' : '') + t(520, 116, 'Signaler', 'b') + t(520, 146, s.sTxt || '', 'm') + t(520, 172, s.sTxt2 || '', 's');
      o += tok('W', s.sleeping ? 275 : 60, s.sleeping ? 206 : 196, 90, 30, s.sleeping ? 'Waiter zzz' : 'Waiter', s.sleeping ? 'a' : 'ok');
      return { svg: o, cap };
    };
    return [
      f({ wTxt: 'while (!ready)', wTxt2: 'about to wait', sTxt: 'working…' }, 'The Waiter needs ready to become true. It must not burn CPU polling.'),
      f({ lock: 'Waiter', wAct: 1, wTxt: 'lock(&m)', wTxt2: 'checks ready: false', sTxt: 'working…' }, 'Waiter locks the mutex and tests the condition: ready is false.'),
      f({ sleeping: 1, wAct: 1, wTxt: 'cond_wait(&cv,&m)', wTxt2: 'releases m, sleeps', sTxt: 'working…' }, 'cond_wait atomically UNLOCKS the mutex and puts the Waiter to sleep. Nothing is wasted.'),
      f({ lock: 'Signaler', sleeping: 1, sAct: 1, wTxt: 'asleep', sTxt: 'lock(&m)', sTxt2: 'mutex was free' }, 'Because the mutex was released, the Signaler can lock it.'),
      f({ lock: 'Signaler', sleeping: 1, sAct: 1, ready: 1, wTxt: 'asleep', sTxt: 'ready = true', sTxt2: 'state changed' }, 'The Signaler changes the shared state: ready = true.'),
      f({ sleeping: 1, sAct: 1, ready: 1, wTxt: 'asleep', sTxt: 'cond_signal(&cv)', sTxt2: 'then unlock(&m)' }, 'cond_signal wakes the Waiter; the Signaler then unlocks.'),
      f({ lock: 'Waiter', wAct: 1, ready: 1, wTxt: 'wakes, re-locks m', wTxt2: 're-checks: ready true', sTxt: 'done' }, 'The Waiter re-acquires the mutex and RE-TESTS the condition (that is why it is a while loop). Now it is true, so it proceeds.'),
    ];
  }

  // ── 11. File descriptors and dup2 ──────────────────────────────
  function fdtable() {
    const rowY = i => 40 + i * 52;
    const f = (s, cap) => {
      let o = t(120, 24, 'fd table', 's') + t(520, 20, 'kernel objects', 's');
      const names = ['0  stdin', '1  stdout', '2  stderr', '3'];
      names.forEach((n, i) => { o += box(40, rowY(i), 160, 40, i === 3 && !s.fd3 ? 'dim' : '') + t(56, rowY(i) + 25, n, 'm b', 'start'); });
      o += box(430, 36, 170, 100, '') + t(515, 66, 'terminal', 'b') + t(515, 90, '(screen)', 's');
      o += box(430, 170, 170, 100, s.fd3 || s.fd1file ? 'a' : 'dim') + t(515, 200, 'log.txt', 'b') + t(515, 224, s.written ? 'contains: "hi"' : '(file)', 'm ' + (s.written ? 'ok' : 's'));
      const target = k => k === 'file' ? 220 : 80;
      [['a0', 0, 'term'], ['a1', 1, s.fd1file ? 'file' : 'term'], ['a2', 2, 'term']].forEach(([k, i, tg]) => {
        o += line(200, rowY(i) + 20, 430, tg === 'file' ? 200 : 60 + i * 24, tg === 'file' ? 'a' : 'n', true, k);
      });
      if (s.fd3) o += line(200, rowY(3) + 20, 430, 230, 'a', true, 'a3');
      if (s.written) o += tok('hi', 470, 238, 50, 26, 'hi', 'ok');
      return { svg: o, cap };
    };
    return [
      f({}, 'Every process starts with 0, 1, 2 pointing at the terminal. The kernel stores these in the descriptor table.'),
      f({ fd3: 1 }, 'fd = open("log.txt", ...) returns the lowest free number, 3, and points it at the file.'),
      f({ fd3: 1, fd1file: 1 }, 'dup2(fd, 1): entry 1 is repointed at the SAME file. stdout now means log.txt.'),
      f({ fd3: 1, fd1file: 1, written: 1 }, 'printf("hi") writes to descriptor 1, so "hi" lands in the file, not on the screen.'),
      f({ fd1file: 1, written: 1 }, 'close(fd) frees entry 3, but descriptor 1 still reaches the file. This is how shell redirection (> file) works.'),
    ];
  }

  // ── 12. Hard links vs symlinks ─────────────────────────────────
  function links() {
    const f = (s, cap) => {
      let o = t(100, 22, 'directory entries', 's') + t(365, 22, 'inodes', 's') + t(550, 22, 'data', 's');
      const ent = (k, y, name, cls) => box(30, y, 140, 40, cls) + t(46, y + 25, name, 'm b', 'start');
      if (s.a) o += ent('a', 44, 'a.txt', s.cdang ? '' : '');
      if (s.b) o += ent('b', 104, 'b.txt', '');
      if (s.c) o += ent('c', 164, 'c.txt', s.cdang ? 'bad' : '');
      o += box(300, 60, 130, 100, 'a') + t(365, 86, 'inode 77', 'b') + t(365, 110, 'nlink = ' + s.nlink, 'm ' + (s.nlink === 1 && s.b ? 'ok' : '')) + t(365, 134, 'size, perms…', 's');
      o += box(490, 70, 110, 80, 'ok') + t(545, 106, 'file data', 'b') + t(545, 128, 'still here', 's');
      o += line(430, 110, 490, 110, 'ok');
      if (s.a) o += line(170, 64, 300, 90, 'a', true, 'la');
      if (s.b) o += line(170, 124, 300, 120, 'a', true, 'lb');
      if (s.c) {
        o += box(300, 194, 130, 70, s.cdang ? 'bad' : '') + t(365, 220, 'inode 91 (symlink)', 's') + t(365, 246, 'path: "a.txt"', 'm b');
        o += line(170, 184, 300, 224, 'n', true, 'lc');
      }
      if (s.cdang) o += t(365, 286, 'a.txt is gone: dangling', 'b bad');
      return { svg: o, cap };
    };
    return [
      f({ a: 1, nlink: 1 }, 'A file is an inode. The directory entry a.txt just maps the name to inode 77. nlink = 1.'),
      f({ a: 1, b: 1, nlink: 2 }, 'ln a.txt b.txt: a HARD link. A second name for the same inode; nlink = 2.'),
      f({ a: 1, b: 1, c: 1, nlink: 2 }, 'ln -s a.txt c.txt: a SYMLINK. A separate tiny file (inode 91) that stores the path "a.txt".'),
      f({ b: 1, c: 1, nlink: 1, cdang: 1 }, 'rm a.txt: nlink drops to 1, but the data stays because b.txt still names it. The symlink c.txt now points at a path that no longer exists.'),
    ];
  }

  // ── 13. TCP: server and client conversation ────────────────────
  function tcpflow() {
    const SX = 130, CX = 510;
    const f = (n, cap) => {
      let o = box(SX - 70, 8, 140, 30, 'a') + t(SX, 28, 'Server', 'b') + box(CX - 70, 8, 140, 30, 'a') + t(CX, 28, 'Client', 'b');
      o += line(SX, 40, SX, 316, 'n', false) + line(CX, 40, CX, 316, 'n', false);
      const sv = (y, txt, cls = '') => t(SX + 12, y, txt, 'm ' + cls, 'start');
      const cl = (y, txt, cls = '') => t(CX - 12, y, txt, 'm ' + cls, 'end');
      if (n >= 1) o += sv(64, 'socket()') + sv(86, 'bind(:8080)') + sv(108, 'listen()', 'ok');
      if (n >= 2) o += cl(130, 'socket()') + cl(152, 'connect()', 'a');
      if (n >= 3) o += line(CX - 8, 170, SX + 8, 170, 'a') + t(320, 164, 'SYN', 's a') + line(SX + 8, 190, CX - 8, 190, 'a') + t(320, 184, 'SYN-ACK', 's a') + line(CX - 8, 210, SX + 8, 210, 'a') + t(320, 204, 'ACK', 's a');
      if (n >= 4) o += sv(232, 'accept() → fd 4', 'ok');
      if (n >= 5) o += line(CX - 8, 258, SX + 8, 258, 'ok') + t(320, 252, 'write("hello")', 's ok') + sv(280, 'read(4) → "hello"');
      if (n >= 6) o += line(SX + 8, 296, CX - 8, 296, 'ok') + t(400, 290, 'write("hi!")', 's ok') + cl(310, 'read() → "hi!"');
      return { svg: o, cap };
    };
    return [
      f(0, 'Two programs, one TCP conversation. The server must be ready BEFORE the client connects.'),
      f(1, 'Server setup: socket() makes the endpoint, bind() claims port 8080, listen() starts queueing connections.'),
      f(2, 'The client creates its own socket and calls connect().'),
      f(3, 'The kernels run the TCP handshake (SYN, SYN-ACK, ACK). It completes before accept() returns.'),
      f(4, 'accept() returns a NEW descriptor (fd 4) for this client. The listening socket stays open for the next one.'),
      f(5, 'The client writes; the server reads from fd 4.'),
      f(6, 'The server replies on the same connection. Either side can close() when finished.'),
    ];
  }

  // ── 14. Serving many clients ───────────────────────────────────
  function clients() {
    const cli = (hi, waiting) => ['A', 'B', 'C'].map((n, i) => {
      const cls = waiting && i > 0 ? 'bad' : hi === i ? 'ok' : '';
      return box(500, 30 + i * 80, 110, 50, cls) + t(555, 60 + i * 80, 'Client ' + n, 'b');
    }).join('');
    const f = (srv, cap) => ({ svg: cli(srv.hi, srv.waiting) + srv.svg, cap });
    return [
      f({ waiting: 1, hi: 0, svg: box(60, 90, 250, 90, 'a') + t(185, 122, 'One server process', 'b') + t(185, 148, 'serving Client A only', 'm') + line(310, 130, 500, 55, 'ok') + t(185, 212, 'B and C wait:', 's bad') + t(185, 232, 'server is stuck in read() for A', 's bad') },
        'One process, one client at a time. While it blocks in read() for A, B and C cannot even connect.'),
      f({ hi: -1, svg: box(40, 20, 170, 60, 'a') + t(125, 46, 'Parent', 'b') + t(125, 66, 'accept() loop', 'm') +
        [0, 1, 2].map(i => box(280, 30 + i * 80, 130, 50, 'ok') + t(345, 60 + i * 80, 'Child ' + 'ABC'[i], 'b') + line(210, 60, 280, 55 + i * 80, 'n') + line(410, 55 + i * 80, 500, 55 + i * 80, 'ok')).join('') +
        t(125, 120, 'fork() per client', 's') },
        'fork-per-client: the parent keeps accepting and forks a child for each connection. Everyone is served in parallel, at the price of one process each.'),
      f({ hi: 1, svg: box(60, 90, 250, 100, 'a') + t(185, 118, 'ONE process', 'b') + t(185, 144, 'select() watches A, B, C', 'm') + t(185, 170, 'Client B is ready: read it', 'm ok') +
        [0, 1, 2].map(i => line(310, 130 + (i - 1) * 14, 500, 55 + i * 80, i === 1 ? 'ok' : 'n')).join('') },
        'select(): one process watches every descriptor and wakes when any one is ready. No extra processes, no blocking on a single client.'),
    ];
  }

  // ── 15. Buffered I/O: many small writes become one system call ──
  function bufio() {
    const f = (fill, call, o2, cap, kern, calls) => {
      let o = box(20, 50, 160, 100, '') + t(100, 76, 'Your program', 'b') + t(100, 108, call, 'm');
      o += box(230, 30, 190, 150, fill >= 8 ? 'a' : '') + t(325, 54, 'stdio buffer', 'b') + t(325, 74, 'in user space', 's');
      for (let i = 0; i < 8; i++) o += `<rect x="${244 + i * 21}" y="106" width="19" height="34" rx="3" class="vz-box ${i < fill ? 'a' : 'dim'}"/>`;
      o += box(470, 50, 150, 100, kern ? 'ok' : '') + t(545, 76, 'Kernel', 'b') + t(545, 108, kern || 'waiting', 'm ' + (kern ? 'ok' : 's'));
      o += line(180, 100, 230, 100, fill ? 'a' : 'n') + (o2 || '');
      o += t(320, 214, calls, 'm b');
      return { svg: o, cap };
    };
    const flush = line(420, 100, 470, 100, 'a');
    return [
      f(1, 'fputc("a")', '', 'fputc copies the byte into the stdio buffer, in your own memory. No system call yet.', '', 'write() calls so far: 0'),
      f(5, 'fputc x 5', '', 'More bytes pile up in the buffer. Still no system call.', '', 'write() calls so far: 0'),
      f(8, 'fputc ...', flush, 'The buffer is full, so stdio flushes it.', '', 'write() calls so far: 0'),
      f(0, 'buffer empty', '', 'One write() hands the whole buffer to the kernel. A full buffer costs one system call.', '4096 bytes', 'write() calls so far: 1'),
      f(0, 'write(fd,&c,1)', '', 'Unbuffered, the same 4096 bytes would have cost 4096 separate system calls.', '1 byte each', 'unbuffered: 4096 write() calls'),
    ];
  }

  // ── 16. File offsets: separate open vs dup ─────────────────────
  function offsetViz() {
    const fd = (y, n, d = '') => box(20, y, 90, 44, d) + t(65, y + 28, 'fd ' + n, 'm b');
    const ofd = (y, name, off) => box(240, y, 170, 80, 'a') + t(325, y + 26, name, 'b') + t(325, y + 54, 'offset: ' + off, 'm b');
    const file = box(500, 70, 120, 110, '') + t(560, 112, 'data.txt', 'b') + t(560, 136, 'one inode', 's');
    const links = (a, b) => line(250, 50 + 0, 500, 100, 'n', false) + (b ? line(250, 160, 500, 150, 'n', false) : '');
    const base = (extra) => ({ svg: t(65, 24, 'DESCRIPTORS', 's') + t(325, 24, 'OPEN FILE DESCRIPTIONS', 's') + t(560, 24, 'FILE', 's') + file + extra });
    const toFile = y => line(410, y, 500, 125, 'n', false);
    return [
      { svg: base(fd(50, 3, 'a') + ofd(40, 'description #1', 0) + line(110, 72, 240, 72, 'a') + toFile(80)).svg,
        cap: 'open("data.txt") creates an open file description. The offset (0) lives in it, not in the file.' },
      { svg: base(fd(50, 3) + fd(150, 4, 'a') + ofd(40, 'description #1', 0) + ofd(140, 'description #2', 0) + line(110, 72, 240, 72, 'n') + line(110, 172, 240, 172, 'a') + toFile(80) + toFile(180)).svg,
        cap: 'A second open() makes a separate description with its own offset.' },
      { svg: base(fd(50, 3, 'a') + fd(150, 4) + ofd(40, 'description #1', 5) + ofd(140, 'description #2', 0) + line(110, 72, 240, 72, 'a') + line(110, 172, 240, 172, 'n') + toFile(80) + toFile(180)).svg,
        cap: 'read(fd 3, 5 bytes) moves only description #1. fd 4 still reads from byte 0.' },
      { svg: base(fd(50, 3) + fd(100, 5, 'a') + fd(170, 4) + ofd(40, 'description #1', 5) + ofd(140, 'description #2', 0) + line(110, 72, 240, 72, 'n') + line(110, 122, 240, 90, 'a') + line(110, 192, 240, 192, 'n') + toFile(80) + toFile(180)).svg,
        cap: 'dup(3) gives fd 5 the SAME description, so fd 3 and fd 5 now share one offset.' },
      { svg: base(fd(50, 3, 'ok') + fd(100, 5, 'a') + fd(170, 4) + ofd(40, 'description #1', 10) + ofd(140, 'description #2', 0) + line(110, 72, 240, 72, 'n') + line(110, 122, 240, 90, 'a') + line(110, 192, 240, 192, 'n') + toFile(80) + toFile(180)).svg,
        cap: 'read(fd 5, 5 bytes) moved the offset to 10, and fd 3 sees it too. fork shares descriptions the same way.' },
    ];
  }

  // ── 17. epoll: wait on many sockets, handle only the ready ones ─
  function epollViz() {
    const slot = (i, label, sub, cls) => box(14 + i * 124, 28, 112, 66, cls) + t(70 + i * 124, 56, label, 'b') + t(70 + i * 124, 78, sub, 's');
    const ep = (n) => box(14, 130, 612, 46, 'a') + t(320, 159, 'epoll instance watches the fds above', 'm b') + Array.from({ length: n }, (_, i) => line(70 + i * 124, 94, 70 + i * 124, 130, 'n', false)).join('');
    const ret = list => t(320, 214, 'epoll_wait returns: ' + list, 'm b ' + (list === 'nothing (blocked)' ? 's' : 'ok'));
    const f = (states, extra, list, cap) => {
      const names = [['fd 3', 'listening'], ['fd 4', 'client'], ['fd 5', 'client'], ['fd 6', 'client']];
      let o = names.map((n, i) => slot(i, n[0], states[i] === 'ready' ? 'READY' : n[1], states[i] === 'ready' ? 'ok' : '')).join('');
      o += extra || '';
      o += ep(extra ? 5 : 4) + ret(list);
      return { svg: o, cap };
    };
    const newSlot = box(14 + 4 * 124, 28, 112, 66, 'a') + t(70 + 4 * 124, 56, 'fd 7', 'b') + t(70 + 4 * 124, 78, 'new client', 's');
    return [
      f(['', '', '', ''], '', 'nothing (blocked)', 'epoll_wait blocks while no watched descriptor is ready. One thread, many sockets.'),
      f(['', '', 'ready', ''], '', '[ fd 5 ]', 'A client sends data on fd 5. epoll_wait wakes and returns ONLY the ready descriptors.'),
      f(['', '', '', ''], '', 'nothing (blocked)', 'The loop read fd 5 and goes back to epoll_wait. Idle sockets cost nothing.'),
      f(['ready', '', '', ''], '', '[ fd 3 ]', 'A new client connects: the LISTENING socket (fd 3) is ready. Call accept, do not read.'),
      f(['', '', '', ''], newSlot, 'nothing (blocked)', 'accept returned fd 7, and epoll_ctl(ADD) registers it. Now fd 7 is watched too.'),
    ];
  }

  // ── 18. mmap: file mapping vs anonymous mapping ────────────────
  function mmapViz() {
    const disk = (txt, cls) => box(20, 50, 150, 100, cls || '') + t(95, 76, 'data.bin', 'b') + t(95, 98, 'on disk', 's') + t(95, 130, txt, 'm b');
    const region = (txt, cls, label, x = 250) => box(x, 50, 170, 100, cls) + t(x + 85, 76, 'mapped region', 'b') + t(x + 85, 98, label, 's') + t(x + 85, 130, txt, 'm b');
    const child = txt => box(400, 50, 170, 100, 'ok') + t(485, 76, 'child process', 'b') + t(485, 98, 'inherited', 's') + t(485, 130, txt, 'm b');
    return [
      { svg: disk('H i', 'a') + region('H i', 'a', 'backed by the file') + line(170, 100, 250, 100, 'a') + t(210, 84, 'mmap(fd)', 's') + t(320, 200, 'FILE MAPPING (MAP_SHARED)', 's'),
        cap: 'A file mapping starts with the file contents. The region is backed by data.bin.' },
      { svg: disk('X i', 'ok') + region('X i', 'ok', 'p[0] = \'X\'') + line(250, 100, 170, 100, 'ok') + t(320, 200, 'FILE MAPPING (MAP_SHARED)', 's'),
        cap: 'Writing through a shared file mapping changes the file itself.' },
      { svg: region('0 0', 'a', 'no file behind it') + t(335, 28, 'MAP_ANONYMOUS, fd = -1', 's') + t(320, 200, 'ANONYMOUS MAPPING', 's'),
        cap: 'An anonymous mapping has no file. It is fresh memory that starts as zeros.' },
      { svg: region('42', 'ok', '*p = 42 (parent)', 70) + child('42') + line(240, 100, 400, 100, 'ok') + t(320, 200, 'MAP_SHARED | MAP_ANONYMOUS, then fork()', 's'),
        cap: 'Mapped before fork, a shared anonymous region is inherited, so parent and child see the same bytes. Unrelated processes cannot reach it.' },
    ];
  }

  // ── 19. Strict alternation with two semaphores ─────────────────
  function pingpong() {
    const thr = (x, name, line1, cls) => box(x, 60, 190, 100, cls) + t(x + 95, 86, name, 'b') + t(x + 95, 118, line1, 'm');
    const sem = (y, name, n) => box(250, y, 140, 56, n ? 'ok' : '') + t(320, y + 24, name, 'm b') + t(320, y + 46, 'value = ' + n, 'm ' + (n ? 'ok' : 's')) + (n ? ball('sp-' + name, 410, y + 28) : '');
    const f = (a, b, sp, so, out, cap, pc, qc) => ({
      svg: thr(30, 'ping thread', a, pc || '') + thr(420, 'pong thread', b, qc || '') + sem(20, 'sem_ping', sp) + sem(110, 'sem_pong', so) + t(320, 214, out ? 'output: ' + out : 'output:', 'm b'),
      cap });
    return [
      f('sem_wait(sem_ping)', 'sem_wait(sem_pong)', 1, 0, '', 'Start: sem_ping = 1 (ping may go), sem_pong = 0 (pong must wait). Each thread waits on its OWN semaphore.', 'a', ''),
      f('prints "ping"', 'blocked', 0, 0, 'ping', 'ping passes its wait (value 1 to 0) and prints. pong is still blocked on sem_pong = 0.', 'ok', 'bad dim'),
      f('sem_post(sem_pong)', 'wakes up', 0, 1, 'ping', 'ping posts the OTHER semaphore. sem_pong becomes 1, so pong may go.', 'a', 'a'),
      f('sem_wait(sem_ping)', 'prints "pong"', 0, 0, 'ping pong', 'pong passes its wait and prints. ping is now blocked at sem_ping = 0.', 'bad dim', 'ok'),
      f('wakes up', 'sem_post(sem_ping)', 1, 0, 'ping pong', 'pong posts sem_ping (back to 1). The cycle repeats: ping, pong, ping, pong.', 'a', 'a'),
    ];
  }

  // ── 20. Secret key vs public key ───────────────────────────────
  function keysViz() {
    const person = (x, n) => box(x, 50, 110, 60, '') + t(x + 55, 86, n, 'b');
    return [
      { svg: person(30, 'Alice') + person(500, 'Bob') + box(250, 56, 140, 48, 'a') + t(320, 86, 'secret key K', 'm b') + line(140, 80, 250, 80, 'a') + line(390, 80, 500, 80, 'a') + t(320, 160, 'The SAME key K locks and unlocks.', 's') + t(320, 190, 'Fast, but both must hold K safely.', 's'),
        cap: 'Secret-key (symmetric): Alice and Bob use one shared key K for both encrypting and decrypting.' },
      { svg: person(30, 'Alice') + person(500, 'Bob') + box(250, 20, 140, 44, 'ok') + t(320, 48, 'public key', 'm b') + box(500, 130, 110, 44, 'bad') + t(555, 158, 'private key', 'm b') + line(500, 60, 390, 44, 'ok') + t(320, 98, 'Bob publishes his public key', 's') + t(320, 120, 'The private key never leaves Bob.', 's'),
        cap: 'Public-key (asymmetric): Bob publishes a public key for anyone and keeps the private key secret.' },
      { svg: person(30, 'Alice') + person(500, 'Bob') + box(225, 20, 190, 44, 'ok') + t(320, 48, 'Bob\'s public key', 'm b') + box(250, 90, 140, 44, 'a') + t(320, 118, 'ciphertext', 'm b') + line(140, 72, 225, 42, 'ok') + line(140, 90, 250, 112, 'a') + line(390, 112, 500, 90, 'a') + t(320, 170, 'Alice encrypts with the PUBLIC key.', 's'),
        cap: 'Alice encrypts with Bob\'s public key and sends the ciphertext.' },
      { svg: person(30, 'Alice') + person(500, 'Bob') + box(250, 90, 140, 44, 'a') + t(320, 118, 'ciphertext', 'm b') + box(500, 130, 110, 44, 'ok') + t(555, 158, 'private key', 'm b') + line(555, 130, 555, 112, 'ok') + t(555, 40, 'plaintext', 'm ok') + t(320, 170, 'An eavesdropper sees only the', 's') + t(320, 190, 'public key and ciphertext. No luck.', 's'),
        cap: 'Only Bob\'s private key decrypts it. Anyone can encrypt to Bob, but only Bob can read it.' },
    ];
  }

  // ── 21. Hash + digital signature ───────────────────────────────
  function signViz() {
    const doc = (x, y, label, cls) => box(x, y, 110, 70, cls) + t(x + 55, y + 30, 'photo', 'b') + t(x + 55, y + 52, label, 's');
    const hashT = (x, y, h, cls) => box(x, y, 110, 44, cls) + t(x + 55, y + 18, 'hash', 's') + t(x + 55, y + 36, h, 'm b');
    return [
      { svg: doc(40, 40, 'original', 'a') + line(150, 75, 200, 75, 'a') + hashT(200, 53, '9f3a...', 'a') + t(320, 190, 'SIGNER', 's'),
        cap: 'Step 1: hash the photo. Any change to the photo would change this digest completely.' },
      { svg: doc(40, 40, 'original', '') + hashT(200, 53, '9f3a...', '') + line(310, 75, 360, 75, 'a') + box(360, 53, 130, 44, 'a') + t(425, 74, 'sig = Sign(', 'm b') + t(425, 90, 'private key)', 'm b') + t(320, 190, 'SIGNER', 's'),
        cap: 'Step 2: sign the digest with your PRIVATE key. The result is the digital signature.' },
      { svg: doc(40, 40, 'posted', '') + box(200, 53, 130, 44, 'a') + t(265, 80, 'signature', 'm b') + box(360, 53, 130, 44, 'ok') + t(425, 80, 'public key', 'm b') + t(320, 190, 'POSTED TOGETHER', 's'),
        cap: 'Step 3: post the photo, the signature and your public key. Anyone can download all three.' },
      { svg: doc(40, 40, 'as downloaded', '') + hashT(200, 53, '9f3a...', 'a') + box(360, 53, 130, 44, 'ok') + t(425, 74, 'check sig with', 's') + t(425, 90, 'public key', 'm b') + line(310, 75, 360, 75, 'ok') + t(545, 82, 'VALID', 'm b ok') + t(320, 190, 'VERIFIER', 's'),
        cap: 'Verifier: recompute the hash (same 9f3a...) and check the signature with your public key. It matches, so the photo is untouched.' },
      { svg: doc(40, 40, 'edited!', 'bad') + hashT(200, 53, '71c0...', 'bad') + box(360, 53, 130, 44, 'ok') + t(425, 74, 'check sig with', 's') + t(425, 90, 'public key', 'm b') + line(310, 75, 360, 75, 'b') + t(545, 82, 'REJECTED', 'm b bad') + t(320, 190, 'VERIFIER', 's'),
        cap: 'If someone edits the photo, its hash becomes 71c0... which no longer matches the signature. Nobody else can forge a new one without your private key.' },
    ];
  }


  // ── OS stack: applications, kernel, hardware ───────────────────
  function osstack() {
    const layer = (y, name, sub, cls) => box(170, y, 300, 56, cls) + t(320, y + 26, name, 'b') + t(320, y + 46, sub, 's');
    const base = (a, k, h) => layer(20, 'Applications', 'user mode', a) + layer(100, 'Kernel', 'kernel mode', k) + layer(180, 'Hardware', 'CPU, memory, I/O devices', h);
    return [
      { svg: base('', '', ''), cap: 'Three layers: applications on top, the kernel in the middle, the hardware at the bottom.' },
      { svg: base('a', '', '') + line(320, 76, 320, 100, 'a') + t(470, 94, 'syscall: write()', 'm a', 'start'), cap: 'An application cannot touch the hardware. It asks the kernel through a system call.' },
      { svg: base('', 'a', 'a') + line(320, 156, 320, 180, 'a') + t(470, 174, 'device driver', 'm a', 'start'), cap: 'The kernel runs in kernel mode with full access. It mediates access and talks to the hardware.' },
      { svg: base('ok', '', '') + line(320, 100, 320, 76, 'ok') + t(470, 94, 'result returned', 'm ok', 'start'), cap: 'The result comes back to the application. Many apps share the hardware safely because the kernel is in between.' },
    ];
  }

  // ── Signals: a child taps its parent on the shoulder ───────────
  function signalsViz() {
    const parent = (lines, cls) => box(20, 30, 230, 130, cls) + t(135, 56, 'Parent process', 'b') + lines.map((l, i) => t(135, 86 + i * 24, l[0], 'm ' + (l[1] || ''))).join('');
    const child = (lines, cls) => box(390, 30, 230, 130, cls) + t(505, 56, 'Child process', 'b') + lines.map((l, i) => t(505, 86 + i * 24, l[0], 'm ' + (l[1] || ''))).join('');
    const kern = cls => box(270, 190, 100, 44, cls) + t(320, 218, 'kernel', 'b');
    return [
      { svg: parent([['sigaction(SIGINT,', 'a'], ['  handler)', 'a'], ['loop: sleep(1)', '']], 'a') + child([['searching for', 's'], ['the golden ticket', 's']], '') + kern(''),
        cap: 'The parent registers a handler for SIGINT with sigaction(), then loops with sleep().' },
      { svg: parent([['loop: sleep(1)', '']], '') + child([['found it!', 'ok'], ['kill(getppid(),', 'a'], ['  SIGINT)', 'a']], 'ok') + kern('a') + line(505, 160, 370, 205, 'a'),
        cap: 'The child found the ticket, so it sends SIGINT to its parent with kill(getppid(), SIGINT).' },
      { svg: parent([['handler runs:', 'ok'], ['write("Found it!")', 'ok']], 'ok') + child([['(keeps working)', 's']], '') + kern('a') + line(270, 205, 135, 160, 'a'),
        cap: 'The kernel delivers the signal. The parent pauses its loop at once and runs the handler (using write, which is signal safe).' },
      { svg: parent([['back in the loop:', ''], ['sleep(1)', '']], 'a') + child([['(keeps working)', 's']], '') + kern(''),
        cap: 'When the handler returns, the parent resumes where it left off. The signal arrived asynchronously: the parent never asked for it.' },
    ];
  }


  // ── CPU scheduling Gantt charts ────────────────────────────────
  function schedViz() {
    const X0 = 30, U = 35;
    const cls = { P1: 'a', P2: 'ok', P3: '', P4: 'a' };
    const gantt = (segs, title, avg) => {
      let o = t(320, 24, title, 'b');
      segs.forEach(([p, a, b]) => { o += box(X0 + a * U, 60, (b - a) * U, 44, cls[p], 4) + t(X0 + (a + b) / 2 * U, 88, p, 'b'); });
      for (let i = 0; i <= 16; i += 2) o += t(X0 + i * U, 128, String(i), 's');
      o += t(320, 170, avg, 'm b');
      return o;
    };
    const procs = t(320, 24, 'Processes (run time, arrival)', 'b') + [['P1', 7, 0], ['P2', 4, 2], ['P3', 1, 4], ['P4', 4, 5]].map((p, i) => box(40 + i * 150, 50, 130, 60, cls[p[0]]) + t(105 + i * 150, 76, p[0], 'b') + t(105 + i * 150, 98, p[1] + ' ms, arrives ' + p[2], 's')).join('');
    return [
      { svg: procs + t(320, 160, 'Four processes: P1 7, P2 4, P3 1, P4 4', 's'), cap: 'Four processes with run times 7, 4, 1, 4 and arrival times 0, 2, 4, 5. We draw each algorithm\'s schedule and compute waiting times.' },
      { svg: gantt([['P1', 0, 7], ['P2', 7, 11], ['P3', 11, 12], ['P4', 12, 16]], 'FCFS (non-preemptive)', 'waits 0 + 5 + 7 + 7 = 19, average 4.75'), cap: 'FCFS: run in arrival order. P2 arrived at 2 but starts at 7, so it waits 5.' },
      { svg: gantt([['P1', 0, 7], ['P3', 7, 8], ['P2', 8, 12], ['P4', 12, 16]], 'SJF (non-preemptive)', 'waits 0 + 6 + 3 + 7 = 16, average 4'), cap: 'SJF: when P1 finishes at 7, the shortest ready job (P3, 1 ms) goes next.' },
      { svg: gantt([['P1', 0, 2], ['P2', 2, 4], ['P3', 4, 5], ['P2', 5, 7], ['P4', 7, 11], ['P1', 11, 16]], 'SRTF (preemptive)', 'total wait 12, average 3'), cap: 'SRTF: each new arrival with less time remaining preempts the running job. P1 is interrupted twice.' },
      { svg: gantt([['P1', 0, 3], ['P2', 3, 6], ['P1', 6, 9], ['P3', 9, 10], ['P4', 10, 13], ['P2', 13, 14], ['P1', 14, 15], ['P4', 15, 16]], 'Round Robin (quantum 3)', 'total wait 28, average 7'), cap: 'Round Robin: every 3 ms the running process goes to the back of the queue. Fair, but more switching and a higher average wait here.' },
    ];
  }

  // ── Heap allocator with an in-place free list ──────────────────
  function freelistViz() {
    const X = a => 30 + a * 2.2656;
    const blk = (a, b, label, cls) => box(X(a), 60, X(b) - X(a), 56, cls, 4) + t((X(a) + X(b)) / 2, 84, label, 'b') + t((X(a) + X(b)) / 2, 104, (b - a) + ' B', 's');
    const addr = [0, 116, 182, 256].map(a => t(X(a), 140, String(a), 's')).join('');
    const f = (blocks, list, cap) => ({ svg: t(320, 30, 'Heap: 256 bytes (16-byte headers)', 'b') + blocks + addr + t(320, 180, list, 'm b'), cap });
    return [
      f(blk(0, 256, 'Free', 'ok'), 'free list: head → [0: 256]', 'The whole 256-byte heap is one free block. Its header (size, next) lives inside it.'),
      f(blk(0, 116, 'Used', 'a') + blk(116, 256, 'Free', 'ok'), 'free list: head → [116: 140]', 'malloc(100): 100 + 16 header = 116 bytes are split off. The leftover 140 bytes is the new free block.'),
      f(blk(0, 116, 'Used', 'a') + blk(116, 182, 'Used', 'a') + blk(182, 256, 'Free', 'ok'), 'free list: head → [182: 74]', 'malloc(50): 50 + 16 = 66 more bytes split off. 74 bytes stay free.'),
      f(blk(0, 116, 'Free', 'ok') + blk(116, 182, 'Used', 'a') + blk(182, 256, 'Free', 'ok'), 'free list: head → [0: 116] → [182: 74]', 'free() on the first block inserts it at the head of the free list. Free space is now split into two pieces: external fragmentation.'),
      f(blk(0, 116, 'Free', 'ok') + blk(116, 182, 'Free', 'ok') + blk(182, 256, 'Free', 'ok'), 'free list: [116: 66] → [0: 116] → [182: 74]', 'The second free() puts [116: 66] at the head. Three free blocks sit side by side.'),
      f(blk(0, 256, 'Free', 'ok'), 'free list: head → [0: 256]', 'Coalescing merges the consecutive free blocks into one 256-byte block again.'),
    ];
  }

  // ── Paging: translating a virtual address ──────────────────────
  function pagingViz() {
    const addr = (x, y, a, b, la, lb, c1, c2) => box(x, y, 90, 50, c1) + t(x + 45, y + 32, a, 'm b') + box(x + 90, y, 150, 50, c2) + t(x + 165, y + 32, b, 'm b') + t(x + 45, y + 70, la, 's') + t(x + 165, y + 70, lb, 's');
    const table = hi => t(500, 24, 'Page table', 'b') + [['00', '01'], ['01', '11'], ['10', '00'], ['11', '10']].map((r, i) => box(420, 36 + i * 36, 160, 32, hi === r[0] ? 'a' : '', 4) + t(450, 58 + i * 36, 'page ' + r[0], 'm') + t(540, 58 + i * 36, 'frame ' + r[1], 'm')).join('');
    return [
      { svg: t(135, 24, 'Virtual address', 'b') + addr(15, 40, '10', '1011', 'page number', 'offset', 'a', '') + table(''), cap: 'A 6-bit virtual address with 16-byte pages: 2 bits of page number and 4 bits of offset. 101011 is page 10, offset 1011.' },
      { svg: t(135, 24, 'Virtual address', 'b') + addr(15, 40, '10', '1011', 'page number', 'offset', 'a', '') + table('10') + line(105, 92, 420, 126, 'a'), cap: 'Step 1: look up page number 10 in the process\'s page table. It maps to page frame 00.' },
      { svg: t(135, 24, 'Virtual address', 'b') + addr(15, 40, '10', '1011', 'page number', 'offset', '', '') + table('10') + t(135, 158, 'page 10 → frame 00, offset copied', 's') + t(135, 196, 'Physical address', 'b') + addr(15, 206, '00', '1011', 'frame number', 'offset', 'ok', 'ok'), cap: 'Step 2: the frame number (00) replaces the page number, and the offset (1011) is unchanged. Physical address: 001011.' },
    ];
  }


  const DEFS = {
    memory:    { title: 'Stack, heap and pointers',                vb: '0 0 640 270', frames: memory },
    ptrarith:  { title: 'Pointer arithmetic steps by element size', vb: '0 0 640 230', frames: ptrarith },
    fork:      { title: 'fork(), wait() and zombies',               vb: '0 44 640 166', frames: forkViz },
    race:      { title: 'Race condition: a lost update',            vb: '0 0 640 290', frames: race },
    mutex:     { title: 'A mutex serializes the critical section',  vb: '0 0 640 270', frames: mutex },
    deadlock:  { title: 'Deadlock: a cycle of waiting',             vb: '0 0 640 260', frames: deadlock },
    semaphore: { title: 'Semaphores: producer and consumer',        vb: '0 0 640 270', frames: semaphore },
    condvar:   { title: 'Condition variable: wait, signal, wake',   vb: '0 0 640 260', frames: condvar },
    fdtable:   { title: 'File descriptors and dup2',                vb: '0 0 640 285', frames: fdtable },
    links:     { title: 'Hard links vs symbolic links',             vb: '0 0 640 300', frames: links },
    tcpflow:   { title: 'A TCP conversation',                       vb: '0 0 640 326', frames: tcpflow },
    clients:   { title: 'Serving many clients',                     vb: '0 0 640 260', frames: clients },
    pipe:      { title: 'A pipe between parent and child',          vb: '0 0 640 260', frames: pipe },
    shm:       { title: 'Shared memory between two processes',      vb: '0 0 640 260', frames: shm },
    sched:     { title: 'CPU scheduling: the same four processes',     vb: '0 0 640 190', frames: schedViz },
    freelist:  { title: 'A heap allocator and its free list',          vb: '0 0 640 200', frames: freelistViz },
    paging:    { title: 'Paging: virtual to physical address',         vb: '0 0 640 300', frames: pagingViz },
    osstack:   { title: 'The OS stack and a system call',              vb: '0 0 640 250', frames: osstack },
    signals:   { title: 'A signal from child to parent',               vb: '0 0 640 250', frames: signalsViz },
    bufio:     { title: 'Buffered I/O: many writes, one system call', vb: '0 0 640 240', frames: bufio },
    offset:    { title: 'File offsets: separate open vs dup',        vb: '0 0 640 250', frames: offsetViz },
    epoll:     { title: 'epoll: only the ready descriptors',         vb: '0 0 640 240', frames: epollViz },
    mmap:      { title: 'mmap: file mapping vs anonymous mapping',   vb: '0 0 640 220', frames: mmapViz },
    pingpong:  { title: 'Ping-pong with two semaphores',             vb: '0 0 640 240', frames: pingpong },
    keys:      { title: 'Secret key vs public key',                  vb: '0 0 640 210', frames: keysViz },
    sign:      { title: 'Hash and digital signature',                vb: '0 0 640 210', frames: signViz },
  };

  // ── Morphing renderer ──────────────────────────────────────────
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TWEEN = { rect: ['x', 'y', 'width', 'height'], text: ['x', 'y'], line: ['x1', 'y1', 'x2', 'y2'], circle: ['cx', 'cy', 'r'] };

  function parse(svgStr) {
    const doc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + svgStr + '</svg>', 'image/svg+xml');
    return [...doc.documentElement.children];
  }

  function tween(old, nn) {
    const props = TWEEN[old.tagName] || [];
    const from = {}, to = {};
    props.forEach(a => { from[a] = parseFloat(old.getAttribute(a)); to[a] = parseFloat(nn.getAttribute(a)); });
    [...nn.attributes].forEach(at => { if (!props.includes(at.name)) old.setAttribute(at.name, at.value); });
    if (old.tagName === 'text' && old.textContent !== nn.textContent) old.textContent = nn.textContent;
    if (old._raf) cancelAnimationFrame(old._raf);
    if (reduced()) { props.forEach(a => old.setAttribute(a, to[a])); return; }
    const t0 = performance.now(), D = 520;
    const step = now => {
      const p = Math.min(1, (now - t0) / D), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      props.forEach(a => { if (!isNaN(from[a]) && !isNaN(to[a])) old.setAttribute(a, from[a] + (to[a] - from[a]) * e); });
      if (p < 1) old._raf = requestAnimationFrame(step); else old._raf = null;
    };
    old._raf = requestAnimationFrame(step);
  }

  function morph(g, svgStr, instant) {
    const nodes = parse(svgStr);
    if (instant) { g.replaceChildren(...nodes.map(n => document.importNode(n, true))); return; }
    const cur = [...g.children].filter(n => !n.classList.contains('vz-out'));
    const used = new Set(), keyed = new Map();
    cur.forEach(n => { const k = n.getAttribute('data-k'); if (k) keyed.set(k, n); });
    const next = [];
    nodes.forEach(nn => {
      const k = nn.getAttribute('data-k');
      if (k && keyed.has(k)) { const o = keyed.get(k); used.add(o); tween(o, nn); next.push(o); return; }
      const sig = nn.outerHTML;
      const same = !k && cur.find(o => !used.has(o) && !o.getAttribute('data-k') && o.outerHTML === sig);
      if (same) { used.add(same); next.push(same); return; }
      const el = document.importNode(nn, true);
      el.classList.add('vz-in');
      next.push(el);
    });
    cur.forEach(o => { if (!used.has(o)) { o.classList.add('vz-out'); setTimeout(() => o.remove(), 280); } });
    next.forEach(el => { if (el.parentNode !== g || el !== g.lastElementChild) g.appendChild(el); });
  }

  function mount(el, name) {
    const def = DEFS[name];
    if (!def) return;
    const frames = def.frames();
    let i = 0, timer = null;
    el.innerHTML = `<div class="viz">
      <div class="viz-title">${def.title}</div>
      <button class="btn btn-secondary btn-sm viz-expand" data-a="expand">Full screen</button>
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
    const draw = instant => {
      morph(g, frames[i].svg, instant);
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
        if (i >= frames.length - 1) { i = 0; draw(); }
        play.textContent = 'Pause';
        timer = setInterval(() => {
          if (!el.isConnected) { clearInterval(timer); return; }
          i++; draw();
        }, 2400);
      }
    });
    el.querySelector('.viz-expand').addEventListener('click', () => {
      const viz = el.querySelector('.viz');
      const ov = document.createElement('div');
      ov.className = 'viz-full';
      ov.innerHTML = '<button class="btn btn-secondary btn-sm viz-full-close">Close</button>';
      const close = () => { el.appendChild(viz); ov.remove(); window.removeEventListener('keydown', onKey); };
      const onKey = e => { if (e.key === 'Escape') close(); };
      ov.querySelector('button').addEventListener('click', close);
      window.addEventListener('keydown', onKey);
      ov.appendChild(viz);
      document.body.appendChild(ov);
    });
    draw(true);
  }

  function mountAll(root) {
    (root || document).querySelectorAll('[data-viz]').forEach(el => { if (!el.dataset.mounted) { el.dataset.mounted = 1; mount(el, el.dataset.viz); } });
  }

  return { mount, mountAll, names: Object.keys(DEFS), DEFS };
})();
