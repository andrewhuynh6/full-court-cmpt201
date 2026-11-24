// FULL COURT — Lessons as short steps. One idea per step, then a quick check.
// Step: { title, html, viz?, check: { q, code?, opts[4], ans, exp, hint? } }

const H_esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const codeBlock = s => `<div class="code-block">${H_esc(s.replace(/^\n/, '').replace(/\n$/, ''))}</div>`;
const tipBox = s => `<div class="tip-box">{{i:lightbulb}}${s}</div>`;
const warnBox = s => `<div class="tip-box">{{i:triangle-alert}}${s}</div>`;

const LESSON_STEPS = {

// ── Chapter 1: C fundamentals ───────────────────────────────────────
l1_1: [
  { title: 'A pointer stores an address',
    html: `<p>Every variable lives at an address in memory. A <strong>pointer</strong> is a variable whose value is one of those addresses.</p>`
      + codeBlock(`int x = 42;
int *p = &x;   // p holds the address of x`),
    viz: 'memory',
    check: { q: 'After <code>int *p = &amp;x;</code>, what value is stored inside p?', opts: ['The address where x lives', 'The number 42, copied from x', 'The size of x in bytes', 'A second variable named x'], ans: 0,
      exp: 'A pointer holds an address. Following it (*p) gets you to the value 42.' } },
  { title: '&amp; and * are opposites',
    html: `<p><code>&amp;x</code> means "address of x". <code>*p</code> means "the thing p points to". Writing through <code>*p</code> changes the original variable.</p>`,
    check: { q: 'What does this program print?', code: H_esc(`int x = 5;
int *p = &x;
*p = 9;
printf("%d\\n", x);`), opts: ['9', '5', 'The address of x', 'Nothing: compile error'], ans: 0,
      exp: '*p = 9 writes through the pointer, so x itself becomes 9.' } },
  { title: 'The pointer type sets the step size',
    html: `<p><code>p + 1</code> moves forward by <code>sizeof(*p)</code> bytes, not by one byte. An <code>int *</code> jumps 4 bytes; a <code>char *</code> jumps 1.</p>`
      + codeBlock(`int a[3] = {10, 20, 30};
int *p = a;    // an array name decays to &a[0]
p++;           // now points at a[1]`),
    check: { q: 'After the code above, what does <code>printf("%d", *p)</code> print?', opts: ['20', '10', '30', '4'], ans: 0,
      exp: 'p++ advanced one int (4 bytes) from a[0] to a[1], which holds 20.' } },
  { title: 'Arrays are pointer math',
    html: `<p>The compiler rewrites <code>a[i]</code> as <code>*(a + i)</code>. Both forms reach the same element, and a pointer can be indexed like an array.</p>`,
    check: { q: 'What does this print?', code: H_esc(`int a[4] = {5, 6, 7, 8};
int *p = a + 2;
printf("%d %d\\n", *p, p[1]);`), opts: ['7 8', '6 7', '7 7', '8 8'], ans: 0,
      exp: 'p points at a[2] (7). p[1] is *(p + 1) = a[3] = 8.' } },
  { title: 'Pointers to pointers and to functions',
    html: `<p><code>char **argv</code> is a pointer to a <code>char *</code>: an array of strings. A function also has an address, so you can store it and call it later.</p>`
      + codeBlock(`int add(int a, int b) { return a + b; }
int (*op)(int, int) = add;
printf("%d\\n", op(2, 3));   // 5`),
    check: { q: 'What is <code>op</code> in <code>int (*op)(int, int)</code>?', opts: ['A pointer to a function taking two ints', 'A function that returns a pointer to int', 'An array holding two int pointers', 'A pointer to a pair of integers'], ans: 0,
      exp: 'The parentheses around *op make it a pointer; the rest says "to a function (int, int) returning int".' } },
],

l1_2: [
  { title: 'Stack vs heap',
    html: `<p>The <strong>stack</strong> holds local variables and vanishes when a function returns. The <strong>heap</strong> holds memory you ask for with <code>malloc</code>, and it stays until you <code>free</code> it.</p>`,
    viz: 'memory',
    check: { q: 'Where does memory returned by <code>malloc()</code> live?', opts: ['On the heap, until you free it', 'On the stack, until the function returns', 'In the code section of the program', 'Inside a CPU register'], ans: 0,
      exp: 'malloc hands out heap memory. Only free() (or the process ending) returns it.' } },
  { title: 'The four heap functions',
    html: `<ul><li><code>malloc(n)</code> reserves n bytes, uninitialized.</li><li><code>calloc(count, size)</code> reserves and zeroes.</li><li><code>realloc(p, n)</code> resizes, and may move the block.</li><li><code>free(p)</code> gives it back.</li></ul>`
      + codeBlock(`int *a = malloc(5 * sizeof(int));
if (a == NULL) { perror("malloc"); exit(1); }
a = realloc(a, 10 * sizeof(int));   // may move!
free(a);`),
    check: { q: 'Which call returns memory that is already set to zero?', opts: ['calloc', 'malloc', 'realloc', 'free'], ans: 0,
      exp: 'calloc zero-fills. malloc leaves whatever bytes were there.' } },
  { title: 'malloc counts bytes, not elements',
    html: `<p>The argument is a number of <strong>bytes</strong>. Always multiply by the element size, and check for <code>NULL</code> because allocation can fail.</p>`,
    check: { q: 'On a machine where int is 4 bytes, how many ints fit in this block?', code: H_esc(`int *a = malloc(10);`), opts: ['2', '10', '40', '0'], ans: 0,
      exp: '10 bytes holds only 2 whole ints (8 bytes). You wanted malloc(10 * sizeof(int)).' } },
  { title: 'Three classic heap bugs',
    html: `<ul><li><strong>Leak:</strong> allocate, never free.</li><li><strong>Use after free:</strong> touch memory you already returned.</li><li><strong>Double free:</strong> free the same block twice (often crashes).</li></ul>`
      + tipBox(`Set a pointer to <code>NULL</code> right after freeing it. <code>free(NULL)</code> is safe, and a NULL dereference fails loudly.`),
    check: { q: 'Which bug is in this code?', code: H_esc(`char *s = malloc(8);
free(s);
s[0] = 'x';`), opts: ['Use after free', 'Memory leak', 'Buffer overflow', 'Double free'], ans: 0,
      exp: 'The block was already returned, so writing s[0] touches memory that is no longer yours.' } },
  { title: 'Catch them with Valgrind',
    html: `<p>Compile with <code>-g</code>, then run under Valgrind. It reports leaks, invalid reads and writes, and double frees, with line numbers.</p>`
      + codeBlock(`gcc -g prog.c -o prog
valgrind --leak-check=full ./prog
# "definitely lost: 40 bytes in 1 blocks"`),
    check: { q: 'Valgrind says "40 bytes definitely lost". What does that mean?', opts: ['40 bytes were allocated and never freed', '40 bytes were freed two separate times', '40 bytes were read before being written', '40 bytes overflowed past the stack end'], ans: 0,
      exp: 'Definitely lost = no pointer to the block remains and it was never freed: a leak.' } },
],

// ── Chapter 2: Processes and threads ────────────────────────────────
l2_1: [
  { title: 'A process is a running program',
    html: `<p>Each process has its own virtual address space, PID, open file table and signal handlers. The OS keeps processes isolated from each other.</p>`,
    check: { q: 'Why can one crashing process not overwrite another process\'s variables?', opts: ['Each has its own virtual address space', 'The OS restarts any process that crashes', 'All processes share one protected heap', 'Processes are not allowed to use pointers'], ans: 0,
      exp: 'Virtual memory gives every process a private view of memory, so addresses in one mean nothing in another.' } },
  { title: 'fork() returns twice',
    html: `<p><code>fork()</code> clones the calling process. Both copies continue from the same line, and the return value tells them apart.</p>`
      + codeBlock(`pid_t pid = fork();
if (pid == 0)      { /* child  */ }
else if (pid > 0)  { /* parent: pid = child's PID */ }
else               { perror("fork"); }`),
    viz: 'fork',
    check: { q: 'What does <code>fork()</code> return inside the child?', opts: ['0', 'The child\'s own PID', 'The parent\'s PID', '-1'], ans: 0,
      exp: 'The child sees 0, the parent sees the child\'s PID, and -1 means fork failed.' } },
  { title: 'Count the processes',
    html: `<p>Every <code>fork()</code> doubles the number of processes that reach the next line, because the child also continues.</p>`,
    check: { q: 'How many times is "hi" printed?', code: H_esc(`fork();
fork();
printf("hi\\n");`), opts: ['4', '2', '3', '1'], ans: 0,
      exp: 'The first fork makes 2 processes; each runs the second fork, making 4. All 4 print.' } },
  { title: 'exec() replaces the program',
    html: `<p><code>exec</code> loads a new program into the current process. The PID stays; the code, data and stack are replaced. The usual recipe is <code>fork</code> then <code>exec</code> in the child.</p>`
      + codeBlock(`char *args[] = {"/bin/ls", "-l", NULL};
execv("/bin/ls", args);
perror("execv");   // only reached if exec FAILED
exit(1);`),
    check: { q: 'When does the line after a successful <code>execv()</code> run?', opts: ['Never; the old program image is gone', 'After the new program finishes running', 'In a new child process', 'Only if the new program crashes'], ans: 0,
      exp: 'A successful exec never returns. Code after it runs only when exec itself failed.' } },
  { title: 'wait() prevents zombies',
    html: `<p>A finished child stays in the process table as a <strong>zombie</strong> until the parent calls <code>wait()</code>/<code>waitpid()</code> to read its exit status. If the parent dies first, the child is an <strong>orphan</strong> and init (PID 1) adopts it.</p>`,
    check: { q: 'A child exits, but its parent never calls wait(). The child is now a…', opts: ['Zombie', 'Orphan', 'Daemon', 'Thread'], ans: 0,
      exp: 'Zombie = exited but not yet reaped. An orphan is a child whose parent exited first.' } },
],

l2_2: [
  { title: 'Threads share, processes do not',
    html: `<p>A thread is a separate flow of execution <em>inside</em> a process. Threads share the heap, globals and open files, so talking is easy. Each thread has its own <strong>stack</strong> and registers.</p>`,
    check: { q: 'Which of these is private to each thread?', opts: ['Its stack', 'The heap', 'Global variables', 'Open file descriptors'], ans: 0,
      exp: 'Local variables live on the thread\'s own stack. The heap, globals and file descriptors are shared.' } },
  { title: 'Create and join',
    html: `<p><code>pthread_create</code> starts a thread running a function. <code>pthread_join</code> waits for it to finish. Compile with <code>-pthread</code>.</p>`
      + codeBlock(`void *work(void *arg) {
    printf("hello from a thread\\n");
    return NULL;
}
pthread_t t;
pthread_create(&t, NULL, work, NULL);
pthread_join(t, NULL);   // wait for it`),
    check: { q: 'What does <code>pthread_join(t, NULL)</code> do?', opts: ['Blocks until thread t has finished', 'Starts thread t running right now', 'Cancels thread t as soon as possible', 'Detaches t from the process for good'], ans: 0,
      exp: 'join is the thread version of wait(): the caller sleeps until t returns.' } },
  { title: 'Careful with arguments',
    html: `<p>The new thread receives a <em>pointer</em>. If you pass the address of a loop variable, the loop may change it before the thread reads it.</p>`,
    check: { q: 'What is wrong with this loop?', code: H_esc(`for (int i = 0; i < 3; i++)
    pthread_create(&t[i], NULL, work, &i);`), opts: ['Threads may all read the same, changing i', 'pthread_create cannot accept pointers', 'The int i will not compile as an argument', 'Threads cannot read the main stack at all'], ans: 0,
      exp: 'All threads get the address of the same i. Pass a separate value per thread, for example ids[i].' } },
  { title: 'The race condition',
    html: `<p>When threads update shared data without coordination, the result depends on timing. Even <code>counter++</code> is three CPU steps: load, add, store.</p>`,
    viz: 'race',
    check: { q: 'counter starts at 0 and two threads each run <code>counter++</code> once. Why might the result be 1?', opts: ['Load, add, store can interleave and lose an update', 'counter++ is atomic but reaches memory slowly', 'The compiler deletes one of the two increments', 'Threads have separate copies and one is dropped'], ans: 0,
      exp: 'Both threads can load 0 before either stores, so both store 1. The fix is a mutex.' } },
],

l2_3: [
  { title: 'A mutex is a lock',
    html: `<p>A <strong>mutex</strong> (mutual exclusion) lets only one thread into a critical section at a time. Others calling <code>lock</code> sleep until it is released.</p>`,
    viz: 'mutex',
    check: { q: 'Thread B calls <code>lock()</code> while thread A holds the mutex. What happens?', opts: ['B sleeps until A unlocks', 'B skips the critical section', 'B steals the lock from A', 'B gets an error and exits'], ans: 0,
      exp: 'lock() blocks. When A unlocks, one waiting thread wakes and takes the lock.' } },
  { title: 'Protect the shared data',
    html: `<p>Wrap every access to the shared variable in lock/unlock, using the same mutex everywhere.</p>`
      + codeBlock(`pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;

pthread_mutex_lock(&m);
counter++;                 // critical section
pthread_mutex_unlock(&m);`),
    check: { q: 'What bug does this function have?', code: H_esc(`pthread_mutex_lock(&m);
if (x > 0)
    return;            // early exit
x--;
pthread_mutex_unlock(&m);`), opts: ['It returns while still holding the lock', 'It unlocks a mutex it never locked', 'It locks the same mutex twice', 'x-- is not allowed inside a lock'], ans: 0,
      exp: 'The early return skips unlock, so every other thread blocks forever. Unlock on every path.' } },
  { title: 'Keep critical sections short',
    html: `<p>While you hold the lock, everyone else who needs it waits. Do only the shared-data update inside; do slow work (I/O, sleeping) outside.</p>`,
    check: { q: 'A thread calls <code>sleep(5)</code> while holding a mutex. What is the effect?', opts: ['Other threads needing it wait 5 seconds', 'The mutex unlocks itself while sleeping', 'Only lower-priority threads have to wait', 'Nothing, because sleeping releases locks'], ans: 0,
      exp: 'Sleeping does not release a mutex. Everyone else stays blocked for the whole nap.' } },
  { title: 'Deadlock',
    html: `<p>Deadlock happens when threads wait on each other in a cycle. Each holds a lock the other needs, so nobody ever proceeds.</p>`,
    viz: 'deadlock',
    check: { q: 'Thread 1 holds M1 and wants M2. Thread 2 holds M2 and wants M1. This is a…', opts: ['Deadlock', 'Race condition', 'Spurious wakeup', 'Zombie'], ans: 0,
      exp: 'A cycle of threads each waiting on the next is the signature of deadlock.' } },
  { title: 'Prevent it: lock ordering',
    html: `<p>Pick a global order for locks and always acquire them in that order. A cycle becomes impossible. <code>pthread_mutex_trylock</code> offers another way out: it returns immediately instead of blocking.</p>`
      + codeBlock(`// Every thread, everywhere:
pthread_mutex_lock(&m1);
pthread_mutex_lock(&m2);
/* ... */
pthread_mutex_unlock(&m2);
pthread_mutex_unlock(&m1);`),
    check: { q: 'Which rule prevents the M1/M2 deadlock?', opts: ['Every thread locks M1 before M2', 'Every thread uses its own private mutex', 'Threads lock whichever mutex is free first', 'Add a sleep() between the two locks'], ans: 0,
      exp: 'With one agreed order, no thread can hold M2 while waiting for M1, so no cycle can form.' } },
],

l2_4: [
  { title: 'A semaphore is a counter',
    html: `<p>A semaphore holds a non-negative number. <code>sem_wait</code> decrements it, sleeping if it is 0. <code>sem_post</code> increments it and wakes a sleeper. Initialize with <code>sem_init(&amp;s, 0, n)</code>.</p>`,
    check: { q: 'A semaphore is 0. A thread calls <code>sem_wait()</code>. What happens?', opts: ['It blocks until another thread posts', 'It returns -1 at once with an error', 'The value becomes -1 and it continues', 'It resets the semaphore to 1 and goes on'], ans: 0,
      exp: 'At 0 there is nothing to take, so the caller sleeps until a post makes the count positive.' } },
  { title: 'Producer and consumer',
    html: `<p>A bounded buffer needs two counters: <code>empty</code> (free slots, starts at N) and <code>full</code> (filled slots, starts at 0). The producer waits on <code>empty</code>; the consumer waits on <code>full</code>.</p>`,
    viz: 'semaphore',
    check: { q: 'Which semaphore does a producer wait on before adding an item?', opts: ['empty (free slots)', 'full (filled slots)', 'Only the mutex', 'No semaphore at all'], ans: 0,
      exp: 'The producer needs a free slot, so it waits on empty. Then it posts full for the consumer.' } },
  { title: 'Why a mutex as well?',
    html: `<p>Semaphores count slots, but they do not protect the buffer\'s index variables. Several producers could update them at once, so you lock around the actual insert.</p>`
      + codeBlock(`sem_wait(&empty);          // wait for a free slot
pthread_mutex_lock(&m);
buf[in] = item; in = (in + 1) % N;
pthread_mutex_unlock(&m);
sem_post(&full);           // announce a new item`),
    check: { q: 'Why is a mutex needed on top of the two semaphores?', opts: ['Two producers could corrupt the index', 'Semaphores cannot count higher than one', 'Semaphores only work between processes', 'A mutex makes sem_post run faster'], ans: 0,
      exp: 'The semaphores only count; the shared index and buffer still need mutual exclusion.' } },
  { title: 'Condition variables',
    html: `<p>A condition variable lets a thread sleep until some condition on shared data becomes true. <code>pthread_cond_wait</code> releases the mutex while sleeping and re-takes it on wake-up. Always re-test in a <code>while</code> loop.</p>`
      + codeBlock(`pthread_mutex_lock(&m);
while (!ready)                    // while, not if
    pthread_cond_wait(&cv, &m);
/* ready is true here */
pthread_mutex_unlock(&m);`),
    check: { q: 'Why test the condition in a <code>while</code> loop rather than an <code>if</code>?', opts: ['The condition may be false after waking', 'cond_wait only returns after a fixed timeout', 'while loops are faster than if statements here', 'The mutex is released again after waking'], ans: 0,
      exp: 'Another thread may change the state between the signal and your wake-up, so re-check before going on.' } },
],

// ── Chapter 3: Files ────────────────────────────────────────────────
l3_1: [
  { title: 'File descriptors are small integers',
    html: `<p>The kernel gives each open file a number: a <strong>file descriptor</strong>. 0 is stdin, 1 is stdout, 2 is stderr. <code>open</code> returns the lowest unused number.</p>`,
    check: { q: 'stdin, stdout and stderr are open. What fd does the first <code>open()</code> return?', opts: ['3', '0', '1', '4'], ans: 0,
      exp: '0, 1 and 2 are taken, so the lowest free descriptor is 3.' } },
  { title: 'The core calls',
    html: `<p>Four calls do most of the work: <code>open</code>, <code>read</code>, <code>write</code>, <code>close</code>. <code>read</code> returns the number of bytes read; <code>0</code> means end of file.</p>`
      + codeBlock(`int fd = open("data.txt", O_RDONLY);
char buf[64];
ssize_t n;
while ((n = read(fd, buf, sizeof buf)) > 0)
    write(STDOUT_FILENO, buf, n);
close(fd);`),
    check: { q: 'What does it mean when <code>read()</code> returns 0?', opts: ['End of file', 'An error happened', 'No data yet; try again', 'The file was closed'], ans: 0,
      exp: '0 means EOF. Errors return -1 and set errno.' } },
  { title: 'Short reads are normal',
    html: `<p><code>read</code> and <code>write</code> may transfer fewer bytes than you asked for. Use the return value, not the buffer size.</p>`,
    check: { q: '<code>read(fd, buf, 100)</code> returns 37. What should the code do?', opts: ['Use the 37 bytes; that is a valid result', 'Treat it as an error and stop reading', 'Close the file and reopen it to retry', 'Assume the file is now at its very end'], ans: 0,
      exp: 'A short read is fine (near EOF, on pipes, on sockets). Loop until you get 0 or all you need.' } },
  { title: 'Open flags',
    html: `<p>Flags choose the access mode and behavior. Combine them with <code>|</code>. When creating a file, pass permissions as a third argument.</p>`
      + codeBlock(`int fd = open("out.txt",
              O_WRONLY | O_CREAT | O_TRUNC,
              0644);`),
    check: { q: 'Which flags create the file if missing and empty it if it exists?', opts: ['O_WRONLY | O_CREAT | O_TRUNC', 'O_WRONLY | O_APPEND | O_EXCL', 'O_RDONLY | O_CREAT | O_SYNC', 'O_RDWR | O_NONBLOCK | O_TRUNC'], ans: 0,
      exp: 'O_CREAT creates it and O_TRUNC wipes existing contents. O_APPEND would keep old data and add to the end.' } },
  { title: 'dup2 redirects a descriptor',
    html: `<p><code>dup2(old, new)</code> makes <code>new</code> refer to the same file as <code>old</code>. That is how a shell implements <code>&gt; file</code>.</p>`
      + codeBlock(`int fd = open("log.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
dup2(fd, STDOUT_FILENO);
close(fd);
printf("this goes to log.txt\\n");`),
    check: { q: 'After <code>dup2(fd, STDOUT_FILENO)</code>, where does printf output go?', opts: ['Into the file that fd refers to', 'To the terminal, as before', 'To standard error', 'Nowhere; stdout is now closed'], ans: 0,
      exp: 'Descriptor 1 now points at the file, so anything written to stdout lands there.' } },
],

l3_2: [
  { title: 'Names point to inodes',
    html: `<p>A file is really an <strong>inode</strong>: a record holding size, owner, permissions, timestamps and pointers to data blocks. The <em>name</em> lives elsewhere, in a directory.</p>`,
    check: { q: 'Where is a file\'s name stored?', opts: ['In an entry of its parent directory', 'Inside the file\'s own inode', 'At the start of its data blocks', 'In the filesystem\'s superblock'], ans: 0,
      exp: 'A directory maps names to inode numbers. The inode itself has no name.' } },
  { title: 'Reading an inode with stat()',
    html: `<p><code>stat</code> copies inode fields into a <code>struct stat</code>.</p>`
      + codeBlock(`struct stat st;
stat("a.txt", &st);
printf("inode %lu, %ld bytes, %lu links\\n",
       st.st_ino, st.st_size, st.st_nlink);`),
    check: { q: 'What does <code>st_nlink</code> count?', opts: ['The directory entries pointing at this inode', 'The processes that currently have it open', 'The data blocks that the file occupies', 'The symbolic links made to the file'], ans: 0,
      exp: 'It is the hard-link count. Data is freed only when it reaches 0 (and no process has it open).' } },
  { title: 'Permission bits',
    html: `<p>Nine bits: read, write, execute for <strong>owner</strong>, <strong>group</strong>, <strong>others</strong>. Written in octal: r=4, w=2, x=1. So <code>0644</code> is rw-r--r--.</p>`,
    check: { q: 'What does <code>chmod 640 file</code> allow?', opts: ['Owner read and write, group read, others nothing', 'Owner read and write, group write, others read', 'Owner everything, group read, others nothing', 'Everyone read, only the owner may write'], ans: 0,
      exp: '6 = rw- for the owner, 4 = r-- for the group, 0 = --- for others.' } },
  { title: 'Hard links vs symlinks',
    html: `<p>A <strong>hard link</strong> is another name for the same inode. A <strong>symlink</strong> is a tiny file that stores a path, and it can dangle if the target disappears.</p>`
      + codeBlock(`ln a.txt b.txt      # hard link: same inode
ln -s a.txt c.txt   # symlink: stores the path "a.txt"`),
    check: { q: 'You run <code>ln a b</code> then <code>rm a</code>. What happens to the data?', opts: ['Reachable through b; link count becomes 1', 'It is deleted at once along with a', 'b becomes a dangling link to nothing', 'b is removed too, because a was removed'], ans: 0,
      exp: 'Both names share one inode. Removing one name just lowers the count; the data stays while another name exists.' } },
  { title: 'Directories are files too',
    html: `<p>A directory is a special file whose contents are (name, inode number) pairs, including <code>.</code> (itself) and <code>..</code> (its parent). Listing a directory just reads those pairs.</p>`,
    check: { q: 'How is a directory stored on disk?', opts: ['As a special file listing name-to-inode pairs', 'As a table kept inside the superblock', 'As an inode that has no data blocks', 'As a linked list of other inodes'], ans: 0,
      exp: 'A directory has its own inode and data blocks; the data is the list of name-to-inode entries.' } },
],

// ── Chapter 4: Networking ───────────────────────────────────────────
l4_1: [
  { title: 'A socket is an endpoint',
    html: `<p>A socket is one end of a network conversation. In Unix it is just a <strong>file descriptor</strong>, so <code>read</code>, <code>write</code> and <code>close</code> work on it. A TCP socket carries a reliable, ordered byte stream.</p>`,
    check: { q: 'How does a Unix program refer to a socket?', opts: ['By a file descriptor', 'By a process ID number', 'By a mutex handle object', 'By a named pipe path'], ans: 0,
      exp: 'socket() returns an fd, which is why the usual I/O calls apply.' } },
  { title: 'The server sequence',
    html: `<p>A TCP server does four setup calls in order, then serves clients.</p>`
      + codeBlock(`int ls = socket(AF_INET, SOCK_STREAM, 0);
bind(ls, (struct sockaddr *)&addr, sizeof addr);  // claim a port
listen(ls, 5);                                    // start queueing
int cs = accept(ls, NULL, NULL);                  // wait for a client`),
    check: { q: 'Which order is correct for a TCP server?', opts: ['socket, bind, listen, accept', 'socket, listen, bind, accept', 'bind, socket, accept, listen', 'socket, accept, bind, listen'], ans: 0,
      exp: 'Create the socket, attach it to an address, mark it passive, then accept connections.' } },
  { title: 'accept() makes a new socket',
    html: `<p><code>accept</code> blocks until a client connects, then returns a <strong>new</strong> descriptor for that one client. The original listening socket stays open to accept the next one.</p>`,
    check: { q: 'What does <code>accept()</code> return?', opts: ['A new fd for that client; the listener stays open', 'The listening socket itself, now connected', 'The client\'s IP address as an integer', '0 for success and -1 for failure'], ans: 0,
      exp: 'One listening socket, one new connected socket per client.' } },
  { title: 'The client sequence',
    html: `<p>A client is shorter: it does not bind, listen or accept. It just connects.</p>`
      + codeBlock(`int fd = socket(AF_INET, SOCK_STREAM, 0);
connect(fd, (struct sockaddr *)&server, sizeof server);
write(fd, "hello", 5);
read(fd, buf, sizeof buf);
close(fd);`),
    check: { q: 'Which calls does a typical client NOT make that a server does?', opts: ['bind, listen and accept', 'socket, then close at the end', 'read and write on the fd', 'connect, then send the data'], ans: 0,
      exp: 'The client initiates (connect). The server binds, listens and accepts.' } },
  { title: 'Stream or datagram',
    html: `<p><code>SOCK_STREAM</code> (TCP) gives a reliable, ordered stream with a connection. <code>SOCK_DGRAM</code> (UDP) sends independent packets with no connection and no guarantee of delivery or order.</p>`,
    check: { q: 'Which socket type guarantees reliable, ordered delivery?', opts: ['SOCK_STREAM (TCP)', 'SOCK_DGRAM (UDP)', 'AF_UNIX', 'INADDR_ANY'], ans: 0,
      exp: 'TCP retransmits lost data and keeps order. UDP does neither.' } },
],

l4_2: [
  { title: 'Byte order on the wire',
    html: `<p>Networks use <strong>big-endian</strong> byte order. Your CPU may be little-endian, so convert multi-byte numbers: <code>htons</code>/<code>htonl</code> going out, <code>ntohs</code>/<code>ntohl</code> coming in.</p>`
      + codeBlock(`addr.sin_family = AF_INET;
addr.sin_port   = htons(8080);`),
    check: { q: 'Why wrap the port number in <code>htons()</code>?', opts: ['Hosts may be little-endian, the network is not', 'It converts the number into a text string', 'It checks that the port is not already used', 'It encrypts the port before sending'], ans: 0,
      exp: 'Without it, the two bytes of the port would be swapped on little-endian machines.' } },
  { title: 'Filling in the address',
    html: `<p>For a server, <code>INADDR_ANY</code> means "accept connections on any network interface of this machine".</p>`
      + codeBlock(`struct sockaddr_in addr = {0};
addr.sin_family      = AF_INET;
addr.sin_addr.s_addr = htonl(INADDR_ANY);
addr.sin_port        = htons(8080);`),
    check: { q: 'What does <code>INADDR_ANY</code> mean when binding?', opts: ['Listen on every interface of this machine', 'Connect to the local machine only (loopback)', 'Accept exactly one client then stop', 'Pick a random free port for the socket'], ans: 0,
      exp: 'The server will accept connections arriving on any of its addresses.' } },
  { title: 'One client at a time is a problem',
    html: `<p><code>accept</code> and <code>read</code> block. A loop that serves one client until it disconnects leaves everyone else waiting.</p>`,
    check: { q: 'A one-at-a-time server is serving client A, who has gone idle. What happens to client B?', opts: ['B waits; the server is stuck on A', 'B is served in parallel with A', 'The kernel closes A\'s connection', 'B is served first because it is newer'], ans: 0,
      exp: 'The single thread is blocked in read() for A, so it never reaches accept() for B.' } },
  { title: 'Strategy 1: fork per client',
    html: `<p>Fork a child for each connection. The child serves the client; the parent goes back to <code>accept</code>.</p>`
      + codeBlock(`int cs = accept(ls, NULL, NULL);
if (fork() == 0) {
    close(ls);          // child doesn't need the listener
    handle(cs);
    exit(0);
}
close(cs);              // parent doesn't need this client`),
    check: { q: 'Why does the parent call <code>close(cs)</code>?', opts: ['The child owns the connection now', 'It tells the client to disconnect', 'It frees the listening port', 'accept() requires it before returning'], ans: 0,
      exp: 'fork copied the descriptor. The parent closes its copy so it does not leak one fd per client.' } },
  { title: 'Strategy 2: select()',
    html: `<p><code>select</code> watches many descriptors at once in a single process and wakes when any is ready. Pass a set of fds and the highest fd number plus one.</p>`
      + codeBlock(`fd_set rd;
FD_ZERO(&rd);
FD_SET(ls, &rd);                 // listener
FD_SET(cs, &rd);                 // a client
select(maxfd + 1, &rd, NULL, NULL, NULL);
if (FD_ISSET(ls, &rd)) { /* new connection */ }`),
    check: { q: 'What should the first argument of <code>select()</code> be?', opts: ['The highest fd number plus one', 'The number of connected clients', 'The size of the fd_set in bytes', 'Always 1024'], ans: 0,
      exp: 'select checks fds 0 up to nfds-1, so pass max_fd + 1.' } },
],

// ── Chapter 5: IPC ──────────────────────────────────────────────────
l5_1: [
  { title: 'A pipe is a one-way channel',
    html: `<p><code>pipe(fd)</code> creates a kernel buffer with two ends: <code>fd[1]</code> to <strong>write</strong>, <code>fd[0]</code> to <strong>read</strong>. Create it <em>before</em> <code>fork()</code> so parent and child both get the ends.</p>`
      + codeBlock(`int fd[2];
pipe(fd);          // fd[0] = read end, fd[1] = write end
if (fork() == 0) { /* child reads fd[0]  */ }
else             { /* parent writes fd[1] */ }`),
    viz: 'pipe',
    check: { q: 'Which end of <code>pipe(fd)</code> do you write to?', opts: ['fd[1]', 'fd[0]', 'Either end works', 'Both ends at once'], ans: 0,
      exp: 'Remember: 0 is like stdin (read), 1 is like stdout (write).' } },
  { title: 'Close the ends you do not use',
    html: `<p>A reader only sees end-of-file once <strong>every</strong> write end is closed, in every process. One forgotten open write end means <code>read</code> blocks forever.</p>`,
    check: { q: 'A child reads from a pipe until EOF but hangs forever. The most likely cause?', opts: ['Some process still has the write end open', 'The pipe buffer is currently empty', 'read() was called twice in a row', 'The parent wrote through fd[0]'], ans: 0,
      exp: 'EOF needs all write ends closed. Often the child itself forgot to close its own copy of fd[1].' } },
  { title: 'Pipes plus dup2 build pipelines',
    html: `<p>A shell runs <code>ls | wc</code> by connecting one process's stdout to a pipe and the next process's stdin to the same pipe.</p>`
      + codeBlock(`// in the "ls" child:
dup2(fd[1], STDOUT_FILENO);
close(fd[0]); close(fd[1]);
execlp("ls", "ls", NULL);`),
    check: { q: 'Before exec-ing <code>ls</code>, what does the shell do to feed the pipe?', opts: ['dup2 the pipe\'s write end onto stdout', 'dup2 the pipe\'s read end onto stdout', 'Close stdout and open a regular file', 'Create a named FIFO on disk'], ans: 0,
      exp: 'ls writes to fd 1. Making fd 1 the pipe\'s write end sends its output into the pipe.' } },
  { title: 'Named pipes (FIFOs)',
    html: `<p>A FIFO is a pipe with a <strong>name in the filesystem</strong>, so unrelated processes can use it. Opening one end blocks until the other end is opened.</p>`
      + codeBlock(`mkfifo("/tmp/myfifo", 0644);
int fd = open("/tmp/myfifo", O_WRONLY);   // blocks until a reader opens
write(fd, "ping", 4);`),
    check: { q: 'What makes a FIFO different from a pipe from <code>pipe()</code>?', opts: ['A filesystem name lets unrelated processes use it', 'It keeps its data on disk across reboots', 'It carries data in both directions at once', 'It works across the network between machines'], ans: 0,
      exp: 'Both are kernel buffers; the FIFO\'s name lets any process open it, no fork relationship needed.' } },
],

l5_2: [
  { title: 'Fastest IPC: share the memory',
    html: `<p>Pipes and sockets copy data through the kernel. With <strong>shared memory</strong>, two processes map the same physical page, so after setup there is no copying and no system call per access.</p>`,
    viz: 'shm',
    check: { q: 'Why is shared memory the fastest IPC option?', opts: ['After setup, no kernel copy is needed', 'The data is compressed automatically', 'The kernel schedules it before everything else', 'It travels over the loopback network'], ans: 0,
      exp: 'Both processes read and write the same memory directly.' } },
  { title: 'The POSIX pattern',
    html: `<p>Create, size, map, use, clean up.</p>`
      + codeBlock(`int fd = shm_open("/myshm", O_CREAT | O_RDWR, 0666);
ftruncate(fd, 4096);                       // set the size
int *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE,
              MAP_SHARED, fd, 0);          // map it
*p = 42;
munmap(p, 4096);  close(fd);
shm_unlink("/myshm");                      // remove the name`),
    check: { q: 'Which call sets the size of a newly created shared-memory object?', opts: ['ftruncate', 'shm_open', 'mmap', 'shm_unlink'], ans: 0,
      exp: 'shm_open creates an empty object. ftruncate gives it a length before you mmap it.' } },
  { title: 'MAP_SHARED vs MAP_PRIVATE',
    html: `<p><code>MAP_SHARED</code> writes are visible to every process mapping the object. <code>MAP_PRIVATE</code> uses copy-on-write: your writes go to a private copy nobody else sees.</p>`,
    check: { q: 'A process writes to a <code>MAP_PRIVATE</code> mapping. What do other processes see?', opts: ['Nothing; the write went to a private copy', 'The change, immediately', 'The change, only after msync()', 'An error, because the write is illegal'], ans: 0,
      exp: 'MAP_PRIVATE is copy-on-write, so changes stay private to the writer.' } },
  { title: 'You must synchronize',
    html: `<p>Shared memory gives no ordering guarantees. Put a mutex or semaphore <em>inside</em> the shared region and mark it process-shared.</p>`
      + codeBlock(`pthread_mutexattr_t a;
pthread_mutexattr_init(&a);
pthread_mutexattr_setpshared(&a, PTHREAD_PROCESS_SHARED);
pthread_mutex_init(&shared->lock, &a);`),
    check: { q: 'Two processes increment a shared counter with no lock. What can happen?', opts: ['A race: some updates are lost', 'Always correct, since memory is shared', 'The kernel serializes the two writes', 'mmap blocks the second writer'], ans: 0,
      exp: 'It is the same load-add-store race as with threads. Shared memory needs explicit locking.' } },
  { title: 'Anonymous sharing with fork',
    html: `<p>If you only need to share with your own children, skip the name: map anonymous shared memory <em>before</em> <code>fork</code>.</p>`
      + codeBlock(`int *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE,
              MAP_SHARED | MAP_ANONYMOUS, -1, 0);
if (fork() == 0) { *p = 7; exit(0); }
wait(NULL);
printf("%d\\n", *p);    // 7`),
    check: { q: 'How can a parent share memory with a forked child, without any name?', opts: ['mmap(MAP_SHARED | MAP_ANONYMOUS) before fork()', 'malloc a shared buffer before calling fork()', 'Use one global variable in both processes', 'mmap(MAP_PRIVATE | MAP_ANONYMOUS) before fork()'], ans: 0,
      exp: 'malloc and globals are copied on fork. Only a MAP_SHARED mapping stays genuinely shared.' } },
],

};
