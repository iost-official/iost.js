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
    "\"tx_bytes_0\" : \"YBVtcAon4SrAYBVtcB8cTC7AYAAAAAAAAABkYAAAAAAAAeIIYAAAAAAAAAAAYF5hYmNgXmBjb250YGFiaWBbXWBeYGlvc3RgMTIz\",\n" +
    "\"tx_base_hash\" : \"WR2W9A/ef8VqBowPZW5j9EgEv3CBrCvigV1kGssCjdw=\",\n" +
    "\"sig_bytes\" : \"YAJgTXaKaVgsIwmE6Hycu+VPUa7wD6NpgSpslEk2qSEnDCFGXGCUy5Vnq+NPtcnVlFw8OqFBfmZ9Ir7pKIHKJJ/o/LIBYFcxretdGoB+ycQ4JTieXF7f9wQS5GQ6lGKaZSrxv89cLwg=\",\n" +
    "\"sig_pubkey\" : \"VzGt610agH7JxDglOJ5e3/cEEuRkOpRimmUq8b/PLwg=\",\n" +
    "\"sig_sig\" : \"TXaKaVgsIwmE6Hycu+VPUa7wD6NpgSpslEk2qSEnDCFGYJTLlWer40+1ydWUPDqhQX5mfSK+6SiByiSf6PyyAQ==\",\n" +
    "\"tx_bytes_1\" : \"YBVtcAon4SrAYBVtcB8cTC7AYAAAAAAAAABkYAAAAAAAAeIIYAAAAAAAAAAAYF5hYmNgXmBjb250YGFiaWBbXWBeYGlvc3RgMTIzYF5gAmBNdoppWCwjCYTofJy75U9RrvAPo2mBKmyUSTapIScMIUZcYJTLlWer40+1ydWUXDw6oUF+Zn0ivukogcokn+j8sgFgVzGt610agH7JxDglOJ5cXt/3BBLkZDqUYpplKvG/z1wvCA==\",\n" +
    "\"tx_publish_hash\" : \"Inod71/lGyXbmmneSIwFrMgZ/CEHB2GdF/YxF49rZR0=\",\n" +
    "\"tx_publish_sign\" : \"YAJgex8I3QHVGiaF483eO5tIhljZLEbYtOnej6geQ1XizdnHKtpvBlxc5icx4t4c4y23sl8Z5MGFhQI6JSTdnjrLdgVgVzGt610agH7JxDglOJ5cXt/3BBLkZDqUYpplKvG/z1wvCA==\"\n" +
    "}"
);

let testTx = new Tx(1, 1234, 0);
testTx.time = 1544013436179000000;
testTx.expiration = 1544013526179000000;
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

if (btoa(testTx._bytes(0)) !== standard.tx_bytes_0) {
    console.log("tx bytes 0 >", btoa(testTx._bytes(0)) );
}
if (btoa(testTx._base_hash()) !== standard.tx_base_hash) {
    console.log("tx base hash >", btoa(testTx._base_hash()));
}


const sig = testTx.signs[0];

if (btoa(sig._bytes()) !== standard.sig_bytes) {
    console.log("sig bytes >", );
}

if (btoa(sig.pubkey) !== standard.sig_pubkey){
console.log("sig pubkey >", btoa(sig.pubkey));
}
if (btoa(sig.sig) !== standard.sig_sig){
console.log("sig sig >", btoa(sig.sig));
}
if (btoa(testTx._bytes(1)) !== standard.tx_bytes_1 ){
console.log("tx bytes 1 >", btoa(testTx._bytes(1)));
}
if (btoa(testTx._publish_hash()) !== standard.tx_publish_hash){
console.log("tx publish hash >", btoa(testTx._publish_hash()));
}

testTx.addPublishSign("def", kp);
if (btoa(testTx.publisher_sigs[0]._bytes()) !== standard.tx_publish_sign){
console.log("tx publish sign >", btoa(testTx.publisher_sigs[0]._bytes()));
}



// console.log(c.hash(stdAns));
//
// const hash = new SHA3(256);
// hash.update('abc');
// console.log( hash.digest('hex'));