'use strict';

class Transaction {
    constructor(iost) {
        this._provider = iost.getProvider();
    }

    sendTx(tx) {
        const api = 'sendTx';
        return this._provider.send('post', api, JSON.stringify(tx))
    }

    getTxByHash(hash) {
        const api = 'getTxByHash/' + hash;
        return this._provider.send('get', api);
    }

    getTxReceiptByHash(hash) {
        const api = 'getTxReceiptByHash/' + hash;
        return this._provider.send('get', api);
    }

    getTxReceiptByTxHash(txHash) {
        const api = 'getTxReceiptByTxHash/' + txHash;
        return this._provider.send('get', api);
    }

}

module.exports = Transaction;