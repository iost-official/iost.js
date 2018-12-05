/**
 *
 * @constructor
 * @param {RPC}rpc - 通过rpc生成Transaction模块
 */
class Transaction {
    constructor(iost) {
        this._provider = iost.getProvider();
    }

    /**
     * 发送交易
     * @param {Tx}tx
     * @returns {promise}
     */
    sendTx(tx) {
        const api = 'sendTx';
        return this._provider.send('post', api, JSON.parse(JSON.stringify(tx)))
    }

    /**
     * 通过交易哈希查询交易
     * @param {string}hash - base58编码的hash
     * @returns {promise}
     */
    getTxByHash(hash) {
        const api = 'getTxByHash/' + hash;
        return this._provider.send('get', api);
    }

    /**
     * 通过receipt哈希查询交易结果
     * @param {string}hash - base58编码的hash
     * @returns {promise}
     */
    getTxReceiptByHash(hash) {
        const api = 'getTxReceiptByHash/' + hash;
        return this._provider.send('get', api);
    }

    /**
     * 通过交易哈希查询交易结果
     * @param {string}txHash - base58编码的hash
     * @returns {promise}
     */
    getTxReceiptByTxHash(txHash) {
        const api = 'getTxReceiptByTxHash/' + txHash;
        return this._provider.send('get', api);
    }

}

module.exports = Transaction;