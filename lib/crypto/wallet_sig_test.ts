//const Signature = require('iost').Signature;
import Signature from './signature';

const sigr = Signature.fromJSON(JSON.stringify({ algorithm: "ED25519", public_key: "vrpJD/m2Jsl4fr3jjyQUwUD0mhd1t/jiV8qvqJnAH74=", signature: "ARbN/gXhpujahwlGxmaENbonVXqWLZJGhdiEEVkdBaa8rDkJtqxy1w3UUuqKRuGi/Ol1Winyn+FVDPpzOQe8Cg==", message: "lianwantang" }));
let messageRaw = "lianwantang";
let lenBuf = Buffer.alloc(4);
lenBuf.writeInt32BE(messageRaw.length, 0);
let messageFull = Buffer.concat([lenBuf, Buffer.from(messageRaw)])
console.log("Signature recover result: ", sigr.verify(messageFull));

