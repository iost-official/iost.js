'use strict';

class Net {
    constructor(iost) {
        this._provider = iost.getProvider();
    }

    getProvider() {
        return this._provider;
    }

    getNodeInfo() {
        return this._provider.send('get', 'getNodeInfo');
    }
}

module.exports = Net;