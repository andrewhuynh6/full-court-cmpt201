// FULL COURT — Practice (3) and Quiz (5) questions per lesson.
// Options are kept the same length and shuffled at runtime. Many questions trace code or find bugs.

const C = H_esc;

const LESSON_QUIZ = {

l1_1: {
  practice: [
    { q: 'What does <code>*p</code> evaluate to after the last line?', code: C(`int a = 7;
int *p = &a;
a = 11;`), opts: ['11', '7', 'The address of a', 'Undefined'], ans: 0,
      exp: 'p points at a, so *p reads a\'s current value, 11.' },
    { q: 'On a typical 64-bit system, what is <code>sizeof(int *)</code>?', opts: ['8', '4', '1', '16'], ans: 0,
      exp: 'Every pointer holds a 64-bit address, regardless of what it points to.' },
    { q: 'What does this print?', code: C(`char s[] = "hey";
char *p = s;
p++;
printf("%c", *p);`), opts: ['e', 'h', 'y', 'Nothing'], ans: 0,
      exp: 'p moved one char forward from s[0] to s[1], which is \'e\'.' },
  ],
  quiz: [
    { q: 'What does this print?', code: C(`int a[3] = {1, 2, 3};
int *p = a;
printf("%d", *p + 1);`), opts: ['2', '1', '3', '4'], ans: 0,
      exp: '*p + 1 is (*p) + 1 = 1 + 1. To read the next element you would write *(p + 1).' },
    { q: 'What does this print?', code: C(`void f(int x) { x = 99; }
int main(void) {
    int n = 5;
    f(n);
    printf("%d", n);
}`), opts: ['5', '99', 'The address of n', 'Undefined'], ans: 0,
      exp: 'C passes by value: f changed its own copy, not n.' },
    { q: 'Which change makes <code>f</code> actually modify n?', code: C(`void f(int x) { x = 99; }
f(n);`), opts: ['Take int *x, set *x = 99, call f(&n)', 'Declare x as a register variable so it persists', 'Return x from f and ignore the result', 'Call f twice so the change finally sticks'], ans: 0,
      exp: 'To change the caller\'s variable you must pass its address and write through it.' },
    { q: 'Which declaration makes <code>p</code> a pointer to a pointer to char?', opts: ['char **p;', 'char *p[];', 'char &p;', 'char (*p)[];'], ans: 0,
      exp: 'Two stars mean two levels of indirection, as with char **argv.' },
    { q: 'What is wrong with this code?', code: C(`int *p;
*p = 5;`), opts: ['p holds garbage, so the write hits an unknown address', 'The value 5 cannot be stored through any pointer', 'A pointer must be declared const before it is written', 'The star must be replaced with an ampersand here'], ans: 0,
      exp: 'p holds garbage. Writing through it is undefined behavior (often a segfault).' },
  ],
},

l1_2: {
  practice: [
    { q: 'Which function changes the size of a block you already allocated?', opts: ['realloc', 'calloc', 'free', 'memcpy'], ans: 0,
      exp: 'realloc grows or shrinks a heap block, possibly moving it.' },
    { q: 'What happens to a local array when its function returns?', opts: ['Its stack memory is reclaimed automatically', 'It stays allocated until free() is called', 'It moves to the heap and stays there', 'It is zeroed out but kept for later'], ans: 0,
      exp: 'Stack frames vanish on return. Never return a pointer to a local array.' },
    { q: 'What is the bug here?', code: C(`int *a = malloc(3 * sizeof(int));
a[3] = 1;`), opts: ['Writes one element past the end of the block', 'Uses the block after it was already freed', 'Leaks the block because it is never freed', 'Frees the same block more than one time'], ans: 0,
      exp: 'Valid indexes are 0 to 2. a[3] is a heap buffer overflow.' },
  ],
  quiz: [
    { q: 'What is the bug here?', code: C(`char *s = malloc(4);
strcpy(s, "hello");`), opts: ['"hello" needs 6 bytes, so it overflows', 'strcpy cannot copy into heap memory at all', 'malloc(4) returns NULL for odd sizes', 'The string literal is freed after the copy'], ans: 0,
      exp: 'Five letters plus the terminating NUL is 6 bytes, but only 4 were allocated.' },
    { q: 'What goes wrong in this code?', code: C(`int *p = malloc(sizeof(int));
p = malloc(sizeof(int));
free(p);`), opts: ['The first block is leaked', 'The second block is freed twice', 'The first block is used after free', 'Nothing, this is correct'], ans: 0,
      exp: 'Overwriting p lost the only pointer to the first block, so it can never be freed.' },
    { q: 'After <code>free(p)</code>, which statement is safe?', opts: ['p = NULL;', '*p = 0;', 'free(p);', 'printf("%d", *p);'], ans: 0,
      exp: 'Assigning to the pointer variable is fine. Dereferencing or freeing it again is not.' },
    { q: 'What is the risk in <code>a = realloc(a, n);</code>?', opts: ['Failure sets a to NULL and leaks the block', 'realloc always frees the old block first', 'The old block is zeroed even if it succeeds', 'realloc cannot be given the same pointer'], ans: 0,
      exp: 'Use a temporary pointer: tmp = realloc(a, n); if (tmp) a = tmp;' },
    { q: 'Valgrind reports "Invalid write of size 4" right after a call to <code>free(p)</code>. The likely bug?', opts: ['Use after free', 'Memory leak', 'Stack overflow', 'Missing NULL check'], ans: 0,
      exp: 'Writing to memory that was already freed is a use-after-free.' },
  ],
},

l2_1: {
  practice: [
    { q: 'What does <code>waitpid(pid, &amp;st, WNOHANG)</code> do?', opts: ['Returns at once even if the child still runs', 'Blocks the caller until that child has exited', 'Kills the child if it has not yet exited', 'Waits for every child process of the caller'], ans: 0,
      exp: 'WNOHANG makes it non-blocking: it returns 0 if the child has not changed state.' },
    { q: 'After fork(), how do parent and child treat memory?', opts: ['They have separate copies (copy-on-write)', 'They share all memory permanently', 'Only the heap is shared between them', 'The child has no memory until it execs'], ans: 0,
      exp: 'Each process gets its own address space; pages are copied lazily on first write.' },
    { q: 'Which signal is sent to a parent when a child terminates?', opts: ['SIGCHLD', 'SIGTERM', 'SIGKILL', 'SIGUSR1'], ans: 0,
      exp: 'SIGCHLD tells the parent a child changed state, so it can call wait().' },
  ],
  quiz: [
    { q: 'What does this program print?', code: C(`int x = 1;
if (fork() == 0) { x = 2; exit(0); }
wait(NULL);
printf("%d", x);`), opts: ['1', '2', '1 then 2', 'Undefined'], ans: 0,
      exp: 'The child changed its own copy of x. The parent\'s x is still 1.' },
    { q: 'How many processes exist after this loop, counting the original?', code: C(`for (int i = 0; i < 3; i++)
    fork();`), opts: ['8', '6', '3', '4'], ans: 0,
      exp: 'Each fork doubles the count of processes that continue: 2, 4, 8.' },
    { q: 'A parent exits while its child is still running. Who adopts the child?', opts: ['init (PID 1)', 'The shell that launched the parent', 'Nobody: the child is killed', 'The kernel\'s idle task'], ans: 0,
      exp: 'Orphans are re-parented to init, which reaps them when they exit.' },
    { q: 'Assuming stdout is a terminal, what does this print?', code: C(`printf("A\\n");
execl("/bin/echo", "echo", "B", NULL);
printf("C\\n");`), opts: ['A then B', 'A, B, then C', 'A then C', 'B only'], ans: 0,
      exp: 'exec replaced the program, so the last printf never runs.' },
    { q: 'Why is fork() followed by exec() cheap, even though fork "copies" the process?', opts: ['Pages are copy-on-write and exec discards them', 'fork shares the stack between the two forever', 'exec runs inside the parent process instead', 'The kernel skips building page tables'], ans: 0,
      exp: 'No pages are physically copied unless written. exec then throws the old pages away.' },
  ],
},

l2_2: {
  practice: [
    { q: 'Which function starts a new thread?', opts: ['pthread_create', 'pthread_start', 'fork', 'thread_spawn'], ans: 0,
      exp: 'pthread_create(&tid, attr, function, arg).' },
    { q: 'How does a caller read a thread function\'s <code>void *</code> return value?', opts: ['From pthread_join\'s second argument', 'From the global errno variable', 'It is passed to main as argv', 'The OS discards it'], ans: 0,
      exp: 'pthread_join(t, &result) waits and stores the return value in result.' },
    { q: 'Which memory is shared by every thread of a process?', opts: ['The heap and global variables', 'Local variables and the stack', 'Registers and program counter', 'Nothing; threads are isolated'], ans: 0,
      exp: 'Each thread has its own stack and registers; the heap and globals are shared.' },
  ],
  quiz: [
    { q: 'Two threads each run this, then main joins both and prints counter. What is the most likely output?', code: C(`int counter = 0;
void *inc(void *a) {
    for (int i = 0; i < 100000; i++) counter++;
    return NULL;
}`), opts: ['Often below 200000 and different each run', 'Always exactly 200000 on every single run', 'Always exactly 100000 because threads alternate', 'Always 0 since the counter is never shared'], ans: 0,
      exp: 'Unsynchronized counter++ loses updates, and how many depends on timing.' },
    { q: 'Thread A calls <code>exit(0)</code> while thread B is still running. What happens?', opts: ['The whole process ends, so B is killed', 'Only thread A ends; B keeps running', 'exit waits until B has finished first', 'The call is ignored inside threads'], ans: 0,
      exp: 'exit() terminates the entire process. Use pthread_exit() to end just one thread.' },
    { q: 'Why call <code>pthread_join</code> (or detach) for every thread you create?', opts: ['Otherwise its resources are never reclaimed', 'Otherwise the thread never gets to start', 'It is what makes the threads run in parallel', 'It gives the thread its own private heap'], ans: 0,
      exp: 'An unjoined, non-detached thread leaks its stack and bookkeeping until the process ends.' },
    { q: 'Which is a correct way to give each thread its own index?', opts: ['Store ids in an array and pass &ids[i]', 'Pass &i but sleep after every create', 'Declare the loop counter i as volatile', 'Pass i cast to a char pointer and hope'], ans: 0,
      exp: 'Each thread then reads a stable, separate location that the loop does not modify.' },
    { q: 'Two threads call <code>malloc</code> at the same time. Is that safe?', opts: ['Yes, the C library\'s malloc is thread-safe', 'No, you must lock around every malloc call', 'Only if both threads use calloc instead', 'Only if the threads are created detached'], ans: 0,
      exp: 'Standard library allocators handle concurrent calls. Your own data structures still need locks.' },
  ],
},

l2_3: {
  practice: [
    { q: 'What does <code>pthread_mutex_unlock</code> do?', opts: ['Releases the lock and lets a waiter proceed', 'Destroys the mutex so it cannot be reused', 'Blocks until every thread has unlocked', 'Locks the mutex for the next thread'], ans: 0,
      exp: 'Unlock hands the mutex back; one blocked thread can then acquire it.' },
    { q: 'A critical section is code that…', opts: ['Touches shared data and must not run concurrently', 'Runs more often than the rest of the program', 'Is protected by the compiler automatically', 'Can only run inside the main thread'], ans: 0,
      exp: 'It is the stretch of code a mutex is meant to guard.' },
    { q: 'What does <code>pthread_mutex_trylock</code> do if the mutex is already held?', opts: ['Returns EBUSY at once without blocking', 'Blocks until the mutex becomes free', 'Locks it anyway and returns zero', 'Aborts the whole process'], ans: 0,
      exp: 'trylock never sleeps. You can do other work and retry.' },
  ],
  quiz: [
    { q: 'What can happen with these two threads?', code: C(`// Thread 1        // Thread 2
lock(&a);          lock(&b);
lock(&b);          lock(&a);`), opts: ['Deadlock, if each grabs its first lock', 'A data race on both a and b', 'Nothing: locks nest safely', 'Thread 1 is starved but Thread 2 is fine'], ans: 0,
      exp: 'Opposite lock order creates the cycle. Fix it by always locking a then b.' },
    { q: 'A thread locks a default mutex twice with no unlock in between. What happens?', opts: ['It blocks forever, waiting on itself', 'The second lock is silently ignored', 'The lock count goes to 2 and it continues', 'The second call fails and returns at once'], ans: 0,
      exp: 'A normal mutex is not recursive. The thread waits for a release that only it could do.' },
    { q: 'Which of these is a data race?', opts: ['Two threads write one global, no lock', 'Two threads read one constant global', 'Each thread writes its own local variable', 'Both threads lock the mutex before writing'], ans: 0,
      exp: 'A race needs two accesses to the same location, at least one a write, with no synchronization.' },
    { q: 'When is a read-write lock (<code>pthread_rwlock</code>) a good fit?', opts: ['Many readers, few writers', 'Many writers, few readers', 'Exactly one reader at a time', 'It replaces every other lock'], ans: 0,
      exp: 'Readers can hold it together; a writer gets exclusive access.' },
    { q: 'Thread A guards <code>x</code> with mutex m1. Thread B guards <code>x</code> with mutex m2. Is x protected?', opts: ['No; the two locks never exclude each other', 'Yes, because both threads lock something', 'Yes, if both release their lock quickly', 'Only if m2 was created before m1'], ans: 0,
      exp: 'Every access to the same data must use the same mutex.' },
  ],
},

l2_4: {
  practice: [
    { q: 'What does <code>sem_post</code> do?', opts: ['Increments the count and wakes a waiter', 'Decrements the count and may block', 'Destroys the semaphore immediately', 'Resets the count back to zero'], ans: 0,
      exp: 'post adds one unit and wakes a sleeping thread, if any.' },
    { q: 'A buffer has N slots. What is the initial value of the <code>empty</code> semaphore?', opts: ['N', '0', '1', 'N - 1'], ans: 0,
      exp: 'Initially every slot is free, so empty counts N free slots and full counts 0.' },
    { q: '<code>pthread_cond_signal</code> wakes…', opts: ['One thread waiting on that condition', 'Every thread in the whole process', 'Only the thread that called it', 'Nobody; it just sets a flag'], ans: 0,
      exp: 'signal wakes at least one waiter. broadcast wakes all of them.' },
  ],
  quiz: [
    { q: 'You initialize a semaphore with <code>sem_init(&amp;s, 0, 1)</code>. What does it behave like?', opts: ['A mutex (binary semaphore)', 'An unbounded counter of free slots', 'A condition variable', 'A thread barrier'], ans: 0,
      exp: 'With a count of 1, wait/post work like lock/unlock.' },
    { q: 'A semaphore has value 3 and a thread calls <code>sem_wait</code>. What happens?', opts: ['Value becomes 2 and the thread continues', 'Value stays 3 and the thread blocks', 'Value becomes 0 and the thread blocks', 'Value becomes 2 and the thread blocks'], ans: 0,
      exp: 'Positive means a unit is available: take it and go on. Blocking happens only at 0.' },
    { q: 'Why must <code>pthread_cond_wait</code> be called with the mutex locked?', opts: ['It releases the mutex and sleeps atomically', 'It needs the lock to count waiters', 'Otherwise the condition variable is destroyed', 'It locks the mutex a second time'], ans: 0,
      exp: 'Atomic unlock-and-sleep prevents a signal from slipping in between and being lost.' },
    { q: '<code>pthread_cond_signal</code> runs before any thread is waiting. What happens to the signal?', opts: ['It is lost: there is no memory of it', 'It is stored until a waiter shows up', 'The next wait returns immediately', 'It raises an error in the caller'], ans: 0,
      exp: 'Unlike a semaphore, a condition variable has no memory, so always pair it with a shared flag.' },
    { q: 'What is the bug in this consumer?', code: C(`pthread_mutex_lock(&m);
sem_wait(&full);        // wait for an item
item = buf[out];
pthread_mutex_unlock(&m);`), opts: ['It sleeps holding m, blocking the producer', 'sem_wait cannot be used together with a mutex', 'The item must be read before locking the mutex', 'The mutex should be locked after unlocking it'], ans: 0,
      exp: 'Wait on the semaphore first, then lock. Otherwise the producer blocks on m and never posts full.' },
  ],
},

l3_1: {
  practice: [
    { q: 'Which file descriptor number is standard error?', opts: ['2', '0', '1', '3'], ans: 0,
      exp: '0 is stdin, 1 is stdout, 2 is stderr.' },
    { q: 'Which call releases a file descriptor?', opts: ['close', 'unlink', 'fclose', 'free'], ans: 0,
      exp: 'close(fd) gives the descriptor number back to the kernel. fclose is for FILE* streams.' },
    { q: '<code>write(fd, buf, 10)</code> returns 10. What does that tell you?', opts: ['All 10 bytes were written', 'The write failed after 10 retries', 'The file now holds exactly 10 bytes', 'The descriptor number was 10'], ans: 0,
      exp: 'The return value is the number of bytes actually written.' },
  ],
  quiz: [
    { q: 'What happens at the last line?', code: C(`int fd = open("a.txt", O_RDONLY);
int g  = dup(fd);
close(fd);
read(g, buf, 1);`), opts: ['It succeeds; g still refers to the file', 'It fails with EBADF because fd was closed', 'It reads from standard input instead', 'It crashes with a segmentation fault'], ans: 0,
      exp: 'dup gave a second descriptor to the same open file. Closing one does not close the other.' },
    { q: 'For many tiny writes, which is usually faster and why?', opts: ['fwrite, since it batches into a buffer', 'write, since it has fewer layers', 'They are always exactly the same speed', 'Neither one can batch small writes'], ans: 0,
      exp: 'stdio buffers in user space, so far fewer system calls are made.' },
    { q: 'What does <code>lseek(fd, 0, SEEK_END)</code> return?', opts: ['The file size in bytes', 'Always 0', 'The next free descriptor', '-1 for a regular file'], ans: 0,
      exp: 'It moves to the end and returns that offset, which equals the file size.' },
    { q: 'A file is opened with <code>O_APPEND</code>. Where does each write go?', opts: ['Always to the end of the file', 'To the current offset, wherever it is', 'To the start, replacing old data', 'Into a temporary buffer until close'], ans: 0,
      exp: 'With O_APPEND the kernel moves to the end atomically before every write.' },
    { q: 'After <code>dup2(fd, 0)</code>, which operations now read from the file?', opts: ['read(0, ...) and scanf', 'Only read(fd, ...) calls', 'Nothing, since 0 was closed', 'Only writes to descriptor 0'], ans: 0,
      exp: 'Descriptor 0 is stdin, and it now points at the file, so anything reading stdin reads the file.' },
  ],
},

l3_2: {
  practice: [
    { q: 'Which command prints each file\'s inode number?', opts: ['ls -i', 'ls -l', 'ls -a', 'ls -t'], ans: 0,
      exp: 'ls -i shows the inode number beside each name.' },
    { q: 'What is <code>r--r--r--</code> in octal?', opts: ['0444', '0644', '0400', '0777'], ans: 0,
      exp: 'Read is 4, so three groups of 4.' },
    { q: 'Where is the size of a file stored?', opts: ['In its inode', 'In its directory entry', 'In the file name itself', 'In the parent directory\'s inode'], ans: 0,
      exp: 'Size, owner, permissions and timestamps live in the inode.' },
  ],
  quiz: [
    { q: 'A file has <code>st_nlink = 2</code>. You remove one of its names. What now?', opts: ['The link count is 1 and the data stays', 'The data is deleted immediately', 'The other name becomes a dangling link', 'The link count stays at 2'], ans: 0,
      exp: 'Data is freed only when the link count reaches 0 (and no process has it open).' },
    { q: 'You delete the target of a symlink, then <code>open()</code> the symlink. What happens?', opts: ['It fails with ENOENT; the link dangles', 'It opens an empty file instead', 'The target is recreated automatically', 'It opens the parent directory'], ans: 0,
      exp: 'A symlink only stores a path. If nothing exists there, opening it fails.' },
    { q: 'Can a hard link point to a file on a different filesystem?', opts: ['No, inode numbers are per filesystem', 'Yes, always', 'Only if the target is a directory', 'Only when run as root'], ans: 0,
      exp: 'A hard link is a name-to-inode entry, and that inode must live in the same filesystem.' },
    { q: 'Which permission lets a user list the names inside a directory?', opts: ['Read (r) on the directory', 'Execute (x) on the directory', 'Write (w) on the directory', 'None; anyone can list'], ans: 0,
      exp: 'r lists names, x lets you enter or open entries, w lets you create or delete entries.' },
    { q: 'After <code>chmod 755 script.sh</code>, who can execute it?', opts: ['Everyone; only the owner can edit it', 'Only the owner of the file itself', 'The owner and group members only', 'Nobody until chown is used first'], ans: 0,
      exp: '7 = rwx for owner; 5 = r-x for group and for others.' },
  ],
},

l4_1: {
  practice: [
    { q: 'Which call makes a socket start accepting connections?', opts: ['listen', 'bind', 'connect', 'socket'], ans: 0,
      exp: 'listen marks the socket as passive and creates the pending-connection queue.' },
    { q: 'Which side of a TCP connection calls <code>connect()</code>?', opts: ['The client', 'The server', 'Both sides do', 'Neither; the kernel does'], ans: 0,
      exp: 'The client initiates. The server waits in accept().' },
    { q: 'What does <code>bind()</code> do?', opts: ['Attaches an address and port to the socket', 'Starts the three-way handshake with a peer', 'Blocks the caller until a client arrives', 'Encrypts all data sent over the connection'], ans: 0,
      exp: 'bind claims the local address and port the server will use.' },
  ],
  quiz: [
    { q: 'What does the 5 mean in <code>listen(fd, 5)</code>?', opts: ['The backlog of pending connections', 'The maximum clients ever served', 'The port number to use', 'A timeout of 5 seconds'], ans: 0,
      exp: 'It limits how many completed connections can wait for accept().' },
    { q: 'A server calls <code>accept()</code> and no client is connecting. What happens by default?', opts: ['It blocks until a client connects', 'It returns -1 right away', 'It returns 0 and tries again', 'It exits with an error'], ans: 0,
      exp: 'accept is a blocking call unless the socket is set non-blocking.' },
    { q: '<code>write()</code> on a TCP socket asked for 10 bytes and returned 3. What should the code do?', opts: ['Loop and write the remaining 7 bytes', 'Treat it as success; 3 is enough', 'Close the socket and reconnect', 'Call listen() again'], ans: 0,
      exp: 'Short writes are legal. Keep writing from where you stopped.' },
    { q: 'After a restart, <code>bind</code> fails with "Address already in use". A common fix?', opts: ['Set SO_REUSEADDR before bind', 'Call listen twice before binding', 'Switch to SOCK_DGRAM sockets', 'Close descriptor 0 first'], ans: 0,
      exp: 'The old connection lingers in TIME_WAIT. SO_REUSEADDR lets you rebind the port anyway.' },
    { q: 'A client sends "AB" then "CD" over TCP. What might one <code>read()</code> on the server return?', opts: ['Possibly "ABCD": boundaries are not kept', 'Always exactly "AB"', 'Always "CD" first, then "AB"', 'An error, because it was two writes'], ans: 0,
      exp: 'TCP is a byte stream. You must frame messages yourself (length prefix or delimiter).' },
  ],
},

l4_2: {
  practice: [
    { q: 'Which function converts a 16-bit host number to network byte order?', opts: ['htons', 'htonl', 'ntohs', 'inet_aton'], ans: 0,
      exp: 'htons = host to network, short (16 bits). htonl is the 32-bit version.' },
    { q: 'What does <code>sin_family = AF_INET</code> select?', opts: ['IPv4 addressing', 'IPv6 addressing', 'Unix domain sockets', 'Raw packets'], ans: 0,
      exp: 'AF_INET is IPv4. IPv6 uses AF_INET6.' },
    { q: 'In a fork-per-client server, which process calls <code>accept()</code>?', opts: ['The parent, in a loop', 'Each child, once', 'Both parent and child', 'Neither; the kernel does'], ans: 0,
      exp: 'The parent keeps accepting; each child serves one connection.' },
  ],
  quiz: [
    { q: 'On a little-endian machine, what is <code>htons(0x1234)</code>?', opts: ['0x3412', '0x1234', '0x4321', '0x2143'], ans: 0,
      exp: 'It swaps the two bytes: 12 34 becomes 34 12.' },
    { q: 'A fork-per-client server never calls wait(). What builds up?', opts: ['Zombie processes from finished children', 'Orphans adopted by the parent process', 'Open listening sockets in the parent', 'Extra threads inside the parent process'], ans: 0,
      exp: 'Reap children with waitpid in a SIGCHLD handler, or ignore SIGCHLD.' },
    { q: 'Why must you rebuild the <code>fd_set</code> before every <code>select()</code> call?', opts: ['select overwrites it with only the ready fds', 'fd_set objects cannot be copied', 'The kernel clears it at every context switch', 'FD_SET only works once per set'], ans: 0,
      exp: 'On return, the set holds just the ready descriptors, so the original list is lost unless you keep a copy.' },
    { q: 'How does <code>select()</code> signal that a new client is waiting?', opts: ['The listening socket is marked readable', 'select returns -1 with an error', 'The client\'s fd becomes writable', 'A SIGIO signal is delivered'], ans: 0,
      exp: 'A pending connection makes the listener readable; then accept() will not block.' },
    { q: 'Which design serves 100 clients with the fewest processes?', opts: ['select() in a single process', 'fork() once per client', 'Pre-forking 100 workers', 'All three use the same number'], ans: 0,
      exp: 'select multiplexes everything in one process; fork-based designs need one process per client.' },
  ],
},

l5_1: {
  practice: [
    { q: 'Can data flow in both directions through one <code>pipe()</code>?', opts: ['No, it is one-way', 'Yes, through fd[0] and fd[1]', 'Only between a parent and child', 'Only after dup2 is called'], ans: 0,
      exp: 'For two-way communication use two pipes.' },
    { q: 'What does <code>read()</code> return on a pipe with an empty buffer and no open write ends?', opts: ['0', '-1', 'It blocks forever', '1'], ans: 0,
      exp: 'No writers left means end of file, reported as 0.' },
    { q: 'Which call creates a named pipe?', opts: ['mkfifo', 'pipe', 'mknod_pipe', 'creat'], ans: 0,
      exp: 'mkfifo(path, mode) creates a FIFO special file.' },
  ],
  quiz: [
    { q: 'A process writes to a pipe whose read ends are all closed. What happens?', opts: ['It gets SIGPIPE (or EPIPE)', 'write returns 0 silently', 'The data waits for a new reader', 'It blocks forever'], ans: 0,
      exp: 'Writing with nobody to read is an error. By default SIGPIPE kills the writer.' },
    { q: 'The pipe buffer is full and the writer calls <code>write()</code>. What happens?', opts: ['It blocks until a reader frees space', 'It returns 0 and drops the data', 'It overwrites the oldest bytes', 'It grows the pipe without limit'], ans: 0,
      exp: 'Pipes have a fixed capacity (about 64 KB on Linux), so a full pipe makes the writer wait.' },
    { q: 'The parent\'s read loop never ends. Why?', code: C(`pipe(fd);
if (fork() == 0) {
    close(fd[0]);
    write(fd[1], "hi", 2);
    exit(0);
}
while (read(fd[0], buf, 64) > 0) { }`), opts: ['The parent still holds its own write end', 'The child wrote only two bytes so far', 'read() cannot be used on the fd[0] end', 'The child never called close(fd[0]) at all'], ans: 0,
      exp: 'EOF needs every write end closed. The parent should close(fd[1]) before reading.' },
    { q: 'Which statement about unnamed pipes is true?', opts: ['They link processes sharing a common ancestor', 'They connect any two processes on any machine', 'They persist on disk after reboot', 'They are bidirectional by default'], ans: 0,
      exp: 'Descriptors are inherited through fork, so only related processes can use them. FIFOs remove that limit.' },
    { q: 'A process calls <code>open(fifo, O_RDONLY)</code> and no writer exists yet. What happens?', opts: ['It blocks until a writer opens the FIFO', 'It fails right away with ENOENT', 'It returns 0 as if at end of file', 'It creates a writer automatically'], ans: 0,
      exp: 'Opening a FIFO blocks until the other end is opened (unless O_NONBLOCK).' },
  ],
},

l5_2: {
  practice: [
    { q: 'Which call maps a shared memory object into your address space?', opts: ['mmap', 'shm_open', 'ftruncate', 'shmctl'], ans: 0,
      exp: 'shm_open creates the object; mmap gives you a pointer to it.' },
    { q: 'What does <code>shm_unlink</code> do?', opts: ['Removes the object\'s name', 'Unmaps memory in this process', 'Frees the memory at once, for everyone', 'Locks the object against access'], ans: 0,
      exp: 'The name is removed; the memory goes away after the last process unmaps it.' },
    { q: 'What does <code>ftruncate(fd, 4096)</code> set on a new shared object?', opts: ['Its size, 4096 bytes', 'Its permission bits', 'Its starting address', 'Its sharing mode'], ans: 0,
      exp: 'A fresh object has size 0 until you extend it.' },
  ],
  quiz: [
    { q: 'Two processes map the same page. Why can their pointers to it differ?', opts: ['Each has its own virtual address space', 'The kernel moves the page between calls', 'One process holds a stale pointer copy', 'mmap always returns random addresses'], ans: 0,
      exp: 'The same physical page may appear at different virtual addresses in each process.' },
    { q: 'Which is safe to store inside a shared memory region?', opts: ['An array index or byte offset', 'A pointer to a local variable', 'A pointer returned by malloc', 'A function pointer'], ans: 0,
      exp: 'Raw pointers are meaningless in another process. Offsets stay valid everywhere.' },
    { q: 'The parent maps <code>MAP_PRIVATE | MAP_ANONYMOUS</code> memory, then forks. The child writes to it. What does the parent see?', opts: ['The old value; the write was private', 'The new value, as soon as it is written', 'The new value, but only after wait()', 'A segmentation fault in the parent'], ans: 0,
      exp: 'MAP_PRIVATE is copy-on-write, so the child\'s change never reaches the parent.' },
    { q: 'A process crashes without calling <code>shm_unlink</code>. What happens to the object?', opts: ['It persists until unlinked or reboot', 'It is deleted when the process dies', 'It is saved to disk and then deleted', 'It becomes read-only for everyone'], ans: 0,
      exp: 'POSIX shared memory is kernel-persistent. Clean up with shm_unlink or remove it from /dev/shm.' },
    { q: 'What must a mutex in shared memory be configured with so two processes can use it?', opts: ['PTHREAD_PROCESS_SHARED', 'PTHREAD_MUTEX_RECURSIVE', 'MAP_ANONYMOUS', 'O_CLOEXEC'], ans: 0,
      exp: 'The default mutex is only guaranteed to work between threads of one process.' },
  ],
},

};

// Attach the step lessons and the rewritten questions to the course data.
CHAPTERS.forEach(ch => ch.lessons.forEach(l => {
  if (LESSON_STEPS[l.id]) l.steps = LESSON_STEPS[l.id];
  const q = LESSON_QUIZ[l.id];
  if (q) { l.practice = q.practice; l.quiz = q.quiz; }
}));
