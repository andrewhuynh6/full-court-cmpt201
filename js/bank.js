// CMPT201 LAB — Written question bank for the Championship and the Free-throws drill.
// short: { type:'short', ch, lesson, q, model, points[] }   (2 pts on the final; 2-3 sentence answers)
// long:  { type:'short'|'code', long:true, ch, q, model, points[] }   (4 pts on the final)
// You self-grade by ticking the key points. Model answers use only what the lessons teach.

const S = (ch, lesson, q, model, points) => ({ type: 'short', ch, lesson, q, model, points });
const LONG = (ch, type, q, model, points) => ({ type, long: true, ch, q, model, points });

const WRITTEN = {
  short: [
    // ── Topic 1: Systems & Processes ──
    S('t1', 'tour', 'What is the difference between user mode and kernel mode?',
      'Kernel mode (Ring 0) runs the kernel with full access to the hardware. User mode runs applications and blocks privileged instructions and access to kernel memory; applications ask the kernel for services through system calls.',
      ['Kernel mode has full access to the hardware', 'User mode is restricted (no privileged instructions or kernel memory)', 'Applications reach the kernel through system calls']),
    S('t1', 'tour', 'Why does a computer have a memory hierarchy with caches?',
      'The CPU is much faster than main memory, and fast memory is small and expensive while big memory is slow and cheap. Registers and caches close to the CPU keep recently used data, so the CPU feels like it has a large fast memory.',
      ['The CPU is much faster than main memory', 'Small fast memory (registers, caches) sits near the CPU', 'Bigger memory is slower but cheaper']),
    S('t1', 'sleep', 'What is the difference between a program and a process?',
      'A program is a file on disk holding machine code. A process is a program that has been loaded into memory and is running, with its own memory space.',
      ['A program is a file (on disk)', 'A process is a program loaded into memory and running']),
    S('t1', 'forkexec', 'What does <code>fork()</code> return, and to which process?',
      'It returns 0 in the child, the child\'s PID in the parent, and -1 on failure (no child is created).',
      ['0 in the child', 'The child\'s PID in the parent', '-1 on error']),
    S('t1', 'forkexec', 'What does <code>exec()</code> do to the calling process?',
      'It replaces the process\'s memory with a new program. The old program is discarded, so on success the code after the call never runs.',
      ['Loads a different program into the process', 'The old program is replaced (discarded)', 'It does not return on success']),
    S('t1', 'waiterrno', 'What is a zombie process, and how is it removed?',
      'A zombie is a child that has terminated but whose parent has not yet waited on it, so the OS still keeps its state. It is removed when the parent calls <code>wait()</code> or <code>waitpid()</code>.',
      ['A terminated child that has not been waited on', 'Removed when the parent calls wait/waitpid']),
    S('t1', 'waiterrno', 'What is an orphan process, and what happens to it on Linux?',
      'An orphan is a process whose parent has terminated. On Linux it becomes a child of <code>init</code>, which calls <code>wait()</code> on its children.',
      ['A process whose parent terminated', 'It is adopted by init', 'init calls wait on it']),
    S('t1', 'signals', 'How does a program handle SIGINT in C?',
      'Write a handler <code>void h(int signum)</code>, fill a <code>struct sigaction</code> (set <code>.sa_handler</code>, <code>.sa_flags</code>, and clear <code>.sa_mask</code> with <code>sigemptyset</code>), then register it with <code>sigaction(SIGINT, &amp;act, NULL)</code>.',
      ['Write a handler taking an int signal number', 'Fill struct sigaction (sa_handler, flags, mask)', 'Register it with sigaction(SIGINT, ...)']),
    S('t1', 'signals', 'Why should a signal handler call <code>write()</code> and not <code>printf()</code>?',
      'A handler can interrupt the program at any point, so it must only call async-signal-safe functions. <code>write()</code> is signal safe; <code>printf()</code> is not.',
      ['A handler may interrupt the program at any time', 'Only async-signal-safe functions are allowed', 'write is safe; printf is not']),
    // ── Topic 2: Scheduling & Memory ──
    S('t2', 'scheduling', 'What is the difference between preemptive and non-preemptive scheduling?',
      'In non-preemptive scheduling a process keeps the CPU until it finishes or blocks (for I/O, wait or sleep). In preemptive scheduling the kernel can stop a running process at any time and run another.',
      ['Non-preemptive: runs until it finishes or blocks', 'Preemptive: the kernel can stop it at any time']),
    S('t2', 'scheduling', 'What goes wrong in Round Robin if the quantum is too short?',
      'Context switches happen so often that their overhead becomes too high, and the CPU spends much of its time switching instead of running processes.',
      ['Too many context switches', 'The switching overhead becomes too high']),
    S('t2', 'scheduling', 'What is starvation, and in which scheduling approach can it occur?',
      'Starvation is when a process never gets to run. In priority scheduling, if high-priority processes keep arriving, low-priority processes may never run.',
      ['A process may never run', 'Happens in priority scheduling', 'Caused by higher-priority processes arriving continually']),
    S('t2', 'memmgmt', 'What is external fragmentation, and how does coalescing help?',
      'External fragmentation is when free memory is split into many small pieces, so no single block is big enough even if the total is. Coalescing merges consecutive free blocks into one bigger block.',
      ['Free space split into small pieces', 'No single block big enough even if the total is', 'Coalescing merges consecutive free blocks']),
    S('t2', 'memmgmt', 'Compare first fit and best fit allocation.',
      'First fit takes the first free block that is big enough: simple and fast, but it can leave small blocks at the start of the list. Best fit takes the smallest block that is big enough: it must search the whole list and can leave many tiny blocks.',
      ['First fit: first big-enough block (simple, fast)', 'Best fit: smallest big-enough block', 'Best fit searches the whole list / leaves tiny blocks']),
    S('t2', 'virtmem', 'What is virtual memory, and what is one benefit?',
      'Virtual memory gives each process its own virtual address space, which the OS and hardware map to physical memory. A benefit is isolation: a process sees only its own memory. It also lets the OS swap unused pages to disk.',
      ['Each process has its own virtual address space', 'The OS and hardware map it to physical memory', 'A benefit: isolation or swapping unused pages']),
    S('t2', 'virtmem', 'Explain how a virtual address is translated to a physical address with paging.',
      'Split the virtual address into a page number and an offset. Look up the page number in the process\'s page table to get the page frame number. The physical address is the frame number combined with the unchanged offset.',
      ['Split into page number and offset', 'Look up the page number in the page table to get a frame', 'The offset stays unchanged']),
    S('t2', 'virtmem', 'What is a page fault, and what is thrashing?',
      'A page fault happens when a program accesses a page that is not in memory, so the OS must bring it in. Thrashing is when the OS keeps swapping pages in and out because the process touches too much memory.',
      ['Page fault: accessed page not in memory', 'Thrashing: constant swapping of pages in and out']),
    // ── Topic 3: Threads & Synchronization ──
    S('t3', 'threads', 'What do threads of one process share, and what does each thread have of its own?',
      'Threads share the text, data, BSS and heap segments (and so global variables). Each thread has its own stack, registers, program counter and errno.',
      ['Share text, data, BSS and heap', 'Own stack', 'Own registers, program counter and errno']),
    S('t3', 'threads', 'What is a data race?',
      'A data race is when two threads may access the same data at the same time without protection and at least one writes, so the result depends on timing. For example, <code>counter++</code> is load, increment, store and can lose an update.',
      ['Two threads access the same data at the same time', 'At least one writes, with no protection', 'The result depends on timing (lost update)']),
    S('t3', 'mutex', 'List the four necessary conditions for deadlock.',
      'Hold and wait, circular wait, mutual exclusion, and no preemption. Breaking any one of them prevents deadlock.',
      ['Hold and wait and circular wait', 'Mutual exclusion', 'No preemption']),
    S('t3', 'mutex', 'What is the difference between thread safe and reentrant?',
      'A thread-safe function either uses no shared resources or protects its critical sections, so it works with several threads. A reentrant function can also be called again while it is running (for example from a signal handler on the same thread).',
      ['Thread safe: no shared resources or protected critical sections', 'Reentrant: can be re-entered while running', 'Reentrant must also be thread safe']),
    S('t3', 'patterns', 'Why must <code>pthread_cond_wait</code> be called inside a <code>while</code> loop?',
      'After waking, the condition may no longer be true, because another thread may have taken the data first. A while loop rechecks the predicate before continuing.',
      ['The condition may be false again after waking', 'Another thread may have consumed the data', 'The loop rechecks the predicate']),
    S('t3', 'patterns', 'What is the difference between a mutex and a semaphore?',
      'A mutex is binary: it is either available or not and gives mutual exclusion. A semaphore holds a count of how many are available, so it can allow several holders and can be used to signal between threads.',
      ['Mutex is binary (available or not)', 'Semaphore holds a count', 'Semaphore can signal between threads']),
    // ── Topic 4: File I/O ──
    S('t4', 'fileio', 'Why does <code>fprintf()</code> usually perform better than <code>write()</code>?',
      'fprintf buffers data in user space and calls write later, so it makes fewer system calls and has less overhead.',
      ['It buffers data in a user-space buffer', 'Fewer system calls (less overhead)']),
    S('t4', 'fileio', 'Give an example function for buffered file I/O and one for unbuffered file I/O.',
      'Buffered: <code>fprintf</code>, <code>fscanf</code>, <code>fputs</code> or <code>fgets</code> (stdio). Unbuffered: <code>read</code> or <code>write</code> (system calls on a file descriptor).',
      ['A stdio function such as fprintf/fgets', 'A system call such as read/write']),
    S('t4', 'fileio', 'Explain why there is a file offset for each open file.',
      'The offset records where the next read or write happens, so successive calls continue sequentially without a position argument. It is kept per open file so separate opens are independent, while <code>dup</code> and <code>fork</code> share one offset.',
      ['Tracks the position of the next read/write', 'Per open file, so separate opens are independent', 'dup/fork share the same offset']),
    S('t4', 'fileio', 'What is the difference between <code>fflush()</code> and <code>fsync()</code>?',
      '<code>fflush()</code> sends the data in the user-space stdio buffer to the kernel. <code>fsync()</code> forces the kernel to flush its own buffer to disk.',
      ['fflush flushes the user-level stdio buffer to the kernel', 'fsync flushes the kernel buffer to disk']),
    S('t4', 'filesys', 'Explain the difference between a hard link and a soft (symbolic) link.',
      'A hard link is another name for the same i-node (same file), so the data stays until the last link is removed. A soft link is a separate file with its own i-node whose content is a path to the target; it dangles if the target is deleted.',
      ['Hard link: another name for the same i-node', 'Soft link: a separate file containing a path', 'Deleting the target breaks a soft link but not a hard link']),
    S('t4', 'filesys', 'Explain what an i-node is.',
      'An i-node stores a file\'s metadata (type, permissions, owner, timestamps) and is identified by a number. The file name is not in the i-node; a directory entry maps a name to the i-node number.',
      ['Stores file metadata (type, permissions, owner, timestamps)', 'Identified by an i-node number', 'The name is stored in the directory, not the i-node']),
    // ── Topic 5: Networking ──
    S('t5', 'sockets', 'What do <code>bind</code>, <code>listen</code> and <code>accept</code> each do in a TCP server?',
      '<code>bind</code> assigns an address and port to the socket. <code>listen</code> makes it a passive socket that waits for connections. <code>accept</code> returns a new socket for one connected client.',
      ['bind: assign the address and port', 'listen: make it passive', 'accept: returns a new socket for the client']),
    S('t5', 'sockets', 'What is the difference between a stream socket and a datagram socket?',
      'A stream socket (<code>SOCK_STREAM</code>, TCP) is connection-oriented with in-order delivery. A datagram socket (<code>SOCK_DGRAM</code>, UDP) is connectionless: each message is sent separately with <code>sendto</code>, with no connection or protection.',
      ['Stream: TCP, connection-oriented, in-order', 'Datagram: UDP, connectionless', 'Datagram messages are sent individually (sendto/recvfrom)']),
    S('t5', 'sockets', 'What is a passive socket?',
      'A passive socket is the listening socket of a TCP server, made with <code>socket</code>, <code>bind</code> and <code>listen</code>. It only waits for connections; <code>accept</code> returns new sockets for the data.',
      ['The listening socket (after listen)', 'Only used to accept connections', 'accept returns a new socket for communication']),
    S('t5', 'afinet', 'Why do you call <code>htons</code> on a port number before putting it in a <code>sockaddr_in</code>?',
      'The network uses big-endian byte order, but the host may be little-endian. <code>htons</code> converts the 16-bit port from host to network byte order.',
      ['Network byte order is big-endian', 'The host may be little-endian', 'htons converts the 16-bit value']),
    S('t5', 'multiclient', 'Explain the purpose of the epoll API.',
      'epoll lets one thread watch many file descriptors and be notified by the kernel when some are ready for I/O, with no thread per client and no polling. The calls are <code>epoll_create</code>, <code>epoll_ctl</code> and <code>epoll_wait</code>.',
      ['Monitor many descriptors from one thread', 'The kernel notifies which are ready (no polling)', 'epoll_create, epoll_ctl, epoll_wait']),
    S('t5', 'multiclient', 'Compare a thread per client with I/O multiplexing for serving many clients.',
      'A thread per client is simple but many threads use too much memory and kernel overhead. I/O multiplexing (select, poll, epoll) has no thread overhead and no polling, but the code is more complex.',
      ['Thread per client: simple but too many resources', 'Multiplexing: no thread overhead or polling', 'Multiplexing: more complex code']),
    // ── Topic 6: IPC ──
    S('t6', 'pipes', 'What is the difference between a pipe and a FIFO?',
      'A pipe is anonymous and is shared by related processes through <code>fork()</code>. A FIFO has a pathname created with <code>mkfifo</code>, so unrelated processes can open it.',
      ['Pipe: anonymous, related processes', 'FIFO: has a pathname, unrelated processes can use it']),
    S('t6', 'pipes', 'Why should each process close the pipe ends it does not use?',
      'The reader only gets end-of-file (<code>read()</code> returns 0) when all write ends are closed. If a spare write end stays open, the reader waits forever.',
      ['EOF only when all write ends are closed', 'Otherwise read can block forever']),
    S('t6', 'pipes', 'What does <code>dup2(oldfd, newfd)</code> do?',
      'It makes <code>newfd</code> a copy of <code>oldfd</code>, so, for example, <code>dup2(filedes[1], STDOUT_FILENO)</code> sends standard output into the pipe.',
      ['newfd becomes a copy of oldfd', 'Used to redirect stdin/stdout, for example to a pipe']),
    S('t6', 'shm', 'What is the difference between file mapping and anonymous mapping in <code>mmap()</code>?',
      'A file mapping is backed by a file (given by an fd), so file I/O becomes memory access. An anonymous mapping (<code>MAP_ANONYMOUS</code>, fd -1) has no file; it is just new memory.',
      ['File mapping: backed by a file (fd)', 'Anonymous mapping: no file (MAP_ANONYMOUS, fd = -1)', 'Anonymous mapping is just new memory']),
    S('t6', 'shm', 'What is the purpose of <code>ftruncate()</code> for shared memory?',
      'A new shared memory object from <code>shm_open</code> has size 0. <code>ftruncate</code> sets its size so it can be mapped and used.',
      ['shm_open creates an object of size 0', 'ftruncate sets the size']),
    S('t6', 'shm', 'When would you use <code>shm_open()</code> and when a shared anonymous mapping?',
      'Use a shared anonymous mapping (<code>MAP_SHARED | MAP_ANONYMOUS</code> before <code>fork</code>) for related processes such as parent and child. Use <code>shm_open</code>, <code>ftruncate</code> and <code>mmap</code> for unrelated processes.',
      ['Anonymous shared mapping: related processes (parent/child)', 'shm_open: unrelated processes']),
    // ── Bonus: security and crypto ──
    S('tb', 'l6_1', 'What does CIA stand for in security?',
      'Confidentiality (only authorised parties can read), Integrity (data cannot be changed undetected), and Availability (the system is usable when needed).',
      ['Confidentiality', 'Integrity', 'Availability']),
    S('tb', 'l6_1', 'Explain what a window of validity means.',
      'It is the period of time during which something (a token, one-time code, signature or certificate) is accepted. Outside the window it is rejected, which limits replay attacks and stolen credentials.',
      ['A bounded time span in which something is accepted', 'Outside it, the item is rejected/expired', 'Limits replay or misuse of stolen items']),
    S('tb', 'l6_1', 'What is the difference between a private and a public cryptographic algorithm?',
      'A public algorithm is openly published and reviewed, so its security rests only on the secret key (Kerckhoffs\'s principle). A private (proprietary) one depends on keeping the design secret, which is fragile once it leaks.',
      ['Public: published and peer-reviewed', 'Security depends only on the key (Kerckhoffs)', 'Private: relies on secrecy of the design']),
    S('tb', 'l6_2', 'Explain what strong collision resistance means.',
      'It means it is computationally infeasible to find <em>any</em> two different inputs x and y with the same hash value H(x) = H(y).',
      ['Hard to find any two different inputs with the same hash', 'The attacker may choose both inputs (stronger than second-preimage)']),
    S('tb', 'l6_2', 'You want others to verify that your posted photo was not edited. What crypto primitives can you use?',
      'Hash the photo and sign the hash with your private key to make a digital signature. Post the signature (and your public key or certificate) with the photo; anyone can recompute the hash and verify the signature with your public key.',
      ['A cryptographic hash of the photo', 'A digital signature made with your private key', 'Others verify using your public key']),
  ],

  long: [
    LONG('t1', 'code',
      'Write a program in which the parent forks a child, the child runs <code>ls -a -l</code> with <code>execl</code>, and the parent waits with <code>waitpid</code> and prints the child\'s exit status if it exited normally.',
      `pid_t pid = fork();
if (pid == 0) {                                  // child
    if (execl("/usr/bin/ls", "/usr/bin/ls", "-a", "-l", (char *)NULL) == -1) {
        perror("execl");
        exit(EXIT_FAILURE);
    }
} else {                                         // parent
    int wstatus = 0;
    if (waitpid(pid, &wstatus, 0) == -1) {
        perror("waitpid");
        exit(EXIT_FAILURE);
    }
    if (WIFEXITED(wstatus))
        printf("Exit status: %d\\n", WEXITSTATUS(wstatus));
}`,
      ['Calls fork and branches on pid == 0 for the child', 'Child calls execl with arg0 repeated and a NULL terminator', 'Parent calls waitpid(pid, &wstatus, 0)', 'Checks WIFEXITED and prints WEXITSTATUS']),
    LONG('t1', 'code',
      'Write the code to install a handler so that Ctrl-C (SIGINT) prints "CTRL-C pressed", then loop forever calling <code>sleep(1)</code>. Use only signal-safe output.',
      `void handler(int signum) {
    write(STDOUT_FILENO, "CTRL-C pressed\\n", 15);
}

int main() {
    struct sigaction act;
    act.sa_handler = handler;
    act.sa_flags = 0;
    sigemptyset(&act.sa_mask);
    sigaction(SIGINT, &act, NULL);
    while (1) {
        sleep(1);
    }
}`,
      ['Handler takes an int and returns void', 'Uses write (signal safe), not printf', 'Fills struct sigaction (sa_handler, sa_flags, sigemptyset on sa_mask)', 'Registers with sigaction(SIGINT, ...) and loops with sleep']),
    LONG('t2', 'short',
      'Three processes: P1 (run time 5, arrives at 0), P2 (run time 3, arrives at 1), P3 (run time 1, arrives at 2). Compute the total waiting time under FCFS and under non-preemptive SJF. Show the schedule.',
      'FCFS: P1 runs 0-5, P2 5-8, P3 8-9. Waits: P1 0, P2 5 - 1 = 4, P3 8 - 2 = 6. Total <strong>10</strong>. SJF: P1 runs 0-5 (the only job at time 0). At 5, P3 (1) is shorter than P2 (3), so P3 runs 5-6 and P2 6-9. Waits: P1 0, P3 5 - 2 = 3, P2 6 - 1 = 5. Total <strong>8</strong>. SJF is lower because the short job does not wait behind the longer one.',
      ['FCFS order P1, P2, P3 with the waits 0, 4, 6', 'FCFS total 10', 'SJF order P1, P3, P2 with the waits 0, 3, 5', 'SJF total 8 (and why it is lower)']),
    LONG('t2', 'short',
      'The free list is, in order, A (80 bytes), B (40 bytes) and C (120 bytes). A request for 35 bytes arrives (ignore headers). Which block is chosen by first fit, best fit and worst fit? Explain each.',
      '<strong>First fit</strong> takes the first big-enough block in the list: A (80). <strong>Best fit</strong> takes the smallest block that is big enough: B (40). <strong>Worst fit</strong> takes the largest block: C (120). Best and worst fit must search the whole list; first fit stops at the first match.',
      ['First fit chooses A (first big enough)', 'Best fit chooses B (smallest big enough)', 'Worst fit chooses C (largest)', 'Notes that best and worst fit search the whole list']),
    LONG('t2', 'short',
      'Pages are 16 bytes and addresses are 6 bits. The page table maps page 11 to frame 01. Translate the virtual address <code>110101</code>. Then count the page faults for the accesses 1, 2, 3, 1, 4, 2 with 3 frames under LRU and under FIFO.',
      '16-byte pages mean a 4-bit offset, so the page number is the top 2 bits: <code>11</code>, offset <code>0101</code>. Page 11 maps to frame 01, so the physical address is <code>01</code> + <code>0101</code> = <code>010101</code>. <strong>LRU</strong>: faults on 1, 2, 3; 1 hits; 4 evicts 2 (least recently used); 2 faults again: <strong>5 faults</strong>. <strong>FIFO</strong>: faults on 1, 2, 3; 1 hits; 4 evicts 1 (oldest); 2 is still in memory: <strong>4 faults</strong>.',
      ['Splits the address into page 11 and offset 0101', 'Physical address 010101 (frame 01 plus unchanged offset)', 'LRU gives 5 faults', 'FIFO gives 4 faults']),
    LONG('t3', 'short',
      'Two threads T1 and T2 both run <code>update(3, 4)</code>, which does <code>x += v1 * v2;</code> on a global <code>int x = 0;</code> with no locking. What are the possible final values of <code>x</code>? Explain how you reach each.',
      'The update is load x, add 12, store x. If one thread finishes before the other starts, the result is 12 + 12 = <strong>24</strong>. If both load x = 0 before either stores, each stores 0 + 12 = 12, so the second store overwrites the first and the result is <strong>12</strong> (a lost update). No other value is possible.',
      ['Identifies the update as load, add, store (not atomic)', 'Serial execution gives 24', 'Both load 0 then store gives 12 (lost update)', 'States that only 12 and 24 are possible']),
    LONG('t3', 'short',
      'Thread T1 runs <code>access(&a); access(&b);</code> and T2 runs <code>access(&b); access(&c); access(&a);</code>. <code>access</code> locks the variable it is given and keeps the lock until the thread finishes. (a) Explain why the threads can deadlock. (b) Change T2 to avoid the deadlock without new variables, structures or locks.',
      '(a) T1 can hold <code>a</code> and wait for <code>b</code> while T2 holds <code>b</code> and waits for <code>a</code>. Each thread holds a lock the other needs: a circular wait with hold and wait. (b) Make T2 take locks in the same order as T1: <code>access(&a); access(&b); access(&c);</code>. A global lock order removes the circular wait.',
      ['(a) T1 holds a and waits for b', '(a) T2 holds b and waits for a (circular wait)', '(b) T2 accesses a before b (same order as T1)', '(b) A consistent order prevents the cycle']),
    LONG('t3', 'code',
      'Two threads run <code>ping</code> and <code>pong</code> and must print "ping" and "pong" alternately, ping first, using the semaphores <code>sem_ping</code> and <code>sem_pong</code>. Give the initial values and the correct <code>sem_wait</code>/<code>sem_post</code> calls at the four marked places.'
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
    LONG('t4', 'code',
      'Write a program that creates a file named "tmp" (user read and write permission), writes the string "Hello World!" (12 bytes), moves the file offset back by half of that, then reads and prints the rest of the file to standard output. Ignore error handling.',
      `int fd = open("tmp", O_RDWR | O_CREAT, S_IRUSR | S_IWUSR);
write(fd, "Hello World!", 12);
lseek(fd, -6, SEEK_CUR);          // back by 12 / 2
char buf[6];
ssize_t n = read(fd, buf, 6);
write(STDOUT_FILENO, buf, n);     // prints "World!"
close(fd);`,
      ['open with O_RDWR | O_CREAT and a mode (S_IRUSR | S_IWUSR)', 'write the 12 bytes', 'lseek(fd, -6, SEEK_CUR) to move back half', 'read the rest and write it to STDOUT_FILENO; close the file']),
    LONG('t5', 'code',
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
    LONG('t5', 'code',
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
    LONG('t6', 'code',
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
    LONG('t6', 'code',
      'Write the code for a process that creates a POSIX shared memory object named "/lab" big enough for one <code>int</code>, maps it so other processes can see changes, stores 42, and cleans up. Ignore error handling.',
      `int fd = shm_open("/lab", O_CREAT | O_RDWR, S_IRUSR | S_IWUSR);
ftruncate(fd, sizeof(int));
int *p = mmap(NULL, sizeof(int), PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
*p = 42;
munmap(p, sizeof(int));
shm_unlink("/lab");`,
      ['<code>shm_open</code> with O_CREAT | O_RDWR', '<code>ftruncate</code> to set the size', '<code>mmap</code> with PROT_READ | PROT_WRITE and MAP_SHARED', 'Writes through the pointer (42)', 'Cleans up with munmap and shm_unlink']),
    LONG('tb', 'short',
      'Describe step by step how you would let anyone verify that a photo you posted has not been modified, and say why a hash alone is not enough.',
      'Compute a cryptographic hash of the photo, then sign the digest with your <strong>private</strong> key to make a digital signature. Post the photo, the signature and your public key (or certificate). A reader recomputes the hash of the photo they downloaded and verifies the signature with your public key; any edit changes the hash, so verification fails. A hash alone is not enough because an attacker can edit the photo and post a new, matching hash; only the private-key signature cannot be forged.',
      ['Hash the photo', 'Sign the hash with the private key', 'Verifier recomputes the hash and checks with the public key', 'Explains that a lone hash can be replaced along with the photo']),
  ],
};
