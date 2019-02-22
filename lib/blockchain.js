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
        const api = 'getBlockByNumber/' + num + '/' + complete;
        return this._provider.send('get', api);
    }

    /**
     * 获取某个用户的余额
     * @param address
     * @param useLongestChain
     * @returns {promise}
     */
    getBalance(address, tokenSymbol = "iost", useLongestChain = 0)
    {
        const api = 'getTokenBalance/' + address + '/' + tokenSymbol + '/' + useLongestChain;
        return this._provider.send('get', api);
    }

    /**
     * 获取某个用户的余额
     * @param address
     * @param tokenSymbol
     * @param useLongestChain
     * @returns {promise}
     */
    getToken721Balance(address, tokenSymbol, useLongestChain = 0)
    {
        const api = 'getToken721Balance/' + address + '/' + tokenSymbol + '/' + useLongestChain;
        return this._provider.send('get', api);
    }

    /**
     * 获取某个token721类型token的 metadata
     * @param tokenSymbol
     * @param tokenID
     * @param useLongestChain
     * @returns {promise}
     */
    getToken721Metadata(tokenSymbol, tokenID, useLongestChain = 0)
    {
        const api = 'getToken721Metadata/' + tokenSymbol + '/' + tokenID + '/' + useLongestChain;
        return this._provider.send('get', api);
    }
    /**
     * 获取某个token721类型token的 owner
     * @param tokenSymbol
     * @param tokenID
     * @param useLongestChain
     * @returns {promise}
     */
    getToken721Owner(tokenSymbol, tokenID, useLongestChain = 0)
    {
        const api = 'getToken721Owner/' + tokenSymbol + '/' + tokenID + '/' + useLongestChain;
        return this._provider.send('get', api);
    }

    /**
     * 获取智能合约
     * @param {string}id - 智能合约的ID
     * @param {boolean} useLongestChain - 是否从最长链上查询
     * @returns {promise}
     */
    getContract(id, useLongestChain = 0) {
        const api = 'getContract/' + id + '/' + useLongestChain;
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
     * 获取智能合约下的fields集合
     * @param {string}contractID - 智能合约ID
     * @param {string}key - 需查询的key
     * @param {boolean}pending - 是否从最长链上查询
     * @returns {promise}
     */
    getContractStorageFields(contractID, key, pending=false) {
        const query = {
            "id": contractID,
            "key": key,
            "by_longest_chain": pending
        };

        const api = 'getContractStorageFields';
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
        return this._provider.send('get', api);
    }

    /**
     * 获取当前Gas费率
     * @returns {promise}
     */
    getGasRatio() {
        return this._provider.send('get', 'getGasRatio');
    }

    /**
     * 获取预估的gas消耗
     * @returns {number}
     */
    getGasUsage(actionName) {
        switch (actionName) {
            case "transfer":
                return 7800;
            case "newAccount":
                return 115000;
        }
    }

    /**
     * 获取创建合约帐号的信息
     * @returns {object}
     */
    getExchangeContractInfo() {
        return {
            "contractID": "ContractZGVqhY3c65xRs8aoC4dUdACVCKSwhMMsg2negSFxpr3",
            "minAmount": 100,
            "initialRAM": 1000,
            "initialGasPledged": 10
        }
    }
}

module.exports = Blockchain;
