// CMPT201 LAB — Topic 6: Inter-Process Communication (slides 11.1 Pipes, 11.2 Shared Memory)

// ═══ Slides 11.1: Pipes, FIFOs and message queues ═══
defLesson('t6', {
  id: 'pipes', deck: '11.1 IPC: Pipes', title: 'Pipes, FIFOs & Message Queues',
  analogy: `A pipe is a one-way tube between two rooms. One person drops notes in at one end, the other reads them at the other end. A FIFO is the same tube with a name painted on the wall, so people from other buildings can find it. A message queue is a tube that carries whole labelled envelopes instead of loose paper.`,
  goals: ['Create a pipe and use it between a parent and child', 'Explain why each process closes the pipe ends it does not use, and how EOF is signalled', 'Redirect input and output with dup2, and know FIFOs and message queues'],
  recap: ['IPC facilities: UNIX domain sockets, pipes, FIFOs, message queues, memory mapping and shared memory.', '<code>pipe(filedes)</code>: <code>filedes[0]</code> is the read end, <code>filedes[1]</code> the write end. A pipe is unidirectional.', 'After <code>fork()</code> both processes have both ends; each closes the end it does not use.', 'The reader gets <code>read() == 0</code> only after <strong>all</strong> write ends are closed.', '<code>dup2(old, new)</code> redirects a descriptor, for example stdout to the pipe\'s write end.', 'FIFO (<code>mkfifo</code>): named, for unrelated processes. Message queue (<code>mq_*</code>): whole prioritised messages.'],
  steps: [
    step('What is IPC?',
      `<p><strong>Inter-process communication (IPC)</strong> is how two processes send data between themselves. A UNIX domain socket is one example. Other facilities: <strong>pipes</strong>, <strong>FIFOs</strong>, <strong>message queues</strong>, <strong>memory mapping and shared memory</strong>.</p><p>Questions it answers: what if the processes are parent and child, what if they are unrelated, and what if we want to send full messages, not just bytes?</p>`,
      'Each facility fits a different relationship between the two processes.',
      'Using the wrong tool: a plain pipe cannot connect two unrelated processes.',
      mc('Which of these is an IPC facility?', ['Pipes', 'Page tables', 'The scheduler', 'A mutex'], 'Pipes, FIFOs, message queues and shared memory are IPC facilities.')),
    step('The pipe() call',
      `<p>We have used shell pipes, as in <code>ps aux | grep bash</code>: the output of the first becomes the input of the second. Programmatically:</p>` + codeBlock(`int filedes[2];
pipe(filedes);
// filedes[0] = read end
// filedes[1] = write end`) + `<p>A pipe is <strong>unidirectional</strong>: data goes in one end and out the other. A pipe creates <strong>file descriptors</strong>, so you use regular file I/O: <code>read()</code> and <code>write()</code>, or the buffered <code>fprintf()</code>/<code>fscanf()</code>.</p>`,
      'It is the simplest IPC: two descriptors from one call.',
      'Mixing up the ends. Index 0 is for reading and index 1 is for writing.',
      mc('In <code>pipe(filedes)</code>, which entry is the write end?', ['filedes[1]', 'filedes[0]', 'filedes[2]', 'Both'], 'filedes[0] is the read end and filedes[1] is the write end.'), 'pipe'),
    step('Parent and child: close the unused ends',
      `<p>The typical use: the parent calls <code>pipe()</code>, then <code>fork()</code>. <code>fork()</code> copies the file descriptors, so <strong>both ends are available in both processes</strong>, and they can communicate.</p><p><strong>Point 1</strong>: each process closes the end it does not use. If the child writes and the parent reads:</p>` + codeBlock(`pid_t pid = fork();
// parent                       // child
close(filedes[1]);                close(filedes[0]);
read(filedes[0], buf, n);         write(filedes[1], msg, len);`),
      'Closing the unused ends is what makes the next step work.',
      'Leaving both ends open in both processes.',
      mc('The child writes into the pipe and the parent reads. What does the parent close?', ['The write end', 'The read end', 'Both ends', 'Neither'], 'The parent only reads, so it closes the write end, filedes[1].')),
    step('Pipe buffer size',
      `<p><strong>Point 2</strong>: a pipe has a limited buffer in the kernel. When you <code>write()</code> n bytes: if <code>n &lt;= PIPE_BUF</code> the write is <strong>atomic</strong> (kept together). If <code>n &gt; PIPE_BUF</code>, the write may be split and other writes may be interleaved between its parts. Details depend on whether the pipe is non-blocking (see <code>man 7 pipe</code>). <code>PIPE_BUF</code> is <strong>4096</strong> on Linux.</p>`,
      'It tells you when several writers can corrupt each other\'s messages.',
      'Assuming big writes stay in one piece. Only up to PIPE_BUF are guaranteed.',
      mc('What is <code>PIPE_BUF</code> on Linux?', ['4096', '1024', '512', '65536'], 'Writes up to 4096 bytes are not interleaved with other writes.')),
    step('Closing all write ends gives EOF',
      `<p><strong>Point 3</strong>: the reader only sees end-of-file when <strong>all</strong> write ends are closed. This works as a signalling mechanism.</p><p>Scenario: the parent creates the pipe and forks. The parent closes its write end and <code>read()</code>s. The child closes its read end and <code>write()</code>s, then closes the write end. Once the parent has read all the data in the pipe's buffer, <code>read()</code> returns <strong>0</strong>, so the parent knows the child closed the write end. If any process still holds a write end open, the reader waits forever.</p>`,
      'A forgotten write end is the classic reason a program hangs.',
      'Leaving the parent\'s own write end open, so read never returns 0.',
      mc('When does <code>read()</code> on a pipe return 0?', ['After the buffer drains and all writers close', 'When the pipe has become completely full', 'As soon as the child process exits', 'When the reader closes its own read end'], 'Zero means end-of-file: no data left and no process can still write.')),
    step('Redirecting with dup2() and popen()',
      `<p><code>int dup2(int oldfd, int newfd)</code> makes <code>newfd</code> a copy of <code>oldfd</code>, so you can redirect a program's input or output to a pipe:</p>` + codeBlock(`dup2(filedes[1], STDOUT_FILENO);   // stdout now goes to the pipe's write end
dup2(filedes[0], STDIN_FILENO);    // stdin now reads from the pipe's read end`) + `<p>After the first line, anything written to stdout goes into the pipe. <code>FILE *popen(const char *command, const char *mode)</code> conveniently runs a command with a pipe: mode <code>"r"</code> gives a stream connected to the command's STDOUT; mode <code>"w"</code> gives a stream connected to its STDIN. Close it with <code>pclose()</code>.</p>`,
      'This is how a shell connects two programs with |.',
      'Redirecting but forgetting to close the original pipe descriptors afterwards.',
      mc('What does <code>dup2(filedes[1], STDOUT_FILENO)</code> do?', ['Makes stdout write into the pipe', 'Makes stdin read from the pipe', 'Closes stdout', 'Creates a new pipe'], 'After it, writes to standard output go into the write end of the pipe.'), 'fdtable'),
    step('FIFOs: named pipes',
      `<p>Related processes (parent, child, grandchild) can share a pipe, but <strong>unrelated processes cannot</strong>. Instead they share a <strong>FIFO</strong>:</p>` + codeBlock(`int mkfifo(const char *pathname, mode_t mode);`) + `<p><code>pathname</code> is the name of the FIFO and <code>mode</code> the permissions, like <code>open()</code>. It creates a file, similar to UNIX domain sockets; remove it with <code>unlink()</code>. One process creates it with <code>mkfifo()</code>, and any process can then use <code>open()</code>, <code>read()</code> and <code>write()</code> with the pathname. A FIFO is still <strong>unidirectional</strong>, typically for two processes: one opens it for read and the other for write, and <code>open()</code> <strong>blocks</strong> until the other process opens it as well.</p>`,
      'A FIFO is the answer to "how do unrelated processes use a pipe".',
      'Calling mkfifo in both programs. Only one creates it.',
      mc('What is the difference between a pipe and a FIFO?', ['A FIFO has a pathname, so unrelated processes can use it', 'A FIFO is bidirectional and a pipe is not', 'A pipe is permanently stored on the disk', 'A FIFO can only be used by parent and child'], 'A pipe is anonymous and shared through fork. A FIFO has a pathname that any process can open.')),
    step('POSIX message queues (briefly)',
      `<p>A <strong>message queue</strong> is similar to a FIFO, but a message is a <strong>whole structured message</strong>, not a stream of bytes. Five important functions: <code>mq_open()</code>, <code>mq_send()</code>, <code>mq_receive()</code>, <code>mq_close()</code> and <code>mq_unlink()</code>. See <code>man 7 mq_overview</code>.</p>` + codeBlock(`int mq_send(mqd_t mqdes, const char *msg_ptr,
            size_t msg_len, unsigned int msg_prio);`) + `<p><code>msg_prio</code> sets the message priority. The queue is a <strong>priority queue</strong> (FIFO for equal priority). <code>mq_receive()</code> retrieves the <strong>oldest highest-priority</strong> message, the whole message at once.</p>`,
      'Use it when you need to send full, prioritised messages.',
      'Expecting strict arrival order. Higher priority messages come out first.',
      mc('Which message does <code>mq_receive()</code> return first?', ['The oldest message of the top priority', 'The newest message that was sent', 'The smallest message in the queue', 'A random message from the queue'], 'The queue is a priority queue that is first-in, first-out within each priority.')),
  ],
  practice: [
    mc('Which facility lets UNRELATED processes share a pipe-like channel?', ['A FIFO', 'A plain pipe', 'The fork() call', 'A signal handler'], 'A FIFO has a name in the file system, so unrelated processes can open it.'),
    mc('Why does each process close the pipe end it does not use?', ['So the reader sees EOF when the writer ends', 'To make the pipe buffer a bit bigger', 'To free up the kernel buffer right away', 'Because pipes carry data both ways'], 'The reader only gets 0 from read() once all write ends are closed.'),
    mc('What does <code>popen("ls", "r")</code> give you?', ['A stream connected to the command\'s stdout', 'A stream connected to its stdin', 'A new FIFO', 'A child PID'], 'Mode "r" lets you read what the command writes to standard output.'),
  ],
  hands: [
    bug('The parent hangs reading the pipe even after the child exits. Tap the faulty line.', ['pipe(filedes);', 'pid_t pid = fork();', 'if (pid != 0) { /* parent, reads from filedes[0] */ }', '/* the parent never calls close(filedes[1]) */'], 3, 'The parent still holds a write end open, so read() never returns 0. It must close <code>filedes[1]</code>.'),
    blank('Fill in the blank to send the child\'s standard output into the pipe.', 'dup2(filedes[____], STDOUT_FILENO);', ['1', '0', '2', '-1'], 'Index 1 is the write end, and standard output should feed it.'),
    order('Put the lines in order for a parent to read what the child writes.', ['pipe(filedes);', 'pid_t pid = fork();', 'close(filedes[1]);  /* parent */', 'read(filedes[0], buf, sizeof buf);'], 'Create the pipe, fork, close the unused write end in the parent, then read.'),
  ],
  quiz: [
    mc('A parent and child share a pipe. Both keep both ends open. The child writes and exits. What happens when the parent reads until EOF?', ['It blocks, since the parent holds a write end', 'It reads 0 at once and finishes', 'It crashes with a segmentation fault', 'It reads the same data twice over'], 'The parent\'s own write end is still open, so no EOF is ever signalled.'),
    mc('What is true about a pipe?', ['It is unidirectional', 'It is bidirectional', 'It has a pathname', 'It works only between unrelated processes'], 'Data flows one way through a pipe, from the write end to the read end.'),
    mc('Which call creates a FIFO?', ['mkfifo()', 'pipe()', 'mq_open()', 'dup2()'], 'mkfifo(pathname, mode) creates a named pipe.'),
    mc('Why does <code>open()</code> on a FIFO sometimes block?', ['It waits for the other side to open it', 'The disk where the FIFO lives is full', 'The pipe buffer happens to be empty', 'mkfifo was never called by anyone'], 'One process opens for read and the other for write; each waits for its partner.'),
    mc('What does a message queue add compared with a FIFO?', ['Whole messages with priorities', 'A pathname in the file system', 'Bytes that flow in both directions', 'Memory that two processes share'], 'A message queue carries structured messages and is a priority queue.'),
  ],
});

// ═══ Slides 11.2: Memory mapping and shared memory ═══
defLesson('t6', {
  id: 'shm', deck: '11.2 IPC: Shared Memory', title: 'Memory Mapping & Shared Memory',
  analogy: `A file mapping is a window cut into the wall that looks straight onto a real file. An anonymous mapping is a window onto a blank room. A shared mapping is a window that two people can both look and write through; a private one gives each person their own scratch copy.`,
  goals: ['Explain what mmap() does and the file vs anonymous types', 'Choose among the four mapping possibilities (shared or private, file or anonymous)', 'Share memory with shm_open, ftruncate, mmap and clean up'],
  recap: ['<code>mmap(addr, length, prot, flags, fd, offset)</code> returns a pointer to the new mapping; <code>munmap</code> removes it.', 'File mapping: backed by a file. Anonymous mapping (<code>MAP_ANONYMOUS</code>, fd -1, offset 0): fresh memory.', '<code>MAP_SHARED</code> changes are seen by others (and go to the file); <code>MAP_PRIVATE</code> changes are not.', 'Shared anonymous mapping before <code>fork()</code> gives parent and child shared memory.', 'Unrelated processes: <code>shm_open</code> then <code>ftruncate</code> (size starts at 0) then <code>mmap</code>.', 'Cleanup: <code>munmap</code> and <code>shm_unlink</code>.'],
  steps: [
    step('What memory mapping is',
      `<p><strong>Memory mapping</strong> is not just for IPC. Uses: loading a whole file into memory and using <strong>memory access instead of <code>read()</code>/<code>write()</code></strong>; allocating memory; sharing memory between processes.</p>` + codeBlock(`void *mmap(void *addr, size_t length, int prot, int flags,
           int fd, off_t offset);`) + `<ul><li><code>addr</code>: starting address, usually <code>NULL</code> so the OS picks it.</li><li><code>length</code>: number of bytes in the mapping.</li><li><code>prot</code>: protection (readable, writable, executable, or not accessible).</li><li><code>flags</code>: <code>MAP_SHARED</code> or <code>MAP_PRIVATE</code>, and optionally <code>MAP_ANONYMOUS</code>.</li><li><code>fd</code> and <code>offset</code>: which file, and where in it.</li></ul><p>It returns a pointer to the start of the mapping.</p>`,
      'mmap is the base of both shared memory and file I/O through memory.',
      'Forgetting that the result is a pointer you read and write like an array.',
      mc('What does <code>mmap()</code> return on success?', ['A pointer to the start of the mapping', 'A new file descriptor for the file', 'The number of bytes that were mapped', 'The size of the underlying file'], 'The return value is the address where the mapping begins.')),
    step('File mapping vs anonymous mapping',
      `<p>There are two types of memory mapping:</p><ul><li><strong>File mapping</strong> (the <code>MAP_ANONYMOUS</code> flag is <strong>not</strong> set): a file is loaded into a memory region, and file I/O becomes memory access. This is a <strong>memory-mapped file</strong>.</li><li><strong>Anonymous mapping</strong> (<code>MAP_ANONYMOUS</code> set): no file. It is another way to get more memory for the process (besides <code>sbrk()</code>); <code>malloc()</code> uses both <code>sbrk()</code> and <code>mmap()</code>. Use <code>fd = -1</code> and <code>offset = 0</code>.</li></ul>`,
      'This is a standard exam question and the answer is the presence of a backing file.',
      'Passing a real fd together with MAP_ANONYMOUS. Use -1.',
      mc('Which is the key difference between a file mapping and an anonymous mapping?', ['A file mapping has a file; an anonymous one has none', 'Anonymous mappings are always read-only', 'File mappings can never be written to', 'Anonymous mappings need a real fd'], 'The file mapping comes from a file descriptor. The anonymous one is plain new memory.'), 'mmap'),
    step('Shared vs private mappings',
      `<p><strong>Shared mapping</strong>: changes are visible to other processes that share the mapping, because the memory is cloned or mapped from the same file. When <code>fork()</code> clones a mapping, the parent and child share it, and multiple processes can map the same file. Changes to a shared file mapping are also carried to the file.</p><p><strong>Private mapping</strong>: changes in one process's mapping are <strong>not</strong> seen by other processes (and not carried to the file).</p>`,
      'The flag you pick decides whether the memory is really shared.',
      'Using MAP_PRIVATE and wondering why the other process never sees the writes.',
      mc('A process writes to a MAP_PRIVATE file mapping. What happens to the file?', ['The file does not change', 'The file changes at once', 'The file is deleted', 'Other processes see the change'], 'Private mapping changes stay in the process and are not carried to the file.')),
    step('The four possibilities',
      `<table class="mini"><tr><th></th><th>Private</th><th>Shared</th></tr><tr><th>File</th><td>Fast access to a temporary copy of a file; changes not saved</td><td>Many processes edit a file and see each other's edits, saved to disk</td></tr><tr><th>Anonymous</th><td>More memory for this process (like malloc)</td><td>Memory shared with related processes (parent and child)</td></tr></table><p>Example: <code>d1 = malloc(...)</code> and <code>d2 = mmap(... MAP_PRIVATE | MAP_ANONYMOUS ...)</code> both hold <code>"h_"</code> / <code>"H_"</code>. The child changes the second character of each after <code>fork()</code>. The parent prints <code>h_ H_</code>. With <code>MAP_SHARED | MAP_ANONYMOUS</code> for d2, it prints <code>h_ HI</code>: only the shared mapping changed for the parent.</p>`,
      'Trace questions like this one are common.',
      'Thinking malloc memory is shared after fork. Each process gets its own copy.',
      mc('A child changes a <code>MAP_SHARED | MAP_ANONYMOUS</code> region created before <code>fork()</code>. What does the parent see?', ["The child's change", 'The old value from before', 'A crash from the kernel', 'Nothing, since the region is gone'], 'A shared mapping is not copied apart by fork: both processes see the same memory.')),
    step('Sharing memory between processes',
      `<p>Two ways to share memory:</p><ul><li><strong>Related processes</strong> (parent and child): <code>mmap()</code> with <code>MAP_SHARED | MAP_ANONYMOUS</code> before <code>fork()</code>.</li><li><strong>Unrelated processes</strong>: a named shared memory object using <code>shm_open()</code>, <code>ftruncate()</code> and <code>mmap()</code> (see <code>man 7 shm_overview</code>).</li></ul><p>You need <code>shm_open()</code> when two <strong>unrelated</strong> processes want to share memory.</p>`,
      'Choosing between the two is the main design decision.',
      'Trying to share anonymous memory with a process you did not fork.',
      mc('When do you need <code>shm_open()</code>?', ['When two unrelated processes share memory', 'When a parent and child share memory', 'Whenever the program calls mmap at all', 'When the program allocates heap memory'], 'Unrelated processes cannot inherit a mapping, so they share a named shared memory object.'), 'shm'),
    step('shm_open() and ftruncate()',
      `<p><code>int shm_open(const char *name, int oflag, mode_t mode)</code> is like opening a file, but it is shared memory. It creates an object listed in <code>/dev/shm/</code>. The <code>name</code> must be known by all participating processes, in the form <code>/somename</code>. Use <code>O_CREAT</code> when creating, plus a <code>mode</code> for permissions. It returns a file descriptor.</p><p>The memory object is created with <strong>size 0</strong>. <code>int ftruncate(int fd, off_t length)</code> <strong>sets its size</strong>. Then <code>mmap()</code> it using the descriptor from <code>shm_open()</code>. This is a POSIX shared memory object.</p>` + codeBlock(`int fd = shm_open("/s", O_CREAT | O_RDWR, 0600);
ftruncate(fd, 4096);                  // size 0 -> 4096 bytes`),
      'These three calls, in this order, are the whole recipe.',
      'Calling mmap before ftruncate. The object still has size 0.',
      mc('What is <code>ftruncate()</code> used for after <code>shm_open()</code>?', ['Setting the size of the shared memory object', 'Deleting the object', 'Mapping it', 'Locking it'], 'A new shared memory object has size 0, so ftruncate gives it its size.')),
    step('Writer and reader example',
      `<p>The writer creates, sizes, maps and stores a value; the reader opens and reads it:</p>` + codeBlock(`// writer
int fd = shm_open("/myshm", O_CREAT | O_RDWR, S_IRUSR | S_IWUSR);
ftruncate(fd, sizeof(uint8_t));
uint8_t *ptr = mmap(NULL, sizeof(uint8_t), PROT_READ | PROT_WRITE,
                    MAP_SHARED, fd, 0);
*ptr = 42;

// reader: the same setup, but the last line is
printf("%d\\n", *ptr);`),
      'The reader just copies the writer\'s setup and prints.',
      'Using MAP_PRIVATE in the writer. The reader would never see 42.',
      mc('Which flag must the writer\'s <code>mmap()</code> use for the reader to see the value?', ['MAP_SHARED', 'MAP_PRIVATE', 'MAP_ANONYMOUS', 'PROT_NONE'], 'MAP_SHARED makes writes visible to other processes that map the same object.')),
    step('Cleanup: munmap and shm_unlink',
      `<p><code>int munmap(void *addr, size_t length)</code> unmaps the memory when you no longer need it. <code>int shm_unlink(const char *name)</code> removes the shared memory object from <code>/dev/shm/</code> when everyone is done. Processes still using the object keep using it.</p>`,
      'Leaked names pile up in /dev/shm.',
      'Calling shm_unlink and expecting running processes to lose the memory at once.',
      mc('What does <code>shm_unlink()</code> do?', ["Removes the object's name from /dev/shm", 'Unmaps the memory from the process', 'Sets the size of the shared object', 'Closes the file descriptor of the object'], 'It removes the file from /dev/shm. Processes already using the object keep using it.')),
  ],
  practice: [
    mc('Which type of mapping is best for fast access to a temporary copy of a file?', ['Private file mapping', 'Shared anonymous mapping', 'Shared file mapping', 'Private anonymous mapping'], 'A private file mapping gives you a copy whose changes are not saved.'),
    mc('Which mapping lets parent and child share memory with no file?', ['Shared anonymous mapping', 'Private file mapping', 'Private anonymous mapping', 'Shared file mapping'], 'MAP_SHARED | MAP_ANONYMOUS before fork shares memory without any file.'),
    mc('What does <code>munmap()</code> do?', ['Unmaps mapped memory', 'Removes the shared memory object name', 'Sets the size of the object', 'Opens a file'], 'munmap removes the mapping from your address space.'),
  ],
  hands: [
    bug('Touching the shared memory crashes or fails. Tap the line that runs too early.', ['int fd = shm_open("/s", O_CREAT | O_RDWR, 0600);', 'int *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);', 'ftruncate(fd, 4096);', '*p = 42;'], 1, 'The object still has size 0 when it is mapped. Call <code>ftruncate</code> before <code>mmap</code>.'),
    blank('Fill in the blank so writes are visible to other processes.', 'mmap(NULL, 4096, PROT_READ | PROT_WRITE, ____, fd, 0);', ['MAP_SHARED', 'MAP_PRIVATE', 'MAP_ANONYMOUS', 'MAP_FIXED'], 'MAP_SHARED shares writes. MAP_PRIVATE keeps them to yourself.'),
    order('Put the POSIX shared memory steps in order.', ['int fd = shm_open("/s", O_CREAT | O_RDWR, 0600);', 'ftruncate(fd, 4096);', 'int *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);', '*p = 42;', 'shm_unlink("/s");'], 'Create, size, map, use, then remove the name.'),
  ],
  quiz: [
    mc('The program maps <code>d2</code> with <code>MAP_PRIVATE | MAP_ANONYMOUS</code>, forks, and the child changes d2. What does the parent print for d2?', ['The original value', "The child's new value", 'Garbage bytes', 'Nothing at all'], 'A private mapping is not shared, so the parent never sees the child\'s change.'),
    mc('What size does a new shared memory object have right after <code>shm_open()</code>?', ['0', '4096', '1', 'Length of its name'], 'It is created with size 0, which is why ftruncate is needed.'),
    mc('Which call returns file contents as memory you can index with a pointer?', ['mmap() on a file', 'dup2()', 'pipe()', 'fork()'], 'A file mapping turns file I/O into ordinary memory access.'),
    mc('For an anonymous mapping, what values do <code>fd</code> and <code>offset</code> take?', ['fd = -1 and offset = 0', 'fd = 0 and offset = 1', 'Any open fd and offset', 'fd = 3 and offset = -1'], 'There is no file behind an anonymous mapping, so fd is -1 and the offset is 0.'),
    mc('Where does the named shared memory object appear?', ['In /dev/shm/', 'In /proc/', 'In /sys/', 'In the heap'], 'shm_open creates an object listed in /dev/shm/, like a file.'),
  ],
});
