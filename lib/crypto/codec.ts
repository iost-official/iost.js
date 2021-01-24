import Long from 'long';
import { SHA3 } from 'sha3';

export default class Codec {
    // FIXME: This member is referenced from Signature._bytes()
    //        But, should be private and has a getter if needed
    public _buf: Buffer

    constructor() {
        this._buf = Buffer.alloc(0);
    }

    pushInt(len: number) {
        let bb = Buffer.alloc(4);
        bb.writeInt32BE(len, 0);
        this._buf = Buffer.concat([this._buf, bb]);
        return this
    }

    pushByte(n: number) {
        let bb = Buffer.alloc(1);
        bb.writeUInt8(n, 0);
        this._buf = Buffer.concat([this._buf, bb]);
        return this
    }

    pushInt64(n: number) {
        let l = Long.fromString(n + "");
        let bb = Buffer.alloc(8);
        bb.writeInt32BE(l.high, 0);
        bb.writeInt32BE(l.low, 4);
        this._buf = Buffer.concat([this._buf, bb]);
        return this
    }

    pushString(s: string) {
        const len = s.length;
        let bb = Buffer.from(s);
        this.pushInt(bb.length);
        this._buf = Buffer.concat([this._buf, bb]);
        return this
    }

    pushBytes(b: Buffer) {
        this.pushInt(b.length);
        this._buf = Buffer.concat([this._buf, b]);
        return this
    }
}