'use strict';

class Net
{
    constructor(iost)
    {
        this._provider = iost.getProvider();
        this._api = 'getNodeInfo';
    }

    getProvider()
    {
        return this._provider;
    }

    getNetInfo()
    {
        return this._provider.send('get', this._api);
    }
}

module.exports = Net;