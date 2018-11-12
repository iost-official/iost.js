'use strict';

import Long from 'long';

class Codec {
    constructor() {
        this._buf = new ArrayBuffer(1000);
        this._dataView = new DataView(this._buf);
    }

    pushNumberAsInt64(n) {
        let buffer = new ArrayBuffer(100); // 初始化6个Byte的二进制数据缓冲区
        let dataView = new DataView(buffer);
        let l = Long.fromNumber(this.gas_price);
        dataView.setInt32()
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

    }
}

module.exports = {Tx:Tx};