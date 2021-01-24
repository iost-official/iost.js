import Provider from './provider/Provider';
import Net from './net';
import Blockchain from './blockchain';
import Transaction from './transaction';

/**
 * RPC接口，用以发送交易和查询各类信息
 * @constructor
 * @param {HTTPProvider}provider - provider of this rpc
 */
export default class RPC {
    private _provider: Provider

    public net: Net
    public blockchain: Blockchain
    public transaction: Transaction

    constructor(provider: Provider) {
        this._provider = provider;
        this.net = new Net(this);
        this.blockchain = new Blockchain(this);
        this.transaction = new Transaction(this)
    }

    /**
     * 设置Provider
     * @param {HTTPProvider}provider - provider of this rpc
     */
    setProvider(provider: Provider) {
        this._provider = provider;
    }

    /**
     * 获取Provider
     * @returns {HTTPProvider}provider - provider of this rpc
     */
    getProvider() {
        return this._provider;
    }
}