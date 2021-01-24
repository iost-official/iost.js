import Provider from "./provider/Provider";
import RPC from './rpc';

/**
 * 查询当前节点信息的接口
 * @constructor
 * @param {RPC}rpc - 通过rpc生成Net模块
 */
export default class Net {
    private _provider: Provider

    constructor(rpc: RPC) {
        this._provider = rpc.getProvider();
    }

    getProvider() {
        return this._provider;
    }

    /**
     * 获取当前节点信息
     * @returns {promise} - 当前节点的信息
     */
    getNodeInfo() {
        return this._provider.send('get', 'getNodeInfo');
    }
}