'use strict';

class Blockchain
{
    constructor(iost)
    {
        this._provider = iost.getProvider();
    }

    getChainInfo()
    {
        return this._provider.send('get', 'getChainInfo');
    }

    getBlockByHash(hash, complete)
    {
        const api = 'getBlockByHash/' + hash + '/' + complete;
        return this._provider.send('get', api);
    }

    getBlockByNum(num, complete)
    {
        const api = 'getBlockByNum/' + num + '/' + complete;
        return this._provider.send('get', api);
    }

    getTxByHash(hash)
    {
        const api = 'getTxByHash/' + hash;
        return this._provider.send('get', api);
    }

    getTxReceiptByHash(hash)
    {
        const api = 'getTxReceiptByHash/' + hash;
        return this._provider.send('get', api);
    }

    getTxReceiptByTxHash(txHash)
    {
        const api = 'getTxReceiptByTxHash/' + txHash;
        return this._provider.send('get', api);
    }

    getBalance(address, useLongestChain=0)
    {
        const api = 'getBalance/' + address + '/' + useLongestChain;
        return this._provider.send('get', api);
    }

    getContract(id)
    {
        const api = 'getContract/' + id;
        return this._provider.send('get', api);
    }

    getContractStorage(id, key)
    {
        const api = 'getContractStorage/' + id + '/' + key;
        return this._provider.send('get', )
    }
}

module.exports = Blockchain;