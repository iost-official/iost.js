import Provider from "./provider/Provider";
import { Tx } from './structs';

/**
 *
 * @constructor
 * @param {RPC}rpc - 通过rpc生成Transaction模块
 */
export default class Transaction {
    private _provider: Provider

    /* NOTE:
     * Set any temporary. Fix it after ts rewriting IOST class
     */
    constructor(iost: any) {
        this._provider = iost.getProvider();
    }

    /**
     * 发送交易
     * @param {Tx}tx
     * @returns {promise}
     */
    sendTx(tx: Tx) {
        const api = 'sendTx';
        return this._provider.send('post', api, JSON.parse(JSON.stringify(tx)))
    }

    /**
     * 通过交易哈希查询交易
     * @param {string}hash - base58编码的hash
     * @returns {promise}
     */
    getTxByHash(hash: string) {
        const api = 'getTxByHash/' + hash;
        return this._provider.send('get', api);
    }

    /**
     * 通过receipt哈希查询交易结果
     * @param {string}hash - base58编码的hash
     * @returns {promise}
     */
    getTxReceiptByHash(hash: string) {
        const api = 'getTxReceiptByHash/' + hash;
        return this._provider.send('get', api);
    }

    /**
     * 通过交易哈希查询交易结果
     * @param {string}txHash - base58编码的hash
     * @returns {promise}
     */
    getTxReceiptByTxHash(txHash: string) {
        const api = 'getTxReceiptByTxHash/' + txHash;
        return this._provider.send('get', api);
    }
}