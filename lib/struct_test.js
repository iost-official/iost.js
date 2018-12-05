const {Tx} = require('./structs');
const Codec = require('./crypto/codec');
const Base58 = require('bs58');
const btoa = require('btoa');
const KeyPair = require('./crypto/key_pair');
const Algo = require('./crypto/algorithm');

console.log("====== test of codec");
let c = new Codec();
c.pushInt64(49583);
console.log(c._buf.readInt32BE(4));

c.pushString("hello world!");
console.log(c._buf.toString());

let bb = Buffer.from("nooo");
p = c.pushBytes(bb);
console.log(c._buf.toString());

console.log("====== test of tx");

let testTx = new Tx(1, 1234, 0);
testTx.time = 123;
testTx.expiration = 456;
testTx.addLimit("iost", 123);

testTx.signers.push("abc");
testTx.actions.push({
    contract: "cont",
    actionName: "abi",
    data: "[]",
});

const seckey = Base58.decode('1rANSfcRzr4HkhbUFZ7L1Zp69JZZHiDDq5v7dNSbbEqeU4jxy3fszV4HGiaLQEyqVpS1dKT9g7zCVRxBVzuiUzB');
const kp = new KeyPair(seckey, Algo.Ed25519);

testTx.addSign(kp);

// console.log("tx bytes 0 >", btoa(testTx._bytes(0)));
console.log("tx bytes 0 >", btoa(testTx._bytes(0)) === 'YAAAAAAAAAB7YAAAAAAAAAHIYAAAAAAAAABkYAAAAAAAAeIIYAAAAAAAAAAAYF5hYmNgXmBjb250YGFiaWBbXWBeYGlvc3RgMTIz');


// console.log("tx base hash >", btoa(testTx._base_hash()));
console.log("tx base hash >", btoa(testTx._base_hash()) === '2jcxBy1D+IggoM62M3LQFewqoZAsYsjs/RHXCbOIHLg=');


const sig = testTx.signs[0];

console.log("sig bytes >", btoa(sig._bytes()) === 'YAJgXGA7P/ccp8jz1Oeedx/HFPnlDxhi3RlT2CIO3crmG71B/RI5fJJPCntLGP61r3SYBTv6aewVdRwH8tyUKBS5NAdgVzGt610agH7JxDglOJ5cXt/3BBLkZDqUYpplKvG/z1wvCA==');

console.log("sig pubkey >", btoa(sig.pubkey) === 'VzGt610agH7JxDglOJ5e3/cEEuRkOpRimmUq8b/PLwg=');
console.log("sig sig >", btoa(sig.sig) === 'YDs/9xynyPPU5553H8cU+eUPGGLdGVPYIg7dyuYbvUH9Ejl8kk8Ke0sY/rWvdJgFO/pp7BV1HAfy3JQoFLk0Bw==');

console.log("tx bytes 1 >", btoa(testTx._bytes(1)) === 'YAAAAAAAAAB7YAAAAAAAAAHIYAAAAAAAAABkYAAAAAAAAeIIYAAAAAAAAAAAYF5hYmNgXmBjb250YGFiaWBbXWBeYGlvc3RgMTIzYF5gAmBcYDs/9xynyPPU5553H8cU+eUPGGLdGVPYIg7dyuYbvUH9Ejl8kk8Ke0sY/rWvdJgFO/pp7BV1HAfy3JQoFLk0B2BXMa3rXRqAfsnEOCU4nlxe3/cEEuRkOpRimmUq8b/PXC8I');
console.log("tx publish hash >", btoa(testTx._publish_hash()) === '3U/FqzYFG9Hs7kqKpVCUNA81SWBFMvzhTIs4tm8NzDA=');

testTx.addPublishSign("def", kp);
console.log("p sig bytes >", btoa(testTx.publisher_sigs[0]._bytes()) === 'YAJgxaURaMRFngDBTod1Iq17Hm2IN7Vlhz45an2mshF4Mq+VlzLj+9mIaVQ1kavCM8axUId4sIScwNPxqlxeErnDNQVgVzGt610agH7JxDglOJ5cXt/3BBLkZDqUYpplKvG/z1wvCA==');

console.log("\n", JSON.stringify(testTx));


// console.log(c.hash(stdAns));
//
// const hash = new SHA3(256);
// hash.update('abc');
// console.log( hash.digest('hex'));