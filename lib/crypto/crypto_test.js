const crypto = require('crypto');
const Signature = require('./signature');
const Algo = require("./algorithm");
const Base58 = require('bs58');
const {SHA3} = require('sha3');

const randomBytes = crypto.randomBytes(32).toByteArray();

const hash = new SHA3(256);
hash.update('hello');
const info = hash.digest("binary");

// const info = Buffer.from('hello');
const seckey = Base58.decode('1rANSfcRzr4HkhbUFZ7L1Zp69JZZHiDDq5v7dNSbbEqeU4jxy3fszV4HGiaLQEyqVpS1dKT9g7zCVRxBVzuiUzB');

let sig = new Signature(Algo.Ed25519, info, seckey);

console.log("ed25519: -----------");
console.log("info>", info);
// console.log(sig.algorithm);
console.log("pub >",sig.pubkey);

console.log("sig >",(sig.sig));
console.log(sig.toJSON());

// console.log(randomBytes);


const sec2 = Base58.decode('EhNiaU4DzUmjCrvynV3gaUeuj2VjB1v2DCmbGD5U2nSE');

let sig2 = new Signature(Algo.Secp256k1, info, sec2);

console.log("secp256k1: -----------");
console.log("pub >", sig2.pubkey);
console.log("sig >", sig2.sig);
console.log(sig2.toJSON());