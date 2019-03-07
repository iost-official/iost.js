const BN = require('bn.js');
const Algo = require("./algorithm");
const EC = require('elliptic').ec;
const nacl = require('tweetnacl');
const Codec = require('./codec');

const secp = new EC('secp256k1');

class Signature {
    constructor(info, keyPair) {
        if (!info) {
            this.algorithm = undefined
            this.pubkey = undefined
            this.sig = undefined
            return
        }
        this.algorithm = keyPair.t;
        if (this.algorithm === Algo.Ed25519) {
            this.sig = Buffer.from(nacl.sign(info, keyPair.seckey)).slice(0, 64);
            this.pubkey = keyPair.pubkey
        } else if (this.algorithm === Algo.Secp256k1) {
            const secpKey = secp.keyFromPrivate(keyPair.seckey);
            this.pubkey = keyPair.pubkey;
            const sig = secpKey.sign(info);

            const r = sig.r;
            const n = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16);
            let s = n.sub(sig.s);
            if (s.gt(sig.s)) {
                s = sig.s
            }
            this.sig = Buffer.concat([Buffer.from(r.toArray()), Buffer.from(s.toArray())]);
        } else {
            throw 'type error!'
        }
    }

    _bytes() {
        let c = new Codec();
        c.pushByte(this.algorithm);
        c.pushBytes(this.sig);
        c.pushBytes(this.pubkey);

        return c._buf
    }

    toJSON() {
        return {
            algorithm: this.algorithm === 1 ? "SECP256K1" : "ED25519",
            public_key: this.pubkey.toString('base64'),
            signature: this.sig.toString('base64'),
        }
    }

    static fromJSON(json) {
        const obj = JSON.parse(json)
        const sig = {
            algorithm: obj.algorithm === "ED25519"?2:1,
            pubkey: Buffer.from(obj.public_key, "base64"),
            sig: Buffer.from(obj.signature, "base64")
        }
        return Object.assign(new Signature, sig)
    } 

    verify(info) {
        if (this.algorithm === Algo.Ed25519) {
            return nacl.sign.detached.verify(info, this.sig, this.pubkey)
        }
        if (this.algorithm === Algo.Secp256k1) {

            const r = new BN(this.sig.slice(0, 32).toString('hex'), 16);
            const s = new BN(this.sig.slice(32, 64).toString('hex'), 16);
            const sig = {r, s};

            return secp.verify(info, sig, this.pubkey);
        }
    }
}

module.exports = Signature;