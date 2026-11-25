// CMPT201 LAB — Topic 3: Threads & Synchronization (slides 07 Threads, 08.1 Mutex, 08.2 Patterns)

// ═══ Slides 07: Threads ═══
defLesson('t3', {
  id: 'threads', deck: '07 Threads', title: 'Threads (pthreads) & Data Races',
  analogy: `A process is a house. Threads are the people living in it: they share the kitchen, the fridge and the living room (memory), but each has their own bedroom (stack). That sharing makes teamwork easy, and arguments over the last slice of pizza easy too.`,
  goals: ['Compare threads and processes: what is shared and what is private', 'Create, join and detach pthreads and pass arguments and return values', 'Explain why counter++ causes a data race'],
  recap: ['A thread is a lighter-weight process; every process has at least a main thread (main()).', 'Threads share text, data, BSS and heap; each has its own stack, registers, program counter and errno.', '<code>pthread_create()</code> starts a thread; <code>pthread_join()</code> waits and collects the return value; <code>pthread_detach()</code> lets it run free.', 'Compile with <code>-pthread</code>. Use a struct to pass several arguments through the single <code>void *</code>.', '<code>counter++</code> is three steps (load, increment, store), so two threads can lose an update.', 'A data race is two threads accessing the same data at the same time, with at least one writing.'],
  steps: [
    step('What is a thread?',
      `<p>A <strong>thread</strong> is similar to a process but <strong>lighter weight</strong>: it is a "thread of execution" that shares its process's memory space. A process always has at least one thread, the <strong>main thread</strong>, which starts at <code>main()</code>.</p>`,
      'Threads let one program do several things at once without copying the whole process.',
      'Thinking main() is not a thread. It is the main thread.',
      mc('What is the thread that starts at <code>main()</code> called?', ['The main thread', 'The parent thread', 'The kernel thread', 'The detached thread'], 'Every process has at least a main thread, which runs main().')),
    step('Threads vs processes',
      `<p><code>fork()</code> creates a child with its <strong>own address space</strong>. Threads in the same process <strong>share</strong> the text, data, BSS and heap segments.</p><p>Each thread gets its <strong>own</strong>: <strong>stack</strong>, <strong>registers</strong>, <strong>program counter</strong> (so it can run a different function) and <strong>errno</strong>.</p><p>Benefit of a thread: threads share addresses, so any thread can read or write a global variable and pass pointers around. Benefit of a process: isolation, since one process cannot change another's memory.</p>`,
      'Knowing what is shared tells you where races can happen.',
      'Believing threads have separate heaps. The heap is shared.',
      mc('Which of these does each thread get its own copy of?', ['Stack', 'Heap', 'Text (code)', 'Global variables'], 'Each thread has its own stack, registers, program counter and errno. The heap, text and globals are shared.')),
    step('Creating a thread with pthread_create()',
      `<p>POSIX threads (pthreads) are the thread API. Start one with <code>pthread_create()</code>:</p>` + codeBlock(`pthread_t tid;                          // type for thread IDs
void *func(void *arg) { return 0; }     // thread start function
pthread_create(&tid, NULL, func, arg);`) + `<p>The second argument (<code>pthread_attr_t</code>, often <code>NULL</code>) sets attributes. The start function takes one <code>void *</code> and returns <code>void *</code>. To pass several arguments, use a <strong>struct</strong>. Compile with <code>-pthread</code>.</p>`,
      'The same shape (start function + one pointer) is used in every threaded program.',
      'Forgetting <code>-pthread</code> when compiling.',
      mc('How do you pass several values to a new thread?', ['Put them in a struct and pass its address', 'Add more arguments to the start function', 'Call pthread_create several times', 'Pass them through errno'], 'The start function has one <code>void *</code> parameter, so a struct pointer carries many values.')),
    step('Exit, join, detach and self',
      `<ul><li><code>pthread_exit()</code> ends the calling thread. It happens implicitly when the thread function returns.</li><li><code>pthread_self()</code> returns the caller's thread ID.</li><li><code>pthread_join(tid, &amp;retval)</code> waits for a thread to finish and gets its return value through <code>void **retval</code>.</li><li><code>pthread_detach()</code> lets a thread just run. Use it when you do not need a return value or to wait.</li></ul>` + codeBlock(`void *ret = 0;
pthread_join(tid, &ret);        // wait, then read the return value
printf("%lu\\n", (uint64_t)ret);`),
      'Join is to threads what wait() is to processes.',
      'Expecting <code>pthread_create</code> to wait. It returns at once.',
      mc('Which call waits for a thread to finish and gets its return value?', ['pthread_join()', 'pthread_detach()', 'pthread_self()', 'pthread_exit()'], 'pthread_join blocks until the thread ends and hands back its return value.')),
    step('The data race: counter++ is three steps',
      `<p><code>counter++</code> looks like one operation, but it is three:</p>` + codeBlock(`int tmp = counter;   // load from memory
tmp++;               // change the value
counter = tmp;       // store back to memory`) + `<p>With <code>counter = 5</code> on two threads, both can load 5, both compute 6, and both store 6. We expected 7. An update was lost.</p>`,
      'This is the root of almost every concurrency bug in the course.',
      'Assuming <code>counter++</code> is atomic because it is one line of C.',
      mc('Two threads each run <code>counter++</code> once, starting from 5, with no lock. Which results are possible?', ['6 or 7', 'Only 7', 'Only 6', '5 or 8'], 'If both load 5 before either stores, both store 6. If they run one after the other, the result is 7.'), 'race'),
    step('Deterministic code, data races and race conditions',
      `<p><strong>Deterministic</strong> code gives the same output every run. The <em>order</em> that threads are scheduled differs each run, but non-deterministic scheduling does not cause non-deterministic output unless you have a race.</p><p>A <strong>data race</strong> is when two threads may access the same data at the same time (and at least one writes). A <strong>race condition</strong> is more general: the result depends on the timing of threads.</p>`,
      'The goal is code whose output does not depend on scheduling luck.',
      'Thinking different thread orderings are always a bug. They only matter when the output changes.',
      mc('Which statement describes a data race?', ['Two threads may access the same data at the same time', 'Two threads run on different cores at once', 'A thread finishes before the main thread does', 'Two threads each use a different stack region'], 'A data race happens when threads access shared data without protection and at least one writes.')),
  ],
  practice: [
    mc('Which of these is shared by all threads in a process?', ['The heap', 'The stack', 'The program counter', 'The registers'], 'Threads share text, data, BSS and the heap. Each has its own stack, registers and program counter.'),
    mc('Which function returns the ID of the calling thread?', ['pthread_self()', 'pthread_create()', 'pthread_join()', 'pthread_detach()'], 'pthread_self gives the caller\'s thread ID.'),
    mc('Why can <code>counter++</code> lose an update on two threads?', ['It is load, increment and store, which can interleave', 'The compiler removes the statement entirely', 'It always executes inside the kernel only', 'It must always use the heap for storage'], 'The three steps can interleave so both threads store the same value.'),
  ],
  hands: [
    bug('Tap the FALSE statement about threads.', ['A process always has at least one thread.', 'Threads in a process share the heap.', 'Each thread has its own stack.', 'pthread_create() waits until the new thread finishes.'], 3, '<code>pthread_create()</code> returns immediately. Use <code>pthread_join()</code> to wait.'),
    blank('Fill in the blank to collect the thread\'s return value.', 'pthread_join(tid, ____);', ['&ret', 'ret', '*ret', 'NULL'], 'The second argument is a <code>void **</code>, so pass the address of a <code>void *</code> variable.'),
    order('Put these lines in the order a thread-using program runs them.', ['pthread_t tid;', 'pthread_create(&tid, NULL, func, NULL);', 'pthread_join(tid, NULL);', 'printf("done\\n");'], 'Declare the ID, create the thread, wait for it, then continue.'),
  ],
  quiz: [
    mc('Which pair is correct?', ['fork() gives its own address space; threads share one', 'Threads get their own heap; processes share one', 'A process has no stack of its own; threads do', 'fork() shares the stack of parent and child'], 'A child process has a separate address space. Threads in one process share it, except for their stacks.'),
    mc('What does the start function of a pthread look like?', ['It takes a <code>void *</code> and returns a <code>void *</code>', 'It takes no arguments and returns an int', 'It takes a struct and returns void', 'It takes two ints and returns a pthread_t'], 'The thread function has the shape <code>void *func(void *arg)</code>.'),
    mc('When is <code>pthread_detach()</code> a good fit?', ['When you need no return value or waiting', "When you need the thread's return value", 'When you want main to wait for the thread', 'When the thread has to share its stack'], 'A detached thread just runs and cleans up by itself.'),
    mc('Two threads add 1 to a shared global 10 million times each, with no lock. What does main print?', ['A varying number below 20 million', 'Exactly 20 million on every single run', 'Exactly 10 million from the first thread', 'Always 0 because main prints first'], 'Lost updates mean the total is usually less than 20 million and varies between runs.'),
    mc('Which compiler option is needed for pthreads?', ['-pthread', '-thread', '-lpthreads', '-parallel'], 'Compile with <code>clang -pthread example.c</code>.'),
  ],
});

// ═══ Slides 08.1: Synchronization, mutexes, deadlock ═══
defLesson('t3', {
  id: 'mutex', deck: '08.1 Synchronization: Mutex', title: 'Mutexes, Critical Sections & Deadlock',
  analogy: `A mutex is the key to a single bathroom. Only the thread holding the key can go in, and everyone else queues outside. Two people who each hold one key and wait for the other's key will wait forever: that is deadlock.`,
  goals: ['Protect shared data with pthread mutexes', 'Explain critical sections, thread safety and reentrancy', 'State the four deadlock conditions and ways to prevent deadlock'],
  recap: ['A mutex gives mutual exclusion: <code>pthread_mutex_lock</code> then <code>pthread_mutex_unlock</code> around the critical section.', 'Lock order between waiting threads is not controllable, so behaviour is non-deterministic.', 'A good critical section solution has mutual exclusion, progress and bounded waiting.', 'Thread safe: no shared resources, or protected critical sections. Reentrant: can be re-entered while running (even by a signal handler on the same thread).', 'Deadlock needs hold and wait, circular wait, mutual exclusion and no preemption. Break one to prevent it.', 'Prevent with all-locks-together or one global lock order. Livelock: threads run but make no progress.'],
  steps: [
    step('Why synchronization is hard',
      `<p>Careful <strong>synchronization</strong> avoids hard-to-debug race cases. Race cases are hard because the outcome depends on timing, and we must reason about every possible interleaving, not just one path's correctness.</p><p>The primitives we learn: <strong>locks (mutex)</strong> now, then <strong>condition variables</strong> and <strong>semaphores</strong> in the next lesson.</p>`,
      'A rare interleaving can hide a bug for months.',
      'Testing once and assuming a threaded program works.',
      mc('Why are race cases hard to debug?', ['Timing decides the result, so they show up only sometimes', 'They always crash the program right away', 'They only happen on one particular CPU model', 'They can never be reproduced on purpose'], 'Different schedules give different results, so a bug can vanish when you look for it.')),
    step('The mutex API',
      `<p>A <strong>mutex</strong> (lock) protects shared data. With pthreads:</p>` + codeBlock(`pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_lock(&m);      // grab the lock (blocks if taken)
/* critical section */
pthread_mutex_unlock(&m);    // release it`) + `<p><code>pthread_mutex_lock(&amp;m)</code> either acquires the mutex at once (if it is free) or <strong>blocks</strong> until it is available. Even if several threads call lock together, only one gets it: that is <strong>mutual exclusion</strong>. We cannot control which waiting thread goes next, so the behaviour is <strong>non-deterministic</strong>.</p>`,
      'These three calls are the whole mutex API for this course.',
      'Forgetting to unlock. Every other thread then blocks forever.',
      mc('What does <code>pthread_mutex_lock</code> do when the mutex is already held?', ['It blocks until the mutex is available', 'It fails with an error and continues', 'It forces the other thread to release', 'It copies the data'], 'The call waits until it can acquire the lock.'), 'mutex'),
    step('Protecting a shared counter',
      `<p>Put the critical section between lock and unlock:</p>` + codeBlock(`for (int i = 0; i < 10000000; i++) {
    pthread_mutex_lock(&mutex);
    cnt++;
    pthread_mutex_unlock(&mutex);
}`) + `<p>A thread changing <code>cnt</code> must do so with the mutex locked. Locking <em>outside</em> the loop would also be correct, but then one thread runs the whole loop while the other waits, so there is no parallelism. Real code should also check the return value of each pthread call (and call <code>perror</code> on failure).</p>`,
      'Hold a lock for as short a time as is still correct.',
      'Locking around the entire loop and losing all the parallel speedup.',
      mc('Why not simply lock the mutex outside the whole loop?', ['It would stop the threads running in parallel', 'It would no longer protect the counter at all', 'It would bring back the data race on cnt', 'It would make the code skip the unlock call'], 'It is correct but serializes the whole loop, so the other thread cannot make progress meanwhile.')),
    step('Critical sections and atomicity',
      `<p>A <strong>critical section</strong> is code that accesses a shared resource and must not be executed by more than one thread at a time. A mutex makes the section <strong>atomic</strong>: all or nothing, with nobody else interfering. The lock <strong>serializes</strong> the operations, and the threads' operations are interleaved in some order we cannot control.</p><p>An ideal solution needs three things: <strong>mutual exclusion</strong>, <strong>progress</strong>, and <strong>bounded waiting</strong> (a thread is blocked only a finite time).</p>`,
      'Three requirements give a checklist for judging any lock design.',
      'Forgetting bounded waiting. A thread that waits forever is as bad as a race.',
      mc('Which is one of the three requirements of a critical section solution?', ['Bounded waiting', 'Maximum quantum', 'Zero context switches', 'Equal priorities'], 'A thread must only be blocked for a finite amount of time. The other two are mutual exclusion and progress.')),
    step('Multiple locks and non-blocking locks',
      `<p>A program can have <strong>many locks</strong>, such as <code>data_samples_mutex</code> and <code>printer_mutex</code>. Each thread locks the mutexes it needs. Reducing the amount of locking (and lock time) matters for performance, because it allows more parallel work.</p><p>To control blocking: <code>pthread_mutex_trylock()</code> returns at once if the lock is taken, and <code>pthread_mutex_timedlock()</code> waits only a maximum time.</p>`,
      'Trylock is what lets us build deadlock-free algorithms later.',
      'Using one global lock for everything and serializing unrelated work.',
      mc('What does <code>pthread_mutex_trylock()</code> do if the lock is taken?', ['Returns at once instead of blocking', 'Waits forever until the lock is free', 'Steals the lock from the other thread', 'Kills the thread that holds the lock'], 'trylock is the non-blocking version of lock.')),
    step('Thread safe and reentrant',
      `<p>A <strong>thread-safe</strong> function either does not access shared resources or protects its critical sections. A <strong>reentrant</strong> function can be called again while it is already running (for example a function called by <code>main()</code> that a signal handler on the same thread also calls). It must be thread safe and also work when re-entered.</p><ul><li>Global <code>tmp</code>, no lock: not thread safe, not reentrant.</li><li>Global <code>tmp</code> with a mutex: thread safe, not reentrant.</li><li>Local <code>tmp</code> on the stack: both.</li></ul><p>Make code reentrant with a local buffer, a heap buffer, or a buffer the caller passes in (like <code>strtok_r</code>).</p>`,
      'Signal handlers make reentrancy matter even in single-threaded programs.',
      'Thinking a mutex always makes a function reentrant. A handler that re-enters would deadlock on its own lock.',
      mc('A swap function uses a local variable <code>tmp</code> on the stack and nothing global. How safe is it?', ['Thread safe and reentrant', 'Thread safe but not reentrant', 'Reentrant but not thread safe', 'Neither'], 'Each call has its own stack variable, so it is safe for threads and for re-entry.')),
    step('Deadlock and its four conditions',
      `<p><strong>Deadlock</strong> is when a set of threads each wait for something another holds, so they get stuck and make no progress. Example: Thread 1 locks A, Thread 2 locks B, then Thread 2 blocks trying to lock A and Thread 1 blocks trying to lock B.</p><p>Four conditions are <strong>necessary</strong>: <strong>hold and wait</strong>, <strong>circular wait</strong>, <strong>mutual exclusion</strong> and <strong>no preemption</strong> (a lock is released only voluntarily). They do not guarantee deadlock; it also depends on timing.</p>`,
      'To prevent deadlock, break any one of the four conditions.',
      'Thinking all four conditions mean the program always deadlocks. Timing decides.',
      mc('Which is NOT one of the four necessary conditions for deadlock?', ['Starvation', 'Hold and wait', 'No preemption', 'Circular wait'], 'The four are hold and wait, circular wait, mutual exclusion and no preemption.'), 'deadlock'),
    step('Preventing deadlock',
      `<p><strong>Technique 1</strong>: grab <strong>all the locks together or none</strong>. Use one extra lock around the two lock calls, so a thread holds both or neither.</p><p><strong>Technique 2</strong>: acquire locks in the <strong>same global order</strong> in every thread. If both threads lock <code>mutex0</code> first and then <code>mutex1</code>, a cycle of waiting cannot form.</p>` + codeBlock(`// both threads
pthread_mutex_lock(&mutex0);
pthread_mutex_lock(&mutex1);
...
pthread_mutex_unlock(&mutex1);
pthread_mutex_unlock(&mutex0);`),
      'The same-order rule is the easiest one to apply and to explain.',
      'Locking in the order you happen to need things. Different orders in different threads set up a cycle.',
      mc('Thread 0 locks A then B. How should thread 1 lock to avoid deadlock?', ['A first, then B', 'B first, then A', 'Only B, never A', 'B twice in a row'], 'A consistent global order breaks circular wait.')),
    step('Livelock',
      `<p><strong>Livelock</strong>: a set of threads each execute instructions actively, but make no progress. Example: each of two threads takes its first resource, finds the second one taken, frees the first, and tries again, forever, in step with the other.</p><p>Deadlock vs livelock: both make no progress, but in a livelock the threads are <strong>still running</strong>, while in a deadlock they are <strong>blocked</strong>.</p>`,
      'The trylock-and-back-off trick avoids deadlock but can create livelock.',
      'Calling a program deadlocked when its threads are busy looping.',
      mc('What separates livelock from deadlock?', ['Livelocked threads keep running, but stall', 'Livelock always needs three or more threads', 'Deadlock can only happen when using semaphores', 'Livelock fixes itself after a short while'], 'Both make no progress, but livelocked threads are still active; deadlocked threads are blocked.')),
  ],
  practice: [
    mc('Which pair of calls surrounds a critical section?', ['pthread_mutex_lock and unlock', 'pthread_create and pthread_join', 'sem_init and sem_post together', 'fork() and wait() together'], 'Lock before the critical section and unlock after it.'),
    mc('Which three requirements should a critical section solution meet?', ['Mutual exclusion, progress, bounded waiting', 'Speed, memory usage, and portability', 'Fairness, priority, and a time quantum', 'Lock, unlock, and wait operations'], 'These are the requirements the slides list.'),
    mc('Thread 1 locks A then B. Thread 2 locks B then A. What can happen?', ['A deadlock', 'A livelock only', 'A data race', 'Nothing, it is always safe'], 'Each can hold one lock while waiting for the other: hold and wait with a circular wait.'),
  ],
  hands: [
    bug('Tap the line that may leave the mutex locked forever.', ['pthread_mutex_lock(&m);', 'if (error) return;', 'cnt++;', 'pthread_mutex_unlock(&m);'], 1, 'Returning early skips the unlock, so every other thread blocks on the mutex.'),
    blank('Fill in the blank so both threads use the same lock order.', 'pthread_mutex_lock(&mutex0);\npthread_mutex_lock(&____);', ['mutex1', 'mutex0', 'cnt', 'tid'], 'Taking mutex0 then mutex1 in every thread breaks the circular wait.'),
    order('Put the lines in order to protect <code>cnt++</code>.', ['pthread_mutex_lock(&mutex);', 'cnt++;', 'pthread_mutex_unlock(&mutex);'], 'Lock, change the shared variable, then unlock.'),
  ],
  quiz: [
    mc('A function keeps a global <code>tmp</code> and locks a mutex around its use. How safe is it?', ['Thread safe, but not reentrant', 'Reentrant, but not thread safe', 'Both', 'Neither'], 'The mutex makes threads safe. A re-entry on the same thread would try to lock the same mutex again.'),
    mc('Which technique prevents deadlock by acquiring locks in the same order?', ['Global lock ordering', 'Using trylock only', 'Adding a sleep call', 'Using more threads'], 'Every thread follows one global order, so no cycle of waiting can form.'),
    mc('How do you decide that deadlock is possible in a program?', ['Check that all four conditions can hold', 'Check that there are two threads', 'Check that a mutex is used', 'Check that a thread sleeps'], 'If hold and wait, circular wait, mutual exclusion and no preemption can all hold, deadlock is possible. Break one to prevent it.'),
    mc('Why are threads that grab a lock "non-deterministic"?', ['The order of waiting threads is not controllable', 'Locks always pick the biggest thread first', 'The kernel deletes the lock at random', 'Locks always favour the main thread'], 'The order depends on the underlying lock mechanism and scheduling.'),
    mc('What does <code>pthread_mutex_timedlock()</code> do?', ['Waits a limited time to get the lock', 'Locks the mutex for a fixed duration', 'Waits forever until the lock frees up', 'Unlocks the mutex after a timeout'], 'timedlock is a blocking lock with a maximum wait.'),
  ],
});

// ═══ Slides 08.2: Condition variables, semaphores and classic problems ═══
defLesson('t3', {
  id: 'patterns', deck: '08.2 Synchronization: Patterns', title: 'Condition Variables, Semaphores & Classic Problems',
  analogy: `A condition variable is a doorbell: the consumer naps (no busy waiting) until the producer rings it. A semaphore is a basket of tokens: take one to enter, put one back when you leave. Dining philosophers is what happens when everyone grabs the first fork at the same time.`,
  goals: ['Use condition variables with a mutex in the producer-consumer pattern', 'Use semaphores to count resources and to signal between threads', 'Explain read-write locks, dining philosophers and the bounded buffer'],
  recap: ['<code>pthread_cond_wait(&cond, &mtx)</code> unlocks the mutex, sleeps, and re-locks it when signaled. Always call it in a <code>while</code> loop that rechecks the condition.', '<code>signal</code> wakes one waiter; <code>broadcast</code> wakes all. Signal after releasing the mutex.', 'A semaphore holds a count: <code>sem_wait</code> blocks at 0 and decrements; <code>sem_post</code> increments. <code>sem_init(&amp;s, 0, 1)</code> behaves like a mutex.', 'A read-write lock allows many readers or one writer.', 'Dining philosophers: grabbing right then left for everyone gives a deadlock. Fix by changing one order or by trylock.', 'Bounded buffer: two semaphores (free slots, filled slots) plus a mutex.'],
  steps: [
    step('The producer-consumer pattern',
      `<p><strong>Producers</strong> create data, <strong>consumers</strong> use it, and a shared resource (a variable or buffer) holds data produced but not yet consumed. If two threads change the shared <code>avail</code> without a lock, that is a data race, so we wrap it in a mutex.</p><p>A mutex alone is wasteful: the consumer keeps looping, locking and unlocking, even when there is nothing to consume. That wastes CPU.</p>`,
      'Producer-consumer shows up in pipes, queues and server request handling.',
      'Letting the consumer busy-wait. It burns CPU doing nothing.',
      mc('What is the main inefficiency of a consumer that loops with only a mutex?', ['It wastes CPU looping with nothing to consume', 'It uses far too much memory for avail', 'It can never end, even after consuming', 'It locks the mutex only a single time'], 'The consumer keeps checking and re-locking even when nothing is available.')),
    step('What a condition variable does',
      `<p>A <strong>condition variable</strong> lets threads wait for an event without burning CPU. One thread <strong>sends a notification</strong> to it; another thread <strong>waits until a notification</strong> arrives, sleeping meanwhile. It works closely with a <strong>mutex</strong>: the mutex protects the shared data, and the condition variable says when it is worth checking.</p>` + codeBlock(`static pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;
static pthread_cond_t cond = PTHREAD_COND_INITIALIZER;`),
      'It lets the consumer sleep while the producer works.',
      'Using a condition variable without a mutex. The pair always go together.',
      mc('What is the purpose of a condition variable?', ['Let a thread sleep until it is notified', 'Protect a critical section all by itself', 'Count how many resources are available', 'Create a brand new thread to run code'], 'It signals an event between threads so waiters need not busy-wait.'), 'condvar'),
    step('pthread_cond_wait() releases the mutex',
      `<p><code>pthread_cond_wait(&cond, &mtx)</code> does three things: it <strong>unlocks</strong> the mutex, puts the thread to sleep, and when it is signaled it <strong>re-locks</strong> the mutex before returning.</p><p>This "lock-safe sleep" matters: no item can be added between unlocking the mutex and starting to wait. It is important because a signal with no thread waiting is <strong>lost</strong>. It also lets the producer take the mutex while the consumer sleeps.</p>`,
      'Holding the mutex while sleeping would block the producer forever.',
      'Expecting a signal to be remembered. If nobody waits, it is lost.',
      mc('What does <code>pthread_cond_wait</code> do with the mutex?', ['Unlocks it to sleep, re-locks on wake-up', 'Keeps it locked for the whole time asleep', 'Destroys it once the thread starts waiting', 'Hands it to the producer for good'], 'The wait unlocks the mutex so others can work, then holds it again when it returns.')),
    step('signal vs broadcast',
      `<p><code>pthread_cond_signal(&cond)</code> wakes <strong>one</strong> waiting thread. If one thread waits it wakes it; if two or more wait, one wakes up with no control over which; if none wait, nothing happens.</p><p><code>pthread_cond_broadcast(&cond)</code> wakes <strong>all</strong> waiters, which then compete for the mutex.</p><p>Guideline: use <strong>signal</strong> if any one waiter can handle the event (they probably all do the same thing). Use <strong>broadcast</strong> if all waiters must respond (each does something different).</p>`,
      'Choosing the wrong one either wastes wake-ups or leaves a thread asleep.',
      'Using signal when every thread needs to react.',
      mc('When should you use <code>pthread_cond_broadcast</code>?', ['When every waiting thread must respond', 'When any one waiting thread is enough', 'When there is no thread waiting at all', 'When you do not hold the mutex'], 'Broadcast wakes everyone; signal wakes just one.')),
    step('The usage pattern and the while loop',
      `<p>Producer: lock, produce an item, unlock, then <strong>signal</strong> (after releasing the mutex, to avoid waking a consumer that must immediately wait for the mutex). Consumer:</p>` + codeBlock(`pthread_mutex_lock(&mtx);
while (avail == 0) {
    pthread_cond_wait(&cond, &mtx);
}
/* consume */
pthread_mutex_unlock(&mtx);`) + `<p>Why a <code>while</code> and not an <code>if</code>? The thread was waiting on the mutex as well as the condition, so another thread may have consumed the data first. After waking you must <strong>recheck the predicate</strong> (<code>avail != 0</code>).</p>`,
      'The while-loop recheck is the single most tested detail here.',
      'Using <code>if (avail == 0)</code> and trusting that data is there after waking.',
      mc('Why is <code>pthread_cond_wait</code> called inside a <code>while</code> loop?', ['The condition may be false again after waking', 'To make the thread wake up much faster', 'Because every signal is repeated twice', 'To avoid having to use a mutex at all'], 'Another thread may have taken the data, so the predicate must be rechecked after every wake-up.')),
    step('Semaphores',
      `<p>A mutex is binary (available or not). A <strong>semaphore</strong> holds a <strong>count</strong> of how many are available, so it is useful when availability is a number, such as how many items can be consumed.</p>` + codeBlock(`sem_t sem;
sem_init(&sem, 0, 1);   // pshared 0 = threads, 1 = processes; initial count
sem_wait(&sem);         // count 0: block; else decrement and go
sem_post(&sem);         // increment the count`) + `<p>With count 0, the next <code>sem_wait</code> blocks. A semaphore initialised to 1 behaves like a mutex. Example: allow at most 50 students registered in a course.</p>`,
      'Use a semaphore when you count things, not just lock them.',
      'Initialising a lock-like semaphore to 0. It would block everyone from the start.',
      mc('Which creates a semaphore that behaves like a mutex?', ['sem_init(&sem, 0, 1);', 'sem_init(&sem, 0, 0);', 'sem_init(&sem, 0, 2);', 'sem_init(&sem, 1, 10);'], 'A count of 1 allows exactly one holder at a time.'), 'semaphore'),
    step('Semaphores as signals: ping and pong',
      `<p>Semaphores can also signal between sections of code. To make two threads print "ping" and "pong" alternately with ping first, give each its own semaphore: a thread waits on <strong>its own</strong> and posts the <strong>other's</strong>.</p>` + codeBlock(`sem_init(&sem_ping, 0, 1);   // ping goes first
sem_init(&sem_pong, 0, 0);   // pong must wait

// ping:                       // pong:
sem_wait(&sem_ping);           sem_wait(&sem_pong);
printf("ping\\n");              printf("pong\\n");
sem_post(&sem_pong);           sem_post(&sem_ping);`),
      'This pattern is the standard way to force a strict order between threads.',
      'Starting both semaphores at 1. Then both threads run at once.',
      mc('For strict ping then pong, what are the initial values of <code>sem_ping</code> and <code>sem_pong</code>?', ['sem_ping = 1, sem_pong = 0', 'sem_ping = 0, sem_pong = 1', 'both 1', 'both 0'], 'sem_ping starts open so ping goes first, and sem_pong starts closed until ping posts it.'), 'pingpong'),
    step('Read-write lock',
      `<p>A <strong>read-write lock</strong> allows <strong>multiple readers</strong> at the same time, but when someone writes, nobody else can access the data.</p>` + codeBlock(`pthread_rwlock_rdlock(&rw);   // many threads may hold this together
pthread_rwlock_wrlock(&rw);   // only one thread may hold this`) + `<p><code>rdlock</code> succeeds for any threads as long as nobody holds the lock for writing. <code>wrlock</code> allows only one thread.</p>`,
      'Reads are often far more common than writes, so this keeps them parallel.',
      'Taking a write lock for pure reads and blocking everyone for no reason.',
      mc('How many threads can hold a read-write lock for writing at once?', ['One', 'Any number', 'Two', 'None'], 'Writers need exclusive access. Many readers can share the lock instead.')),
    step('Dining philosophers: the problem',
      `<p>Philosophers sit at a round table and alternate between eating and thinking. To eat, one needs <strong>two forks</strong> (left and right), with one fork between each pair. A fork is a shared resource that one philosopher uses at a time.</p><p><strong>A bad solution</strong>: everyone grabs their right fork, then their left. If all grab right together, everyone waits forever: deadlock. Recall the four deadlock conditions: we can break any one of them.</p>`,
      'It is the classic way to practice spotting deadlock conditions.',
      'Assuming one lock per fork is enough. The order of grabbing matters.',
      mc('Every philosopher grabs the right fork first, all at the same moment. What happens?', ['Deadlock: each holds one fork and waits', 'Livelock: they all release and retry', 'Everyone gets to eat at the same time', 'Only one philosopher starves, the rest eat'], 'Each holds one fork and waits for the left one, which another philosopher holds: a circular wait.'), 'deadlock'),
    step('Dining philosophers: solutions',
      `<ul><li><strong>Big lock</strong>: one lock for the whole table. Correct, but inefficient (Linux once had a "big kernel lock").</li><li><strong>Change one order</strong>: most philosophers grab right then left, one grabs left then right. This breaks the circular wait.</li><li><strong>trylock</strong>: grab left, <code>trylock</code> right, and if it fails release left and retry. No philosopher holds a fork while waiting, but it does not prevent starvation and can livelock.</li></ul>`,
      'Each fix breaks a different deadlock condition.',
      'Thinking the trylock fix is perfect. It can livelock.',
      mc('Which fix breaks the circular wait by making one philosopher grab left then right?', ['Changing the order for one philosopher', 'The big lock', 'The trylock retry', 'Adding more forks'], 'A different order for one philosopher means a cycle of waiting cannot close.')),
    step('The bounded buffer with semaphores',
      `<p>A <strong>bounded (circular) buffer</strong> has <code>SIZE</code> slots. Producers place items at index <code>in</code> and consumers take them from index <code>out</code>, each wrapping with <code>% SIZE</code>. Producers must wait when the buffer is full, and consumers must wait when it is empty.</p>` + codeBlock(`sem_init(&filled_cnt, 0, 0);       // slots with items
sem_init(&avail_cnt, 0, SIZE);     // free slots

// producer                      // consumer
sem_wait(&avail_cnt);            sem_wait(&filled_cnt);
lock(&mtx); buf[in] = i;         lock(&mtx); use(buf[out]);
in = (in + 1) % SIZE; unlock;    out = (out + 1) % SIZE; unlock;
sem_post(&filled_cnt);           sem_post(&avail_cnt);`),
      'This is the elegant, efficient solution, and the one the slides highlight.',
      'Dropping the mutex. The semaphores count, but the buffer indices still need protection.',
      mc('In the bounded buffer, what are the semaphore initial values?', ['filled = 0, avail = SIZE', 'filled = SIZE, avail = 0', 'both 0', 'both 1'], 'At the start every slot is free and none is filled.')),
  ],
  practice: [
    mc('Which call wakes ALL threads waiting on a condition variable?', ['pthread_cond_broadcast()', 'pthread_cond_signal()', 'pthread_cond_wait()', 'sem_post()'], 'Broadcast wakes everyone; signal wakes one.'),
    mc('What does <code>sem_wait</code> do when the count is 0?', ['Blocks until the count is above 0', 'Returns an error', 'Sets the count to 1', 'Kills the thread'], 'It waits; when the count is above 0 it decrements and returns.'),
    mc('Which allows many readers but only one writer?', ['A read-write lock', 'A plain mutex', 'A binary semaphore', 'A condition variable'], 'A read-write lock lets many threads read together but only one write.'),
  ],
  hands: [
    bug('The consumer sometimes reads a bad value. Tap the faulty line.', ['pthread_mutex_lock(&mtx);', 'if (avail == 0) {', '    pthread_cond_wait(&cond, &mtx);', '}'], 1, 'It must be a <code>while</code> loop so the condition is rechecked after waking.'),
    blank('Fill in the blank so the producer can wake a waiting consumer.', 'pthread_mutex_unlock(&mtx);\n____(&cond);', ['pthread_cond_signal', 'pthread_cond_wait', 'pthread_cond_init', 'pthread_cond_destroy'], 'After producing, the producer signals the condition variable. <code>pthread_cond_signal</code> wakes one waiter.'),
    order('Put the producer steps in the bounded buffer in order.', ['sem_wait(&avail_cnt);', 'pthread_mutex_lock(&mtx);', 'buf[in] = i;  in = (in + 1) % SIZE;', 'pthread_mutex_unlock(&mtx);', 'sem_post(&filled_cnt);'], 'Wait for a free slot, lock, produce, unlock, then announce a filled slot.'),
  ],
  quiz: [
    mc('Why should the producer signal AFTER releasing the mutex?', ['The woken consumer need not block on the mutex', 'Signals cannot be sent while a lock is held', 'It makes the signal arrive much sooner', 'Because unlock itself sends the signal'], 'If it signals while holding the mutex, the woken consumer must immediately block on the mutex, costing an extra context switch.'),
    mc('What happens if you signal a condition variable that no thread is waiting on?', ['The signal is lost', 'The next wait returns at once', 'The signal is queued forever', 'The mutex is destroyed'], 'A signal with no waiting thread has no effect, which is why the predicate is checked under the mutex.'),
    mc('What is the fix for dining philosophers that changes ONE philosopher\'s order?', ['That philosopher grabs left then right', 'That philosopher skips eating', 'That philosopher gets a second mutex', 'That philosopher uses trylock twice'], 'Breaking the symmetry breaks the circular wait, so deadlock cannot form.'),
    mc('Why does the bounded buffer still need a mutex?', ['The indices in and out are shared data', 'Semaphores cannot be used by any thread', 'The buffer has no fixed size at all', 'Consumers do not need to keep a count'], 'The semaphores count slots, but threads still update shared indices, so that code needs mutual exclusion.'),
    mc('Which statement about <code>sem_init(&s, 0, 0)</code> is correct?', ['The first sem_wait blocks until a post', 'It behaves exactly the same as a mutex', 'It lets ten threads enter at the same time', 'It is meant for processes, not for threads'], 'A count of 0 means nothing is available yet, so waiters block. The 0 in the middle means it is for threads.'),
  ],
});
