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

let testTx = new Tx(1, 123456, 0);
testTx.time = 123;
testTx.expiration = 456;

testTx.signers.push("abc");
testTx.actions.push({
    contract: "cont",
    actionName: "abi",
    data: "[]",
});

const seckey = Base58.decode('1rANSfcRzr4HkhbUFZ7L1Zp69JZZHiDDq5v7dNSbbEqeU4jxy3fszV4HGiaLQEyqVpS1dKT9g7zCVRxBVzuiUzB');
const kp = new KeyPair(seckey, Algo.Ed25519);

testTx.addSign(kp);

console.log("tx bytes 0 >", btoa(testTx._bytes(0)) === 'YAAAAAAAAAB7YAAAAAAAAAHIYAAAAAAAAABkYAAAAAAAAeJAYAAAAAAAAAAAYF5hYmNgXmBjb250YGFiaWBbXQ==');

console.log("tx base hash >", btoa(testTx._base_hash()) === 'BbXS6SEuGsUPZ2ySQUX/swbQHust8oU6QsfNqwyf4Mg=');


const sig = testTx.signs[0];

console.log("sig bytes >", btoa(sig._bytes()) === 'YAJgXF47hkw5Et8AoxYQYaqmWlPV/0Ezg5v0/xAuME64R8TCeO4C3ViDaYXUvibTkQNKKJOSj2eGNCD2hklsFqgcrQ9gVzGt610agH7JxDglOJ5cXt/3BBLkZDqUYpplKvG/z1wvCA==');

console.log("sig pubkey >", btoa(sig.pubkey) === 'VzGt610agH7JxDglOJ5e3/cEEuRkOpRimmUq8b/PLwg=');
console.log("sig sig >", btoa(sig.sig) === 'XjuGTDkS3wCjFhBhqqZaU9X/QTODm/T/EC4wTrhHxMJ47gLdWINphdS+JtORA0ook5KPZ4Y0IPaGSWwWqBytDw==');

console.log("tx bytes 1 >", btoa(testTx._bytes(1)) === 'YAAAAAAAAAB7YAAAAAAAAAHIYAAAAAAAAABkYAAAAAAAAeJAYAAAAAAAAAAAYF5hYmNgXmBjb250YGFiaWBbXWBeYAJgXF47hkw5Et8AoxYQYaqmWlPV/0Ezg5v0/xAuME64R8TCeO4C3ViDaYXUvibTkQNKKJOSj2eGNCD2hklsFqgcrQ9gVzGt610agH7JxDglOJ5cXt/3BBLkZDqUYpplKvG/z1wvCA==');
console.log("tx publish hash >", btoa(testTx._publish_hash()) === 'W+fKZSh+C37Uf3L2t1GrtL02za62V2AL24AgnAwZ5ss=');

testTx.addPublishSign("def", kp);
console.log("p sig bytes >", btoa(testTx.publishSigns[0]._bytes()) === 'YAJg6Z9WMCiYSxbl/T9SV7ZZ39tM0KK3BzPC0tDh87MbzWY0nTI4db037ViCl90NYRVjRrIgNctXdCQo+cqKpRnFAGBXMa3rXRqAfsnEOCU4nlxe3/cEEuRkOpRimmUq8b/PXC8I');



console.log("\n", JSON.stringify(testTx));


// console.log(c.hash(stdAns));
//
// const hash = new SHA3(256);
// hash.update('abc');
// console.log( hash.digest('hex'));