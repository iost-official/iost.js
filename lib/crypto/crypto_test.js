const Signature = require('./signature');
const Algo = require("./algorithm");
const Base58 = require('bs58');
const {SHA3} = require('sha3');
const btoa = require('btoa');
const KeyPair = require('./key_pair');

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


console.log("======= test of secp256k1:");
const sec2 = Base58.decode('EhNiaU4DzUmjCrvynV3gaUeuj2VjB1v2DCmbGD5U2nSE');

const seKP = new KeyPair(sec2, Algo.Secp256k1);
console.log(seKP);

let sig2 = new Signature(info, seKP);

console.log("pub >", sig2.pubkey);
console.log("sig >", sig2.sig);
console.log(sig2.sig.toString('hex'));
console.log(sig2.toJSON());