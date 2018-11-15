let {Tx} = require('./structs');
let Codec = require('./crypto/codec');
const { SHA3} = require('sha3');
const Base58 = require('bs58');
const btoa = require('btoa');

let c = new Codec();
let p = c.pushInt64(49583);
console.log(c._buf.readInt32BE(4));

c.pushString("hello world!");
console.log(c._buf.toString());

let bb = Buffer.from("nooo");
p = c.pushBytes(bb);
console.log(c._buf.toString());

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

testTx.addSign(2, seckey);

let stdAns = Buffer.from([96,0,0,0,0,0,0,0,123,96,0,0,0,0,0,0,1,200,96,0,0,0,0,0,0,0,100,96,0,0,0,0,0,1,226,
    64,96,0,0,0,0,0,0,0,0,96,94,97,98,99,96,94,96,99,111,110,116,96,97,98,105,96,91,93]);
if (!testTx._bytes(0).equals(stdAns)) {
    console.log("===============bytes error!")
} else {
    console.log("===============bytes success")
}

console.log("tx bytes 0 >", btoa(testTx._bytes(0)));

console.log("tx base hash >", btoa(testTx._base_hash()));


const sig = testTx.signs[0];

console.log("sig bytes >", btoa(sig._bytes()));

console.log("sig pubkey >", btoa(sig.pubkey));
console.log("sig sig >", btoa(sig.sig));

console.log("tx bytes 1 >", btoa(testTx._bytes(1)));
console.log("tx publish hash >", btoa(testTx._publish_hash()));

testTx.addPublishSign("def", 2, seckey);

console.log("p sig bytes >", btoa(testTx.publishSigns[0]._bytes()));

console.log(JSON.stringify(testTx));


// console.log(c.hash(stdAns));
//
// const hash = new SHA3(256);
// hash.update('abc');
// console.log( hash.digest('hex'));