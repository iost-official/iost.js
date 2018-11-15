const Long = require('long');
const { SHA3 } = require('sha3');


class Codec {
    constructor() {
        this._buf = Buffer.alloc(0);
        this._sep = Buffer.from('`');
    }

    arrayStart() {
        this._buf = Buffer.concat([this._buf, this._sep]);
        this._sep = Buffer.from('^')
    }

    arrayEnd() {
        this._sep = Buffer.from('`');
    }

    pushByte(n) {
        let bb = Buffer.alloc(1);
        bb.writeUInt8(n, 0);
        bb = this._escape(bb);
        this._buf = Buffer.concat([this._buf, this._sep, bb]);
        return this
    }

    pushInt64(n) {
        let l = Long.fromNumber(n);
        let bb = Buffer.alloc(8);
        bb.writeInt32BE(l.high, 0);
        bb.writeInt32BE(l.low, 4);
        bb = this._escape(bb);
        this._buf = Buffer.concat([this._buf, this._sep, bb]);
        return this
    }

    pushString(s) {
        let bb = Buffer.from(s);
        bb = this._escape(bb);
        this._buf = Buffer.concat([this._buf, this._sep, bb]);
        return this
    }

    pushBytes(b, isEscape) {
        let bb;
        if (isEscape) {
            bb = this._escape(b)
        } else {
            bb = b
        }
        this._buf = Buffer.concat([this._buf, this._sep, bb]);
        return this
    }

    _escape(buf) {
        let buf2 = Buffer.alloc(buf.length * 2);
        let j = 0;
        for (let i = 0; i < buf.length; i++) {
            switch (buf.readUInt8(i)) {
                case 92 : // \
                case 94 : // ^
                case 96 : // `
                case 47 : // /
                case 60 : // <
                    buf2.writeUInt8(92, j++);
                    break;
                default:
                    break
            }
            buf2.writeUInt8(buf.readUInt8(i), j++)
        }
        return buf2.slice(0,j)
    }
}

module.exports = Codec;