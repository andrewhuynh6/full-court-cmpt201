// CMPT201 LAB — Bonus topic: Security & Crypto. The slides for this topic were not available, so it is written from
// general crypto knowledge. Compare the wording with your own lecture slides.

// ═══════════════════════════════════════════════════════════════════
// Bonus topic: Security and crypto. Written from general crypto knowledge;
// check the wording against your own lecture slides.
// ═══════════════════════════════════════════════════════════════════
defLesson('tb', {
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
      viz: 'keys',
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

defLesson('tb', {
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
      viz: 'sign',
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

