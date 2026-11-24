// CMPT201 LAB — Written question bank for the Championship and the Free-throws drill.
// short: { type:'short', ch, lesson, q, model, points[] }   (2 pts on the final; 2-3 sentence answers)
// long:  { type:'short'|'code', long:true, ch, q, model, points[] }   (4 pts on the final)
// You self-grade by ticking the key points. Model answers are written from the lessons in this app.

const S = (ch, lesson, q, model, points) => ({ type: 'short', ch, lesson, q, model, points });
const LONG = (ch, type, q, model, points) => ({ type, long: true, ch, q, model, points });

const WRITTEN = {
  short: [
    // ── C fundamentals ──
    S('ch1', 'l1_1', 'What is a pointer, and what does <code>*p</code> do?',
      'A pointer is a variable that stores the memory address of another object. <code>*p</code> dereferences it: it reads or writes the value stored at that address.',
      ['A pointer holds an address (of another variable)', '<code>*p</code> accesses the value at that address (read or write)']),
    S('ch1', 'l1_2', 'What is the difference between the stack and the heap?',
      'The stack holds local variables and call frames; it is managed automatically and freed when the function returns. The heap is memory you request with <code>malloc</code> and must release with <code>free</code>; it lives until you free it.',
      ['Stack: automatic, freed when the function returns', 'Heap: allocated with malloc and freed with free by the programmer', 'Heap data outlives the function that allocated it']),
    S('ch1', 'l1_2', 'What is a memory leak, and how do you avoid one?',
      'A leak is heap memory that was allocated but never freed and can no longer be reached, so it is wasted until the process ends. Avoid it by pairing every <code>malloc</code> with exactly one <code>free</code> on every path.',
      ['Allocated memory that is never freed', 'Fix: free every allocation (one free per malloc, on all paths)']),
    S('ch1', 'l1_1', 'Why does <code>sizeof(arr)</code> give the wrong size inside a function that received an array parameter?',
      'An array parameter decays to a pointer, so <code>sizeof</code> returns the size of the pointer (such as 8 bytes), not of the array. Pass the length as a separate argument.',
      ['The array decays to a pointer', 'sizeof gives the pointer size, not the array size', 'Pass the length separately']),
    // ── Processes and threads ──
    S('ch2', 'l2_1', 'What does <code>fork()</code> return, and to which process?',
      'It returns 0 in the child, the child\'s PID in the parent, and -1 on failure (no child is created).',
      ['0 in the child', 'The child\'s PID in the parent', '-1 on error']),
    S('ch2', 'l2_1', 'What is a zombie process, and how is it removed?',
      'A zombie is a child that has finished but whose exit status has not been collected. It stays in the process table until the parent calls <code>wait()</code> or <code>waitpid()</code>.',
      ['A terminated child still in the process table', 'Removed when the parent calls wait/waitpid (reaps it)']),
    S('ch2', 'l2_2', 'What is the difference between a process and a thread?',
      'A process has its own address space and resources. Threads in the same process share the address space (heap, globals, open files) but each has its own stack and registers, so they communicate easily but need synchronization.',
      ['Processes have separate address spaces', 'Threads share memory and resources within a process', 'Each thread has its own stack']),
    S('ch2', 'l2_2', 'What is a race condition?',
      'A race condition is a bug where the result depends on the unpredictable timing of threads that access shared data without proper synchronization, for example two threads doing <code>x++</code> and losing an update.',
      ['Shared data accessed by several threads', 'Outcome depends on timing/interleaving', 'At least one access is a write, with no synchronization']),
    S('ch2', 'l2_3', 'What does a mutex protect, and what happens if a thread forgets to unlock it?',
      'A mutex protects a critical section so only one thread at a time touches the shared data. If a thread never unlocks it, every other thread that tries to lock it blocks forever (a deadlock).',
      ['Provides mutual exclusion for a critical section', 'Forgetting unlock makes other threads wait forever']),
    S('ch2', 'l2_4', 'What is the difference between a mutex and a semaphore?',
      'A mutex is a lock with an owner: the thread that locks it must unlock it, and it allows one holder at a time. A semaphore is a counter that allows up to N holders and can be posted by a different thread than the one that waited, so it also signals events.',
      ['Mutex: binary lock, owned by the locking thread', 'Semaphore: a counter (N permits)', 'Semaphore can be signalled by another thread']),
    S('ch2', 'l2_4', 'Why must <code>pthread_cond_wait</code> be called inside a <code>while</code> loop that rechecks the condition?',
      'A waiting thread can wake up spuriously, or another thread may have already consumed the condition before it gets the mutex again. Rechecking in a loop makes sure the condition is really true before proceeding.',
      ['Spurious wakeups can happen', 'Condition may change before the thread reacquires the mutex', 'The loop rechecks the predicate']),
    S('ch2', 'l2_5', 'List the four conditions that must hold for a deadlock to occur.',
      'Mutual exclusion, hold and wait, no preemption, and circular wait. Removing any one of them prevents deadlock.',
      ['Mutual exclusion and hold and wait', 'No preemption', 'Circular wait']),
    // ── File systems and I/O ──
    S('ch3', 'l3_1', 'What is a file descriptor?',
      'A small non-negative integer that a process uses to refer to an open file (or pipe or socket). It indexes the process\'s descriptor table, and 0, 1, 2 are stdin, stdout, stderr.',
      ['A small integer identifying an open file/resource', 'Index into the process\'s descriptor table (0, 1, 2 are the standard streams)']),
    S('ch3', 'l3_2', 'Explain the difference between a hard link and a soft (symbolic) link.',
      'A hard link is another directory entry pointing to the same inode, so both names are equal and the data lives until the last link is removed. A soft link is a separate small file that stores a path; if the target is removed it dangles.',
      ['Hard link: another name for the same inode', 'Soft link: a file containing a path to the target', 'Deleting the target breaks a soft link but not a hard link']),
    S('ch3', 'l3_2', 'Explain what an i-node (inode) is.',
      'An inode is the on-disk structure that stores a file\'s metadata (size, owner, permissions, timestamps, link count) and the locations of its data blocks. It does not store the file name; directory entries map names to inode numbers.',
      ['Stores file metadata (size, owner, permissions, times)', 'Points to the file\'s data blocks', 'The name is stored in the directory, not the inode']),
    S('ch3', 'l3_3', 'Give an example function for buffered file I/O and one for unbuffered file I/O.',
      'Buffered: <code>fread</code>, <code>fwrite</code>, <code>fprintf</code>, <code>fgets</code> (stdio). Unbuffered: <code>read</code>, <code>write</code> (system calls on a file descriptor).',
      ['A stdio function such as fread/fwrite/fprintf/fgets', 'A system call such as read/write']),
    S('ch3', 'l3_3', 'Explain why there is a file offset for each open file.',
      'The offset records where the next read or write happens, so successive calls continue sequentially without a position argument. It is kept per open file so independent opens do not disturb one another, while <code>dup</code> and <code>fork</code> share one offset.',
      ['Tracks the position of the next read/write', 'Per open file so separate opens are independent', 'dup/fork share the same offset']),
    S('ch3', 'l3_3', 'Why does buffered I/O usually perform better than unbuffered I/O?',
      'Buffering collects many small reads or writes in memory and performs one large system call, so there are far fewer expensive switches into the kernel.',
      ['Fewer system calls', 'Small operations are batched into large ones']),
    // ── Networking ──
    S('ch4', 'l4_1', 'In a TCP server, what do <code>bind</code>, <code>listen</code> and <code>accept</code> each do?',
      '<code>bind</code> attaches the socket to a local address and port. <code>listen</code> marks it as a passive socket ready to queue incoming connections. <code>accept</code> takes one pending connection and returns a new socket for that client.',
      ['bind: assign local address and port', 'listen: make it passive / start queuing connections', 'accept: returns a new connected socket for one client']),
    S('ch4', 'l4_2', 'Why do you call <code>htons</code> on a port number before putting it in a <code>sockaddr_in</code>?',
      'The network uses big-endian byte order but the host may be little-endian. <code>htons</code> converts a 16-bit host value to network byte order so the port is interpreted correctly.',
      ['Network byte order is big-endian', 'Host byte order may differ (little-endian)', 'htons converts the 16-bit value']),
    S('ch4', 'l4_3', 'What is a passive socket?',
      'A passive socket is a listening socket created with <code>socket</code>, <code>bind</code> and <code>listen</code>. It only waits for incoming connections; <code>accept</code> on it returns new active sockets, and data is never read or written on the passive one.',
      ['A listening socket (after listen)', 'Only accepts connections; no data transfer on it', 'accept returns a new active socket']),
    S('ch4', 'l4_3', 'What is the difference between a stream socket and a datagram socket?',
      'A stream socket (<code>SOCK_STREAM</code>, TCP) is connection-oriented, reliable and ordered, a byte stream without message boundaries. A datagram socket (<code>SOCK_DGRAM</code>, UDP) is connectionless and message-based, with no guarantee of delivery, order or duplicates.',
      ['Stream: connection, reliable, ordered byte stream', 'Datagram: connectionless, separate messages', 'Datagram gives no delivery/order guarantee']),
    S('ch4', 'l4_3', 'Explain the purpose of the epoll API.',
      'epoll lets one thread monitor many file descriptors and be told which ones are ready for I/O, scaling better than <code>select</code> and <code>poll</code> because the kernel keeps the interest list and returns only the ready descriptors.',
      ['Monitor many file descriptors from one thread', 'Reports which are ready (readable/writable)', 'Scales better than select/poll']),
    // ── IPC ──
    S('ch5', 'l5_1', 'What is the difference between a pipe and a FIFO?',
      'A pipe is anonymous and has no name in the file system, so it can only be shared by related processes that inherit it (such as parent and child). A FIFO (named pipe) has a name in the file system, so unrelated processes can open it.',
      ['Pipe: anonymous, only related processes (inherited)', 'FIFO: has a filesystem name, unrelated processes can use it']),
    S('ch5', 'l5_1', 'Why should each process close the pipe ends it does not use?',
      'So that the reader sees end-of-file when all write ends are closed, and so descriptors are not leaked. If a spare write end stays open, the reader\'s <code>read</code> blocks forever.',
      ['Reader only gets EOF when every write end is closed', 'Otherwise read can block forever', 'Avoids leaking descriptors']),
    S('ch5', 'l5_1', 'What does <code>dup2(oldfd, newfd)</code> do?',
      'It makes <code>newfd</code> refer to the same open file as <code>oldfd</code>, closing <code>newfd</code> first if it was open. It is used to redirect standard input or output, for example to a pipe.',
      ['newfd becomes a copy of oldfd (same open file)', 'Closes newfd first if open', 'Used to redirect stdin/stdout']),
    S('ch5', 'l5_2', 'Why is a raw pointer unsafe inside shared memory?',
      'Each process may map the region at a different virtual address, so an address stored by one process is meaningless in another. Store offsets or indexes instead.',
      ['Mappings can be at different addresses per process', 'Use offsets/indexes instead']),
    S('ch5', 'l5_2', 'When would you choose shared memory over a pipe?',
      'When you need high throughput or random access to a large amount of data, since shared memory avoids copying through the kernel. The cost is that you must add your own synchronization.',
      ['Faster: no copy through the kernel', 'Random access to large data', 'Needs its own synchronization']),
    S('ch5', 'l5_3', 'What is the difference between file mapping and anonymous mapping in <code>mmap()</code>?',
      'A file mapping is backed by a file you pass via a file descriptor, so its contents come from the file and shared writes go back to it. An anonymous mapping (<code>MAP_ANONYMOUS</code>, fd -1) has no file; it is fresh zero-filled memory.',
      ['File mapping: backed by a file (fd)', 'Anonymous mapping: no file, zero-filled memory', 'Anonymous shared memory only reaches related processes (fork)']),
    S('ch5', 'l5_3', 'What is the purpose of <code>ftruncate()</code> for shared memory?',
      'A new object from <code>shm_open</code> has size 0. <code>ftruncate</code> sets its size so it can be mapped and used; touching memory beyond the size causes SIGBUS.',
      ['shm_open creates a size-0 object', 'ftruncate sets the size', 'Without it, access past the size gives SIGBUS']),
    // ── Security and crypto (bonus topic) ──
    S('ch6', 'l6_1', 'What does CIA stand for in security?',
      'Confidentiality (only authorised parties can read), Integrity (data cannot be changed undetected), and Availability (the system is usable when needed).',
      ['Confidentiality', 'Integrity', 'Availability']),
    S('ch6', 'l6_1', 'Explain what a window of validity means.',
      'It is the period of time during which something (a token, one-time code, signature or certificate) is accepted. Outside the window it is rejected, which limits replay attacks and stolen credentials.',
      ['A bounded time span in which something is accepted', 'Outside it, the item is rejected/expired', 'Limits replay or misuse of stolen items']),
    S('ch6', 'l6_1', 'What is the difference between a private and a public cryptographic algorithm?',
      'A public algorithm is openly published and reviewed, so its security rests only on the secret key (Kerckhoffs\'s principle). A private (proprietary) one depends on keeping the design secret, which is fragile once it leaks.',
      ['Public: published and peer-reviewed', 'Security depends only on the key (Kerckhoffs)', 'Private: relies on secrecy of the design']),
    S('ch6', 'l6_2', 'Explain what strong collision resistance means.',
      'It means it is computationally infeasible to find <em>any</em> two different inputs x and y with the same hash value H(x) = H(y).',
      ['Hard to find any two different inputs with the same hash', 'The attacker may choose both inputs (stronger than second-preimage)']),
    S('ch6', 'l6_2', 'You want others to verify that your posted photo was not edited. What crypto primitives can you use?',
      'Hash the photo and sign the hash with your private key to make a digital signature. Post the signature (and your public key or certificate) with the photo; anyone can recompute the hash and verify the signature with your public key.',
      ['A cryptographic hash of the photo', 'A digital signature made with your private key', 'Others verify using your public key']),
  ],

  long: [
    LONG('ch2', 'code',
      'Two threads run in parallel and must print "ping" and "pong" alternately, with "ping" always first. They use the semaphores <code>sem_ping</code> and <code>sem_pong</code>. Give the initial values and the correct <code>sem_wait</code>/<code>sem_post</code> calls at the four marked places.'
      + codeBlock(`void *ping(void *arg) {
    for (int i = 0; i < 10; i++) {
        // (1)
        printf("ping\\n");
        // (2)
    }
}
void *pong(void *arg) {
    for (int i = 0; i < 10; i++) {
        // (3)
        printf("pong\\n");
        // (4)
    }
}`),
      `sem_init(&sem_ping, 0, 1);
sem_init(&sem_pong, 0, 0);

// (1) sem_wait(&sem_ping);
// (2) sem_post(&sem_pong);
// (3) sem_wait(&sem_pong);
// (4) sem_post(&sem_ping);`,
      ['sem_ping starts at 1 and sem_pong at 0', '(1) ping waits on sem_ping', '(2) ping posts sem_pong', '(3) pong waits on sem_pong and (4) posts sem_ping']),
    LONG('ch2', 'short',
      'Two threads T1 and T2 both run <code>update(3, 4)</code> at the same time on two cores. The shared global is <code>int x = 0;</code> and <code>update</code> does <code>x += v1 * v2;</code> with no locking. What are the possible final values of <code>x</code>? Explain how you reach each.',
      'Each thread does load x, add 12, store x. If one thread completes before the other starts, the result is 0 + 12 + 12 = <strong>24</strong>. If both load x = 0 before either stores, each stores 0 + 12, so the second store overwrites the first and the result is <strong>12</strong> (a lost update). No interleaving gives any other value.',
      ['Identifies <code>x += ...</code> as load, add, store (not atomic)', 'Serial execution gives 24', 'Both load 0 then store gives 12 (lost update)', 'States that only 12 and 24 are possible']),
    LONG('ch2', 'short',
      'Thread T1 runs <code>access(&a); access(&b);</code> and thread T2 runs <code>access(&b); access(&c); access(&a);</code>. <code>access</code> locks the variable it is given and keeps the lock until the thread finishes. (a) Explain why the two threads can deadlock. (b) Change T2 to avoid the deadlock without new variables, structures or locks.',
      '(a) T1 can hold <code>a</code> and wait for <code>b</code> while T2 holds <code>b</code> and waits for <code>a</code>. Each thread holds a lock the other needs and neither can proceed: a circular wait. (b) Make T2 take the locks in the same order as T1: <code>access(&a); access(&b); access(&c);</code>. A global lock order removes the circular wait.',
      ['(a) T1 holds a and waits for b', '(a) T2 holds b and waits for a (circular wait)', '(b) T2 accesses a before b (same order as T1)', '(b) Explains that a consistent lock order prevents the cycle']),
    LONG('ch2', 'short',
      'What does this program print on a terminal? Explain the order.'
      + codeBlock(`int main() {
    printf("A\\n");
    if (fork() == 0) {
        printf("B\\n");
    } else {
        wait(NULL);
        printf("C\\n");
    }
    printf("D\\n");
    return 0;
}`),
      'It prints <code>A B D C D</code> on separate lines. A is printed once before the fork (a terminal is line buffered, so it is already flushed). The child prints B then D and exits. The parent was blocked in <code>wait</code>, so only afterwards it prints C then D. If stdout were redirected to a file, A would sit in the buffer and be printed twice.',
      ['A printed once, before the fork', 'Child prints B then D', 'Parent waits, then prints C then D', 'Final order A B D C D (and the buffered-stdout caveat for a file)']),
    LONG('ch4', 'code',
      'This TCP server should print everything clients send. Find four problems and fix each.'
      + codeBlock(`int main() {
    struct sockaddr_in addr;
    int sfd = socket(AF_INET, SOCK_STREAM, 0);
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET;
    addr.sin_port = 8000;
    addr.sin_addr.s_addr = INADDR_ANY;
    bind(sfd, (struct sockaddr *)&addr, sizeof addr);
    for (;;) {
        accept(sfd, NULL, NULL);
        char buf[64];
        ssize_t n;
        while ((n = read(sfd, buf, 64)) > 0)
            write(STDOUT_FILENO, buf, n);
    }
}`),
      `addr.sin_port = htons(8000);        // 1. network byte order
bind(sfd, (struct sockaddr *)&addr, sizeof addr);
listen(sfd, 5);                      // 2. missing: make it passive
for (;;) {
    int cfd = accept(sfd, NULL, NULL);   // 3. keep accept's result
    char buf[64];
    ssize_t n;
    while ((n = read(cfd, buf, 64)) > 0) // 3. read from cfd, not sfd
        write(STDOUT_FILENO, buf, n);
    close(cfd);                      // 4. close the client socket
}`,
      ['Port needs <code>htons(8000)</code>', 'Missing <code>listen</code> after bind', 'Must save the descriptor returned by accept and read from it, not from the listening socket', 'Close the client socket when done']),
    LONG('ch5', 'code',
      'Write a program that forks a child and talks to it over a pipe. The parent must write to its <em>standard output</em> to send data, and the child must read from its <em>standard input</em>. The parent sends "Hello, world!" and the child prints it to its own standard output. Use <code>pipe</code> and <code>dup2</code>; ignore error handling.',
      `int fd[2];
pipe(fd);
if (fork() == 0) {                 // child
    close(fd[1]);
    dup2(fd[0], STDIN_FILENO);
    close(fd[0]);
    char buf[64];
    ssize_t n = read(STDIN_FILENO, buf, sizeof buf);
    write(STDOUT_FILENO, buf, n);
} else {                           // parent
    close(fd[0]);
    dup2(fd[1], STDOUT_FILENO);
    close(fd[1]);
    write(STDOUT_FILENO, "Hello, world!", 13);
    close(STDOUT_FILENO);
    wait(NULL);
}`,
      ['Creates the pipe before fork', 'Child redirects the read end onto stdin with dup2', 'Parent redirects the write end onto stdout with dup2', 'Parent writes the string; child reads stdin and writes it to stdout', 'Closes the unused or duplicated ends (and parent waits)']),
    LONG('ch5', 'code',
      'Write the code for a process that creates a POSIX shared memory object named "/lab" big enough for one <code>int</code>, maps it so other processes can see changes, stores 42, and cleans up. Ignore error handling.',
      `int fd = shm_open("/lab", O_CREAT | O_RDWR, 0600);
ftruncate(fd, sizeof(int));
int *p = mmap(NULL, sizeof(int), PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
*p = 42;
munmap(p, sizeof(int));
close(fd);
shm_unlink("/lab");`,
      ['<code>shm_open</code> with O_CREAT | O_RDWR', '<code>ftruncate</code> to set the size', '<code>mmap</code> with PROT_READ | PROT_WRITE and MAP_SHARED', 'Writes through the pointer (42)', 'Cleans up with munmap and shm_unlink']),
    LONG('ch4', 'code',
      'Sketch the main loop of an epoll-based TCP server. The listening socket <code>lfd</code> and the epoll instance <code>ep</code> already exist and <code>lfd</code> is registered. Accept new clients and read from existing ones; close a client when it disconnects.',
      `struct epoll_event ev, evs[64];
for (;;) {
    int n = epoll_wait(ep, evs, 64, -1);
    for (int i = 0; i < n; i++) {
        int fd = evs[i].data.fd;
        if (fd == lfd) {
            int c = accept(lfd, NULL, NULL);
            ev.events = EPOLLIN;
            ev.data.fd = c;
            epoll_ctl(ep, EPOLL_CTL_ADD, c, &ev);
        } else {
            char buf[256];
            ssize_t r = read(fd, buf, sizeof buf);
            if (r <= 0) close(fd);
            else write(STDOUT_FILENO, buf, r);
        }
    }
}`,
      ['Loops on <code>epoll_wait</code> and iterates over the ready events', 'If the ready fd is the listening socket: accept and add the new fd with epoll_ctl', 'Otherwise read from the client fd', 'Closes the fd when read returns 0 or an error']),
    LONG('ch1', 'code',
      'Write a function <code>int *make_range(int n)</code> that returns a heap-allocated array containing 0, 1, ..., n-1. Then show how the caller uses it and avoids a memory leak.',
      `int *make_range(int n) {
    int *a = malloc(n * sizeof(int));
    if (a == NULL) return NULL;
    for (int i = 0; i < n; i++) a[i] = i;
    return a;
}

int *r = make_range(5);
printf("%d\\n", r[4]);
free(r);`,
      ['Allocates n * sizeof(int) bytes with malloc (not a local array)', 'Fills the array correctly', 'Returns the pointer (checks for NULL)', 'Caller frees it with free']),
    LONG('ch6', 'short',
      'Describe step by step how you would let anyone verify that a photo you posted has not been modified, and say why a hash alone is not enough.',
      'Compute a cryptographic hash of the photo, then sign the digest with your <strong>private</strong> key to make a digital signature. Post the photo, the signature and your public key (or certificate). A reader recomputes the hash of the photo they downloaded and verifies the signature with your public key; any edit changes the hash, so verification fails. A hash alone is not enough because an attacker can edit the photo and post a new, matching hash; only the private-key signature cannot be forged.',
      ['Hash the photo', 'Sign the hash with the private key', 'Verifier recomputes the hash and checks with the public key', 'Explains that a lone hash can be replaced along with the photo']),
  ],
};
