'use strict';

const Net = require('./net');
const Blockchain = require('./blockchain');
const Transaction = require('./transaction');

class RPC {
    constructor(provider) {
        this._provider = provider;
        this.net = new Net(this);
        this.blockchain = new Blockchain(this);
        this.transaction = new Transaction(this)
    }

    setProvider(provider) {
        this._provider = provider;
    }

    getProvider() {
        return this._provider;
    }


}

module.exports = RPC;