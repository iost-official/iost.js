
const Algo = require("./algorithm");
const EC = require('elliptic').ec;
const btoa = require('btoa');
const nacl = require('tweetnacl');
const Codec = require('./codec');

const secp = new EC('secp256k1');

class Signature {
    constructor(info, keyPair) {
        this.algorithm = keyPair.t;
        if (this.algorithm === Algo.Ed25519) {
            this.sig = Buffer.from(nacl.sign(info, keyPair.seckey)).slice(0,64);
            this.pubkey = keyPair.pubkey
        } else if (this.algorithm === Algo.Secp256k1) {
            const secpKey = secp.keyFromPrivate(keyPair.seckey);
            this.pubkey = keyPair.pubkey;
            const sig = secpKey.sign(info);
            this.sig = Buffer.from(sig.toDER("hex").substr(8), 'hex');
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
            algorithm: this.algorithm===1?"SECP256K1":"ED25519",
            public_key: btoa(this.pubkey),
            signature: btoa(this.sig),
        }
    }
}

module.exports = Signature;