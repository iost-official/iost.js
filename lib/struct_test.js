const {Tx} = require('./structs');
const Codec = require('./crypto/codec');
const Base58 = require('bs58');
const btoa = require('btoa');
const KeyPair = require('./crypto/key_pair');
const Algo = require('./crypto/algorithm');

console.log("====== test of codec");
// let c = new Codec();
// c.pushInt64(49583);
// console.log(c._buf.readInt32BE(4));
//
// c.pushString("hello world!");
// console.log(c._buf.toString());
//
// let bb = Buffer.from("nooo");
// p = c.pushBytes(bb);
// console.log(c._buf.toString());

console.log("====== test of tx");

const standard = JSON.parse("{\n" +
    "\"tx_bytes_0\" : \"156d700a27e12ac0156d701f1c4c2ec00000000000000064000000000001e2080000000000000000000000000000000100000003616263000000010000001500000004636f6e7400000003616269000000025b5d000000010000000f00000004696f737400000003313233\",\n" +
    "\"tx_base_hash\" : \"5b75a2e0a5e7c8c462604d90df60893e9714702bd5c0dd1448dd017ed4aa0bc4\",\n" +
    "\"sig_bytes\" : \"0200000040b41b996ea0a47c0a14dd5d6e473828dea4966bc1d8823205b7af6b6ca19626f46c1e86957a6fa2510bb1bf42125368c4add823bcba9c56eb888b5cd23f544203000000205731adeb5d1a807ec9c43825389e5edff70412e4643a94629a652af1bfcf2f08\",\n" +
    "\"sig_pubkey\" : \"5731adeb5d1a807ec9c43825389e5edff70412e4643a94629a652af1bfcf2f08\",\n" +
    "\"sig_sig\" : \"b41b996ea0a47c0a14dd5d6e473828dea4966bc1d8823205b7af6b6ca19626f46c1e86957a6fa2510bb1bf42125368c4add823bcba9c56eb888b5cd23f544203\",\n" +
    "\"tx_bytes_1\" : \"156d700a27e12ac0156d701f1c4c2ec00000000000000064000000000001e2080000000000000000000000000000000100000003616263000000010000001500000004636f6e7400000003616269000000025b5d000000010000000f00000004696f73740000000331323300000001000000690200000040b41b996ea0a47c0a14dd5d6e473828dea4966bc1d8823205b7af6b6ca19626f46c1e86957a6fa2510bb1bf42125368c4add823bcba9c56eb888b5cd23f544203000000205731adeb5d1a807ec9c43825389e5edff70412e4643a94629a652af1bfcf2f08\",\n" +
    "\"tx_publish_hash\" : \"1990bf1492c2f9d0ae57c5350a4fe9517ee6889808e534f81f2b28549ebe81fb\",\n" +
    "\"tx_publish_sign\" : \"0200000040c0302c52371cabf010af3b3a537e46ed6ed68cfe8b59dcfd7106d63cebf2c9f9f354ca8c40955ee0ee7373d458cea22a9657b44d2e78451df5833d8148e24807000000205731adeb5d1a807ec9c43825389e5edff70412e4643a94629a652af1bfcf2f08\"\n" +
    "}"
);

let testTx = new Tx(1, 1234, 0);
testTx.time = 1544013436179000000;
testTx.expiration = 1544013526179000000;
testTx.addApprove("iost", 123);
testTx.setChainID(0);

testTx.signers.push("abc");
testTx.actions.push({
    contract: "cont",
    actionName: "abi",
    data: "[]",
});


const seckey = Base58.decode('1rANSfcRzr4HkhbUFZ7L1Zp69JZZHiDDq5v7dNSbbEqeU4jxy3fszV4HGiaLQEyqVpS1dKT9g7zCVRxBVzuiUzB');
const kp = new KeyPair(seckey, Algo.Ed25519);

testTx.addSign(kp);

console.log(JSON.stringify(testTx));

if (testTx._bytes(0).toString('hex') !== standard.tx_bytes_0) {
    console.log("tx bytes 0 >", testTx._bytes(0).toString('hex'));
}
if (testTx._base_hash().toString('hex') !== standard.tx_base_hash) {
    console.log("tx base hash >", testTx._base_hash().toString('hex'));
}

const sig = testTx.signatures[0];

if (sig._bytes().toString('hex') !== standard.sig_bytes) {
    console.log("sig bytes >",sig._bytes().toString('hex'));
}

if (sig.pubkey.toString('hex') !== standard.sig_pubkey) {
    console.log("sig pubkey >", sig.pubkey).toString('hex');
}
if (sig.sig.toString('hex') !== standard.sig_sig) {
    console.log("sig sig >", sig.sig.toString('hex'));
}
if (testTx._bytes(1).toString('hex') !== standard.tx_bytes_1) {
    console.log("tx bytes 1 >", testTx._bytes(1).toString('hex'));
}
if (testTx._publish_hash().toString('hex') !== standard.tx_publish_hash) {
    console.log("tx publish hash >", testTx._publish_hash().toString('hex'));
}

testTx.addPublishSign("def", kp);
if (testTx.publisher_sigs[0]._bytes().toString('hex') !== standard.tx_publish_sign) {
    console.log("tx publish sign >", testTx.publisher_sigs[0]._bytes().toString('hex'));
}


// console.log(c.hash(stdAns));
//
// const hash = new SHA3(256);
// hash.update('abc');
// console.log( hash.digest('hex'));