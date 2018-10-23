'use strict';

const Account = require('./lib/account');
const IOST = require('./lib/iost');
const HTTPProvider = require('./lib/provider/HTTPProvider');

module.exports = {
    Account: Account,
    IOST: IOST,
    HTTPProvider: HTTPProvider,
};