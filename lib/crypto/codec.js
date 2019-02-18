const Long = require('long');
const { SHA3 } = require('sha3');


class Codec {
    constructor() {
        this._buf = Buffer.alloc(0);
    }

    pushInt(len) {
        let bb = Buffer.alloc(4);
        bb.writeInt32BE(len, 0);
        this._buf = Buffer.concat([this._buf, bb]);
        return this
    }

    pushByte(n) {
        let bb = Buffer.alloc(1);
        bb.writeUInt8(n, 0);
        this._buf = Buffer.concat([this._buf, bb]);
        return this
    }

    pushInt64(n) {
        let l = Long.fromString(n+"");
        let bb = Buffer.alloc(8);
        bb.writeInt32BE(l.high, 0);
        bb.writeInt32BE(l.low, 4);
        this._buf = Buffer.concat([this._buf, bb]);
        return this
    }

    pushString(s) {
        const len = s.length;
        let bb = Buffer.from(s);
        this.pushInt(bb.length);
        this._buf = Buffer.concat([this._buf, bb]);
        return this
    }

    pushBytes(b) {
        this.pushInt(b.length);
        this._buf = Buffer.concat([this._buf, b]);
        return this
    }
}

module.exports = Codec;
