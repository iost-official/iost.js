
const Algo = require("./algorithm");
const Secp256k1 = require('secp256k1');
const btoa = require('btoa');
const nacl = require('tweetnacl');
const Codec = require('./codec');

class Signature {
    constructor(info, keyPair) {
        this.algorithm = keyPair.t;
        if (this.algorithm === Algo.Ed25519) {
            this.sig = Buffer.from(nacl.sign(info, keyPair.seckey)).slice(0,64);
            this.pubkey = keyPair.pubkey
        } else if (this.algorithm === Algo.Secp256k1) {
            this.pubkey = Secp256k1.publicKeyCreate(keyPair.seckey);
            const sig = Secp256k1.sign(info, keyPair.seckey);
            this.sig = sig.signature;
        } else {
            throw 'type error!'
        }
    }

    _bytes() {
        let c = new Codec();
        c.pushByte(this.algorithm);
        c.pushBytes(this.sig, true);
        c.pushBytes(this.pubkey,true);

        return c._buf
    }

    toJSON() {
        return  {
            algorithm: this.algorithm,
            pubkey: btoa(this.pubkey),
            sig: btoa(this.sig),
        }
    }
}

module.exports = Signature;