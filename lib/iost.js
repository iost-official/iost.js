'use strict';

const Net = require('./net');
const Blockchain = require('./blockchain');

class IOST
{
    constructor(provider)
    {
        this._provider = provider;
        this.net = new Net(this);
        this.blockchain = new Blockchain(this);
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