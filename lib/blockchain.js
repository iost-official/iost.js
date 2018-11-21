'use strict';

class Blockchain {
    constructor(iost) {
        this._provider = iost.getProvider();
    }

    getChainInfo() {
        return this._provider.send('get', 'getChainInfo');
    }

    getBlockByHash(hash, complete) {
        const api = 'getBlockByHash/' + hash + '/' + complete;
        return this._provider.send('get', api);
    }

    getBlockByNum(num, complete) {
        const api = 'getBlockByNum/' + num + '/' + complete;
        return this._provider.send('get', api);
    }


    getBalance(address, useLongestChain = 0) // TODO 有问题，get token balance
    {
        const api = 'getBalance/' + address + '/' + useLongestChain;
        return this._provider.send('get', api);
    }

    getContract(id) {
        const api = 'getContract/' + id;
        return this._provider.send('get', api);
    }

    getContractStorage(contractID, owner, key, field ) {
        const query = {
            "contractID": contractID,
            "owner": owner,
            "key": key,
            "field": field
        };

        const api = 'getContractStorage/';
        return this._provider.send('post', api, query)
    }

    getAccountInfo(id, reversible) {
        const api = 'getAccountInfo/' + id + '/' + (reversible? 1: 0);
        return this._provider.send('get', api)
    }
}

module.exports = Blockchain;