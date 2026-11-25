// CMPT201 LAB — Topic 5: Networking (slides 10.1 Sockets, 10.2 AF_INET, 10.3 Multiple Clients)

// ═══ Slides 10.1: Networking stack and the socket interface ═══
defLesson('t5', {
  id: 'sockets', deck: '10.1 Networking: Sockets', title: 'The Network Stack & Sockets',
  analogy: `Sending a package. The application writes the letter, the transport layer decides how to track it, the IP layer writes the destination address, the link layer carries it down the local street, and the physical layer is the actual truck. A socket is your post office counter: you talk to it, and the layers below do the rest.`,
  goals: ['Name the five network layers and what each does', 'Compare TCP (SOCK_STREAM) and UDP (SOCK_DGRAM) and their call sequences', 'Tell the server and client calls apart, and passive from active sockets'],
  recap: ['Layers bottom-up: Physical, Link (MAC), IP, Transport, Application. Each provides a service to the layer above.', 'MAC addresses look like 05:35:5a:30:f9:05; IP addresses like 192.168.7.53; port numbers (80, 443) identify the application.', 'Five key calls: <code>socket</code>, <code>bind</code>, <code>listen</code>, <code>accept</code>, <code>connect</code>.', 'TCP (<code>SOCK_STREAM</code>) is connection-oriented and in-order; UDP (<code>SOCK_DGRAM</code>) is connectionless.', 'TCP server: socket, bind, listen, accept, read/write, close. TCP client: socket, connect, write/read, close.', 'UDP server: socket, bind, recvfrom, sendto. UDP client: socket, sendto, recvfrom.'],
  steps: [
    step('The networking stack',
      `<p>Software does something complicated like networking with <strong>layers</strong>. Each layer provides a service to the layer above it. From top to bottom: <strong>Application</strong>, <strong>Transport</strong>, <strong>IP</strong>, <strong>Link (MAC)</strong>, <strong>Physical</strong>.</p><p>Programs can communicate across a network (wifi, wired) or on the same computer.</p>`,
      'Knowing the layers tells you which problem each protocol solves.',
      'Mixing the order. Physical is at the bottom and Application at the top.',
      mc('Which layer is directly below the Application layer?', ['Transport', 'IP', 'Link', 'Physical'], 'The stack is Application, Transport, IP, Link (MAC), Physical from top to bottom.')),
    step('What each layer does',
      `<ul><li><strong>Physical</strong>: generates and receives signals (voltage and signalling).</li><li><strong>Link (MAC)</strong>: delivery inside a small <strong>local</strong> network (LAN), using <strong>MAC addresses</strong> such as <code>05:35:5a:30:f9:05</code>.</li><li><strong>IP</strong>: addressing and routing across networks (wired and wireless together), using <strong>IP addresses</strong> such as <code>192.168.7.53</code>.</li><li><strong>Transport</strong>: handles lost, out-of-order and duplicated packets. TCP gives an in-order reliable byte stream; UDP gives no protection. A <strong>port number</strong> (80, 443) identifies which application gets the data.</li><li><strong>Application</strong>: well-known protocols such as HTTP and FTP.</li></ul>`,
      'You must be able to tell an IP address, a MAC address and a port apart.',
      'Calling a port number an address of a computer. A port picks the application on a computer.',
      mc('Which of these is a MAC address?', ['19:02:16:08:07:01', '153.10.23.103', '8001', '0xF5325E850005235F'], 'A MAC address is written as six hex pairs. 153.10.23.103 is an IP address and 8001 is a port.')),
    step('socket() and the five syscalls',
      `<p>An application uses a <strong>socket</strong> to communicate with another process (local or remote). Five key syscalls: <code>socket()</code>, <code>bind()</code>, <code>listen()</code>, <code>accept()</code>, <code>connect()</code>. You can then use <code>send()</code>, <code>recv()</code>, <code>sendto()</code>, <code>recvfrom()</code>, or the ordinary <code>read()</code> and <code>write()</code>.</p>` + codeBlock(`int socket(int domain, int type, int protocol);`) + `<ul><li><code>domain</code>: <code>AF_UNIX</code> (local), <code>AF_INET</code> (IPv4), <code>AF_INET6</code> (IPv6).</li><li><code>type</code>: <code>SOCK_STREAM</code> (TCP, connection-oriented) or <code>SOCK_DGRAM</code> (UDP, connectionless).</li><li><code>protocol</code>: always 0 for us.</li></ul>`,
      'The socket call fixes both the address family and the style of communication.',
      'Passing a protocol number. For this course it is always 0.',
      mc('Which type argument selects TCP?', ['SOCK_STREAM', 'SOCK_DGRAM', 'AF_INET', 'AF_UNIX'], 'SOCK_STREAM is TCP and SOCK_DGRAM is UDP. AF_* values are domains.')),
    step('The TCP call sequence',
      `<p>A <strong>passive socket</strong> (server) waits for connections; an <strong>active socket</strong> (client) starts one.</p><p><strong>Server</strong>: <code>socket()</code>, <code>bind()</code>, <code>listen()</code>, <code>accept()</code>, then <code>read()</code>/<code>write()</code>, then <code>close()</code>.<br><strong>Client</strong>: <code>socket()</code>, <code>connect()</code>, <code>write()</code>/<code>read()</code>, <code>close()</code>.</p><ul><li><code>bind()</code> assigns an address, using a generic <code>struct sockaddr</code> (each protocol has its own struct).</li><li><code>listen()</code> makes the socket passive. By default a socket is active.</li><li><code>accept()</code> returns a <strong>new socket</strong> for the new connection. The original is only used to accept more.</li><li><code>connect()</code> establishes the connection ("connection-oriented").</li></ul>`,
      'This sequence is asked on every exam.',
      'Calling read() on the listening socket. Read from the socket accept returned.',
      mc('Which is the most likely call sequence for a TCP server?', ['socket, bind, listen, accept, read, write, close', 'socket, bind, listen, read, accept, write, close', 'socket, bind, write, listen, accept, read, close', 'socket, connect, accept, listen, read, write, close'], 'A server creates the socket, binds an address, listens, accepts a connection and then communicates.'), 'tcpflow'),
    step('The UDP call sequence',
      `<p>UDP is <strong>connectionless</strong>, like an SMS message received one-off: each time you receive a message you are told who sent it. UDP has <strong>no active or passive sockets</strong>, so there is no <code>listen</code>, <code>accept</code> or <code>connect</code>.</p><ul><li><strong>Server</strong>: <code>socket()</code>, <code>bind()</code>, <code>recvfrom()</code>, <code>sendto()</code>, <code>close()</code>.</li><li><strong>Client</strong>: <code>socket()</code>, <code>sendto()</code>, <code>recvfrom()</code>, <code>close()</code>.</li></ul><p><code>sendto()</code> must name the receiver's address every time, and <code>recvfrom()</code> tells you who sent the message.</p>`,
      'UDP is simpler, with no connection setup, but it gives no delivery guarantee.',
      'Calling listen or accept on a UDP socket. They only apply to TCP.',
      mc('Which calls does a UDP client use?', ['socket, sendto, recvfrom, close', 'socket, listen, accept, close', 'socket, connect, accept, close', 'socket, bind, listen, close'], 'A UDP client creates a socket and then sends and receives datagrams.')),
    step('Local sockets with AF_UNIX',
      `<p>Sockets can also be local. <code>AF_UNIX</code> addresses use <code>struct sockaddr_un</code> with a path name:</p>` + codeBlock(`struct sockaddr_un {
    sa_family_t sun_family;   /* AF_UNIX */
    char sun_path[108];       /* pathname */
};`) + `<p>Fill it with <code>memset</code> to 0, set the family, and <code>strncpy</code> the path. <code>bind()</code> fails if that path already exists, so delete it with <code>remove()</code> first. Then use the same call sequence as for TCP or UDP.</p>`,
      'It is the easiest way to practice the call sequence on one machine.',
      'Forgetting to remove the old socket file, so bind fails.',
      mc('Why might <code>bind()</code> fail on an AF_UNIX socket?', ['The path name already exists as a file', 'The port number is already in use', 'The domain was set to AF_INET instead', 'listen() was not called before bind()'], 'The socket file stays after the program ends, so remove it before binding again.')),
  ],
  practice: [
    mc('What does <code>accept()</code> return?', ['A new socket for that connection', 'The listening socket again', 'The client\'s IP address', 'A port number'], 'accept returns a new socket for the new connection. The original keeps accepting.'),
    mc('Which layer uses port numbers to find the right application?', ['Transport', 'Link', 'Physical', 'IP'], 'The transport layer (TCP/UDP) uses port numbers.'),
    mc('UDP is described as:', ['Connectionless', 'Connection-oriented', 'In-order and reliable', 'Always encrypted'], 'UDP has no connection and gives no ordering or delivery guarantee.'),
  ],
  hands: [
    bug('This TCP server never serves a client. Tap the line that is wrong.', ['int sfd = socket(AF_INET, SOCK_STREAM, 0);', 'bind(sfd, (struct sockaddr *)&addr, sizeof addr);', 'listen(sfd, 5);', 'read(sfd, buf, sizeof buf);'], 3, 'The listening socket only accepts. Call <code>accept()</code> and read from the socket it returns.'),
    blank('Fill in the blank to create a UDP socket.', 'int s = socket(AF_INET, ____, 0);', ['SOCK_DGRAM', 'SOCK_STREAM', 'SOCK_UDP', 'AF_DGRAM'], 'SOCK_DGRAM selects datagram (UDP) behaviour.'),
    order('Put the TCP client calls in order.', ['socket()', 'connect()', 'write()', 'close()'], 'A client creates a socket, connects, sends and receives, then closes.'),
  ],
  quiz: [
    mc('Which calls would you most likely see in a TCP server? (not in order)', ['accept, bind, listen, read, socket, write, close', 'connect, read, socket, write, close, send', 'bind, recvfrom, sendto, socket, close, send', 'sendto, recvfrom, socket, close, wait'], 'A TCP server binds, listens and accepts. The client side uses connect.'),
    mc('Which calls would you most likely see in a UDP server? (not in order)', ['bind, recvfrom, sendto, socket, close', 'accept, bind, listen, read, socket, write', 'connect, read, socket, write, close', 'listen, accept, socket, close'], 'A UDP server binds and then receives and sends datagrams, with no listen or accept.'),
    mc('What problem can occur in the transport layer that TCP protects against?', ['Packets lost, reordered or duplicated', 'Voltage changes on the physical wire', 'Wrong MAC addresses on the local network', 'Broken routing tables inside the IP layer'], 'TCP gives an in-order reliable byte stream despite lost, out-of-order or duplicate packets.'),
    mc('What does <code>listen()</code> do to a socket?', ['Marks it passive so it can accept', 'Sends a connection request to a server', 'Closes the socket after the last client', 'Reads the next data from a client'], 'By default a socket is active; listen makes it passive so it can accept connections.'),
    mc('The IP layer is mainly responsible for:', ['Addressing and routing across networks', 'Voltage and signalling on the wire', 'Port numbers for each application', 'Sending HTTP requests and replies'], 'IP provides a common addressing and routing scheme across different kinds of local networks.'),
  ],
});

// ═══ Slides 10.2: AF_INET and byte order ═══
defLesson('t5', {
  id: 'afinet', deck: '10.2 Networking: AF_INET', title: 'AF_INET, Byte Order & Hosts',
  analogy: `Addresses are like street addresses written in different languages. If one computer writes the number "12345" with the big end first and another with the small end first, they will read each other's numbers wrong. Network byte order is the agreed language.`,
  goals: ['Fill in a struct sockaddr_in for a server and a client', 'Convert addresses with inet_pton and inet_ntop', 'Explain big vs little endian and use htons, htonl, ntohs, ntohl'],
  recap: ['<code>AF_INET</code> uses 4-byte IPv4 addresses and <code>struct sockaddr_in</code> (family, port, address).', '<code>inet_pton</code> converts "192.168.0.1" to binary; <code>inet_ntop</code> converts back.', '<code>INADDR_LOOPBACK</code> is 127.0.0.1 (stays on this machine); <code>INADDR_ANY</code> accepts on any network card.', 'Network byte order is big-endian (most significant byte first).', '<code>htons</code>/<code>htonl</code>: host to network; <code>ntohs</code>/<code>ntohl</code>: network to host. Only for multi-byte values.', '<code>recv()</code> and <code>send()</code> are socket-specific read and write with flags.'],
  steps: [
    step('IPv4 addresses and sockaddr_in',
      `<p><code>AF_INET</code> uses <strong>4 bytes</strong> for IPv4 addresses (like <code>192.168.7.2</code>). <code>AF_INET6</code> uses <strong>16 bytes</strong>. We focus on AF_INET.</p>` + codeBlock(`struct sockaddr_in {
    sa_family_t    sin_family;   // AF_INET
    in_port_t      sin_port;     // port number
    struct in_addr sin_addr;     // IPv4 address
    unsigned char  __pad[X];
};
struct in_addr { in_addr_t s_addr; };`),
      'This is the struct you fill in for bind() and connect().',
      'Using sockaddr_un or sockaddr for AF_INET without casting. Use sockaddr_in and cast when calling.',
      mc('How many bytes does an AF_INET (IPv4) address use?', ['4', '16', '2', '6'], 'IPv4 addresses are 4 bytes. IPv6 (AF_INET6) addresses are 16 bytes.')),
    step('Addresses: inet_pton and inet_ntop',
      `<p>Humans write <code>"192.168.7.1"</code>, but the struct needs a <strong>binary</strong> address. <code>inet_pton()</code> converts the presentation string to binary, and <code>inet_ntop()</code> converts binary back to a string. Both handle IPv4 and IPv6. The maximum string length is <code>INET_ADDRSTRLEN</code> (IPv4) or <code>INET6_ADDRSTRLEN</code> (IPv6), defined in <code>&lt;netinet/in.h&gt;</code>.</p>` + codeBlock(`inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);`),
      'You will use inet_pton in every client.',
      'Storing the dotted string directly in s_addr.',
      mc('Which function converts the string "192.168.0.1" to binary?', ['inet_pton()', 'inet_ntop()', 'htons()', 'getaddrinfo()'], 'pton means presentation to network. ntop goes the other way.')),
    step('Special addresses: loopback and wildcard',
      `<p>The <strong>loopback</strong> address <code>127.0.0.1</code> (<code>INADDR_LOOPBACK</code>) is for local communication, similar to UNIX domain sockets: nothing goes out onto the network.</p><p>The <strong>wildcard</strong> address <code>INADDR_ANY</code> means "any". A machine can have several network cards (for example wireless and Ethernet), each with its own IP address. A server that binds to <code>INADDR_ANY</code> accepts connections arriving on any of them.</p>`,
      'A server normally binds to INADDR_ANY.',
      'Binding a server to 127.0.0.1 and wondering why other machines cannot connect.',
      mc('A server binds to <code>INADDR_ANY</code>. What does that mean?', ['It accepts connections on any of its IPs', 'It accepts only connections from this host', 'It binds to port zero by default', 'It switches the socket over to UDP'], 'The wildcard address matches every network interface on the machine.')),
    step('Ports',
      `<p><code>bind()</code> needs an IP address <strong>and a port</strong>. Some ports are well known: <strong>SSH 22</strong>, <strong>HTTP 80</strong>. Clients know to look at those ports. If you do not <code>bind()</code> to a specific port, TCP or UDP picks an unused "random" port.</p>`,
      'A server must bind a known port so clients can find it.',
      'Letting a server pick a random port. Clients would not know where to connect.',
      mc('Which port is the well-known port for HTTP?', ['80', '22', '8000', '443'], 'HTTP is on port 80 and SSH on port 22.')),
    step('Byte order and network byte order',
      `<p>Different architectures store multi-byte numbers in different orders. For <code>12345 = 0x3039</code>:</p><ul><li><strong>Little endian</strong>: stores the small part first (<code>39 30</code>).</li><li><strong>Big endian</strong>: stores the big part (most significant byte) first at the lower address (<code>30 39</code>: <code>0x30</code> then <code>0x39</code>).</li></ul><p><strong>Network byte order</strong> is <strong>big-endian</strong>. Multi-byte values such as the port number and IP address are sent most significant byte first. Single-byte data (chars) is sent one at a time.</p>`,
      'This is how different machines agree on a data format.',
      'Applying byte-order conversion to single chars. Only multi-byte values need it.',
      mc('Which byte order does the network use?', ['Big-endian', 'Little-endian', 'Whatever the sender uses', 'Random'], 'Network byte order is big-endian: the most significant byte first.')),
    step('htons, htonl, ntohs and ntohl',
      `<p>From <code>&lt;arpa/inet.h&gt;</code>:</p>` + codeBlock(`uint32_t htonl(uint32_t hostlong);   // host to network, 32-bit
uint16_t htons(uint16_t hostshort);  // host to network, 16-bit
uint32_t ntohl(uint32_t netlong);    // network to host, 32-bit
uint16_t ntohs(uint16_t netshort);   // network to host, 16-bit`) + `<p>Use <code>htons()</code> for the port and <code>htonl()</code> for a 32-bit address, going in; use <code>ntohs()</code> and <code>ntohl()</code> to read them back.</p>`,
      'These four functions are asked about all the time.',
      'Forgetting htons on the port: port 8000 would be read as a different number.',
      mc('Which call puts the port 8000 into the struct correctly?', ['addr.sin_port = htons(8000);', 'addr.sin_port = 8000;', 'addr.sin_port = ntohs(8000);', 'addr.sin_port = htonl(8000);'], 'The port is a 16-bit value going to the network, so use htons.')),
    step('Setting up an AF_INET TCP address',
      `<p>A server fills the struct with <code>INADDR_ANY</code> and a port; a client converts the server's IP string:</p>` + codeBlock(`memset(&addr, 0, sizeof(struct sockaddr_in));
addr.sin_family = AF_INET;
addr.sin_port = htons(8000);
addr.sin_addr.s_addr = htonl(INADDR_ANY);              // server

inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);       // client`) + `<p>An AF_INET socket has no file in the current folder, so there is nothing to delete before <code>bind()</code>.</p>`,
      'This is the setup block you copy into every network program.',
      'Skipping the memset, so the padding holds garbage.',
      mc('What is the purpose of <code>memset(&amp;addr, 0, sizeof addr)</code>?', ['Clear the struct, including its padding', 'Set the port to the default value', 'Bind the socket to an address', 'Create the socket in the kernel'], 'Zeroing the struct makes sure unused fields and padding are not garbage.')),
    step('Host names, recv() and send()',
      `<p>You can use a <strong>host name</strong> (the computer name) instead of an IP address. <code>getaddrinfo()</code> converts a host name string to the set of all possible options (structs containing an IP and a port number). <code>getnameinfo()</code> does the reverse: IP to host name.</p><p><code>recv()</code> and <code>send()</code> are like <code>read()</code> and <code>write()</code> but socket-specific, with extra control flags such as <code>MSG_DONTWAIT</code> (non-blocking) and <code>MSG_PEEK</code> (read but do not remove the data).</p>`,
      'Real programs rarely hard-code an IP address.',
      'Using MSG_PEEK and expecting the data to be removed.',
      mc('What does the <code>MSG_PEEK</code> flag do for <code>recv()</code>?', ['Reads the data without removing it', 'Makes the call non-blocking', 'Sends urgent data', 'Closes the socket'], 'MSG_PEEK looks at the data but leaves it in the socket buffer.')),
  ],
  practice: [
    mc('What does <code>htons()</code> convert?', ['A 16-bit value, host to network order', 'A 32-bit value, network to host order', 'A string, converted into an IP address', 'A host name, converted into an IP'], 'htons means host to network short (16 bits).'),
    mc('Which special address keeps traffic on the local machine?', ['127.0.0.1 (loopback)', 'INADDR_ANY', '0.0.0.0 on the network', '255.255.255.255'], 'The loopback address sends nothing out onto the network.'),
    mc('Which function converts a binary address back to a string?', ['inet_ntop()', 'inet_pton()', 'ntohl()', 'getaddrinfo()'], 'inet_ntop goes from the network (binary) form to presentation text.'),
  ],
  hands: [
    bug('Clients cannot reach the server on port 8000. Tap the faulty line.', ['addr.sin_family = AF_INET;', 'addr.sin_port = 8000;', 'addr.sin_addr.s_addr = htonl(INADDR_ANY);', 'bind(sfd, (struct sockaddr *)&addr, sizeof addr);'], 1, 'The port must be in network byte order: <code>htons(8000)</code>.'),
    blank('Fill in the blank to convert a 16-bit network value to host order.', 'int port = ____(addr.sin_port);', ['ntohs', 'htons', 'ntohl', 'htonl'], 'ntohs converts a 16-bit value from network to host byte order.'),
    order('Put the lines in order to set up a server address.', ['memset(&addr, 0, sizeof addr);', 'addr.sin_family = AF_INET;', 'addr.sin_port = htons(8000);', 'addr.sin_addr.s_addr = htonl(INADDR_ANY);'], 'Clear the struct, then fill the family, port and address.'),
  ],
  quiz: [
    mc('The number 12345 is 0x3039. Which bytes does a big-endian machine store, lowest address first?', ['30 39', '39 30', '12 34', '03 09'], 'Big-endian stores the most significant byte first: 0x30 then 0x39.'),
    mc('Why must the port be converted with <code>htons()</code>?', ['The network uses big-endian; the host may not', 'Ports are stored as text strings', 'bind rejects any plain numbers', 'Ports are 32-bit values on the wire'], 'Hosts may be little-endian, but the network expects big-endian multi-byte values.'),
    mc('A host has a wireless and an Ethernet card. A server binds to <code>INADDR_ANY</code>. It listens on:', ['Both addresses', 'Only the first network card', 'Only the loopback interface', 'Neither of the two addresses'], 'The wildcard matches every interface.'),
    mc('Which of these needs no byte-order conversion?', ['A single char sent on its own', 'A port number', 'An IPv4 address', 'A 32-bit integer'], 'Single-byte data has no byte order. Multi-byte values need conversion.'),
    mc('What does <code>getaddrinfo()</code> do?', ['Converts a host name to address structs', 'Converts an IP address to a host name', 'Sends a datagram to a peer', 'Binds a socket to a given port'], 'getaddrinfo turns a host name into possible IP and port options. getnameinfo does the reverse.'),
  ],
});

// ═══ Slides 10.3: Handling multiple clients ═══
defLesson('t5', {
  id: 'multiclient', deck: '10.3 Networking: Multiple Clients', title: 'Serving Many Clients: Threads, Polling & epoll',
  analogy: `A restaurant with one waiter who must serve many tables. He can clone himself per table (threads), run around checking every table constantly (polling), or have the tables ring a bell so he only goes to the ones that need him (epoll).`,
  goals: ['Explain why a TCP server needs to handle many sockets', 'Compare thread-per-client, non-blocking polling and kernel notification', 'Describe the three epoll calls'],
  recap: ['<code>accept()</code> returns a new socket for each TCP client, so a server must handle many sockets.', 'Idea 1, a thread per connection: clean, but many threads use lots of memory and kernel overhead.', 'Idea 2, non-blocking sockets in a loop: no extra threads, but it wastes CPU busy-waiting.', 'Idea 3, <code>select</code>/<code>poll</code>/<code>epoll</code>: the kernel notifies the program of ready sockets; no threads, no polling, but more complex code.', 'epoll: <code>epoll_create</code>, <code>epoll_ctl</code> (add or remove descriptors), <code>epoll_wait</code>.'],
  steps: [
    step('The problem: many clients',
      `<p>On a TCP server we open a socket and call <code>accept()</code>, which returns a <strong>new socket</strong> for each connection. The simple loop of <code>accept()</code> then <code>read()</code> handles <strong>one socket at a time</strong>: while the server waits on client A, client B must wait.</p><p>How can the server work with <strong>multiple client sockets</strong>?</p>`,
      'Every real server (web, chat, game) faces this problem.',
      'Writing an accept-then-read loop and expecting it to serve two clients at once.',
      mc('What is wrong with a server that does accept, then read in a loop?', ['It handles one client socket at a time', 'It cannot accept connections at all', 'It leaks a socket on every client', 'It only works when using UDP'], 'While it blocks reading one client, every other client has to wait.')),
    step('Idea 1: one thread per connection',
      `<p>Create a new <strong>thread for each new connection</strong>. That thread handles the new client's socket.</p><ul><li><strong>Pro</strong>: handles multiple clients cleanly.</li><li><strong>Con</strong>: many threads can use too much system resources (such as <strong>RAM</strong>) and add too much kernel overhead.</li></ul>`,
      'Easy to write, but it does not scale to very many clients.',
      'Using a thread per client for thousands of idle connections.',
      mc('What is the main weakness of a thread per client?', ['Too many threads use too many resources', 'It handles only a single client at once', 'It wastes CPU time by polling', 'It needs epoll to work at all'], 'Each thread costs memory and kernel overhead, which does not scale.'), 'clients'),
    step('Idea 2: non-blocking sockets',
      `<p>A <strong>non-blocking</strong> <code>accept()</code> either accepts a new connection immediately, or returns immediately if no connection is waiting. Use non-blocking <code>read()</code> and <code>write()</code> too.</p><p>The server loops forever: non-blocking <code>accept</code> to add any new socket to an array, then a non-blocking read (or write) on each socket in the array as needed.</p><ul><li><strong>Pro</strong>: avoids creating processes or threads.</li><li><strong>Con</strong>: <strong>wastes CPU time</strong> (busy-waiting, always checking).</li></ul>`,
      'It fixes the thread cost but burns CPU doing nothing useful.',
      'Looping over sockets with no sleep. The CPU runs at 100 percent.',
      mc('What is the main drawback of looping over non-blocking sockets?', ['It wastes CPU time busy-waiting', 'It needs one thread per client', 'It handles one client at a time', 'It cannot read'], 'The loop keeps checking sockets even when nothing is ready.')),
    step('Idea 3: the kernel notifies you',
      `<p>Use non-blocking sockets and let the <strong>kernel notify</strong> the program on socket events. Use syscalls to monitor many file descriptors: <code>select()</code>, <code>poll()</code> and <code>epoll()</code>. This is <strong>I/O multiplexing</strong>:</p><ol><li>Add file descriptors to the monitored list.</li><li>Say which events you want (read, write).</li><li>Call the blocking function (<code>select()</code> or <code>epoll_wait()</code>) to wait.</li><li>When it returns, check which descriptors can do I/O, and do it.</li></ol><p><strong>Pro</strong>: no thread overhead, no polling. <strong>Con</strong>: more complex code.</p>`,
      'This is how high-performance servers handle huge numbers of connections.',
      'Calling read on every descriptor after epoll_wait returns. Only the ready ones.',
      mc('What is the main drawback of I/O multiplexing?', ['More complex code', 'Wasted CPU time', 'One thread per client', 'It handles one socket at a time'], 'It avoids threads and polling, but the code is harder to write.'), 'epoll'),
    step('epoll in three calls',
      `<ul><li><code>epoll_create()</code> returns an <strong>epoll instance</strong>: think of it as a set of monitored descriptors.</li><li><code>epoll_ctl()</code> lets you add, modify or remove descriptors. Start by monitoring the listening socket for <code>accept()</code>; each new descriptor from <code>accept()</code> is added to the set.</li><li><code>epoll_wait()</code> waits for a descriptor to be available for I/O.</li></ul>` + codeBlock(`int ep = epoll_create1(0);
struct epoll_event ev = { .events = EPOLLIN, .data.fd = lfd };
epoll_ctl(ep, EPOLL_CTL_ADD, lfd, &ev);        // watch the listening socket
for (;;) {
    int n = epoll_wait(ep, evs, 64, -1);        // block until something is ready
    for (int i = 0; i < n; i++) {
        if (evs[i].data.fd == lfd) { /* accept, then epoll_ctl(ep, EPOLL_CTL_ADD, client_fd, &ev) */ }
        else { /* read from evs[i].data.fd */ }
    }
}`),
      'This three-call pattern is the whole epoll recipe.',
      'Calling read() on the listening socket instead of accept().',
      mc('In the epoll loop, the ready descriptor is the listening socket. What should the code do?', ['accept() and add the new socket with epoll_ctl', 'read() from the listening socket', 'close() the listening socket', 'call epoll_create again'], 'A ready listening socket means a connection is waiting, so accept it and add the new socket to the set.')),
    step('Matching each idea to its problem',
      `<table class="mini"><tr><th>Design</th><th>Problem</th></tr><tr><td>Accept then read, in a simple loop</td><td>Handles only one socket at a time</td></tr><tr><td>Non-blocking I/O in a loop</td><td>Wastes CPU time</td></tr><tr><td>epoll to watch sockets</td><td>More complex code</td></tr><tr><td>Thread per client</td><td>Too much RAM and kernel overhead</td></tr></table>`,
      'Exam questions ask you to match each design to its weakness.',
      'Mixing up which approach wastes CPU and which uses too much memory.',
      mc('Which design is likely to use too much RAM or kernel overhead?', ['A thread per client', 'epoll to watch sockets', 'Non-blocking I/O in a loop', 'A single accept loop'], 'Many threads each use a stack and cost the kernel scheduling work.')),
  ],
  practice: [
    mc('Which design wastes CPU time because it keeps checking sockets?', ['Non-blocking I/O in a loop', 'epoll', 'Thread per client', 'A blocking accept'], 'Polling every socket repeatedly burns CPU while nothing is ready.'),
    mc('Which call waits until a monitored descriptor is ready?', ['epoll_wait()', 'epoll_create()', 'epoll_ctl()', 'accept()'], 'epoll_wait blocks until some descriptor can do I/O.'),
    mc('Which syscalls can monitor many file descriptors for the kernel to notify you?', ['select, poll and epoll', 'fork and exec', 'bind and listen', 'sleep and wait'], 'These three provide I/O multiplexing.'),
  ],
  hands: [
    bug('The epoll server never serves clients. Tap the faulty line inside the loop.', ['int n = epoll_wait(ep, evs, 64, -1);', 'for (int i = 0; i < n; i++) {', '    if (evs[i].data.fd == lfd)', '        read(lfd, buf, sizeof buf);'], 3, 'A ready listening socket means a connection is waiting. Call <code>accept()</code>, not <code>read()</code>.'),
    blank('Fill in the blank to add a new client socket to the epoll set.', 'epoll_ctl(ep, ____, client_fd, &ev);', ['EPOLL_CTL_ADD', 'EPOLL_CTL_DEL', 'EPOLLIN', 'EPOLL_WAIT'], 'EPOLL_CTL_ADD registers a descriptor to be monitored.'),
    order('Put the epoll setup in order.', ['int ep = epoll_create1(0);', 'struct epoll_event ev = { .events = EPOLLIN, .data.fd = lfd };', 'epoll_ctl(ep, EPOLL_CTL_ADD, lfd, &ev);', 'int n = epoll_wait(ep, evs, 64, -1);'], 'Create the instance, describe the event, register the descriptor, then wait.'),
  ],
  quiz: [
    mc('Why does <code>accept()</code> make serving many clients a design problem?', ['It returns a new socket for every client', 'It always blocks forever on the socket', 'It closes the listening socket itself', 'It can be called only a single time'], 'Each client gets its own socket, so the server must handle many sockets at once.'),
    mc('Which of these is a benefit of I/O multiplexing with epoll?', ['No thread overhead and no polling', 'Simpler code than using threads', 'It needs one thread for each client', 'It works only with UDP datagrams'], 'epoll avoids both per-client threads and busy-waiting.'),
    mc('In Idea 2, what does a non-blocking <code>accept()</code> do when no client is waiting?', ['Returns immediately', 'Blocks until one arrives', 'Creates a thread', 'Closes the socket'], 'Non-blocking calls return right away if they cannot proceed.'),
    mc('What does <code>epoll_ctl()</code> do?', ['Adds, changes or removes descriptors', 'Waits for an event on a descriptor', 'Creates the listening socket itself', 'Reads bytes from a ready socket'], 'ctl controls the set of descriptors that the epoll instance monitors.'),
    mc('Which pair matches a design with its weakness correctly?', ['Thread per client: too many resources', 'epoll: wastes CPU time', 'Non-blocking loop: complex code', 'Simple accept loop: uses too much RAM'], 'Threads cost RAM and kernel overhead. Polling wastes CPU, and epoll is more complex.'),
  ],
});
