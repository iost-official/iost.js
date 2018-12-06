/**
 * 区块链相关RPC接口的实现
 * @constructor
 * @param {RPC}rpc - 通过rpc生成Blockchain模块
 */
class Blockchain {
    constructor(iost) {
        this._provider = iost.getProvider();
    }

    /**
     * 获取区块链整体信息
     * @returns {promise}
     */
    getChainInfo() {
        return this._provider.send('get', 'getChainInfo');
    }

    /**
     * 通过Hash获取区块
     * @param {string}hash - hash in base58
     * @param {boolean}complete - 是否获取完整的block
     * @returns {promise}
     */
    getBlockByHash(hash, complete) {
        const api = 'getBlockByHash/' + hash + '/' + complete;
        return this._provider.send('get', api);
    }

    /**
     * 通过区块高度获取区块
     * @param {number}num - 区块高度
     * @param {boolean}complete - 是否获取完整的block
     * @returns {promise}
     */
    getBlockByNum(num, complete) {
        const api = 'getBlockByNum/' + num + '/' + complete;
        return this._provider.send('get', api);
    }

    /**
     * 获取某个用户的余额
     * @param address
     * @param useLongestChain
     * @returns {promise}
     */
    getBalance(address, useLongestChain = 0) // TODO 有问题，get token balance
    {
        const api = 'getBalance/' + address + '/' + useLongestChain;
        return this._provider.send('get', api);
    }

    /**
     * 获取智能合约
     * @param {string}id - 智能合约的ID
     * @returns {promise}
     */
    getContract(id) {
        const api = 'getContract/' + id;
        return this._provider.send('get', api);
    }

    /**
     * 获取智能合约下的某个键值
     * @param {string}contractID - 智能合约ID
     * @param {string}key - 需查询的key
     * @param {string}field - 需查询的field
     * @param {boolean}pending - 是否从最长链上查询
     * @returns {promise}
     */
    getContractStorage(contractID, key, field="", pending=false) {
        if (typeof field === 'boolean') {
            pending = field;
            field = ""
        }
        const query = {
            "id": contractID,
            "key": key,
            "field": field,
            "by_longest_chain": pending
        };

        const api = 'getContractStorage';
        return this._provider.send('post', api, query)
    }

    /**
     * 获取account信息
     * @param {string}id - 用户名
     * @param {boolean}reversible - 是否从可逆链上查询
     * @returns {promise}
     */
    getAccountInfo(id, reversible) {
        const api = 'getAccount/' + id + '/' + (reversible? 1: 0);
        return this._provider.send('get', api)
    }
}

module.exports = Blockchain;