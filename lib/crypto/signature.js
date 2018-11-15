
const Algo = require("./algorithm");
const ED25519 = require('./ed25519');
const Secp256k1 = require('secp256k1');
const elliptic = require('elliptic');
const btoa = require('btoa');
const nacl = require('tweetnacl');
const Codec = require('./codec');

Buffer.prototype.toBase64 = function() {
    return Base64.encode(this)
};

class Signature {
    constructor(t, info, seckey) {
        this.algorithm = t;
        if (t === Algo.Ed25519) {
            this.sig = Buffer.from(nacl.sign(info, seckey)).slice(0,64);
            this.pubkey = seckey.slice(seckey.length/2)
        } else if (t === Algo.Secp256k1) {
            this.pubkey = Secp256k1.publicKeyCreate(seckey);
            const sig = Secp256k1.sign(info, seckey);
            this.sig = sig.signature;
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