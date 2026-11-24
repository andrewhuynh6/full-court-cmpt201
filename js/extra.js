// CMPT201 LAB — Extra lessons that close the gaps found against a past final:
// buffered I/O and file offsets, socket types and epoll, mmap file vs anonymous, worked synchronization problems,
// and an optional security/crypto bonus topic. Each lesson is fully self-contained (steps, practice, quiz).
// Also attaches one short-answer question from the written bank to every lesson's practice.

function defLesson(chId, L) {
  const ch = CHAPTERS.find(c => c.id === chId);
  const intro = { kind: 'intro', title: 'The big picture',
    html: `<p class="lead">${L.analogy}</p><div class="step-label">By the end of this lesson you can</div><ul>${L.goals.map(g => `<li>${g}</li>`).join('')}</ul>` };
  const recap = { kind: 'recap', title: 'Recap',
    html: `<div class="step-label">Cheat sheet</div><ul class="recap-list">${L.recap.map(r => `<li>${r}</li>`).join('')}</ul>` };
  const mixed = [];
  const m = L.practice, h = L.hands || [];
  for (let i = 0; i < Math.max(m.length, h.length); i++) { if (m[i]) mixed.push(m[i]); if (h[i]) mixed.push(h[i]); }
  ch.lessons.push({ id: L.id, title: L.title, learn: '', steps: [intro, ...L.steps, recap], practice: mixed, quiz: L.quiz, deepened: true, handsOn: true });
}

// ── New topic: security and crypto (bonus, optional) ────────────────
CHAPTERS.push({ id: 'ch6', num: '06', title: 'Security & Crypto', subtitle: 'CIA, keys, hashes, signatures', icon: 'shield-check', color: '#0F766E', bonus: true, lessons: [] });

// ═══════════════════════════════════════════════════════════════════
// File systems & I/O: buffered I/O and file offsets
// ═══════════════════════════════════════════════════════════════════
defLesson('ch3', {
  id: 'l3_3', title: 'Buffered I/O & File Offsets',
  analogy: `Unbuffered I/O is a waiter who walks to the kitchen after every single item you order. Buffered I/O is a waiter who writes the whole table's order on a pad first, then makes one trip. And every open file has a bookmark that remembers where you stopped reading.`,
  goals: ['Tell buffered functions (<code>fwrite</code>) from unbuffered ones (<code>write</code>)', 'Predict when buffered output actually reaches the file', 'Explain why each open file has its own offset, and who shares it'],
  recap: ['<code>open/read/write/close</code> are system calls. <code>fopen/fprintf/fwrite/fgets</code> are buffered stdio.', 'Buffering cuts system calls: many small writes become a few big ones.', 'Buffered output leaves on a full buffer, <code>fflush</code>, <code>fclose</code>, normal exit, or a newline on a terminal.', '<code>fork</code> copies unflushed buffers, so output can appear twice.', 'The offset lives in the open file description. <code>dup</code> and <code>fork</code> share it; a second <code>open</code> gets its own.'],
  steps: [
    { title: 'Two families of file functions',
      html: `<p><strong>Unbuffered</strong> I/O talks to the kernel directly. <strong>Buffered</strong> I/O (the C library, stdio) keeps a copy of the data in a user-space buffer first.</p>`
        + codeBlock(`// unbuffered: system calls
int fd = open("a.txt", O_RDONLY);
read(fd, buf, 100);  write(fd, buf, 100);  close(fd);

// buffered: C library (stdio)
FILE *f = fopen("a.txt", "r");
fread(buf, 1, 100, f);  fprintf(f, "x");  fclose(f);`),
      why: 'The exam asks you to name one function from each family, so know both lists cold.',
      mistake: 'Mixing the two: <code>fread</code> needs a <code>FILE *</code>, while <code>read</code> needs an int descriptor.',
      check: { q: 'Which of these is a buffered I/O function?', opts: ['fwrite', 'write', 'lseek', 'open'], ans: 0, exp: 'fwrite belongs to stdio and writes into a user-space buffer. write, lseek and open are system calls.' } },
    { title: 'Why buffer? Fewer system calls',
      html: `<p>A system call switches into the kernel, which is slow compared to copying a byte in memory. Buffering collects small writes and sends one big write.</p>`
        + codeBlock(`for (int i = 0; i < 10000; i++)
    fputc('x', f);      // buffered: ~3 write() calls
    // write(fd, "x", 1);  // unbuffered: 10000 calls`),
      why: 'This is the whole reason stdio exists, and the standard answer to "why use buffered I/O".',
      mistake: 'Thinking buffered I/O is always better. For a log you must not lose, or interactive prompts, you may want to flush or go unbuffered.',
      check: { q: 'A program calls <code>fputc</code> 10000 times on a file with a 4096-byte buffer. About how many <code>write</code> system calls happen?', opts: ['3', '10000', '1', '4096'], ans: 0, exp: 'Two full buffers (8192 bytes) plus the final flush of the remaining 1808 bytes gives about 3 writes.' } },
    { title: 'When does buffered output actually leave?',
      html: `<p>The data stays in the buffer until one of these happens:</p><ul><li>the buffer fills up</li><li>you call <code>fflush</code> or <code>fclose</code></li><li>the program exits normally</li><li>a <code>\\n</code> is printed <em>and</em> the output is a terminal (line buffered)</li></ul><p>Written to a file or pipe, stdout is <strong>fully buffered</strong>, so a newline alone does not flush it.</p>`,
      why: 'This explains why printf debugging output sometimes disappears when a program crashes.',
      mistake: 'Assuming every <code>\\n</code> flushes. That is only true when stdout is a terminal.',
      check: { q: 'A program calls <code>printf("saved")</code> with stdout redirected to a file, then crashes with a segfault. What ends up in the file?', opts: ['Probably nothing, since it was still buffered', 'The full word saved, written before the crash', 'The word saved followed by a newline character', 'A partial word such as sav, cut off mid-write'], ans: 0, exp: 'A crash skips the normal exit flush, so unflushed buffered text is lost.' } },
    { title: 'The fork trap: buffers get copied',
      html: `<p><code>fork</code> copies the whole process, including any text still waiting in the stdio buffer. Both processes then flush their own copy.</p>`
        + codeBlock(`printf("hi\\n");   // stdout redirected to a file: still buffered
fork();
// both parent and child exit and flush: "hi" appears twice`),
      why: 'This is a classic exam trace question and a real source of duplicated output.',
      mistake: 'Expecting one line. Call <code>fflush(stdout)</code> before <code>fork</code> to flush first.',
      check: { q: 'stdout goes to a file. The program runs <code>printf("hi\\n"); fork();</code> and both processes exit normally. How many times does "hi" appear?', opts: ['2', '1', '0', '4'], ans: 0, exp: 'The unflushed buffer is copied by fork, and each process flushes its own copy at exit.' } },
    { title: 'Every open file has an offset',
      html: `<p>The kernel remembers a <strong>file offset</strong>: the position of the next read or write. Each <code>read</code> and <code>write</code> moves it forward by the bytes transferred. <code>lseek</code> moves it directly.</p>`
        + codeBlock(`int fd = open("data.txt", O_RDONLY);
read(fd, buf, 10);          // bytes 0-9, offset is now 10
read(fd, buf, 10);          // bytes 10-19, offset is now 20
lseek(fd, 0, SEEK_SET);     // back to the start`),
      why: 'Without an offset, every read and write would need a position argument.',
      mistake: 'Forgetting that a read moves the offset, then reading the same bytes twice by accident.',
      check: { q: 'After <code>read(fd, buf, 10)</code> twice in a row, where does the next read begin?', opts: ['Byte 20', 'Byte 10', 'Byte 0', 'Byte 11'], ans: 0, exp: 'Each read advanced the offset by 10, so the next read starts at byte 20.' } },
    { title: 'Why the offset belongs to the open file',
      html: `<p>The offset is stored in the <strong>open file description</strong>: the kernel object created by <code>open</code>. It is not stored in the file (many openers) or in the descriptor number.</p><ul><li>Two separate <code>open</code> calls get <strong>separate</strong> offsets, so independent readers never disturb each other.</li><li><code>dup</code> and <code>fork</code> <strong>share</strong> one description, so they share one offset. A child continues where its parent stopped.</li></ul>`
        + codeBlock(`int a = open("f", O_RDONLY);
int b = open("f", O_RDONLY);   // separate offsets
int c = dup(a);                // c and a share one offset`),
      why: 'This is the answer to "why is there a file offset for each open file", and it explains how shell redirection appends output from several commands.',
      mistake: 'Believing the offset is a property of the file itself. Two programs can read the same file at different positions.',
      check: { q: 'After <code>int c = dup(a);</code>, you call <code>read(c, buf, 5)</code>. What is the offset seen through descriptor <code>a</code>?', opts: ['Also advanced by 5', 'Unchanged', 'Reset to 0', 'Undefined'], ans: 0, exp: 'a and c refer to one open file description, so they share the offset.' } },
  ],
  practice: [
    { q: 'Which pair contains one buffered and one unbuffered function?', opts: ['fprintf and write', 'fread and fgets', 'open and read', 'fopen and fclose'], ans: 0, exp: 'fprintf is stdio (buffered); write is a system call. The other pairs are both buffered or both unbuffered.' },
    { q: 'You want a progress message to appear immediately even though stdout goes to a file. What do you call after printf?', opts: ['fflush(stdout)', 'fclose(stdin)', 'lseek(1, 0, SEEK_SET)', 'sync()'], ans: 0, exp: 'fflush empties the stdio buffer right away.' },
    { q: 'Two processes each call <code>open("log.txt", O_RDONLY)</code> and read 8 bytes. Process A then reads again. Which bytes does A get?', opts: ['Bytes 8 to 15', 'Bytes 16 to 23', 'Bytes 0 to 7', 'Bytes 4 to 11'], ans: 0, exp: 'Separate open calls mean separate offsets. B reading did not move A.' },
  ],
  hands: [
    { type: 'bug', q: 'This should read 16 bytes from a file. Tap the line that mixes up the two I/O families.', lines: ['int fd = open("a.txt", O_RDONLY);', 'char buf[16];', 'fread(buf, 1, 16, fd);', 'close(fd);'], ans: 2,
      exp: '<code>fread</code> expects a <code>FILE *</code> from <code>fopen</code>. With an int descriptor use <code>read(fd, buf, 16)</code>.' },
    { type: 'blank', q: 'Fill in the blank so the call returns the current offset without moving it.', code: 'off_t pos = lseek(fd, 0, ____);', opts: ['SEEK_CUR', 'SEEK_SET', 'SEEK_END', 'O_APPEND'], ans: 0,
      exp: 'SEEK_CUR measures from the current offset, so an offset of 0 just reports it.' },
    { type: 'order', q: 'Put these stdio lines in order so "start" is guaranteed to be in the file before the program continues.', lines: ['FILE *f = fopen("log.txt", "w");', 'fputs("start\\n", f);', 'fflush(f);', 'fclose(f);'],
      exp: 'Open, write into the buffer, flush it out, then close.' },
  ],
  quiz: [
    { q: 'A program writes one byte at a time with <code>write(fd, &c, 1)</code> in a loop of 100000. How could you cut the system calls without changing the logic?', opts: ['Switch to fputc on a FILE *', 'Call lseek between writes', 'Open the file with O_SYNC', 'Call dup on the descriptor'], ans: 0, exp: 'stdio batches the bytes into large writes. O_SYNC would make every write slower.' },
    { q: 'stdout is a terminal. <code>printf("abc\\n")</code> runs, then the program crashes. What do you see?', opts: ['abc', 'Nothing', 'ab', 'abc printed twice'], ans: 0, exp: 'Terminal output is line buffered: the newline flushed it before the crash.' },
    { q: 'Parent opens a file, then forks. The child reads 4 bytes. The parent then reads 4 bytes. Which bytes does the parent get?', opts: ['Bytes 4 to 7', 'Bytes 0 to 3', 'Bytes 8 to 11', 'It depends on the file'], ans: 0, exp: 'fork shares the open file description, so the shared offset is already at 4.' },
    { q: 'Where does the kernel store the offset used by <code>read</code>?', opts: ['In the open file description', 'In the inode on disk', 'In the file descriptor number', 'In the user buffer'], ans: 0, exp: 'The open file description holds the offset and flags. The inode is shared by every opener.' },
    { q: 'Which statement about <code>lseek</code> is true?', opts: ['It changes only the offset; no data moves', 'It reads data starting from a new position', 'It flushes the stdio buffer to the disk first', 'It works only on pipes and sockets, not files'], ans: 0, exp: 'lseek only moves the offset. Pipes and sockets cannot seek.' },
  ],
});

// ═══════════════════════════════════════════════════════════════════
// Networking: socket types, passive sockets and epoll
// ═══════════════════════════════════════════════════════════════════
defLesson('ch4', {
  id: 'l4_3', title: 'Socket Types, Passive Sockets & epoll',
  analogy: `A stream socket is a phone call: you connect once and talk in order. A datagram socket is postcards: each one stands alone and may arrive late or not at all. A passive socket is the receptionist who only answers the phone and hands each caller to someone else. epoll is the receptionist's light board that shows which lines are ringing.`,
  goals: ['Compare stream and datagram sockets', 'Explain what a passive socket is and what <code>accept</code> returns', 'Describe what epoll is for and read a basic epoll loop'],
  recap: ['<code>SOCK_STREAM</code> (TCP): connected, reliable, ordered byte stream. <code>SOCK_DGRAM</code> (UDP): connectionless, message-based, no guarantees.', 'A passive socket is made by <code>socket</code>, <code>bind</code>, <code>listen</code>. It only accepts; it never reads or writes data.', '<code>accept</code> returns a new <strong>active</strong> socket for that one client.', 'epoll watches many descriptors and returns only the ready ones: <code>epoll_create1</code>, <code>epoll_ctl</code>, <code>epoll_wait</code>.', 'epoll scales better than <code>select</code> and <code>poll</code> because the kernel keeps the interest list.'],
  steps: [
    { title: 'Stream vs datagram sockets',
      html: `<p>The socket type chooses the transport behaviour:</p><ul><li><strong>Stream</strong> (<code>SOCK_STREAM</code>, TCP): needs <code>connect</code>/<code>accept</code>, reliable, in order, a byte stream with no message boundaries.</li><li><strong>Datagram</strong> (<code>SOCK_DGRAM</code>, UDP): no connection, each <code>sendto</code> is one message with boundaries, but messages can be lost, duplicated or reordered.</li></ul>`,
      why: 'Servers pick TCP for correctness (web, ssh) and UDP for speed or small messages (DNS, games, video calls).',
      mistake: 'Expecting one <code>read</code> to return exactly one <code>write</code> on a stream socket. Streams have no message boundaries.',
      check: { q: 'Which statement describes a datagram socket?', opts: ['No connection; each message is separate and may be lost', 'A reliable, ordered byte stream between two peers', 'It must call listen before use', 'It guarantees every message arrives'], ans: 0, exp: 'Datagram sockets are connectionless and unreliable by design. Streams are the reliable, ordered ones.' } },
    { title: 'Passive vs active sockets',
      html: `<p>A <strong>passive</strong> (listening) socket waits for incoming connections. You make one with <code>socket</code>, <code>bind</code>, then <code>listen</code>. You never <code>read</code> or <code>write</code> on it.</p><p>When a client connects, <code>accept</code> returns a <strong>new, active</strong> socket for that single conversation. The passive socket keeps listening.</p>`
        + codeBlock(`int lfd = socket(AF_INET, SOCK_STREAM, 0);
bind(lfd, (struct sockaddr *)&addr, sizeof addr);
listen(lfd, 5);                 // lfd is now passive
int cfd = accept(lfd, NULL, NULL);   // cfd is active
read(cfd, buf, sizeof buf);`),
      why: 'The word "passive socket" is a one-line exam answer: the listening socket that accepts connections.',
      mistake: 'Calling <code>read(lfd, ...)</code> on the listening socket. Read from the descriptor <code>accept</code> returned.',
      check: { q: 'What does <code>accept</code> return?', opts: ['A new connected socket for one client', 'The listening socket again', 'The client IP address as a string', 'The number of waiting clients'], ans: 0, exp: 'accept returns a fresh active socket. The original passive one stays open for more clients.' } },
    { title: 'One server, many clients',
      html: `<p>A loop of <code>accept</code> then <code>read</code> serves one client at a time. While it blocks on client A, client B waits. There are three common fixes:</p><ul><li>one <strong>process</strong> per client (<code>fork</code>)</li><li>one <strong>thread</strong> per client</li><li><strong>I/O multiplexing</strong>: one thread watches many descriptors with <code>select</code>, <code>poll</code> or <code>epoll</code></li></ul>`,
      why: 'Multiplexing handles thousands of mostly idle clients without thousands of threads.',
      mistake: 'Making a thread per client for 100000 idle connections. Memory and context switches pile up.',
      check: { q: 'Which approach serves many clients from a single thread?', opts: ['I/O multiplexing with epoll', 'fork per client', 'A thread per client', 'Calling accept in a loop'], ans: 0, exp: 'epoll lets one thread wait on many sockets and react only to the ready ones.' } },
    { title: 'What epoll is for',
      html: `<p><code>epoll</code> is a Linux API to monitor many file descriptors and be told which are <strong>ready</strong> (data to read, room to write). It uses three calls:</p>`
        + codeBlock(`int ep = epoll_create1(0);                          // make the epoll instance
epoll_ctl(ep, EPOLL_CTL_ADD, fd, &ev);               // watch fd (ADD / MOD / DEL)
int n = epoll_wait(ep, events, MAX, -1);             // block until some are ready`)
        + `<p>The kernel keeps the interest list, and <code>epoll_wait</code> returns only the ready descriptors.</p>`,
      why: 'Compared with <code>select</code> and <code>poll</code>, you do not pass and scan the whole list on every call, so cost grows with the ready count, not the total.',
      mistake: 'Treating <code>epoll_wait</code> as returning all descriptors. It returns only those that are ready.',
      check: { q: 'What is the main purpose of the epoll API?', opts: ['Watch many descriptors and report the ready ones', 'Create a pair of connected sockets for two processes', 'Map a file straight into the process address space', 'Encrypt the data that travels over a socket'], ans: 0, exp: 'epoll is scalable I/O event notification for many file descriptors.' } },
    { title: 'An epoll server loop',
      html: `<p>The pattern: add the listening socket, then loop. If the ready descriptor is the listening one, <code>accept</code> and add the new client. Otherwise it is a client, so <code>read</code> it.</p>`
        + codeBlock(`for (;;) {
    int n = epoll_wait(ep, evs, 64, -1);
    for (int i = 0; i < n; i++) {
        int fd = evs[i].data.fd;
        if (fd == lfd) {
            int c = accept(lfd, NULL, NULL);
            ev.events = EPOLLIN; ev.data.fd = c;
            epoll_ctl(ep, EPOLL_CTL_ADD, c, &ev);
        } else if (read(fd, buf, sizeof buf) <= 0) {
            close(fd);           // client left
        }
    }
}`),
      why: 'This skeleton is the answer to "write an epoll loop" questions.',
      mistake: 'Calling <code>read</code> on the listening socket instead of <code>accept</code>, or forgetting to add the new client to epoll.',
      check: { q: 'In the loop above, the ready descriptor equals <code>lfd</code>. What should the code do?', opts: ['Accept a new client and add it to epoll', 'Read the waiting data from the lfd socket', 'Close lfd because the server is finished', 'Call listen on lfd once more to re-arm it'], ans: 0, exp: 'A ready listening socket means a client is waiting to be accepted.' } },
    { title: 'Level-triggered vs edge-triggered',
      html: `<p>By default epoll is <strong>level-triggered</strong>: it keeps reporting a descriptor as ready while unread data remains. With <code>EPOLLET</code> it is <strong>edge-triggered</strong>: you are told once when new data arrives.</p><p>With edge-triggered mode you must read until <code>read</code> returns <code>EAGAIN</code>, or you may never be told about the rest.</p>`,
      why: 'Level-triggered is safer and the usual default. Edge-triggered is faster but easier to get wrong.',
      mistake: 'Using <code>EPOLLET</code> and reading only once. Leftover bytes are not reported again.',
      check: { q: 'With the default (level-triggered) mode, a socket has 100 unread bytes and you read only 10. What does the next <code>epoll_wait</code> do?', opts: ['Reports it ready again', 'Blocks until new data arrives', 'Removes it from the list', 'Returns an error'], ans: 0, exp: 'Level-triggered mode keeps reporting readiness while data remains.' } },
  ],
  practice: [
    { q: 'Which socket would you choose for a DNS-style query where one small message gets one small reply?', opts: ['SOCK_DGRAM', 'SOCK_STREAM', 'A passive socket', 'AF_UNIX pipe'], ans: 0, exp: 'Small independent messages suit datagram sockets and avoid connection setup.' },
    { q: 'A server calls <code>socket</code>, <code>bind</code> and <code>listen</code>. What is the descriptor now?', opts: ['A passive socket', 'An active socket', 'A datagram socket', 'A closed socket'], ans: 0, exp: 'After listen the socket only accepts connections, which makes it passive.' },
    { q: 'One thread must handle 5000 mostly idle client connections. Which design fits best?', opts: ['epoll on all the sockets', 'A thread per client', 'fork per client', 'Blocking read on each in order'], ans: 0, exp: 'epoll scales to many idle descriptors without a thread each.' },
  ],
  hands: [
    { type: 'bug', q: 'The server never serves clients. Tap the faulty line inside the epoll loop.', lines: ['int n = epoll_wait(ep, evs, 64, -1);', 'for (int i = 0; i < n; i++) {', '    if (evs[i].data.fd == lfd)', '        read(lfd, buf, sizeof buf);', '}'], ans: 3,
      exp: 'A ready listening socket means a pending connection. Call <code>accept</code>, not <code>read</code>.' },
    { type: 'blank', q: 'Fill in the blank to create a UDP socket.', code: 'int s = socket(AF_INET, ____, 0);', opts: ['SOCK_DGRAM', 'SOCK_STREAM', 'SOCK_PASSIVE', 'AF_PACKET'], ans: 0,
      exp: 'SOCK_DGRAM selects datagram (UDP) behaviour.' },
    { type: 'order', q: 'Put the epoll setup in order.', lines: ['int ep = epoll_create1(0);', 'struct epoll_event ev = { .events = EPOLLIN, .data.fd = lfd };', 'epoll_ctl(ep, EPOLL_CTL_ADD, lfd, &ev);', 'int n = epoll_wait(ep, evs, 64, -1);'],
      exp: 'Create the instance, describe the event, register the descriptor, then wait.' },
  ],
  quiz: [
    { q: 'Which call blocks until at least one watched descriptor is ready?', opts: ['epoll_wait', 'epoll_create1', 'epoll_ctl', 'listen'], ans: 0, exp: 'epoll_wait is the blocking call. create1 makes the instance and ctl edits the watch list.' },
    { q: 'A client sends two 100-byte writes over TCP. The server calls <code>read(fd, buf, 1000)</code> once. What can it receive?', opts: ['Anywhere from 1 up to 200 bytes', 'Exactly 100 bytes, matching the first write', 'Always exactly 200 bytes in a single read', 'Exactly one message with its boundary intact'], ans: 0, exp: 'TCP is a byte stream with no message boundaries, so one read may return part or all of the data.' },
    { q: 'Why can a UDP receiver see messages out of order?', opts: ['Datagrams are routed independently', 'The kernel sorts them wrongly', 'recvfrom reads from the end', 'bind reorders packets'], ans: 0, exp: 'UDP does no sequencing, so different routes can deliver datagrams in a different order.' },
    { q: 'A passive socket is called passive because it:', opts: ['Only accepts connections, never carries data', 'Cannot be closed until every client has left', 'Silently ignores every incoming packet it gets', 'Always uses UDP datagrams, not TCP streams'], ans: 0, exp: 'Data moves over the active sockets that accept returns.' },
    { q: 'What happens to a closed client socket that is still in the epoll interest list?', opts: ['The kernel removes it once all references close', 'It keeps being reported as ready for ever after', 'epoll_wait crashes with a segmentation fault', 'It moves over to the listening socket instead'], ans: 0, exp: 'Closing the last descriptor for the open file automatically removes it from epoll.' },
  ],
});

// ═══════════════════════════════════════════════════════════════════
// IPC: mmap, file mapping vs anonymous mapping, ftruncate
// ═══════════════════════════════════════════════════════════════════
defLesson('ch5', {
  id: 'l5_3', title: 'mmap: File vs Anonymous Mapping',
  analogy: `A file mapping is a window cut into a wall that looks straight onto a real file: whatever you write through the window changes the file. An anonymous mapping is a window onto a blank room with no file behind it: just fresh scratch memory.`,
  goals: ['Explain what <code>mmap</code> does', 'Tell a file mapping from an anonymous mapping', 'Say why shared memory needs <code>ftruncate</code>'],
  recap: ['<code>mmap</code> maps a file or fresh memory into your address space; you then use it like an array.', 'File mapping: backed by a file (<code>fd</code>). Anonymous mapping: <code>MAP_ANONYMOUS</code>, <code>fd = -1</code>, zero-filled, no file.', '<code>MAP_SHARED</code> shares writes; <code>MAP_PRIVATE</code> is copy-on-write.', '<code>MAP_SHARED | MAP_ANONYMOUS</code> shares memory only between related processes (parent and child).', '<code>ftruncate</code> sets the size of a new <code>shm_open</code> object. Mapping past its size gives SIGBUS.'],
  steps: [
    { title: 'What mmap does',
      html: `<p><code>mmap</code> asks the kernel to place a region in your address space. You read and write it with ordinary pointers instead of calling <code>read</code> and <code>write</code>.</p>`
        + codeBlock(`void *p = mmap(NULL,            // let the kernel pick the address
               length,          // bytes
               PROT_READ | PROT_WRITE,
               flags,           // MAP_SHARED, MAP_PRIVATE, MAP_ANONYMOUS
               fd, offset);     // which file, and where in it`),
      why: 'It is the foundation of shared memory, of loading large files, and of how <code>malloc</code> gets big blocks.',
      mistake: 'Forgetting to check for <code>MAP_FAILED</code> (not NULL) on error.',
      check: { q: 'What does <code>mmap</code> give you back on success?', opts: ['A pointer to the mapped region', 'A new file descriptor', 'The number of bytes mapped', 'A copy of the file'], ans: 0, exp: 'mmap returns the address of the region. You use it like a normal array.' } },
    { title: 'File mapping',
      html: `<p>A <strong>file mapping</strong> is backed by a file you opened. The region starts with the file's contents. With <code>MAP_SHARED</code>, writes go back to the file and other processes mapping it see them.</p>`
        + codeBlock(`int fd = open("data.bin", O_RDWR);
char *p = mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
p[0] = 'X';          // changes the first byte of data.bin`),
      why: 'File mappings give fast random access to big files and let unrelated processes share data through a file.',
      mistake: 'Using <code>MAP_PRIVATE</code> and expecting the file to change. Private writes are copy-on-write and never reach the file.',
      check: { q: 'A process maps a file with <code>MAP_SHARED</code> and writes to the mapped memory. What happens?', opts: ['The change reaches the file', 'The write is lost', 'The kernel raises an error', 'Only a private copy changes'], ans: 0, exp: 'MAP_SHARED file mappings write through to the underlying file.' } },
    { title: 'Anonymous mapping',
      html: `<p>An <strong>anonymous mapping</strong> has no file. Pass <code>MAP_ANONYMOUS</code> and <code>fd = -1</code>. The memory starts as all zeros.</p>`
        + codeBlock(`int *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE,
              MAP_SHARED | MAP_ANONYMOUS, -1, 0);
if (fork() == 0) { *p = 42; _exit(0); }   // child writes
wait(NULL);
printf("%d\\n", *p);                       // parent sees 42`),
      why: 'This is the easiest shared memory between a parent and child, with nothing to name or clean up.',
      mistake: 'Trying to share an anonymous mapping with an unrelated process. With no name or file it can only be inherited through <code>fork</code>.',
      check: { q: 'What is the key difference between file mapping and anonymous mapping?', opts: ['A file mapping is backed by a file; an anonymous one is not', 'Anonymous mappings are always much slower than file ones', 'File mappings can never be shared between processes', 'Anonymous mappings must always be mapped read-only'], ans: 0, exp: 'File mappings come from an fd. Anonymous mappings are fresh zero-filled memory with no backing file.' } },
    { title: 'Why shared memory needs ftruncate',
      html: `<p><code>shm_open</code> creates a shared memory object of <strong>size 0</strong>. <code>ftruncate</code> sets its size. Mapping or touching bytes beyond the object's size crashes with <code>SIGBUS</code>.</p>`
        + codeBlock(`int fd = shm_open("/lab", O_CREAT | O_RDWR, 0600);
ftruncate(fd, 4096);                 // give it 4096 bytes
char *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);`),
      why: 'This is the usual answer to "what is the purpose of ftruncate for shared memory".',
      mistake: 'Skipping ftruncate. The object stays empty and the first write raises SIGBUS.',
      check: { q: 'What is <code>ftruncate</code> used for after <code>shm_open</code>?', opts: ['Setting the size of the shared object', 'Deleting the shared object from the system', 'Locking the shared object for exclusive use', 'Mapping the shared object into memory'], ans: 0, exp: 'A new shared memory object has size 0, so ftruncate sets how many bytes it holds.' } },
    { title: 'Which mapping for which job?',
      html: `<table class="mini"><tr><th>Goal</th><th>Use</th></tr><tr><td>Parent and child share memory</td><td><code>MAP_SHARED | MAP_ANONYMOUS</code> before fork</td></tr><tr><td>Unrelated processes share memory</td><td><code>shm_open</code> + <code>ftruncate</code> + <code>MAP_SHARED</code></td></tr><tr><td>Fast access to a big file</td><td>file mapping</td></tr><tr><td>Private scratch memory</td><td><code>MAP_PRIVATE | MAP_ANONYMOUS</code></td></tr></table>`,
      why: 'Choosing the right flags is the heart of most IPC design questions.',
      mistake: 'Calling <code>mmap</code> after <code>fork</code>. Each process then gets its own separate mapping.',
      check: { q: 'Two unrelated processes need to share a buffer. Which approach works?', opts: ['shm_open, ftruncate, then MAP_SHARED mmap in both', 'MAP_ANONYMOUS before an unrelated launch', 'MAP_PRIVATE on the same file', 'An anonymous mapping in each process'], ans: 0, exp: 'A named shared memory object (or a shared file) is something both can open. Anonymous memory is only inherited.' } },
    { title: 'Cleaning up',
      html: `<p><code>munmap</code> removes a mapping. Closing the file descriptor does <strong>not</strong> unmap it: the mapping stays valid. A shared memory name stays in the system until <code>shm_unlink</code>.</p>`,
      why: 'Leaked names accumulate under <code>/dev/shm</code>.',
      mistake: 'Believing <code>close(fd)</code> destroys the mapping.',
      check: { q: 'After <code>mmap</code> succeeds you call <code>close(fd)</code>. What happens to the mapping?', opts: ['It stays valid until munmap', 'It is destroyed at once', 'It becomes read-only', 'It turns anonymous'], ans: 0, exp: 'The mapping holds its own reference to the file, so closing the descriptor does not unmap it.' } },
  ],
  practice: [
    { q: 'Which flag combination gives a zero-filled region shared with a child created later by <code>fork</code>?', opts: ['MAP_SHARED | MAP_ANONYMOUS', 'MAP_PRIVATE | MAP_ANONYMOUS', 'MAP_SHARED only', 'MAP_PRIVATE only'], ans: 0, exp: 'Anonymous gives fresh zeroed memory, and shared lets the forked child write to the same pages.' },
    { q: 'A file is mapped <code>MAP_PRIVATE</code> and the program writes to it. What happens to the file on disk?', opts: ['It does not change', 'It changes immediately', 'It is deleted', 'It becomes a symlink'], ans: 0, exp: 'MAP_PRIVATE is copy-on-write, so changes stay in the process.' },
    { q: 'You create <code>shm_open("/s", ...)</code> and map 4096 bytes without ftruncate. The first write does what?', opts: ['Raises SIGBUS', 'Succeeds silently', 'Grows the object', 'Returns -1'], ans: 0, exp: 'The object has size 0, so touching it faults with SIGBUS.' },
  ],
  hands: [
    { type: 'bug', q: 'The program wants to modify a file through <code>mmap</code>. Tap the line with the bug.', lines: ['int fd = open("data.bin", O_RDWR);', 'char *p = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, fd, 0);', 'p[0] = 1;', 'munmap(p, 4096);'], ans: 1,
      exp: '<code>MAP_ANONYMOUS</code> ignores the file, so the memory is not backed by data.bin. Drop it for a file mapping.' },
    { type: 'blank', q: 'Fill in the blank for an anonymous shared region.', code: 'mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED | ____, -1, 0);', opts: ['MAP_ANONYMOUS', 'MAP_PRIVATE', 'MAP_FIXED', 'O_CREAT'], ans: 0,
      exp: 'MAP_ANONYMOUS says no file is behind the region. That is why fd is -1.' },
    { type: 'order', q: 'Put the file-mapping steps in order.', lines: ['int fd = open("data.bin", O_RDWR);', 'struct stat sb; fstat(fd, &sb);', 'char *p = mmap(NULL, sb.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);', "p[0] = 'X';", 'munmap(p, sb.st_size);'],
      exp: 'Open, ask the size, map, use, then unmap.' },
  ],
  quiz: [
    { q: 'You need fast random reads in a 2 GB file without calling <code>read</code> over and over. Which tool fits?', opts: ['A MAP_SHARED file mapping', 'An anonymous mapping with no file behind it', 'A pipe between two cooperating processes', 'A FIFO created with mkfifo in the file system'], ans: 0, exp: 'Mapping the file lets you index it like an array and the kernel pages data in as needed.' },
    { q: 'The parent maps <code>MAP_SHARED | MAP_ANONYMOUS</code> memory <em>after</em> calling fork. Does the child share it?', opts: ['No, each process ends up with its own mapping', 'Yes, the child always inherits it automatically', 'Only if the child calls wait on the parent first', 'Only when the child opens it for read access'], ans: 0, exp: 'The mapping must exist before fork so that the child inherits it.' },
    { q: 'What initial contents does a new anonymous mapping have?', opts: ['All zeros', 'Random bytes', 'The previous process data', 'Whatever the file held'], ans: 0, exp: 'The kernel zero-fills anonymous pages.' },
    { q: 'Why is a pointer inside a shared region unsafe to hand to another process?', opts: ['Each process may map it at a different address', 'Pointers are always limited to just 4 bytes', 'The kernel clears every pointer it finds there', 'Shared memory is unable to hold integers at all'], ans: 0, exp: 'The same bytes can sit at different virtual addresses in each process, so store offsets.' },
    { q: 'Which call returns the memory region to the system?', opts: ['munmap', 'ftruncate', 'shm_open', 'dup2'], ans: 0, exp: 'munmap removes the mapping. shm_unlink removes the name of a shared object.' },
  ],
});

// ═══════════════════════════════════════════════════════════════════
// Processes & threads: worked synchronization problems
// ═══════════════════════════════════════════════════════════════════
defLesson('ch2', {
  id: 'l2_5', title: 'Worked Problems: Races, Semaphores, Deadlock',
  analogy: `Think of these as game film. You already know the plays (races, semaphores, lock ordering). Now you watch a full possession and call out exactly where it goes wrong, the way you will on the exam.`,
  goals: ['List every possible result of a racy update and justify each', 'Set the right semaphore values to force strict alternation', 'Spot a circular wait and fix it with lock ordering'],
  recap: ['A race: two threads do load, compute, store. If both load before either stores, one update is lost.', 'For <code>x += 12</code> in two threads from 0, the results are 12 (lost update) or 24.', 'Strict alternation needs two semaphores: one starts at 1 (the first thread), the other at 0.', 'Each thread waits on its own semaphore and posts the other one.', 'Deadlock needs mutual exclusion, hold-and-wait, no preemption and circular wait. Lock ordering breaks the cycle.'],
  steps: [
    { title: 'Possible results of a race',
      html: `<p><code>x += v1 * v2</code> is not one step. It is <strong>load x, add 12, store x</strong>. Two threads each run update(3, 4), so each adds 12.</p><ul><li>One thread finishes before the other starts: 0 → 12 → <strong>24</strong>.</li><li>Both load 0 before either stores: each computes 12 and stores 12, so the final value is <strong>12</strong>.</li></ul>`
        + codeBlock(`T1: load x (0)
T2: load x (0)
T1: store x = 0 + 12
T2: store x = 0 + 12     // overwrites: x == 12`),
      why: 'The exam gives no points for just the numbers. You must show the interleaving.',
      mistake: 'Answering 0 or 6. Each thread either adds its 12 on top of the real value or overwrites with 12.',
      check: { q: 'x starts at 0. Two threads each run <code>x += 3 * 4</code> with no lock. Which set lists all possible final values?', opts: ['12 and 24', '24 only', '0, 12 and 24', '12 only'], ans: 0, exp: 'Serial execution gives 24. A lost update gives 12. No interleaving can produce 0.' } },
    { title: 'Strict alternation with two semaphores',
      html: `<p>To make "ping" and "pong" alternate, with ping always first, give each thread its own semaphore. A thread <strong>waits</strong> on its own and <strong>posts</strong> the other.</p>`
        + codeBlock(`sem_t sem_ping, sem_pong;
sem_init(&sem_ping, 0, 1);   // ping may go first
sem_init(&sem_pong, 0, 0);   // pong must wait

// ping thread            // pong thread
sem_wait(&sem_ping);      sem_wait(&sem_pong);
printf("ping\\n");         printf("pong\\n");
sem_post(&sem_pong);      sem_post(&sem_ping);`),
      why: 'This is a standard long-answer question. The marks are for the initial values and the four calls in the right places.',
      mistake: 'Initialising both semaphores to 1. Then both threads can run at once and the order is not guaranteed.',
      check: { q: 'What are the correct initial values for <code>sem_ping</code> and <code>sem_pong</code> if ping must print first?', opts: ['sem_ping = 1, sem_pong = 0', 'sem_ping = 0, sem_pong = 1', 'both = 1', 'both = 0'], ans: 0, exp: 'sem_ping starts open so ping runs first. sem_pong starts closed until ping posts it.' } },
    { title: 'Why a deadlock happens',
      html: `<p>T1 locks <code>a</code> then <code>b</code>. T2 locks <code>b</code>, <code>c</code>, then <code>a</code>. Suppose <code>access</code> keeps each lock until the thread finishes.</p><ul><li>T1 holds <strong>a</strong> and waits for <strong>b</strong>.</li><li>T2 holds <strong>b</strong> (and c) and waits for <strong>a</strong>.</li></ul><p>Each waits for the other: a <strong>circular wait</strong>.</p>`,
      why: 'You must explain the cycle in 2-3 sentences: who holds what and who is waiting for it.',
      mistake: 'Only saying "they lock each other". Name the locks and who holds them.',
      check: { q: 'T1 locks a then b. T2 locks b, c, then a. What causes the deadlock?', opts: ['T1 holds a wanting b while T2 holds b wanting a', 'T2 takes three locks while T1 takes only two locks', 'Variable c is also locked by T1 at the same time', 'Both threads release their locks too early on exit'], ans: 0, exp: 'Each thread holds a lock the other needs while waiting for the one it lacks.' } },
    { title: 'Fix it with lock ordering',
      html: `<p>Break the circular wait by making every thread take locks in the <strong>same global order</strong>. T1 already uses a then b, so rewrite T2 to take them in that order too:</p>`
        + codeBlock(`T2_access() {
    access(&a);     // was last
    access(&b);
    access(&c);
}`)
        + `<p>No new variables or locks are needed.</p>`,
      why: 'If everyone follows one order, a cycle cannot form.',
      mistake: 'Adding a new lock around everything. That fixes it but the exam forbids new locks.',
      check: { q: 'Which change to T2 (currently b, c, a) removes the deadlock with T1 (a, b)?', opts: ['Access a first: a, b, c', 'Access c first: c, b, a', 'Access b twice', 'Add a sleep call'], ans: 0, exp: 'Taking a before b matches T1, so a thread holding b can never be waiting for a.' } },
    { title: 'The four conditions for deadlock',
      html: `<p>Deadlock needs all four at once:</p><ol><li><strong>Mutual exclusion</strong>: a resource has one holder.</li><li><strong>Hold and wait</strong>: a thread holds one lock while asking for another.</li><li><strong>No preemption</strong>: locks cannot be taken away.</li><li><strong>Circular wait</strong>: a loop of threads each waiting on the next.</li></ol><p>Break any one and deadlock is impossible. Lock ordering breaks the circular wait.</p>`,
      why: 'You can name the condition you broke when justifying your fix.',
      mistake: 'Trying to remove mutual exclusion. Locks exist to provide it, so break another condition.',
      check: { q: 'Lock ordering prevents deadlock by breaking which condition?', opts: ['Circular wait', 'Mutual exclusion', 'No preemption', 'Hold and wait'], ans: 0, exp: 'A global order means no cycle of waiting threads can form.' } },
  ],
  practice: [
    { q: 'Two threads each run <code>count++</code> 1000 times on a shared int that starts at 0, with no lock. Which final value is impossible?', opts: ['2001', '2000', '1347', '1000'], ans: 0, exp: 'Each increment adds at most 1, so 2000 is the ceiling. Lost updates can only make the total smaller.' },
    { q: 'A thread posts <code>sem_post(&s)</code> on a semaphore whose value is 0 and another thread is blocked in <code>sem_wait(&s)</code>. What happens?', opts: ['The waiter wakes and the value stays 0', 'The value becomes 1 and the waiter keeps waiting', 'Both threads block', 'The post fails'], ans: 0, exp: 'The post hands the permit to the waiter, which takes it right away.' },
    { q: 'Threads X and Y both lock m1 then m2 in that order. Can they deadlock with each other?', opts: ['No, the order is the same', 'Yes, always', 'Only on a single core', 'Only if m1 is a spinlock'], ans: 0, exp: 'A consistent order removes the circular wait.' },
  ],
  hands: [
    { type: 'bug', q: 'Two threads must strictly alternate, ping first. Tap the line with the wrong initial value.', lines: ['sem_t sem_ping, sem_pong;', 'sem_init(&sem_ping, 0, 1);', 'sem_init(&sem_pong, 0, 1);', '/* ping waits on sem_ping, posts sem_pong */'], ans: 2,
      exp: 'sem_pong must start at 0 so pong waits for ping. Starting both at 1 lets them run together.' },
    { type: 'blank', q: 'Fill in the blank so pong waits for ping.', code: 'sem_init(&sem_pong, 0, ____);', opts: ['0', '1', '2', '-1'], ans: 0,
      exp: 'A semaphore at 0 blocks the first sem_wait until someone posts it.' },
    { type: 'order', q: 'Put the pong thread loop body in order.', lines: ['sem_wait(&sem_pong);', 'printf("pong\\n");', 'sem_post(&sem_ping);'],
      exp: 'Wait for your turn, do the work, then hand the turn back to ping.' },
  ],
  quiz: [
    { q: 'Which set lists every possible final value of <code>x</code> if two threads each run <code>x += 5</code> once from 0, with no lock?', opts: ['5 and 10', '10 only', '0 and 10', '5 only'], ans: 0, exp: 'Both load 0 and write 5, or they run one after the other and give 10.' },
    { q: 'sem_ping starts at 1 and sem_pong at 0. Which thread prints first?', opts: ['ping', 'pong', 'Either one', 'Neither'], ans: 0, exp: 'ping can pass its wait at once, while pong blocks until ping posts.' },
    { q: 'T1 locks a then b. T2 locks b then a. A deadlock needs:', opts: ['T1 to hold a and T2 to hold b at once', 'Both threads to be pinned to a single CPU core', 'Both of the locks to be recursive mutexes', 'More than two threads competing for the locks'], ans: 0, exp: 'Each must hold its first lock before the other grabs the second.' },
    { q: 'You cannot add locks or variables. Which fix breaks a lock cycle?', opts: ['Make both threads lock in the same order', 'Make one thread sleep between its two locks', 'Make both threads lock c before anything else', 'Make one thread lock the same variable twice'], ans: 0, exp: 'A single global lock order prevents any circular wait.' },
    { q: 'Which is NOT one of the four conditions for deadlock?', opts: ['Starvation of a low-priority thread', 'Circular wait', 'Hold and wait', 'No preemption'], ans: 0, exp: 'The four are mutual exclusion, hold and wait, no preemption and circular wait. Starvation is a different problem.' },
  ],
});

// ═══════════════════════════════════════════════════════════════════
// Bonus topic: Security and crypto. Written from general crypto knowledge;
// check the wording against your own lecture slides.
// ═══════════════════════════════════════════════════════════════════
defLesson('ch6', {
  id: 'l6_1', title: 'CIA, Keys & Validity Windows',
  analogy: `A sealed, signed letter. The envelope keeps it private (confidentiality), the wax seal shows nobody altered it (integrity), and the postbox being open when you need it (availability) is the third promise.`,
  goals: ['Say what CIA stands for with an example of each', 'Compare secret-key and public-key cryptography', 'Explain why credentials and signatures have a time window'],
  recap: ['CIA = Confidentiality, Integrity, Availability.', 'Secret-key (symmetric): one shared key. Fast, but the key must be shared safely. Public-key (asymmetric): a key pair; the public key can be shared openly.', 'A public algorithm is published and reviewed; security rests on the key, not on hiding the algorithm (Kerckhoffs).', 'A validity window is the time span in which a token, signature or certificate is accepted. It limits replay and stolen credentials.'],
  steps: [
    { title: 'CIA: the three security goals',
      html: `<ul><li><strong>Confidentiality</strong>: only authorised parties can read the data. Tool: encryption.</li><li><strong>Integrity</strong>: data cannot be changed without detection. Tools: hashes, MACs, signatures.</li><li><strong>Availability</strong>: the system works when needed. Threat: denial of service.</li></ul>`,
      why: 'Almost every security feature serves at least one of these three goals.',
      mistake: 'Thinking encryption alone gives integrity. A flipped bit in ciphertext may go unnoticed without a MAC or signature.',
      check: { q: 'Which goal does a digital signature mainly provide?', opts: ['Integrity', 'Availability', 'Confidentiality', 'Anonymity'], ans: 0, exp: 'A signature lets you detect any modification. It does not hide the data.' } },
    { title: 'Secret-key vs public-key cryptography',
      html: `<table class="mini"><tr><th></th><th>Secret key (symmetric)</th><th>Public key (asymmetric)</th></tr><tr><td>Keys</td><td>One shared key</td><td>Public + private pair</td></tr><tr><td>Speed</td><td>Fast</td><td>Slower</td></tr><tr><td>Main problem</td><td>Sharing the key safely</td><td>Trusting that a public key is really theirs</td></tr><tr><td>Example</td><td>AES</td><td>RSA</td></tr></table>`,
      why: 'Real systems combine both: public-key to agree on a secret key, then fast symmetric encryption for the data.',
      mistake: 'Mixing up who uses which key: anyone may encrypt with your public key, but only you decrypt with the private key.',
      check: { q: 'Alice wants only Bob to read a message using public-key crypto. Which key does she encrypt with?', opts: ["Bob's public key", "Bob's private key", "Alice's private key", 'A shared secret'], ans: 0, exp: 'Only Bob holds the matching private key, so only he can decrypt.' } },
    { title: 'Public vs private algorithms',
      html: `<p>The phrase can also mean whether the <em>algorithm itself</em> is secret. A <strong>public</strong> algorithm is published and examined by experts; its safety depends on the key. A <strong>private</strong> (proprietary) one relies on keeping the design secret.</p><p><strong>Kerckhoffs's principle</strong>: assume the attacker knows the algorithm. Only the key should be secret.</p>`,
      why: 'Published algorithms such as AES and SHA-256 have survived years of attack. Secret designs often hide flaws.',
      mistake: 'Calling "security through obscurity" safe. Once the design leaks, nothing protects you.',
      check: { q: 'According to Kerckhoffs\'s principle, what should be secret?', opts: ['Only the key', 'Only the algorithm', 'Both the key and the algorithm', 'Neither'], ans: 0, exp: 'A system should stay secure even if everything except the key is public.' } },
    { title: 'Window of validity',
      html: `<p>A <strong>validity window</strong> is the span of time during which something is accepted: a login token, a one-time code, a signature timestamp or a certificate. Outside the window it is rejected.</p><p>Short windows limit damage from <strong>replay</strong> (reusing a captured message) and from stolen credentials. Long windows are more convenient but riskier.</p>`,
      why: 'Your slides may define the term for a specific protocol; the idea is always a bounded time of acceptance.',
      mistake: 'Treating a signed message as valid forever. A replayed old message can still carry a perfect signature.',
      check: { q: 'Why add an expiry time to a signed login token?', opts: ['To limit how long a stolen token stays useful', 'To make the signature itself shorter to store', 'To encrypt the token on its way to the server', 'To avoid needing any key at all for checking'], ans: 0, exp: 'An expiry bounds the window in which a copied token can be abused.' } },
  ],
  practice: [
    { q: 'A website goes down under a flood of fake requests. Which CIA goal is violated?', opts: ['Availability', 'Confidentiality', 'Integrity', 'None'], ans: 0, exp: 'A denial-of-service attack makes the service unavailable.' },
    { q: 'Which is the main drawback of secret-key encryption?', opts: ['Both sides must get the key safely', 'It cannot encrypt files', 'It is slower than public-key', 'It needs two keys'], ans: 0, exp: 'Key distribution is the hard part. The cipher itself is fast.' },
    { q: 'An attacker records a valid login message and sends it again later. Which defense helps most?', opts: ['A short validity window or a nonce', 'A much longer and stronger password', 'A bigger hash on every login message', 'Compressing the whole message before sending'], ans: 0, exp: 'Time limits or one-time values make an old copy useless.' },
  ],
  hands: [],
  quiz: [
    { q: 'Which pairing is correct?', opts: ['Integrity and hashes or signatures', 'Confidentiality and checksums', 'Availability and encryption', 'Integrity and denial of service'], ans: 0, exp: 'Hashes and signatures detect change. Encryption serves confidentiality.' },
    { q: 'Which key can Bob safely publish on his website?', opts: ['His public key', 'His private key', 'Both keys', 'His AES key'], ans: 0, exp: 'The private key must never leave Bob.' },
    { q: 'AES is an example of:', opts: ['Secret-key (symmetric) encryption', 'A digital signature scheme using key pairs', 'A cryptographic hash function with a digest', 'Public-key (asymmetric) encryption using RSA'], ans: 0, exp: 'AES uses one shared key for both encryption and decryption.' },
    { q: 'A certificate expires after one year. This is a:', opts: ['Validity window', 'Hash collision', 'Key exchange', 'Denial of service'], ans: 0, exp: 'The certificate is only accepted between its start and end dates.' },
    { q: 'Why is a published, well-studied algorithm usually preferred?', opts: ['Experts have attacked it, so only the key stays secret', 'It always runs faster than a secret design does', 'It needs no key because the design is public', 'It cannot be attacked since everyone has seen it'], ans: 0, exp: 'Public scrutiny finds flaws. Secrecy of design adds little real safety.' },
  ],
});

defLesson('ch6', {
  id: 'l6_2', title: 'Hashes & Digital Signatures',
  analogy: `A hash is a fingerprint of a document: tiny, and changing even one letter gives a totally different print. A digital signature is you stamping that fingerprint with a personal seal only you own, so anyone can check the seal but nobody can forge it.`,
  goals: ['Describe what a cryptographic hash guarantees', 'Explain strong collision resistance', 'Use a hash and a signature to prove a photo was not edited'],
  recap: ['A hash maps any input to a fixed-size digest, is one-way, and changes completely if the input changes.', 'Second-preimage resistance: given x, hard to find y with the same hash. Strong collision resistance: hard to find <em>any</em> two inputs with the same hash.', 'A digital signature = a hash of the message encrypted (signed) with the private key.', 'Anyone verifies with the public key by recomputing the hash and comparing.', 'To protect a photo: publish a signature of it along with your public key.'],
  steps: [
    { title: 'What a hash gives you',
      html: `<p>A cryptographic hash <code>H</code> turns any data into a fixed-size <strong>digest</strong> (SHA-256 gives 32 bytes).</p><ul><li><strong>Deterministic</strong>: same input, same digest.</li><li><strong>One-way</strong>: you cannot recover the input from the digest.</li><li><strong>Avalanche</strong>: a tiny change gives a completely different digest.</li></ul>`,
      why: 'A short digest stands in for a huge file when checking integrity.',
      mistake: 'Calling a hash "encryption". There is no key and no way to decrypt.',
      check: { q: 'You change one pixel of a photo and hash it again with SHA-256. The new digest is:', opts: ['Completely different', 'Almost the same', 'The same', 'Slightly longer'], ans: 0, exp: 'Good hashes have the avalanche property: any change flips about half of the output bits.' } },
    { title: 'Collision resistance',
      html: `<p>A <strong>collision</strong> is two different inputs with the same hash. Collisions must exist (infinite inputs, finite outputs) but should be impossible to <em>find</em>.</p><ul><li><strong>Weak collision (second-preimage) resistance</strong>: given a specific x, you cannot find a different y with H(x) = H(y).</li><li><strong>Strong collision resistance</strong>: you cannot find <em>any</em> pair x ≠ y with H(x) = H(y).</li></ul>`,
      why: 'Strong is harder to guarantee: the birthday effect means a collision search costs only about 2<sup>n/2</sup> tries for an n-bit hash.',
      mistake: 'Mixing up the two. Weak starts from a given x; strong lets the attacker pick both inputs.',
      check: { q: 'What does strong collision resistance mean?', opts: ['It is infeasible to find any two different inputs with one hash', 'No two inputs can ever share the same hash value at all', 'Given x, you cannot find another input with the same hash', 'The hash cannot be computed quickly by anyone, ever'], ans: 0, exp: 'Strong resistance covers every pair the attacker could choose, not just a pair involving a fixed x.' } },
    { title: 'Digital signatures',
      html: `<p>To <strong>sign</strong>, hash the message and encrypt the digest with your <strong>private</strong> key. To <strong>verify</strong>, decrypt the signature with the <strong>public</strong> key and compare it to a fresh hash of the message you received.</p>`
        + codeBlock(`sign:    sig = Sign(private_key, H(message))
verify:  Verify(public_key, message, sig) == true`),
      why: 'A signature proves integrity (not changed) and origin (only the key owner could produce it).',
      mistake: 'Signing with the public key. Only the private key must create signatures.',
      check: { q: 'Which key verifies a digital signature?', opts: ["The signer's public key", "The signer's private key", "The verifier's private key", 'A shared secret key'], ans: 0, exp: 'Anyone can verify with the public key. Only the private key holder can sign.' } },
    { title: 'Proving a photo was not edited',
      html: `<p>You post a photo and want others to detect Photoshopping. Publish extra data with it: a <strong>digital signature of the photo</strong> made with your private key, plus your public key (or certificate).</p><p>Anyone downloads both, recomputes the hash, and verifies. A modified photo has a different hash, so verification fails. A hash alone is not enough: an attacker can edit the photo and post a new matching hash.</p>`,
      why: 'This is a complete exam-style answer: hash + private-key signature + public key to verify.',
      mistake: 'Offering only a hash. Without a signature nobody can tell whether the hash itself was swapped.',
      check: { q: 'What extra information lets anyone check a photo was not edited?', opts: ['A signature over the photo, checked with your public key', 'Only a plain hash of the photo posted beside it', 'A copy of the photo encrypted with a shared key', 'The photo size in bytes, written next to the photo'], ans: 0, exp: 'A signature binds the photo to your key. Edits break verification, and nobody else can forge a new signature.' } },
  ],
  practice: [
    { q: 'Which property makes it safe to store a hash of a large file instead of the file?', opts: ['Different files almost surely give different digests', 'The hash can be reversed to get the file', 'The hash is always the same length as the file', 'The hash needs a key'], ans: 0, exp: 'Collision resistance means a matching digest is strong evidence the file is unchanged.' },
    { q: 'A site publishes a file and its SHA-256 on the same page. An attacker who can edit the page swaps both. What was missing?', opts: ['A signature checked with a trusted public key', 'A longer hash, such as one with more bits', 'Compressing the file before publishing the page', 'Adding a second download link on the same page'], ans: 0, exp: 'A hash alone can be replaced along with the file. A signature ties it to a trusted key.' },
    { q: 'Given a specific message x, finding a different y with the same hash breaks which property?', opts: ['Weak (second-preimage) collision resistance', 'Strong collision resistance and nothing else', 'The availability goal of the CIA triad here', 'The avalanche effect of a cryptographic hash'], ans: 0, exp: 'Starting from a fixed x is the weak, second-preimage case.' },
  ],
  hands: [],
  quiz: [
    { q: 'What is hashed and then signed when you sign a long message?', opts: ['The message is hashed and the digest is signed', 'The private key is hashed before signing begins', 'The finished signature is hashed one more time', 'Nothing is hashed; the whole message is signed'], ans: 0, exp: 'Signing a short digest is faster than signing the full message.' },
    { q: 'Which statement about hashes is true?', opts: ['The same input always gives the same digest', 'You can recover the input from the digest', 'The digest grows with the input', 'A key is required to compute it'], ans: 0, exp: 'Hashes are deterministic and one-way with fixed-size output.' },
    { q: 'An n-bit hash needs roughly how many tries to find some collision, by the birthday effect?', opts: ['About 2^(n/2)', 'About 2^n', 'About n', 'About 2'], ans: 0, exp: 'The birthday bound makes finding any collision far cheaper than finding a specific preimage.' },
    { q: 'You receive a photo and its signature. Verification fails. What is the safest conclusion?', opts: ['The photo or signature was altered, or the key is wrong', 'The photo is certainly genuine and can be trusted', 'The computer needs a faster processor to verify', 'The signature is simply too short to be checked'], ans: 0, exp: 'A failed check means something does not match: do not trust it.' },
    { q: 'Which key must the photo owner keep secret?', opts: ['The private key', 'The public key', 'The digest', 'The photo name'], ans: 0, exp: 'If the private key leaks, anyone can forge signatures.' },
  ],
});

// ── Attach one written question from the bank to each lesson's practice ──
CHAPTERS.forEach(ch => ch.lessons.forEach(l => {
  const w = (WRITTEN.short || []).find(q => q.lesson === l.id);
  if (w && !(l.practice || []).includes(w)) (l.practice = l.practice || []).push(w);
}));
