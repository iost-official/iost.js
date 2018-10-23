'use strict';

class Net
{
    constructor(iost)
    {
        this._provider = iost.getProvider();
        this._netApi = 'getNodeInfo';
    }

    getProvider()
    {
        return this._provider;
    }

    getNetInfo()
    {
        const netInfo = this._provider.send('get', this._netApi);
        return netInfo;
    }
}

module.exports = Net;