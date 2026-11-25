// CMPT201 LAB — Topic 1: Systems & Processes (slides 01 Tour, 02.1 sleep, 02.2 fork/exec, 02.3 wait/errno, 03 Signals)

// ═══ Slides 01: A Tour of Computer Systems ═══
defLesson('t1', {
  id: 'tour', deck: '01 Tour', title: 'A Tour of Computer Systems',
  analogy: `A computer is a restaurant. Applications are the customers, the kernel is the manager who decides who gets the kitchen, and the hardware is the kitchen itself. Customers never walk in and cook: they place an order (a system call).`,
  goals: ['Name the layers of the OS stack and what the syscall interface is', 'Explain the memory hierarchy and why caches exist', 'Relate pointer size to the address space, and kernel mode to user mode'],
  recap: ['OS stack: Applications, Kernel, Hardware. Applications talk to the kernel through the syscall interface.', 'Memory hierarchy: registers, caches, RAM, SSD, HDD, tape. Closer to the CPU is faster, smaller and costlier.', 'Pointer size sets the address space: 32-bit gives 2<sup>32</sup> bytes (4 GiB); 64-bit gives 2<sup>64</sup> bytes.', 'The kernel mediates hardware, controls programs and isolates them. It runs in kernel mode; applications run in user mode.', 'A compiled executable targets one ISA. POSIX gives source portability; the ABI covers binaries.', 'Virtual machines run a whole kernel; containers share the host kernel.'],
  steps: [
    step('The OS stack',
      `<p>A computer system is built in layers: <strong>Applications</strong> on top, the <strong>Kernel</strong> in the middle, and the <strong>Hardware</strong> at the bottom.</p><p>Applications reach the kernel through the <strong>syscall interface</strong>, which is an API. CMPT 201 deals extensively with it. Writing code at this level is <strong>systems programming</strong>, done in low-level languages such as C, C++ and Rust.</p>`,
      'Every later topic (processes, files, sockets) is just a different set of system calls.',
      'Thinking an application talks to hardware directly. It always goes through the kernel.',
      mc('Which layer sits between applications and the hardware?', ['The kernel', 'The compiler', 'The shell', 'The ISA'], 'The kernel mediates between applications and hardware, and applications reach it through syscalls.'), 'osstack'),
    step('Computation and data',
      `<p>Computing has two fundamental components: <strong>computation</strong>, handled by the CPU, and <strong>data</strong>, held in memory (RAM) and storage.</p><p>The <strong>von Neumann architecture</strong> is the basic model: the CPU fetches data from memory. The hardware components are the CPU, memory and I/O devices.</p>`,
      'The CPU can only work on data it has fetched from memory, which is why memory speed matters.',
      'Mixing up memory and storage. A program must be in memory for the CPU to run it.',
      mc('In the von Neumann model, what does the CPU do with memory?', ['Fetches data from it', 'Stores programs on its disk', 'Compiles code in it', 'Encrypts it'], 'The CPU fetches instructions and data from memory to compute on them.')),
    step('The memory hierarchy',
      `<p>The CPU is much faster than memory, so a tiny, very fast memory sits inside the CPU: <strong>registers</strong>. Bigger <strong>caches</strong> (L1 is the smallest, closest and fastest, then L2, L3) sit near the CPU.</p><p>The full hierarchy, fast and small to slow and big: <strong>registers, caches, RAM, SSD, hard drive, tape</strong>. Bigger is cheaper per byte but slower. "Commit" means moving data from memory to disk, from temporary to permanent.</p>`,
      'The hierarchy lets programs use a huge memory while it feels fast, because hot data lives close to the CPU.',
      'Assuming larger memory is faster. Larger is slower and farther from the CPU.',
      mc('Which level of the memory hierarchy is the fastest and smallest?', ['Registers', 'RAM', 'SSD', 'Tape'], 'Registers sit inside the CPU: tiny, fastest, and closest.')),
    step('Pointers, bits and address space',
      `<p>Memory is made of <strong>bytes</strong>, and each byte has an address. A pointer stores one. The <strong>pointer size</strong> controls the address space:</p><ul><li>32-bit: 4-byte pointers, addresses <code>0x00000000</code> to <code>0xFFFFFFFF</code>, which is 4,294,967,296 bytes.</li><li>64-bit: 8-byte pointers, 2<sup>64</sup> bytes (about 16 exabytes).</li></ul><p>An address of n bits can name 2<sup>n</sup> bytes, so 16 bytes of RAM need only 4 address bits. All pointer types (<code>char *</code>, <code>long long *</code>) are the same size.</p>`,
      'This is why a 32-bit machine cannot use more than 4 GiB of memory.',
      'Thinking a <code>char *</code> is smaller than a <code>long long *</code>. The type of the data does not change the size of the address.',
      mc('A computer has only 16 bytes of memory. How many bits does an address need?', ['4', '2', '8', '16'], '2<sup>4</sup> = 16, so 4 bits can name each of the 16 byte locations.')),
    step('What the kernel does',
      `<p>Many programs want the hardware at once. The <strong>kernel</strong> manages (mediates) that access, controls programs (running, stopping, and so on) and provides <strong>protection</strong>: users cannot read each other's data, and programs cannot interfere with each other.</p><p>The kernel is <strong>event-driven</strong>. It does work when something happens: a hardware event (a mouse click, a network packet), a system call from an application, or a software interrupt.</p>`,
      'Protection and sharing are the two reasons we need a kernel at all.',
      'Believing the kernel runs all the time. It mostly waits and responds to events.',
      mc('When does the kernel do its work?', ['In response to events such as syscalls and hardware events', 'Continuously, in a loop of its own', 'Only when the root user asks', 'Only at boot time'], 'The kernel is event-driven. It reacts to hardware events, syscalls and software interrupts.')),
    step('User mode vs kernel mode',
      `<p>The CPU runs in one of two privilege modes. <strong>Kernel mode</strong> (often called "Ring 0") runs the kernel with full access to the hardware. <strong>User mode</strong> runs applications and blocks privileged instructions and access to kernel memory.</p><p>The <strong>root user</strong> is different: it is still a user, with admin privileges over files and programs. Root cannot access kernel memory or run protected instructions.</p>`,
      'A system call is how an application asks the kernel, in kernel mode, to do something privileged for it.',
      'Thinking the root user runs in kernel mode. Mode and user level are separate ideas.',
      mc('What does user mode do?', ['Blocks applications from privileged instructions', 'Lets the root user edit kernel memory freely', 'Runs the kernel itself with full access', 'Switches off every system call for programs'], 'User mode limits what an application can do. Only the kernel runs with full privilege.')),
    step('From source to a running program',
      `<p>C is <strong>compiled</strong> to machine code, which runs fast but targets one <strong>ISA</strong> (instruction set architecture, such as x86, ARM or RISC-V). You cannot run an AMD64 executable on an ARM64 machine. Interpreted languages (Python, Bash) are slower but portable.</p><p><strong>POSIX</strong> is a standard for source portability across operating systems (we request it with <code>#define _POSIX_C_SOURCE 200809L</code>). An <strong>API</strong> is at the code level; an <strong>ABI</strong> is the interface for an executable that the OS defines.</p>`,
      'This explains why one binary will not run everywhere, but one POSIX source file can be rebuilt almost anywhere.',
      'Confusing API and ABI. Your code calls an API; a compiled binary follows an ABI.',
      mc('Why can an AMD64 executable not run on an ARM64 machine?', ['The host kernel', 'The hypervisor layer', 'The CPU registers', 'A second operating system'], 'A container reuses the host kernel and isolates processes with namespaces and cgroups.')),
  ],
  practice: [
    mc('Which of these gives applications a way to ask the kernel for services?', ['The syscall interface', 'The L1 cache', 'The ISA', 'The hypervisor'], 'Applications reach the kernel through system calls, the syscall interface.'),
    mc('Pointers on a 64-bit system are how large?', ['8 bytes', '4 bytes', '2 bytes', '16 bytes'], 'A 64-bit system uses 64-bit (8-byte) pointers, which sets how much memory can be addressed.'),
    mc('A "commit" means moving data from:', ['Memory to disk', 'Disk to the cache', 'A register to the CPU', 'User mode to kernel mode'], 'Commit changes data from temporary (memory) to permanent (disk).'),
  ],
  hands: [
    bug('Tap the FALSE statement about the kernel.', ['The kernel mediates access to the hardware.', 'Applications run in user mode.', 'The root user runs in kernel mode.', 'Syscalls let applications ask the kernel for services.'], 2, 'Root is a user with admin privileges, but it still runs in user mode. Kernel mode belongs to the kernel.'),
    blank('Fill in the blank so the line prints the size of a pointer.', 'printf("%zu\\n", ____);', ['sizeof(char *)', 'strlen(char *)', 'sizeof(pointer)', 'length(char *)'], '<code>sizeof(char *)</code> gives the size of an address: 4 on a 32-bit system and 8 on a 64-bit one.'),
    order('Put the life of a program in order.', ['Write C source code', 'Compile it to machine code for one ISA', 'The OS loads the executable into memory', 'The CPU runs it as a process'], 'Source is compiled to machine code, loaded from disk into memory, then executed.'),
  ],
  quiz: [
    mc('What is the largest number of bytes a 32-bit pointer can address?', ['4,294,967,296', '65,536', '2,147,483,648', '18,446,744,073,709,551,616'], 'A 32-bit address names 2<sup>32</sup> = 4,294,967,296 bytes.'),
    mc('Why do CPUs have caches between the registers and RAM?', ['To bridge the CPU and memory speed gap', 'To store the kernel safely away from users', 'To make main memory much cheaper to buy', 'To let programs run in user mode only'], 'The CPU is much faster than RAM, so caches keep recently used data close to the CPU.'),
    mc('Which pair is correct?', ['Containers share the host kernel; VMs run their own', 'VMs share the host kernel; containers run their own', 'Both share the CPU registers', 'Neither needs a kernel'], 'A VM includes its own kernel under a hypervisor. A container shares the host kernel.'),
    mc('A hardware interrupt, a syscall and a software interrupt are all examples of:', ['Events the kernel responds to', 'Memory hierarchy levels', 'ISA instructions only', 'Kinds of containers'], 'The kernel is event-driven, and these are the events that make it do work.'),
    mc('Which statement about API and ABI is correct?', ['An API is at the code level; an ABI is for binaries', 'An ABI is at the code level; an API is for binaries', 'They are the same thing', 'ABI is only used by interpreters'], 'Your code calls an API. A compiled executable follows the ABI the OS defines.'),
  ],
});

// ═══ Slides 02.1: Processes, sleep() and man pages ═══
defLesson('t1', {
  id: 'sleep', deck: '02.1 Processes: sleep()', title: 'Processes, sleep() & Man Pages',
  analogy: `A program is a recipe card in a drawer. A process is a cook actually following the recipe in the kitchen. The card does nothing until someone loads it and starts cooking.`,
  goals: ['Tell a program from a process', 'Use the man page sections and the four questions to learn a syscall', 'Read output parameters such as <code>char **</code>'],
  recap: ['A program is a file on disk. A process is a program loaded into memory and running.', 'Process syscalls: <code>fork()</code> clones, <code>exec()</code> replaces, <code>wait()</code> waits for a child.', '<code>sleep(n)</code> (from <code>unistd.h</code>) pauses a process for n seconds.', 'Man sections: 1 commands, 2 system calls, 3 C library. <code>man 3 sleep</code> is the function.', 'Learn a call by asking: is it what I want, how do I call it, what does it return, how can it fail.', 'An output parameter is a pointer the callee fills in; <code>char **</code> lets it set where your pointer points.'],
  steps: [
    step('Program vs process',
      `<p>A <strong>program</strong> is a file on disk that holds machine code. Unless you run it, it is just a file. A <strong>process</strong> is a program that has been loaded into memory and is running.</p><p>The CPU cannot access bytes on a disk, so a program must be in memory to run. To start it, the OS makes space in RAM, loads the machine code from the file, makes space for data (variables) and starts executing. Each process has its own <strong>memory space</strong>.</p>`,
      'Everything this course does to processes (fork, exec, wait) starts from this distinction.',
      'Calling a file on disk a process. It only becomes one once it is loaded and running.',
      mc('What is the difference between a process and a program?', ['A process is a program loaded into memory and running', 'A program is a process loaded into memory and running', 'A process lives on the hard drive; a program lives in RAM', 'They are two names for the same thing'], 'A program is the file. Running it creates a process.')),
    step('Controlling processes with syscalls',
      `<p>Programmers control processes with <strong>system calls</strong>. Three core ones:</p><ul><li><code>fork()</code>: create a new process by cloning the current one.</li><li><code>exec()</code>: replace the current process with another executable (a family of calls).</li><li><code>wait()</code>: wait until a created process finishes its work.</li></ul>`,
      'Together they are how a shell runs your commands.',
      'Expecting one call to do it all. Creating, replacing and waiting are separate steps.',
      mc('Which syscall replaces the current process with another executable?', ['exec()', 'fork()', 'wait()', 'sleep()'], 'The exec family loads a different program into the current process.')),
    step('sleep() and seeing processes',
      `<p><code>sleep(seconds)</code> suspends your process for that many seconds. It needs <code>#include &lt;unistd.h&gt;</code>.</p>` + codeBlock(`#include <unistd.h>
int main() {
    while (1) {
        sleep(1);
    }
}`) + `<p>A tool like <code>btop</code> (press <code>e</code> for tree view) shows processes. Every process has a parent; in the container, the shell is the parent of <code>a.out</code>.</p>`,
      'A sleeping process is easy to find in btop, which makes it a good way to watch fork and wait later.',
      'Forgetting the header. <code>sleep</code> is declared in <code>unistd.h</code>.',
      mc('What does <code>sleep(1)</code> do?', ['Suspends the process for one second', 'Kills the process after one second', 'Starts a child process', 'Waits for a child to finish'], 'sleep pauses the calling process for the given number of seconds.')),
    step('Reading a man page',
      `<p>Man pages are the primary way to learn functions and system calls. The command is <code>man &lt;thing&gt;</code>. The section numbers that matter here:</p><ul><li><code>man 1</code>: general commands, such as <code>man 1 ls</code></li><li><code>man 2</code>: system calls, such as <code>man 2 fork</code></li><li><code>man 3</code>: C standard library functions, such as <code>man 3 sleep</code></li></ul><p>Without the 3, <code>man sleep</code> shows the Linux <em>command</em>, not the function.</p>`,
      'Looking in the wrong section is the most common reason you read the wrong page.',
      'Typing <code>man sleep</code> and reading about the shell command.',
      mc('Which command shows the C function sleep()?', ['man 3 sleep', 'man 1 sleep', 'man 2 sleep', 'man sleep()'], 'Section 3 holds the C library functions. Section 1 is the command.')),
    step('Four questions to learn a syscall',
      `<ol><li><strong>Is this what I want?</strong> Read the Description.</li><li><strong>How do I call it?</strong> Read the Synopsis: header files, return type and arguments.</li><li><strong>What does it give me?</strong> Read Return Value. Watch for output parameters (pointers).</li><li><strong>How can it go wrong?</strong> Read Errors (errno) and check for a <strong>feature test macro</strong>. For example, <code>nanosleep</code> needs <code>_POSIX_C_SOURCE</code> defined.</li></ol>`,
      'This routine works for every call in the course.',
      'Skipping the Return Value and Errors sections, then ignoring failures.',
      mc('Which man page section tells you the header file to include?', ['Synopsis', 'Errors', 'Return Value', 'See Also'], 'The Synopsis shows the prototype and the header file.')),
    step('Output parameters and char **',
      `<p>A function can give results back through <strong>output parameters</strong>: pointers the caller passes in so the function can write there. A <code>char **x</code> is a pointer to a <code>char *</code>.</p>` + codeBlock(`void set_name(char **out) {
    *out = "hello";        // changes where the caller's pointer points
}
char *name;
set_name(&name);           // caller passes the ADDRESS of its pointer`) + `<p>The calling code passes <code>&amp;name</code>, and the function sets where <code>name</code> points.</p>`,
      'The same idea returns many results from one call, such as <code>wait</code> filling in a status.',
      'Passing <code>name</code> instead of <code>&amp;name</code>. The function would only change its own copy.',
      mc('What does the caller pass for an output parameter of type <code>char **</code>?', ['The address of its own pointer', 'The string literal itself directly', 'A copy of the pointer value', 'A NULL pointer to be filled in'], 'The callee needs the address of the caller\'s pointer to change where that pointer points.'), 'memory'),
  ],
  practice: [
    mc('A process needs its program to be in:', ['Memory (RAM)', 'The tape drive', 'A register only', 'The man page'], 'The CPU cannot access bytes on disk, so the program must be loaded into memory.'),
    mc('Which man section covers system calls?', ['2', '1', '3', '7'], 'Section 2 is system calls. Section 1 is commands and section 3 is the C library.'),
    mc('Why might a call fail to compile until you define <code>_POSIX_C_SOURCE</code>?', ['It needs a feature test macro', 'sleep has no header', 'fork is not in C', 'The kernel is too old'], 'Some functions are only declared when a feature test macro is defined, as the Synopsis section shows.'),
  ],
  hands: [
    bug('This loop should pause for a second each time. Tap the line that is wrong.', ['#include <stdio.h>', 'int main() {', '    while (1) { sleep(1); }', '}'], 0, '<code>sleep</code> is declared in <code>unistd.h</code>, so that header is the one to include.'),
    blank('Fill in the blank to make the callee set where the caller\'s pointer points.', 'void set(____ out) { *out = "hi"; }', ['char **', 'char *', 'char', 'char ***'], 'A <code>char **</code> is the address of a <code>char *</code>, so <code>*out = ...</code> changes the caller\'s pointer.'),
    order('Put the steps in order for learning a new syscall from its man page.', ['Read the Description: is this what I want?', 'Read the Synopsis: header, return type and arguments', 'Read Return Value: what does it give me?', 'Read Errors: how can it go wrong?'], 'The four questions go from "is it right", to "how to call it", to "what comes back", to "how it fails".'),
  ],
  quiz: [
    mc('Which of these is true about a program and a process?', ['A process is a program loaded and running', 'A program is a running process in RAM', 'A process is stored only on the SSD', 'A program is created by calling wait()'], 'The file is the program. Loading and running it makes a process.'),
    mc('You run <code>man sleep</code> and read about a shell command. Why?', ['No section number means section 1 is shown', 'sleep is simply not a C function at all', 'man only ever knows about shell commands', 'Section 3 does not exist in the manual'], 'Add the section: <code>man 3 sleep</code> gives the C library function.'),
    mc('Which three syscalls were named as the core process calls?', ['fork, exec, wait', 'fork, sleep, open', 'read, write, close', 'malloc, free, brk'], 'Clone with fork, replace with exec, and wait for a child with wait.'),
    mc('In the btop tree view, what is the parent of <code>a.out</code> in the container?', ['The shell (zsh)', 'The kernel directly', 'init', 'The compiler'], 'The container shell started a.out, so it is the parent. Every process has a parent.'),
    mc('In <code>set_name(&amp;name)</code> the function can change which string <code>name</code> points to because:', ["It received the pointer's address", 'Strings are always global variables', 'The name variable is a constant', 'C always passes arrays by value'], 'Passing the address of the pointer gives the callee a way to write to the caller\'s variable.'),
  ],
});

// ═══ Slides 02.2: fork() and exec() ═══
defLesson('t1', {
  id: 'forkexec', deck: '02.2 Processes: fork/exec', title: 'fork() & exec()',
  analogy: `fork() is waking up after being cloned: there are now two of you with the same memories, and the only way to tell is the note in your pocket (the return value). exec() is a brain transplant: same body, a completely new mind.`,
  goals: ['Explain why fork() returns twice and use the return value', 'Count processes created by repeated fork() calls', 'Run a different program with the exec family'],
  recap: ['Each process has its own address space; processes communicate only through the OS.', '<code>fork()</code> is called once and returns twice: the child\'s PID in the parent, 0 in the child, -1 on failure.', 'After fork the two processes run independently.', '<code>exec()</code> replaces the process\'s memory with a new program. On success it never returns.', 'In <code>execl</code>/<code>execv</code> flavours: l = list of arguments, v = vector (array), p = search the PATH.', 'The first argument after the path is the program name (arg0).'],
  steps: [
    step('Separate address spaces',
      `<p>Each process has its <strong>own address space</strong>. Changing a variable in one process does not change it in another. Processes can only communicate through the OS, and only if both agree.</p>`,
      'This is why fork gives you a copy and not a shared variable.',
      'Expecting a child\'s change to a variable to show up in the parent.',
      mc('Process A changes a variable. What does process B see?', ['No change: separate address spaces', 'The new value, copied instantly', 'A crash caused by the change', 'The value it had before the fork'], 'Address spaces are separate, so one process cannot change another\'s variables.')),
    step('fork() returns twice',
      `<p>The parent calls <code>fork()</code> to have the OS start a new process. <code>fork()</code> clones the process: it is called once but <strong>returns twice</strong>, once in each process.</p><ul><li>In the <strong>parent</strong>: the child's PID (non-zero), or -1 on failure.</li><li>In the <strong>child</strong>: 0.</li></ul>` + codeBlock(`pid_t pid = fork();
if (pid == 0) {
    printf("child\\n");
} else {
    printf("parent\\n");
}`),
      'The return value is the only way each copy knows which one it is.',
      'Writing <code>if (pid = 0)</code>. That assigns instead of comparing.',
      mc('What does <code>fork()</code> return in the child process?', ['0', 'The parent\'s PID', 'The child\'s own PID', '-1'], 'The child gets 0. The parent gets the child\'s PID.'), 'fork'),
    step('After the fork',
      `<p>Until <code>fork()</code> there is one process. After it, each process executes <strong>independently</strong>, and they may print in any order. <code>getpid()</code> returns your PID and <code>getppid()</code> returns your parent's PID.</p><p>Calling <code>fork()</code> repeatedly doubles the processes each time: two <code>fork()</code> calls in a row leave 4 processes (counting the original).</p>`,
      'Counting processes after several forks is a very common exam question.',
      'Putting <code>fork()</code> inside a loop by accident. Each pass multiplies the processes.',
      mc('A program calls <code>fork();</code> then <code>fork();</code> one after the other. How many processes exist afterwards?', ['4', '2', '3', '6'], 'The first fork makes 2. Each of them runs the second fork, making 4.'), null,
      'fork once: 1 process becomes 2 &nbsp;→&nbsp; both run the next fork: 2 become 4.'),
    step('exec() replaces the program',
      `<p><code>exec()</code> loads a new program into the current process. It discards the old program from the process's memory, so <strong>the code after a successful exec never runs</strong>. exec completely replaces the calling process, like a brain transplant.</p>` + codeBlock(`int main() {
    printf("Hi\\n");
    fork();
    exec(...);        // parent and child both replaced
    printf("Bye\\n");  // never runs
}`),
      'A shell runs a program by forking and then exec-ing in the child.',
      'Expecting statements after a successful <code>exec</code> to run. They are gone.',
      mc('What happens to the code after a successful exec call?', ['It never runs: the program was replaced', 'It runs after the new program ends', 'It runs in the parent only', 'It runs twice'], 'exec replaces the whole process image, so the old code is gone.')),
    step('The exec family',
      `<p>There are many flavours: <code>execl</code>, <code>execv</code>, <code>execlp</code>, <code>execvp</code>, <code>execle</code>, <code>execvpe</code>.</p><ul><li><strong>l</strong>: pass each argument separately (a list).</li><li><strong>v</strong>: pass the arguments together in an array (a vector).</li><li><strong>p</strong>: search the PATH for the program name.</li></ul>` + codeBlock(`execl("/bin/echo", "/bin/echo", "Yes!", "No!", (char *)NULL);
char *args[] = {"/bin/echo", "Yes!", "No!", NULL};
execv("/bin/echo", args);`),
      'Pick the flavour that fits your data: a fixed list of arguments or a built array.',
      'Leaving off the final <code>NULL</code>. The list must end with one.',
      mc('In <code>execvp</code>, what does the <code>p</code> mean?', ['Search the PATH for the program', 'Pass each argument as a pointer', 'Run the program in parallel', 'Print the result on the screen'], 'p means the call looks the program name up in the PATH, so you need not give a full path.')),
    step('Arguments start with the program name',
      `<p>When a program starts, the OS hands it its arguments. <code>args[0]</code> (<strong>arg0</strong>) is the program's name, and the others follow. So when you call exec, the argument list must <strong>start with the program name</strong> too: <code>execl("/bin/ls", "/bin/ls", "-a", NULL)</code>.</p><p>The usual pattern: <code>fork()</code>, then call exec in the child. If exec returns at all, it failed (it returns -1).</p>`,
      'Forgetting arg0 shifts every argument by one and the program sees the wrong options.',
      'Passing <code>"-a"</code> as the first argument after the path. That is arg0, not an option.',
      mc('Which call correctly runs <code>ls -a</code>?', ['execl("/bin/ls", "/bin/ls", "-a", (char *)NULL);', 'execl("/bin/ls", "-a", (char *)NULL);', 'execl("-a", "/bin/ls", (char *)NULL);', 'execl("ls -a");'], 'The list repeats the program name as arg0, then gives "-a", then ends with NULL.')),
  ],
  practice: [
    mc('Which value tells a process it is the child after fork()?', ['pid == 0', 'pid != 0', 'pid == -1', 'pid == getppid()'], 'The child receives 0 from fork.'),
    mc('Which function returns your parent\'s PID?', ['getppid()', 'getpid()', 'fork()', 'wait()'], 'getppid gives the parent PID, and getpid gives your own.'),
    mc('Which is true of <code>execl</code>?', ['It takes each argument separately', 'It takes an array of arguments', 'It searches the PATH', 'It returns the child PID'], 'The l means a list of separate arguments.'),
  ],
  hands: [
    bug('The child branch never runs correctly. Tap the faulty line.', ['pid_t pid = fork();', 'if (pid = 0) {', '    printf("child\\n");', '}'], 1, '<code>pid = 0</code> assigns instead of comparing. It should be <code>pid == 0</code>.'),
    blank('Fill in the blank so the block runs only in the child.', 'pid_t pid = fork();\nif (____) {\n    /* child code */\n}', ['pid == 0', 'pid != 0', 'pid == -1', 'pid > 0'], 'The child receives 0 from fork().'),
    order('Put the lines in order to run <code>ls -a</code> in a child process.', ['pid_t pid = fork();', 'if (pid == 0) {', '    execl("/bin/ls", "/bin/ls", "-a", (char *)NULL);', '}'], 'Fork first, then only the child (pid == 0) calls exec.'),
  ],
  quiz: [
    mc('A program calls <code>fork()</code> three times in a row. How many processes run afterwards?', ['Each process has its own address space', 'The child simply ignores any updates', 'The fork call locks that variable', 'The variable was declared read-only'], 'After fork the processes are separate copies that cannot see each other\'s memory.'),
    mc('What does exec return on success?', ['It does not return', '0', 'The new PID', '1'], 'The calling program has been replaced, so there is nothing to return to.'),
    mc('Which exec flavour takes its arguments in an array?', ['execv', 'execl', 'execlp', 'None of them'], 'The v means vector: the arguments are passed together as an array.'),
    mc('A program runs <code>fork();</code> then <code>exec(...)</code> (which succeeds) then <code>printf("Bye\\n");</code>. How many times is "Bye" printed?', ['0 times', '1 time', '2 times', '3 times'], 'exec replaced both the parent and the child, so neither one ever reaches the printf.'),
    mc('You call <code>execl("/bin/echo", "Yes!", (char *)NULL)</code>. What goes wrong?', ['"Yes!" becomes arg0, so echo gets no argument', 'The path to echo is the wrong one', 'A NULL argument is not allowed here', 'The echo command is unable to run'], 'The list must start with the program name. Here "Yes!" took the arg0 slot.'),
  ],
});

// ═══ Slides 02.3: wait(), zombies, orphans, errno ═══
defLesson('t1', {
  id: 'waiterrno', deck: '02.3 Processes: wait/errno', title: 'wait(), Zombies & errno',
  analogy: `A parent waiting for a child is a coach waiting for a player to come back from a drill. If the coach never checks in, the finished player stays on the roster as a ghost (a zombie).`,
  goals: ['Use waitpid() and read the status with the macros', 'Explain zombies and orphans', 'Use errno and perror() to find out what went wrong'],
  recap: ['<code>waitpid(pid, &amp;wstatus, 0)</code> blocks until the child ends; it returns -1 on error.', '<code>wstatus</code> is an output parameter; read it with <code>WIFEXITED</code>/<code>WEXITSTATUS</code> and <code>WIFSIGNALED</code>/<code>WTERMSIG</code>.', 'A terminated child that has not been waited on is a zombie. <code>wait()</code> frees it.', 'An orphan has lost its parent; Linux makes <code>init</code> its parent, and init waits on it.', '<code>errno</code> is set when a call fails. <code>perror("msg")</code> prints an explanation.'],
  steps: [
    step('Waiting for a child',
      `<p>A parent can wait for a child with <code>wait()</code>, a family of calls. We usually use <code>waitpid()</code>.</p>` + codeBlock(`pid_t pid = fork();
if (pid != 0) {
    // parent waits for the child to finish
    if (waitpid(pid, NULL, 0) == -1) { /* error */ }
} else {
    // child does something, maybe exec
}`),
      'Without a wait, the parent has no idea when or how the child finished.',
      'Having the child call waitpid. The parent is the one that waits.',
      mc('Which process normally calls waitpid()?', ['The parent', 'The child', 'init only', 'The kernel'], 'The parent waits for the child it created.')),
    step('The parts of waitpid()',
      `<p><code>pid_t waitpid(pid_t pid, int *wstatus, int options);</code></p><ul><li><code>pid</code>: which child to wait for.</li><li><code>wstatus</code>: a pointer to an <code>int</code> where the status is stored. It may be <code>NULL</code>.</li><li><code>options</code>: we leave it as 0. <code>WNOHANG</code> makes the call non-blocking: do not wait.</li></ul><p><code>wstatus</code> is an <strong>output parameter</strong>: main() declares an <code>int</code> so waitpid has somewhere to write the answer.</p>`,
      'The same output-parameter pattern appears in many syscalls.',
      'Passing the status value instead of its address. waitpid needs <code>&amp;wstatus</code>.',
      mc('What does passing <code>WNOHANG</code> as options do?', ['Makes waitpid non-blocking', 'Waits forever', 'Kills the child', 'Waits for any grandchild'], 'WNOHANG tells waitpid not to wait if the child has not finished.')),
    step('Why did the child end?',
      `<p>The <code>wstatus</code> value is complicated, so use the macros:</p>` + codeBlock(`if (WIFEXITED(wstatus)) {
    printf("Reason: %d\\n", WEXITSTATUS(wstatus));
}
if (WIFSIGNALED(wstatus)) {
    printf("Terminated by signal # %d\\n", WTERMSIG(wstatus));
}`) + `<p>A child ends normally by calling <code>exit()</code> or returning from <code>main</code>, or it is terminated by a signal.</p>`,
      'The macros hide the encoded bits, so you never decode the number by hand.',
      'Printing <code>wstatus</code> directly. It is an encoded value, not the exit code.',
      mc('Which macro tells you the child exited normally?', ['WIFEXITED', 'WTERMSIG', 'WNOHANG', 'WEXITED'], 'WIFEXITED is true for a normal exit, and WEXITSTATUS then gives the exit code.')),
    step('Zombies',
      `<p>When a process terminates, the OS keeps some of its state so the parent can learn why it ended. That uses a little memory. A <strong>zombie</strong> is a child that has terminated but whose parent has not yet waited on it: dead, but not completely.</p><p>Calling <code>wait()</code> on the terminated child frees that memory. Many zombies use kernel resources (memory, PIDs), so always <code>wait()</code> on your children.</p>`,
      'A parent that never waits slowly leaks PIDs.',
      'Thinking exit() removes a process completely. The entry stays until the parent waits.',
      mc('How do you get rid of a zombie process?', ['The parent calls wait() on it', 'Call sleep() in the child', 'Call exec() in the parent', 'Reboot the kernel'], 'wait() frees the kept state and removes the zombie.'), 'fork'),
    step('Orphans',
      `<p>An <strong>orphan</strong> is a process whose parent has terminated, so it no longer has a parent. On Linux, an orphan becomes a child of <code>init</code>, and init calls <code>wait()</code> on all of its children.</p>`,
      'This is why orphans do not linger as zombies.',
      'Mixing up zombie and orphan. A zombie is a dead child; an orphan is a living child with no parent.',
      mc('What happens to an orphaned process on Linux?', ['init adopts it and waits on it', 'It is killed at once', 'It becomes a zombie forever', 'Its grandparent adopts it'], 'Orphans become children of init, which calls wait() on them.')),
    step('errno and perror()',
      `<p>When a system call fails, it returns -1 and sets <code>errno</code>, an integer variable (in <code>errno.h</code>) that says which error occurred. <code>perror("message")</code> prints your message plus an explanation of the current errno.</p>` + codeBlock(`if (somecall() == -1) {
    if (errno == EACCES) {
        printf("You don't have access.\\n");
    } else {
        perror("somecall() failed");
    }
}`) + `<p>For example, <code>fork()</code> sets errno to <code>EAGAIN</code>, <code>ENOMEM</code> or <code>ENOSYS</code> when it fails.</p>`,
      'errno turns "it failed" into "it failed because of this".',
      'Checking errno without checking the return value first. errno is only meaningful after a call fails.',
      mc('What does <code>perror("fork")</code> print?', ['Your message plus the errno explanation', 'The PID of the child that failed', 'The exit status of the last child', 'Nothing at all unless errno is zero'], 'perror prints the message and a description of the current errno value.')),
  ],
  practice: [
    mc('Which call blocks until a specific child process ends?', ['waitpid()', 'getpid()', 'sleep()', 'fork()'], 'waitpid waits for the given child.'),
    mc('<code>WEXITSTATUS(wstatus)</code> gives you:', ['The exit code of the child', 'The child PID', 'The signal number', 'The parent PID'], 'After WIFEXITED is true, WEXITSTATUS returns the exit status.'),
    mc('An orphan is a process that:', ['Has lost its parent', 'Has finished but not been waited on', 'Is waiting for a child', 'Called exec twice'], 'An orphan is a process whose parent terminated. A zombie is the finished one.'),
  ],
  hands: [
    bug('The parent should print the child\'s exit status. Tap the line with the bug.', ['int wstatus = 0;', 'waitpid(pid, wstatus, 0);', 'if (WIFEXITED(wstatus))', '    printf("%d\\n", WEXITSTATUS(wstatus));'], 1, 'waitpid needs the <strong>address</strong> of the status variable: <code>&amp;wstatus</code>.'),
    blank('Fill in the blank to run code only when the child ended normally.', 'if (____(wstatus)) {\n    printf("done\\n");\n}', ['WIFEXITED', 'WIFSIGNALED', 'WNOHANG', 'WTERMSIG'], 'WIFEXITED is true when the child exited normally.'),
    order('Put the parent code in order.', ['pid_t pid = fork();', 'if (pid != 0) {', '    waitpid(pid, &wstatus, 0);', '    if (WIFEXITED(wstatus)) { /* use WEXITSTATUS */ }'], 'Fork, then in the parent wait, then inspect the status.'),
  ],
  quiz: [
    mc('A parent forks 100 children and never calls wait. What builds up?', ['Zombie processes', 'Orphans', 'Signals', 'Cache misses'], 'Each finished child stays as a zombie, using a PID and some memory, until it is waited on.'),
    mc('Which statement about zombies is true?', ['They have terminated but not been waited on', 'They are running with no parent', 'They are processes that called exec', 'They only exist on Windows'], 'A zombie is dead, but the parent has not yet collected its status.'),
    mc('Why is <code>wstatus</code> declared in the caller?', ['So waitpid has somewhere to write', 'To store the child process PID', 'To pass the PID value in to it', 'To store the errno value for later'], 'It is an output parameter: the caller provides space and passes its address.'),
    mc('A call returns -1. What should you do next to learn why?', ['Check errno or call perror', 'Call wait()', 'Call sleep(1)', 'Call fork() again'], 'errno holds the reason, and perror prints it.'),
    mc('When a parent terminates before its child, the child is adopted by:', ['init', 'The shell', 'The kernel scheduler', 'Nobody, it is killed'], 'init takes in orphans and calls wait() on them.'),
  ],
});

// ═══ Slides 03: Signals ═══
defLesson('t1', {
  id: 'signals', deck: '03 Signals', title: 'Signals & Function Pointers',
  analogy: `A signal is a tap on the shoulder. You are busy in your loop when a teammate taps you: you pause, do what the tap means (your handler), then carry on. Nobody knew exactly when the tap would come.`,
  goals: ['Explain signals as asynchronous notifications', 'Read and write function pointers', 'Install a handler with sigaction() and send signals with kill()'],
  recap: ['Signals are asynchronous notifications sent by the kernel or by processes.', 'A function pointer holds the address of a function, so a library can call back into your code.', 'Install a handler with <code>sigaction(signum, &amp;act, &amp;oldact)</code>; set <code>.sa_handler</code>, <code>.sa_flags</code>, <code>.sa_mask</code>.', 'SIGINT is Ctrl-C, SIGKILL is the kill call, SIGSEGV is an invalid memory reference. Send with <code>raise()</code> (self) or <code>kill()</code> (another process).', 'Handlers must only call async-signal-safe functions: use <code>write</code>, not <code>printf</code>.'],
  steps: [
    step('What is a signal?',
      `<p>Processes can create other processes, but how can they communicate? A <strong>signal</strong> is a notification with a specific meaning. Programs and the kernel can send signals to themselves or to other programs. Signals allow <strong>asynchronous</strong> communication: the receiver does not ask for it, it just arrives.</p><p>Example: a parent forks children to search for a golden ticket and waits. The child that finds it signals the parent.</p>`,
      'It lets ordinary code with loops and functions react to an event that can arrive at any moment.',
      'Polling in a loop to check for a message. A signal avoids that.',
      mc('What is a signal?', ['An asynchronous notification with a meaning', 'A pipe that links two processes together', 'A new kind of process the kernel makes', 'A function that returns twice at once'], 'Signals notify a process that something happened, without the process asking for it.'), 'signals'),
    step('Function pointers',
      `<p>Normal variables hold values and pointers hold addresses. A <strong>function pointer</strong> holds the address of a function, so you can pass a function around and call it later. That lets a library <em>call back</em> into your code when something happens.</p>` + codeBlock(`void handler(int signum) { /* ... */ }

void (*fp)(int) = &handler;   // or just = handler
fp(2);                        // call it like a function`) + `<p>The declaration looks like the function prototype with the name wrapped as <code>(*name)</code>. For <code>int foo(char a, int b)</code>, the pointer is <code>int (*func)(char a, int b) = foo;</code>.</p>`,
      'This is how you hand your handler to the kernel.',
      'Writing <code>handler()</code> with parentheses. That calls it instead of passing its address.',
      mc('Which line declares a function pointer <code>func</code> to <code>int foo(char a, int b)</code>?', ['int (*func)(char a, int b) = foo;', 'int (*foo)(char a, int b) = func;', 'int *(func)(char a, int b) = foo;', 'int *(foo)(char a, int b) = func;'], 'The name goes inside <code>(*func)</code>, and foo supplies the address on the right.')),
    step('Handling a signal with sigaction()',
      `<p>To receive a signal you write a handler and <strong>register</strong> it with Linux using <code>sigaction()</code>, passing a function pointer.</p>` + codeBlock(`void handler(int signum) { /* ... */ }

struct sigaction act;
act.sa_handler = handler;
act.sa_flags = 0;
sigemptyset(&act.sa_mask);
sigaction(SIGINT, &act, NULL);`) + `<p><code>int sigaction(int signum, struct sigaction *act, struct sigaction *oldact)</code>: the second argument is a <strong>pointer to a struct</strong> that holds the function pointer; the third gives back the old handler.</p>`,
      'The handler takes an int (the signal number) and returns void.',
      'Passing the handler function directly as the second argument. It takes a struct.',
      mc('What is the second argument to <code>sigaction()</code>?', ['A pointer to a struct sigaction', 'The function pointer itself', 'The signal number', 'The signal mask only'], 'The handler goes inside the struct (<code>.sa_handler</code>), and you pass the struct\'s address.')),
    step('Common signals and sending them',
      `<p><code>man 7 signal</code> lists them. Examples:</p><ul><li><strong>SIGINT</strong>: Ctrl-C</li><li><strong>SIGKILL</strong>: sent by the kill call</li><li><strong>SIGSEGV</strong>: invalid memory reference</li></ul><p>To send a signal: <code>raise()</code> sends one to <strong>yourself</strong>, and <code>kill(pid, sig)</code> sends one to <strong>a process</strong>.</p>`,
      'The same handler code works whether Ctrl-C, another process or you sent the signal.',
      'Thinking <code>kill</code> only kills. It sends any signal.',
      mc('Which call sends a signal to a particular process?', ['kill()', 'raise()', 'sigaction()', 'sigemptyset()'], 'kill(pid, sig) targets a process. raise() sends to the caller.')),
    step('Signal safety',
      `<p>A handler can interrupt your program at any point, so it must only call <strong>async-signal-safe</strong> functions (the list is in <code>man signal-safety</code>). <code>printf()</code> is <strong>not</strong> signal safe. Use <code>write()</code>.</p>` + codeBlock(`void handler(int signum) {
    write(STDOUT_FILENO, "CTRL-C pressed\\n", 15);
}`),
      'Calling an unsafe function from a handler can corrupt state or deadlock.',
      'Using <code>printf</code> in a handler because it "works" in testing.',
      mc('Why should a signal handler use <code>write()</code> instead of <code>printf()</code>?', ['write is async-signal-safe; printf is not', 'printf is unable to print any numbers', 'write is always faster than printf is', 'printf needs a signal mask set first'], 'Only the async-signal-safe functions are allowed inside a handler.')),
    step('A child signals its parent',
      `<p>A child can send a signal to its parent with <code>kill(getppid(), SIGINT)</code> (<code>getpid()</code> would be your own PID, not the parent's). The parent installs its handler and loops with <code>sleep()</code>. The child may <strong>sleep a moment first</strong> so the parent has time to install the handler before the signal arrives.</p>` + codeBlock(`if (fork() == 0) {          // child
    while (1) {
        sleep(1);
        kill(getppid(), SIGINT);
    }
}                              // parent: installs handler, loops`),
      'This is the golden ticket example in code.',
      'Sending the signal before the parent registered its handler. The default action may end the process.',
      mc('How does the child find the parent\'s PID to signal it?', ['getppid()', 'getpid()', 'fork()', 'wait()'], 'getppid returns the parent\'s PID, and kill sends the signal to it.')),
  ],
  practice: [
    mc('Which signal is sent by pressing Ctrl-C?', ['SIGINT', 'SIGKILL', 'SIGSEGV', 'SIGTERM'], 'SIGINT is the interrupt from Ctrl-C.'),
    mc('Which call lets a process send a signal to itself?', ['raise()', 'kill()', 'sigaction()', 'waitpid()'], 'raise() sends a signal to the calling process.'),
    mc('What is wrong with this handler? <code>void h(int s) { printf("Signal %d\\n", s); }</code>', ['printf is not async-signal-safe', 'The name is wrong', 'The return type is wrong', 'It has too many arguments'], 'Handlers must use async-signal-safe functions such as write().'),
  ],
  hands: [
    bug('Ctrl-C does nothing special. Tap the line that registers the handler incorrectly.', ['struct sigaction act;', 'act.sa_handler = handler;', 'sigemptyset(&act.sa_mask);', 'sigaction(handler, &act, NULL);'], 3, 'The first argument is the signal number (such as <code>SIGINT</code>), not the handler.'),
    blank('Fill in the blank to send SIGINT to the parent.', 'kill(____, SIGINT);', ['getppid()', 'getpid()', 'fork()', 'SIGINT'], 'getppid() is the parent\'s PID. getpid() would signal yourself.'),
    order('Put the handler setup in order.', ['void handler(int signum) { write(STDOUT_FILENO, "hi\\n", 3); }', 'struct sigaction act;', 'act.sa_handler = handler;', 'sigaction(SIGINT, &act, NULL);'], 'Write the handler, create the struct, fill in the handler, then register it.'),
  ],
  quiz: [
    mc('What does a signal handler receive as its argument?', ['The signal number', 'The PID of the sender', 'A pointer to the stack', 'Nothing'], 'The handler has the form <code>void h(int signum)</code>.'),
    mc('What does <code>sa_mask</code> in struct sigaction need to be initialised with here?', ['sigemptyset()', 'sigaction()', 'kill()', 'raise()'], 'The activity clears the mask with <code>sigemptyset(&amp;act.sa_mask)</code>.'),
    mc('Why do signals count as asynchronous communication?', ['They arrive at any time, unasked', 'They are always delivered using two threads', 'They always arrive after the program ends', 'They are only sent by the sleep function'], 'The receiving code does not wait for them: they interrupt it when they arrive.'),
    mc('A callback function that the kernel can call is passed to it using:', ['A function pointer', 'A global string', 'An exit status', 'A file descriptor'], 'A function pointer holds the address of the function so it can be called later.'),
    mc('SIGSEGV is generated by:', ['An invalid memory reference', 'Pressing Ctrl-C', 'The kill call', 'A finished child'], 'It signals that the process touched memory it should not.'),
  ],
});
