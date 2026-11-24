// FULL COURT — Hands-on practice: tap the buggy line, fill the blank, put lines in order.
// bug:   { type:'bug',   q, lines[], ans (line index), exp }
// blank: { type:'blank', q, code (with ____), opts[4], ans, exp }
// order: { type:'order', q, lines[] (correct order), prose?, exp }

const LESSON_HANDS = {

l1_1: [
  { type: 'bug', q: 'This program should print 10. Tap the line with the bug.', lines: ['int x = 10;', 'int *p;', 'p = x;', 'printf("%d\\n", *p);'], ans: 2,
    exp: '<code>p = x</code> stores the number 10 as an address. It should be <code>p = &amp;x</code>.' },
  { type: 'blank', q: 'Fill in the blank so the line prints 9.', code: 'int a[3] = {4, 5, 9};\nint *p = a;\nprintf("%d", ____);', opts: ['*(p + 2)', '*p + 2', 'p + 2', '&p[2]'], ans: 0,
    exp: '<code>*(p + 2)</code> is a[2], which is 9. <code>*p + 2</code> would be 4 + 2.' },
  { type: 'order', q: 'Put the lines in order to build a function that swaps two ints.', lines: ['void swap(int *x, int *y) {', '    int tmp = *x;', '    *x = *y;', '    *y = tmp;', '}'],
    exp: 'Save one value in tmp first, copy y into x, then put tmp into y.' },
],

l1_2: [
  { type: 'bug', q: 'Tap the line that uses memory it should no longer touch.', lines: ['char *s = malloc(6);', 'strcpy(s, "hello");', 'free(s);', 'printf("%s\\n", s);'], ans: 3,
    exp: 'After <code>free(s)</code> the block belongs to the allocator. Printing it is a use after free.' },
  { type: 'blank', q: 'Fill in the blank to grow the block to hold 20 ints.', code: 'a = realloc(a, ____);', opts: ['20 * sizeof(int)', '20', 'sizeof(20)', '20 + sizeof(int)'], ans: 0,
    exp: 'realloc takes bytes. 20 ints need 20 * sizeof(int) bytes.' },
  { type: 'order', q: 'Put the heap lifecycle in order.', lines: ['int *a = malloc(4 * sizeof(int));', 'if (a == NULL) exit(1);', 'a[0] = 7;', 'free(a);', 'a = NULL;'],
    exp: 'Allocate, check, use, free, then null out the pointer so it cannot be misused.' },
],

l2_1: [
  { type: 'bug', q: 'The child branch never runs correctly. Tap the faulty line.', lines: ['pid_t pid = fork();', 'if (pid = 0) {', '    printf("child\\n");', '}'], ans: 1,
    exp: '<code>pid = 0</code> assigns instead of comparing. It should be <code>pid == 0</code>.' },
  { type: 'blank', q: 'Fill in the blank so the block runs only in the child.', code: 'if (____ == 0) {\n    /* child code */\n}', opts: ['fork()', 'getpid()', 'wait(NULL)', 'exec()'], ans: 0,
    exp: 'fork() returns 0 in the child. getpid() returns a PID, never 0.' },
  { type: 'order', q: 'Put the lines in order: run ls in a child, and wait for it in the parent.', lines: ['pid_t pid = fork();', 'if (pid == 0) {', '    execlp("ls", "ls", NULL);', '}', 'waitpid(pid, NULL, 0);'],
    exp: 'Fork, exec in the child branch, then the parent waits for that child.' },
],

l2_2: [
  { type: 'bug', q: 'Threads sometimes receive the wrong number. Tap the line with the bug.', lines: ['for (int i = 0; i < 4; i++) {', '    pthread_create(&t[i], NULL, work, &i);', '}', 'for (int i = 0; i < 4; i++)', '    pthread_join(t[i], NULL);'], ans: 1,
    exp: 'Every thread gets the address of the same loop variable, which keeps changing. Pass ids[i] instead.' },
  { type: 'blank', q: 'Fill in the blank to wait for thread t to finish.', code: 'pthread_____(t, NULL);', opts: ['join', 'wait', 'exit', 'detach'], ans: 0,
    exp: '<code>pthread_join</code> blocks until the thread returns. detach does the opposite: you can no longer wait.' },
  { type: 'order', q: 'Put the lines in order for starting a worker thread and waiting for it.', lines: ['pthread_t t;', 'pthread_create(&t, NULL, work, NULL);', '/* main does other work */', 'pthread_join(t, NULL);', '/* t has finished */'],
    exp: 'Declare, create, do other work, then join before relying on the result.' },
],

l2_3: [
  { type: 'bug', q: 'Other threads hang forever after this runs once with an empty queue. Tap the bug.', lines: ['pthread_mutex_lock(&m);', 'if (queue_empty()) {', '    return;', '}', 'pop();', 'pthread_mutex_unlock(&m);'], ans: 2,
    exp: 'The early return skips the unlock, so the mutex stays locked forever.' },
  { type: 'blank', q: 'Fill in the blank: trylock returns 0 when it got the lock.', code: 'if (pthread_mutex_trylock(&m) ____ 0) {\n    /* got the lock */\n}', opts: ['==', '!=', '<', '>'], ans: 0,
    exp: 'A zero return means success. Nonzero (EBUSY) means somebody else holds it.' },
  { type: 'order', q: 'Lock both mutexes in the global order, use them, and unlock in reverse order.', lines: ['pthread_mutex_lock(&m1);', 'pthread_mutex_lock(&m2);', '/* use both resources */', 'pthread_mutex_unlock(&m2);', 'pthread_mutex_unlock(&m1);'],
    exp: 'Always m1 then m2, and release in the reverse order.' },
],

l2_4: [
  { type: 'bug', q: 'The producer eventually blocks forever. Tap the line with the bug in this consumer.', lines: ['sem_wait(&full);', 'pthread_mutex_lock(&m);', 'item = buf[out];', 'pthread_mutex_unlock(&m);', 'sem_post(&full);'], ans: 4,
    exp: 'A consumer frees a slot, so it must <code>sem_post(&amp;empty)</code>. Posting full again never wakes the producer.' },
  { type: 'blank', q: 'Fill in the blank to sleep until another thread signals.', code: 'while (!ready)\n    pthread_cond_____(&cv, &m);', opts: ['wait', 'signal', 'lock', 'broadcast'], ans: 0,
    exp: 'cond_wait releases the mutex and sleeps. signal and broadcast are what the OTHER thread calls.' },
  { type: 'order', q: 'Put the producer in order: wait for a free slot first, then lock, and post after unlocking.', lines: ['sem_wait(&empty);', 'pthread_mutex_lock(&m);', 'buf[in] = item;', 'pthread_mutex_unlock(&m);', 'sem_post(&full);'],
    exp: 'Wait for space, protect the buffer update with the mutex, then announce the new item.' },
],

l3_1: [
  { type: 'bug', q: 'The new file has random permissions. Tap the line with the bug.', lines: ['int fd = open("log.txt", O_WRONLY | O_CREAT);', 'write(fd, "hi", 2);', 'close(fd);'], ans: 0,
    exp: 'O_CREAT needs a mode argument such as 0644, otherwise the permissions are garbage.' },
  { type: 'blank', q: 'Fill in the blank so printf output goes to the file.', code: 'dup2(fd, ____);\nprintf("hello\\n");', opts: ['STDOUT_FILENO', 'STDIN_FILENO', 'STDERR_FILENO', 'fd'], ans: 0,
    exp: 'Descriptor 1 (STDOUT_FILENO) is where printf writes, so point it at the file.' },
  { type: 'order', q: 'Put the lines in order to read from a file and print it.', lines: ['int fd = open("a.txt", O_RDONLY);', 'ssize_t n = read(fd, buf, sizeof buf);', 'if (n > 0) write(STDOUT_FILENO, buf, n);', 'close(fd);'],
    exp: 'Open, read, use exactly n bytes, close.' },
],

l3_2: [
  { type: 'bug', q: 'The program should print the file size. Tap the line with the bug.', lines: ['struct stat st;', 'stat("a.txt", &st);', 'printf("%ld bytes\\n", st.st_ino);'], ans: 2,
    exp: '<code>st_ino</code> is the inode number. The size is <code>st_size</code>.' },
  { type: 'blank', q: 'Fill in the blank: what kind of link does <code>ln -s</code> create?', code: 'ln -s a.txt b.txt   # b.txt is a ____ link', opts: ['symbolic', 'hard', 'named', 'dynamic'], ans: 0,
    exp: '-s makes a symbolic link: a small file that stores the path.' },
  { type: 'order', prose: true, q: 'Put these steps in the order the kernel follows to open <code>/home/ann/a.txt</code>.', lines: ['Start at the root directory inode', 'Look up "home" and follow its inode', 'Look up "ann" and follow its inode', 'Look up "a.txt" to get its inode', 'Read the inode, then the data blocks'],
    exp: 'The kernel resolves one path component at a time, then reads the file\'s inode and data.' },
],

l4_1: [
  { type: 'bug', q: 'The server fails to start. Tap the line that is called too early.', lines: ['int ls = socket(AF_INET, SOCK_STREAM, 0);', 'listen(ls, 5);', 'bind(ls, (struct sockaddr *)&addr, sizeof addr);', 'int cs = accept(ls, NULL, NULL);'], ans: 1,
    exp: 'bind must come before listen, because the socket needs an address first.' },
  { type: 'blank', q: 'Fill in the blank to wait for a client.', code: 'int cs = ____(ls, NULL, NULL);', opts: ['accept', 'connect', 'listen', 'bind'], ans: 0,
    exp: 'accept blocks until a client connects and returns a new descriptor for it.' },
  { type: 'order', q: 'Put the TCP server calls in order.', lines: ['int ls = socket(AF_INET, SOCK_STREAM, 0);', 'bind(ls, addr, len);', 'listen(ls, 5);', 'int cs = accept(ls, NULL, NULL);', 'read(cs, buf, sizeof buf);'],
    exp: 'Create, bind, listen, accept, then talk on the new client socket.' },
],

l4_2: [
  { type: 'bug', q: 'Clients cannot reach the server on port 8080. Tap the line with the bug.', lines: ['struct sockaddr_in addr = {0};', 'addr.sin_family = AF_INET;', 'addr.sin_port = 8080;', 'addr.sin_addr.s_addr = htonl(INADDR_ANY);'], ans: 2,
    exp: 'The port must be in network byte order: <code>htons(8080)</code>.' },
  { type: 'blank', q: 'Fill in the blank: what is the first argument of select?', code: 'select(____ + 1, &rd, NULL, NULL, NULL);', opts: ['maxfd', 'the number of clients', 'sizeof(fd_set)', 'FD_SETSIZE'], ans: 0,
    exp: 'select checks descriptors 0 up to nfds - 1, so pass the highest fd plus one.' },
  { type: 'order', q: 'Put a select-based accept check in order.', lines: ['FD_ZERO(&rd);', 'FD_SET(ls, &rd);', 'select(ls + 1, &rd, NULL, NULL, NULL);', 'if (FD_ISSET(ls, &rd))', '    cs = accept(ls, NULL, NULL);'],
    exp: 'Clear the set, add the listener, wait, test whether it is ready, then accept.' },
],

l5_1: [
  { type: 'bug', q: 'Parent and child cannot talk. Tap the line in the wrong place.', lines: ['int fd[2];', 'pid_t pid = fork();', 'pipe(fd);', 'if (pid == 0) read(fd[0], buf, 2);'], ans: 2,
    exp: 'The pipe must exist before fork, otherwise each process creates its own separate pipe.' },
  { type: 'blank', q: 'Fill in the blank: the reading process closes the write end.', code: 'close(fd[____]);', opts: ['1', '0', '2', '-1'], ans: 0,
    exp: 'fd[1] is the write end. The reader does not need it, and closing it lets EOF arrive.' },
  { type: 'order', q: 'Put the lines in order to send the output of ls into a pipe.', lines: ['pipe(fd);', 'if (fork() == 0) {', '    dup2(fd[1], STDOUT_FILENO);', '    execlp("ls", "ls", NULL);', '}'],
    exp: 'Create the pipe, fork, redirect stdout to the write end in the child, then exec.' },
],

l5_2: [
  { type: 'bug', q: 'Touching *p crashes with SIGBUS. Tap the line that runs too early.', lines: ['int fd = shm_open("/s", O_CREAT | O_RDWR, 0666);', 'int *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);', 'ftruncate(fd, 4096);', '*p = 42;'], ans: 1,
    exp: 'The object still has size 0 when it is mapped. Call ftruncate before mmap.' },
  { type: 'blank', q: 'Fill in the blank so writes are visible to other processes.', code: 'mmap(NULL, 4096, PROT_READ | PROT_WRITE, ____, fd, 0);', opts: ['MAP_SHARED', 'MAP_PRIVATE', 'MAP_ANONYMOUS', 'MAP_FIXED'], ans: 0,
    exp: 'MAP_SHARED shares writes. MAP_PRIVATE gives copy-on-write and keeps them to yourself.' },
  { type: 'order', q: 'Put the POSIX shared memory steps in order.', lines: ['int fd = shm_open("/s", O_CREAT | O_RDWR, 0666);', 'ftruncate(fd, 4096);', 'int *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);', '*p = 42;', 'shm_unlink("/s");'],
    exp: 'Create, size, map, use, then remove the name.' },
],

};

// Mix one hands-on question of each type into every lesson's practice, between the multiple-choice ones.
CHAPTERS.forEach(ch => ch.lessons.forEach(l => {
  const h = LESSON_HANDS[l.id];
  if (!h || l.handsOn) return;
  const mixed = [];
  const m = l.practice || [];
  for (let i = 0; i < Math.max(m.length, h.length); i++) { if (m[i]) mixed.push(m[i]); if (h[i]) mixed.push(h[i]); }
  l.practice = mixed;
  l.handsOn = true;
}));
