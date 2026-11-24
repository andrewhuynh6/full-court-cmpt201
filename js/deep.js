// FULL COURT — Depth layer for lessons: big-picture intro, why-it-matters, common mistakes,
// worked traces, extra steps and a recap. Merged into each lesson's steps at load.
// notes[i] = { why, mistake, trace } for original step i; extra = [{ at, step }] (at = insert before original index; >= length appends).

const LESSON_DEEP = {

l1_1: {
  analogy: `A pointer is a jersey number on the roster sheet. The number is not the player, but it tells you exactly which player to go and look at.`,
  goals: ['Read and write through a pointer with <code>&amp;</code> and <code>*</code>', 'Predict where <code>p + 1</code> lands for different types', 'Let a function change a caller\'s variable'],
  recap: ['A pointer stores an address; <code>*p</code> follows it.', '<code>&amp;x</code> gets the address of x.', '<code>p + 1</code> moves by <code>sizeof(*p)</code> bytes.', '<code>a[i]</code> is the same as <code>*(a + i)</code>.', 'Pass an address to let a function modify your variable.'],
  notes: [
    { why: 'Almost every segfault in this course is really a pointer bug, so this is the foundation for everything else.', mistake: 'Mixing up the pointer with what it points to. p holds an address; <code>*p</code> is the value.' },
    { why: 'Passing <code>&amp;x</code> to a function is how C lets a function change your variable.', mistake: 'Writing <code>int *p = 5;</code>. A number is not an address; it compiles with a warning and crashes when used.' },
    { why: 'Pointer arithmetic is how C walks arrays, strings and buffers.', mistake: 'Adding bytes by hand. On an <code>int *</code>, <code>p + 4</code> moves 16 bytes, not 4.',
      trace: 'a = {10, 20, 30} &nbsp;→&nbsp; <code>p = a</code> points at 10 &nbsp;→&nbsp; <code>p++</code> points at 20 &nbsp;→&nbsp; <code>*p</code> is 20.' },
    { why: 'Every array you pass to a function arrives as a pointer.', mistake: 'Using <code>sizeof(arr)</code> inside a function. It gives the pointer size (8), not the array size.' },
    { why: '<code>char **argv</code> in main and callbacks such as qsort\'s compare function both rely on these.', mistake: 'Dropping the parentheses: <code>int *op(int, int)</code> declares a function returning <code>int *</code>, not a function pointer.' },
  ],
  extra: [
    { at: 4, step: {
      title: 'Pass an address to change a variable',
      html: `<p>C copies every argument. To let a function modify your variable, give it the variable's <strong>address</strong>.</p>`
        + codeBlock(`void swap(int *x, int *y) {
    int tmp = *x;
    *x = *y;
    *y = tmp;
}`),
      why: 'This is how <code>scanf</code> fills your variables, and how any function can return more than one result.',
      mistake: 'Calling <code>swap(a, b)</code> instead of <code>swap(&amp;a, &amp;b)</code>. The function would swap copies.',
      check: { q: 'Which call swaps the two ints <code>a</code> and <code>b</code>?', opts: ['swap(&a, &b);', 'swap(a, b);', 'swap(*a, *b);', 'swap(&&a, &&b);'], ans: 0, exp: 'swap expects addresses, so pass &a and &b. Passing a and b would copy their values.' } } },
  ],
},

l1_2: {
  analogy: `The stack is the bench: players sit down and leave automatically. The heap is the equipment room: you check out a ball with <code>malloc</code> and must return it with <code>free</code>. Never return it and the room runs out of balls.`,
  goals: ['Tell stack memory from heap memory', 'Use malloc, calloc, realloc and free correctly', 'Spot leaks, use-after-free and double free'],
  recap: ['Stack memory is automatic and dies when the function returns.', 'Heap memory lives until you <code>free</code> it.', '<code>malloc</code> takes bytes; check for <code>NULL</code>.', 'Every malloc needs exactly one free by one owner.', 'Run Valgrind with <code>-g</code> to find leaks and invalid accesses.'],
  notes: [
    { why: 'Choosing stack or heap decides how long data lives and who must clean it up.', mistake: 'Returning a pointer to a local array. Its stack frame is gone after the return.' },
    { why: 'These four calls are the whole heap API; every other allocator builds on them.', mistake: 'Using malloc memory as if it were zeroed. malloc leaves garbage; use calloc for zeros.' },
    { why: 'Wrong sizes are the top cause of heap corruption, and the crash often shows up far from the cause.', mistake: 'Writing <code>malloc(sizeof(p))</code> when p is a pointer. That is 8 bytes. Use <code>malloc(sizeof *p)</code>.',
      trace: '<code>malloc(10)</code> gives 10 bytes &nbsp;→&nbsp; an int needs 4 &nbsp;→&nbsp; 10 ÷ 4 = 2 whole ints, 2 bytes unused.' },
    { why: 'Leaks slowly eat memory; use-after-free and double free corrupt it and can be exploited.', mistake: 'Freeing a pointer, then freeing a copy of it elsewhere: two pointers, one block, a double free.' },
    { why: 'Valgrind finds in seconds what reading code can take hours to find.', mistake: 'Running Valgrind on a build without <code>-g</code>. You get addresses, not line numbers.' },
  ],
  extra: [
    { at: 4, step: {
      title: 'Who frees it? Decide the owner',
      html: `<p>Every <code>malloc</code> needs exactly one <strong>owner</strong> who will call <code>free</code>. When a function returns allocated memory, the caller becomes the owner. Write that in a comment.</p>`
        + codeBlock(`// Returns a copy of s. Caller must free().
char *dup_name(const char *s) {
    char *copy = malloc(strlen(s) + 1);
    if (copy) strcpy(copy, s);
    return copy;
}`),
      why: 'Unclear ownership is where double frees and leaks come from in bigger programs.',
      mistake: 'Freeing the string inside <code>dup_name</code> before returning it. The caller would get a dangling pointer.',
      check: { q: '<code>dup_name</code> returns a malloc\'d string. Who must call <code>free()</code> on it?', opts: ['The caller that receives the pointer', 'dup_name, just before it returns', 'Nobody, since the OS frees it on return', 'The first thread that reads the string'], ans: 0, exp: 'Ownership transfers to the caller. Free it when you are done with the copy.' } } },
  ],
},

l2_1: {
  analogy: `A process is a whole separate team with its own court and playbook. <code>fork()</code> clones the entire team: the clone starts from the same play but is now completely independent.`,
  goals: ['Explain what fork() returns in parent and child', 'Replace a process image with exec', 'Reap children so no zombies are left'],
  recap: ['A process has its own address space; processes are isolated.', '<code>fork()</code> returns 0 in the child, the child\'s PID in the parent.', 'Each fork doubles the number of processes that continue.', '<code>exec</code> replaces the program; it only returns on failure.', 'Call <code>wait</code>/<code>waitpid</code> to reap zombies.'],
  notes: [
    { why: 'Isolation is why one crashed browser tab does not take down the whole browser: separate processes.', mistake: 'Thinking two processes share variables. After fork, each has its own copy.' },
    { why: 'fork is how a shell launches every command you type.', mistake: 'Ignoring the -1 case. If fork fails there is no child, and code that assumes one misbehaves.' },
    { why: 'Counting processes after nested forks is a classic exam question and the idea behind a fork bomb.', mistake: 'Expecting ordered output. Parent and child run in any order.',
      trace: 'Start: 1 process &nbsp;→&nbsp; after fork #1: 2 &nbsp;→&nbsp; after fork #2: 4 &nbsp;→&nbsp; all 4 reach printf, so 4 lines.' },
    { why: 'fork then exec is how a new program starts without carrying the old one\'s code.', mistake: 'Not handling exec failure. Follow exec with <code>perror</code> and <code>exit</code>, or the child keeps running the parent\'s code.' },
    { why: 'Zombies take up process-table slots; enough of them and <code>fork()</code> starts failing.', mistake: 'Calling wait() once after forking several children. Each child needs its own wait.' },
  ],
  extra: [
    { at: 5, step: {
      title: 'Reading the exit status',
      html: `<p>The status from <code>waitpid</code> packs several facts. Use the macros instead of reading bits yourself.</p>`
        + codeBlock(`int status;
waitpid(pid, &status, 0);
if (WIFEXITED(status))
    printf("exit code %d\\n", WEXITSTATUS(status));
else if (WIFSIGNALED(status))
    printf("killed by signal %d\\n", WTERMSIG(status));`),
      why: 'Shells and test runners use this to report success, failure, or a crash.',
      mistake: 'Printing <code>status</code> directly. A child that called exit(3) gives 768, not 3.',
      check: { q: 'A child calls <code>exit(3)</code>. Which expression gives 3 in the parent?', opts: ['WEXITSTATUS(status)', 'WIFEXITED(status)', 'WTERMSIG(status)', 'status itself'], ans: 0, exp: 'WIFEXITED tells you the child exited normally; WEXITSTATUS extracts the code.' } } },
  ],
},

l2_2: {
  analogy: `Threads are players on one team sharing one court and one ball bin (shared memory). Each player has their own hands (a private stack).`,
  goals: ['Create and join threads with pthreads', 'Pass arguments to threads safely', 'Recognize a race condition'],
  recap: ['Threads share heap and globals; each has its own stack.', '<code>pthread_create</code> starts, <code>pthread_join</code> waits.', 'Never pass the address of a loop variable to threads.', '<code>counter++</code> is three steps and can lose updates.', 'Compile with <code>-pthread</code>.'],
  notes: [
    { why: 'Threads are cheaper than processes to create and to talk to, which is why servers and apps use them.', mistake: 'Sharing a local variable\'s address with a thread that outlives the function that owns it.' },
    { why: 'Without join, main can return and end the whole process while your threads are mid-work.', mistake: 'Forgetting <code>-pthread</code> when compiling. You get link errors or subtle failures.' },
    { why: 'A tiny argument bug here causes the nastiest kind of problem: it works on your laptop and fails in the demo.', mistake: 'Passing <code>&amp;i</code> of a loop variable. By the time the thread runs, i has moved on.' },
    { why: 'Race conditions are the reason every synchronization tool in the next two lessons exists.', mistake: 'Testing a race once. It can pass a thousand times and still be wrong.',
      trace: 'A loads 0 &nbsp;→&nbsp; B loads 0 &nbsp;→&nbsp; A stores 1 &nbsp;→&nbsp; B stores 1 &nbsp;→&nbsp; counter is 1, should be 2.' },
  ],
  extra: [
    { at: 2, step: {
      title: 'Detached threads',
      html: `<p>If you never need a thread\'s result, <strong>detach</strong> it. Its resources are freed automatically when it finishes, and you must not join it.</p>`
        + codeBlock(`pthread_t t;
pthread_create(&t, NULL, work, NULL);
pthread_detach(t);     // fire and forget`),
      why: 'Servers often start a detached thread per request and never wait for it.',
      mistake: 'Joining a detached thread. The behavior is undefined.',
      check: { q: 'When is <code>pthread_detach</code> the right choice?', opts: ['You will never need the thread\'s result', 'You need the thread\'s return value', 'You want the thread to run faster', 'You plan to join the thread twice'], ans: 0, exp: 'A detached thread cleans up after itself and cannot be joined.' } } },
  ],
},

l2_3: {
  analogy: `One ball, one player. Only the player holding the ball may shoot; everyone else waits their turn. The mutex is the ball.`,
  goals: ['Protect shared data with lock and unlock', 'Explain how deadlock happens', 'Prevent deadlock with lock ordering'],
  recap: ['A mutex lets one thread at a time into the critical section.', 'Every access to the data must use the same mutex.', 'Keep critical sections short; never sleep inside one.', 'Deadlock is a cycle of threads each waiting on the next.', 'Lock in one global order to prevent deadlock.'],
  notes: [
    { why: 'A mutex is the simplest tool that guarantees only one thread touches the data at a time.', mistake: 'Using different mutexes for the same data in different places. The lock only works if everyone shares it.' },
    { why: 'This is the fix for the race from the last lesson, in three lines.', mistake: 'Locking only the write. Reads must lock too, or you can read a half-updated value.',
      trace: 'A: lock, counter 0→1, unlock &nbsp;→&nbsp; B (was waiting): lock, counter 1→2, unlock &nbsp;→&nbsp; final 2.' },
    { why: 'A long critical section serializes your threads and cancels the speedup you wanted from threads.', mistake: 'Calling something that can block (I/O, sleep, another lock) while holding the mutex.' },
    { why: 'Deadlock hangs your program with no error message, which makes it very hard to debug.', mistake: 'Thinking deadlock needs many threads. Two threads and two locks are enough.' },
    { why: 'One rule, lock order, removes a whole class of bugs at no runtime cost.', mistake: 'Fixing the order in one function and forgetting another that takes the same two locks.' },
  ],
  extra: [
    { at: 5, step: {
      title: 'trylock and read-write locks',
      html: `<p><code>pthread_mutex_trylock</code> returns right away instead of waiting. A <strong>read-write lock</strong> lets many readers in together but only one writer.</p>`
        + codeBlock(`if (pthread_mutex_trylock(&m) == 0) {
    /* got it: use the data */
    pthread_mutex_unlock(&m);
} else {
    /* busy: do something else, try later */
}`),
      why: 'trylock avoids waiting and some deadlocks; rwlocks speed up data that is read far more than written.',
      mistake: 'Using an rwlock when writes are frequent. The extra bookkeeping can be slower than a plain mutex.',
      check: { q: '<code>pthread_mutex_trylock</code> returns nonzero. What does that tell you?', opts: ['The mutex was held, so it did not wait', 'The calling thread already finished', 'The mutex was just destroyed', 'The lock count reached its limit'], ans: 0, exp: 'trylock never blocks; a nonzero result (EBUSY) means someone else holds the lock.' } } },
  ],
},

l2_4: {
  analogy: `A semaphore is the count of free water bottles on the bench: take one (<code>wait</code>), return one (<code>post</code>), and with none left you wait. A condition variable is the coach's whistle: sleep until the play is ready.`,
  goals: ['Use sem_wait and sem_post to count resources', 'Build a bounded buffer with semaphores', 'Wait on a condition safely with a condition variable'],
  recap: ['A semaphore is a counter; wait decrements (blocks at 0), post increments.', 'Producer waits on <code>empty</code>, consumer on <code>full</code>.', 'Counting and mutual exclusion are separate jobs: use both.', 'Condition variables need a mutex and a <code>while</code> loop.', 'Signals without a waiter are lost.'],
  notes: [
    { why: 'Semaphores count resources (free slots, tokens), which a plain mutex cannot.', mistake: 'Initializing with the wrong count. 0 for a lock makes everyone wait forever; 1 makes it a mutex.' },
    { why: 'Producer-consumer is the pattern behind queues, thread pools and print spoolers.', mistake: 'Swapping the two waits so each side waits for the other.',
      trace: 'empty=4, full=0 &nbsp;→&nbsp; produce: empty=3, full=1 &nbsp;→&nbsp; ... buffer full: empty=0 &nbsp;→&nbsp; producer sleeps until a consumer posts.' },
    { why: 'Counting slots and protecting the buffer are two separate jobs; real code needs both.', mistake: 'Taking the mutex before <code>sem_wait</code>. You sleep holding the lock and the other side can never post.' },
    { why: 'Condition variables let threads wait for something to become true without burning CPU in a loop.', mistake: 'Calling cond_wait without holding the mutex, or signaling before the condition is actually set.' },
  ],
  extra: [
    { at: 4, step: {
      title: 'Which tool for which job?',
      html: `<ul><li><strong>Mutex:</strong> protect shared data; one thread at a time.</li><li><strong>Semaphore:</strong> count how many of something are available, or signal between threads.</li><li><strong>Condition variable:</strong> wait until a condition on shared data is true; always paired with a mutex.</li></ul>`,
      why: 'Picking the right primitive makes the code shorter and the bugs fewer.',
      mistake: 'Using a mutex to wait for an event. A mutex guards data; it does not announce that something happened.',
      check: { q: 'Three connections are shared by many threads. Which tool fits best?', opts: ['A semaphore initialized to 3', 'A mutex around the whole pool', 'A condition variable by itself', 'A pipe between the threads'], ans: 0, exp: 'A counting semaphore models "3 available" directly: wait to take one, post to give it back.' } } },
  ],
},

l3_1: {
  analogy: `A file descriptor is a locker number. You hand the front desk (the kernel) the number, never the locker itself, and the desk does the fetching.`,
  goals: ['Open, read, write and close with system calls', 'Handle short reads and errors', 'Redirect output with dup2'],
  recap: ['A file descriptor is a small integer; 0, 1, 2 are stdin, stdout, stderr.', '<code>read</code> returns 0 at EOF and -1 on error.', 'Short reads and writes are normal: loop.', 'Flags choose the mode; pass the mode with <code>O_CREAT</code>.', '<code>dup2(old, new)</code> redirects descriptors.'],
  notes: [
    { why: 'In Unix, pipes, sockets and terminals are all file descriptors. Learn it once, use it everywhere.', mistake: 'Hard-coding 3 as "the file". The number depends on what is already open.' },
    { why: 'These four calls are what <code>printf</code> and <code>fopen</code> use underneath.', mistake: 'Not checking for -1. open fails if the file is missing or you lack permission.' },
    { why: 'Pipe and network reads often return fewer bytes than requested, so correct programs loop.', mistake: 'Treating the buffer as a C string without adding the terminating zero after read.',
      trace: 'Ask for 100, get 37 &nbsp;→&nbsp; use those 37 &nbsp;→&nbsp; read again &nbsp;→&nbsp; 0 means finished.' },
    { why: 'Wrong flags silently destroy data (<code>O_TRUNC</code>) or fail to create files (missing <code>O_CREAT</code>).', mistake: 'Passing <code>O_CREAT</code> without the mode argument. The permissions come from garbage.' },
    { why: 'Shell redirection and pipelines are built from dup2.', mistake: 'Leaving the extra descriptor open after dup2, which keeps a file or pipe open longer than intended.' },
  ],
  extra: [
    { at: 5, step: {
      title: 'Buffered stdio vs raw syscalls',
      html: `<p><code>printf</code> and <code>fwrite</code> collect bytes in a <strong>user-space buffer</strong> and write them in bulk. <code>write()</code> goes straight to the kernel. Mixing them can reorder output.</p>`
        + codeBlock(`printf("A");                  // sits in the stdio buffer
write(STDOUT_FILENO, "B", 1); // goes out right now`),
      why: 'Buffering is why stdio is fast, and why output can appear late or out of order.',
      mistake: 'Mixing <code>printf</code> and <code>write</code> on the same stream and expecting program order.',
      check: { q: 'No newline is printed and the program just exits. What order does the output show?', code: H_esc(`printf("A");
write(STDOUT_FILENO, "B", 1);`), opts: ['BA', 'AB', 'A only', 'B only'], ans: 0, exp: 'B is written at once; A is flushed from the buffer only when the program exits.' } } },
  ],
},

l3_2: {
  analogy: `An inode is the player card: stats, position, where the player sits. A directory is the roster that maps names to cards. Two names on one card is a hard link; a sticky note that says "see court 3" is a symlink.`,
  goals: ['Explain what an inode stores and what it does not', 'Read permission bits and link counts', 'Choose between hard and symbolic links'],
  recap: ['A file is an inode; the name lives in a directory entry.', '<code>stat</code> reads inode fields such as size and link count.', 'Permissions are rwx for owner, group, others (octal 4/2/1).', 'Hard links share an inode; symlinks store a path and can dangle.', 'A directory is a file of name-to-inode pairs.'],
  notes: [
    { why: 'The split between names and inodes explains hard links, rename, and why deleting an open file still works.', mistake: 'Thinking the name is part of the file.' },
    { why: '<code>ls -l</code>, <code>du</code> and backup tools all read these same fields.', mistake: 'Using <code>stat</code> on a symlink and expecting link info. stat follows the link; <code>lstat</code> does not.' },
    { why: 'Permission errors (EACCES) are among the most common runtime failures.', mistake: 'Reading 755 as one number. It is three digits: owner, group, others.' },
    { why: 'Hard or symbolic changes what happens when files move or are deleted.', mistake: 'Trying to hard-link a directory or across filesystems. Both are not allowed.',
      trace: '<code>ln a b</code>: inode 77 has names a, b (nlink 2) &nbsp;→&nbsp; <code>rm a</code>: only b remains (nlink 1) &nbsp;→&nbsp; data kept.' },
    { why: 'Path lookup walks directories one component at a time; this explains the x bit on directories.', mistake: 'Forgetting that deleting a file needs write permission on the directory, not on the file.' },
  ],
  extra: [
    { at: 5, step: {
      title: 'Walking a path',
      html: `<p>To open <code>/home/ann/a.txt</code>, the kernel starts at the root inode, looks up <code>home</code> in its entries, follows that inode to find <code>ann</code>, then <code>a.txt</code>. Each directory on the way must be <strong>searchable</strong> (x).</p>`,
      why: 'It explains why you can have a readable file you still cannot open: a parent directory blocks the path.',
      mistake: 'Checking only the file\'s own permissions when open() fails with EACCES.',
      check: { q: 'To open <code>/home/ann/a.txt</code>, which permission is needed on the directory <code>/home/ann</code>?', opts: ['Execute (x), to search it', 'Write (w), to modify it', 'None; only the file\'s bits matter', 'Read (r) on every file inside'], ans: 0, exp: 'Looking up a name in a directory needs x on that directory.' } } },
  ],
},

l4_1: {
  analogy: `A socket is a phone line. The server is the arena's front desk: it claims a number (<code>bind</code>), opens the lines (<code>listen</code>), and <code>accept</code> picks up a call and hands you a dedicated line for that caller.`,
  goals: ['Write the server and client call sequences in order', 'Explain why accept returns a new descriptor', 'Choose between TCP and UDP'],
  recap: ['A socket is a file descriptor.', 'Server: socket, bind, listen, accept. Client: socket, connect.', '<code>accept</code> returns a new fd per client; the listener stays open.', 'TCP is a byte stream: no message boundaries.', '<code>SOCK_STREAM</code> is TCP, <code>SOCK_DGRAM</code> is UDP.'],
  notes: [
    { why: 'Because sockets are file descriptors, you already know how to read, write and close them.', mistake: 'Expecting one write on one side to equal one read on the other. TCP is a stream.' },
    { why: 'This order is the exam question and every server\'s skeleton.', mistake: 'Skipping bind. The OS picks a random port and clients cannot find you.',
      trace: 'socket gives fd 3 &nbsp;→&nbsp; bind(3, port 8080) &nbsp;→&nbsp; listen(3) &nbsp;→&nbsp; accept(3) returns fd 4 for client #1 while fd 3 keeps listening.' },
    { why: 'Separating the listener from per-client sockets is what lets one server talk to many clients.', mistake: 'Closing the listening socket after the first accept. No more clients can connect.' },
    { why: 'The client mirrors the server, so once you know one you know both.', mistake: 'Using the right host but the wrong port or byte order in connect().' },
    { why: 'TCP for correctness, UDP for speed or broadcast; choosing wrong changes your design.', mistake: 'Using <code>SOCK_DGRAM</code> and assuming messages arrive in order, or at all.' },
  ],
  extra: [
    { at: 5, step: {
      title: 'Reading a whole message',
      html: `<p>TCP does not keep message boundaries. Two writes can arrive as one read, or one write as two. Frame your messages: send a <strong>length first</strong>, or end each message with a delimiter, then loop until you have it all.</p>`
        + codeBlock(`uint32_t len;
read_full(fd, &len, 4);          // read exactly 4 bytes
len = ntohl(len);
read_full(fd, body, len);        // then exactly len bytes`),
      why: 'Every real protocol (HTTP, chat, databases) has a framing rule for this reason.',
      mistake: 'Assuming one <code>read()</code> returns one whole message.',
      check: { q: 'A client sends a 4-byte length before each message. Why?', opts: ['TCP has no message boundaries', 'read() refuses to start without it', 'The kernel needs it for checksums', 'Otherwise the port number changes'], ans: 0, exp: 'The length tells the receiver exactly how many bytes make up the next message.' } } },
  ],
},

l4_2: {
  analogy: `One receptionist can answer only one call at a time. To serve many callers, either hire an assistant per caller (<code>fork</code>), or have one receptionist who checks every line at once (<code>select</code>).`,
  goals: ['Convert numbers to network byte order', 'Fill in a sockaddr_in for bind and connect', 'Serve many clients with fork or select'],
  recap: ['Networks use big-endian; convert with <code>htons</code>/<code>htonl</code>.', '<code>INADDR_ANY</code> listens on all interfaces.', 'A one-at-a-time server freezes on a slow client.', 'fork-per-client: close the unused fd in each process; reap children.', '<code>select</code> watches many fds; pass max fd + 1 and rebuild the set.'],
  notes: [
    { why: 'Byte-order mistakes show up as ports and addresses that look right in code but fail on the wire.', mistake: 'Calling <code>htons</code> on a value that is already in network order, which swaps it back.',
      trace: 'Port 8080 = 0x1F90 &nbsp;→&nbsp; on the wire: bytes 1F 90 (big-endian) &nbsp;→&nbsp; a little-endian CPU stores 90 1F in memory.' },
    { why: 'These few lines are boilerplate you will write in every networking assignment.', mistake: 'Not zeroing the struct first. Stray bytes in the padding can make bind or connect fail.' },
    { why: 'A server that handles one client at a time is frozen by one slow client.', mistake: 'Testing with a single client, so the blocking problem never shows.' },
    { why: 'fork gives each client its own process: simple and isolated, a little heavy.', mistake: 'Leaving the listening fd open in the child, or the client fd open in the parent.' },
    { why: 'select lets one process watch hundreds of sockets with no extra processes.', mistake: 'Not resetting the fd_set every loop, or passing the wrong max fd.' },
  ],
  extra: [
    { at: 4, step: {
      title: 'Reaping children with SIGCHLD',
      html: `<p>A fork-per-client server creates a zombie for every finished client unless it calls wait. Install a <code>SIGCHLD</code> handler that reaps <strong>all</strong> finished children.</p>`
        + codeBlock(`void on_child(int sig) {
    while (waitpid(-1, NULL, WNOHANG) > 0) { }
}
signal(SIGCHLD, on_child);`),
      why: 'Without it, a long-running server slowly fills the process table with zombies.',
      mistake: 'Calling waitpid only once in the handler. Several children can exit before it runs.',
      check: { q: 'Why does the handler loop on <code>waitpid(-1, NULL, WNOHANG)</code>?', opts: ['Several children may exit before one signal runs', 'WNOHANG makes the handler wait longer', 'One call can reap only zombies made before fork', 'Every signal is queued separately by the kernel'], ans: 0, exp: 'Standard signals can merge. Loop until waitpid reports no more finished children.' } } },
  ],
},

l5_1: {
  analogy: `A pipe is a one-way chute between two players: pass in at one end, catch at the other. If the passer leaves the chute open, the catcher waits forever for another ball.`,
  goals: ['Create a pipe and use its read and write ends', 'Explain why unused ends must be closed', 'Connect commands with dup2 and use FIFOs'],
  recap: ['<code>pipe(fd)</code>: <code>fd[0]</code> reads, <code>fd[1]</code> writes; create it before <code>fork</code>.', 'Close the ends you do not use in each process.', 'EOF arrives only when all write ends are closed.', '<code>dup2</code> connects a pipe to stdin/stdout for pipelines.', 'FIFOs have a name so unrelated processes can use them.'],
  notes: [
    { why: 'Pipes are how the shell connects commands, and the simplest form of IPC.', mistake: 'Creating the pipe after fork. Parent and child then get two unrelated pipes.' },
    { why: 'A forgotten close is the number-one cause of hung pipe programs.', mistake: 'Closing the wrong end, for example closing <code>fd[1]</code> in the writer before it writes.',
      trace: 'Parent closes fd[0]; child closes fd[1] &nbsp;→&nbsp; parent writes, then closes fd[1] &nbsp;→&nbsp; child\'s read returns 0 (EOF).' },
    { why: 'This is exactly how <code>ls | wc</code> works inside a shell.', mistake: 'Leaving the original <code>fd[0]</code>/<code>fd[1]</code> open after <code>dup2</code>, so EOF never arrives.' },
    { why: 'Named pipes let unrelated programs, such as a logger and a viewer, talk without a shared parent.', mistake: 'Opening a FIFO for reading when no program ever writes. It blocks forever.' },
  ],
  extra: [
    { at: 3, step: {
      title: 'When pipes block, and SIGPIPE',
      html: `<p>A pipe holds about 64 KB. When it is full, the writer <strong>blocks</strong> until a reader makes room. Writing when <em>no</em> reader exists raises <code>SIGPIPE</code>, which kills the writer by default.</p>`,
      why: 'It explains programs that freeze on a slow reader and processes that vanish when their reader exits.',
      mistake: 'Writing a large message to a pipe from the same thread that is supposed to read it.',
      check: { q: 'A writer fills the 64 KB pipe and nobody reads. What happens to the writer?', opts: ['write() blocks until space is freed', 'write() returns 0 and carries on', 'The oldest bytes are silently dropped', 'The pipe grows to fit the data'], ans: 0, exp: 'Pipes have a fixed capacity, so a full pipe makes the writer wait.' } } },
  ],
},

l5_2: {
  analogy: `Two teams share one whiteboard on the wall between their locker rooms. Super fast, no messages to carry. But if both write at once the board becomes unreadable, unless they take turns.`,
  goals: ['Create and map a shared memory object', 'Choose MAP_SHARED or MAP_PRIVATE', 'Protect shared data with a process-shared mutex'],
  recap: ['Shared memory maps one physical page into several processes.', 'Pattern: <code>shm_open</code>, <code>ftruncate</code>, <code>mmap</code>, use, <code>munmap</code>, <code>shm_unlink</code>.', '<code>MAP_SHARED</code> shares writes; <code>MAP_PRIVATE</code> copies on write.', 'You must synchronize yourself; use a process-shared mutex.', 'Store offsets, not raw pointers, in shared memory.'],
  notes: [
    { why: 'When throughput matters (video, databases, games), copying data between processes is too slow.', mistake: 'Assuming it is automatic. You still create, size and map the object yourself.' },
    { why: 'These five calls are the checklist for any shared memory program.', mistake: 'Forgetting <code>ftruncate</code>. Touching a zero-size mapping crashes with SIGBUS.',
      trace: 'shm_open gives fd 3 &nbsp;→&nbsp; ftruncate(3, 4096) &nbsp;→&nbsp; mmap gives pointer p &nbsp;→&nbsp; <code>*p = 42</code> &nbsp;→&nbsp; a second process maps the same name and reads 42.' },
    { why: 'Picking MAP_PRIVATE by mistake means your "shared" memory silently is not shared.', mistake: 'Using MAP_PRIVATE and wondering why the other process never sees your writes.' },
    { why: 'Shared memory is the fastest IPC but gives you no safety net at all.', mistake: 'Putting an ordinary mutex in shared memory. It only works inside one process unless marked process-shared.' },
    { why: 'Parent and child sharing is the easiest way to practice with no names to clean up.', mistake: 'Calling mmap after fork. Each process then gets its own separate mapping.' },
  ],
  extra: [
    { at: 5, step: {
      title: 'Do not store raw pointers',
      html: `<p>Each process may map the object at a <strong>different virtual address</strong>, so a pointer saved by one process is meaningless to another. Store an <strong>index or offset</strong> instead.</p>`
        + codeBlock(`struct node {
    int value;
    int next;          // index into an array: safe
    // struct node *next;   // WRONG in shared memory
};`),
      why: 'Linked lists and queues in shared memory only work if links are offsets.',
      mistake: 'Copying a struct that contains pointers into shared memory and reading it from another process.',
      check: { q: 'Which field is safe inside a struct placed in shared memory?', opts: ['int next_index', 'struct node *next', 'char *name', 'void (*callback)(void)'], ans: 0, exp: 'An index means the same thing in every process. Addresses do not.' } } },
  ],
},

};

// Merge the depth layer into each lesson's steps: intro + (steps with notes, extra steps) + recap.
CHAPTERS.forEach(ch => ch.lessons.forEach(l => {
  const d = LESSON_DEEP[l.id];
  if (!d || !l.steps || l.deepened) return;
  const base = l.steps.map((s, i) => ({ ...s, ...((d.notes && d.notes[i]) || {}) }));
  const extra = d.extra || [];
  const out = [];
  base.forEach((s, i) => {
    extra.filter(e => e.at === i).forEach(e => out.push(e.step));
    out.push(s);
  });
  extra.filter(e => e.at >= base.length).forEach(e => out.push(e.step));
  const intro = { kind: 'intro', title: 'The big picture',
    html: `<p class="lead">${d.analogy}</p><div class="step-label">By the end of this lesson you can</div><ul>${d.goals.map(g => `<li>${g}</li>`).join('')}</ul>` };
  const recap = { kind: 'recap', title: 'Recap',
    html: `<div class="step-label">Cheat sheet</div><ul class="recap-list">${d.recap.map(r => `<li>${r}</li>`).join('')}</ul>` };
  l.steps = [intro, ...out, recap];
  l.deepened = true;
}));
