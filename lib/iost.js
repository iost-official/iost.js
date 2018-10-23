'use strict';

const Net = require('./net');

class IOST
{
    constructor(provider)
    {
        this._provider = provider;
        this.net = new Net(this);
    }

    setProvider(provider)
    {
        this._provider = provider;
    }

    getProvider()
    {
        return this._provider;
    }


}

module.exports = IOST;