import BN from 'bn.js';
import Algo from './algorithm';
import { ec as EC } from 'elliptic';
import nacl from 'tweetnacl';
import Codec from './codec';
import KeyPair from './key_pair';

const secp = new EC('secp256k1');

export default class Signature {
    public algorithm?: number
    public pubkey?: Buffer
    public sig?: Buffer

    constructor(info?: Buffer, keypair?: KeyPair) {
        if (!info) {
            this.algorithm = undefined
            this.pubkey = undefined
            this.sig = undefined
            return
        }
        const pair = keypair as KeyPair;
        this.algorithm = pair.t;
        if (this.algorithm === Algo.Ed25519) {
            this.sig = Buffer.from(nacl.sign(new Uint8Array(info), new Uint8Array(pair.seckey))).slice(0, 64);
            this.pubkey = pair.pubkey
        } else if (this.algorithm === Algo.Secp256k1) {
            const secpKey = secp.keyFromPrivate(pair.seckey);
            this.pubkey = pair.pubkey;
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
        c.pushByte(this.algorithm as number);
        c.pushBytes(this.sig as Buffer);
        c.pushBytes(this.pubkey as Buffer);

        return c._buf
    }

    toJSON() {
        return {
            algorithm: this.algorithm === 1 ? "SECP256K1" : "ED25519",
            public_key: (this.pubkey as Buffer).toString('base64'),
            signature: (this.sig as Buffer).toString('base64'),
        }
    }

    static fromJSON(json: string) {
        const obj = JSON.parse(json)
        const sig = {
            algorithm: obj.algorithm === "ED25519" ? 2 : 1,
            pubkey: Buffer.from(obj.public_key, "base64"),
            sig: Buffer.from(obj.signature, "base64")
        }
        return Object.assign(new Signature, sig)
    }

    verify(info: Uint8Array) {
        if (this.algorithm === Algo.Ed25519) {
            return nacl.sign.detached.verify(info, this.sig as Buffer, this.pubkey as Buffer)
        }
        if (this.algorithm === Algo.Secp256k1) {

            const r = new BN((this.sig as Buffer).slice(0, 32).toString('hex'), 16);
            const s = new BN((this.sig as Buffer).slice(32, 64).toString('hex'), 16);
            const sig = { r, s };

            return secp.verify(info, sig, this.pubkey as Buffer);
        }
    }
}