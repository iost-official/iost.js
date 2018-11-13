'use strict';

let Long = require('long');

class Codec {
    constructor(n) {
        this._buf = Buffer.alloc(0);
        this._sep = Buffer.from('`');
    }
    arrayStart(){
        this._sep = Buffer.from('^')
    }
    arrayEnd() {
        this._sep = Buffer.from('`');
    }
    pushInt64(n) {
        let l = Long.fromNumber(n);
        let bb = Buffer.alloc(8);
        bb.writeInt32BE(l.high, 0);
        bb.writeInt32BE(l.low, 4);
        bb = this._escape(bb);
        this._buf = Buffer.concat([this._buf, this._sep, bb])
        return this
    }
    pushString(s) {
        let bb = Buffer.from(s);
        bb = this._escape(bb);
        this._buf = Buffer.concat([this._buf, this._sep, bb])
        return this
    }
    pushBytes(b) {
        let bb = this._escape(b);
        this._buf = Buffer.concat([this._buf, this._sep, bb])
        return this
    }
    _escape(buf){
        let s = buf.toString()
        String.prototype.replaceAll = function (FindText, RepText) {
                regExp = new RegExp(FindText, "g");
                return this.replace(regExp, RepText);

        }
        s.replaceAll('\\', '\\\\')
        s.replaceAll('^', '\\^')
        s.replaceAll('`', '\\`')
        s.replaceAll('<', '\\<')
        s.replaceAll('/', '\\/')
        let buf2 = Buffer.from(s)
        return buf2
    }
}

class Tx {
    constructor(gasPrice, gasLimit, delay) {
        this.gas_price = gasPrice * 100;
        this.gas_limit = gasLimit;
        this.actions = [];
        this.signers = [];
        this.signs = [];
        this.publisher = "";
        this.publishSigns = "";
    }

    addAction(contract, abi, args) {
        this.actions.push({
            contract: contract,
            ActionName: abi,
            Args: args,
        })
    }

    setTime(expirationInSecound, delay) {
        let date = new Date();
        this.time = date.getMilliseconds() * 10e6;
        this.expiration = this.time + expirationInSecound * 10e9;
        this.delay = delay;
    }

    addSign(account, seckey) {

    }

    addPublishSign(publisher, seckey) {

    }

    _base_hash() {
        let c = new Codec();
        c.pushInt64(this.time);
        c.pushInt64(this.expiration);
        c.pushInt64(this.gas_price);
        c.pushInt64(this.gas_limit);
        c.pushInt64(this.delay).sep('`');
        for (let i = 0; i < this.signers.length; i ++) {

        }

    }
}

module.exports = {Tx:Tx};

let c = new Codec(100);
let p = c.pushInt64(49583, 0);
console.log(c._buf.readInt32BE(4));
p = c.pushString("hello world!", p)
console.log(c._buf.toString())
let bb = Buffer.from("nooo")
p = c.pushBytes(bb, p)
console.log(c._buf.toString())
