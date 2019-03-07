const Signature = require('./signature');
const Algo = require("./algorithm");
const Base58 = require('bs58');
const {SHA3} = require('sha3');
const btoa = require('btoa');
const KeyPair = require('./key_pair');
const crc32 = require('./crc32');

console.log("======= test of crc32");
const base = "12345abcde";
const buf = Buffer.from(base, 'hex');
const buf2 = crc32(buf, false);
console.log(buf2.toString('hex'));


console.log("======= test of hash");
const hash = new SHA3(256);
hash.update('hello');
const info = hash.digest("binary");
console.log("hash of hello >", info);

console.log("======= test of ed25519:");

const seckey = Base58.decode('1rANSfcRzr4HkhbUFZ7L1Zp69JZZHiDDq5v7dNSbbEqeU4jxy3fszV4HGiaLQEyqVpS1dKT9g7zCVRxBVzuiUzB');

const edKP = new KeyPair(seckey, Algo.Ed25519);
console.log(edKP);

let sig = new Signature(info, edKP);
console.log("pub >", sig.pubkey);
console.log("sig >", sig.sig);
console.log(sig.toJSON());

console.log(sig.verify(info));
const info2 = hash.update('no').digest("binary");
console.log(sig.verify(info2));

const sigx = Signature.fromJSON(JSON.stringify(sig))
console.log(sigx.verify(info))


console.log("======= test of secp256k1:");
const sec2 = Base58.decode('EhNiaU4DzUmjCrvynV3gaUeuj2VjB1v2DCmbGD5U2nSE');

const seKP = new KeyPair(sec2, Algo.Secp256k1);
console.log(seKP);

let sig2 = new Signature(info, seKP);

console.log("pub >", sig2.pubkey);
console.log("sig >", sig2.sig);
console.log(sig2.sig.toString('hex'));
console.log(sig2.toJSON());

console.log(sig2.verify(info));
console.log(sig2.verify(info2));

function errorTestOfSecp256k1(b64Info, b58Sec) {
    console.log("=== Error test");
    const infoE = Buffer.from(b64Info, 'base64');

    const secE = Base58.decode(b58Sec);

    const seKPE = new KeyPair(secE, Algo.Secp256k1);
    let sigE = new Signature(infoE, seKPE);

    console.log("pub >", sigE.pubkey);
    console.log("sig >", sigE.sig);
    console.log(sigE.toJSON());
}

errorTestOfSecp256k1('NMxeTwJ1rygOpes1a/W9t3757KADZJ+e3Vx4diRvF2Y=', 'BNkwBQabFLjUBmcJQhKAHYF99Qkx3tfJpSmZ6riyY69n');
errorTestOfSecp256k1('UihM8HBK07omJ1/wAHLko5SN0hQN/mdS6vaJ4RYP5wU=', 'BNkwBQabFLjUBmcJQhKAHYF99Qkx3tfJpSmZ6riyY69n');

function errorTestOfEd25519(b64Info, hexSec) {
    console.log("=== Error test");
    const infoE = Buffer.from(b64Info, 'base64');

    const secE = Buffer.from(hexSec, 'hex');

    const seKPE = new KeyPair(secE);
    let sigE = new Signature(infoE, seKPE);

    console.log("pub >", sigE.pubkey);
    console.log("sig >", sigE.sig);
    console.log(sigE.toJSON());

}

errorTestOfEd25519('UihM8HBK07omJ1/wAHLko5SN0hQN/mdS6vaJ4RYP5wU=', '2093a491b78569d6d65bc8c988d0d7b601c21549e839ae2879fc493cf21e06ab277f231b870b069237d5dfec2aec36902bb385a7ada383c3447af7eaf76bf72e');

const nacl = require("tweetnacl");
function memoWords() {
    const sw = '65Rznad6Ko7gPha1Vnbsgu1bS7hYATdtdVp191jwVrMhW3SynSR6R7qzBgM6cFL74spAQnCWXuqze2YME8UfUFiL';
    const seckey = Base58.decode(sw);
    const kp = nacl.sign.keyPair.fromSeed(seckey.slice(0,32));
    if (Base58.encode(Buffer.from(kp.secretKey.buffer)) !== sw) {
        console.log("KeyPair error!"+Base58.encode(Buffer.from(kp.secretKey.buffer)))
    }
    const kp2 = new KeyPair(seckey)
    console.log(kp2.B58PubKey())
}

memoWords();

function newkpTest() {
    const kp = KeyPair.newKeyPair();
    const kp2 = new KeyPair(kp.seckey);
    if (kp.B58PubKey !== kp2.B58PubKey) {
        console.log("newKeyPair error!"+ kp.B58SecKey+":"+ kp2.B58SecKey)
    }
}
