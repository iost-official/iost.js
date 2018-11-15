'use strict';

const Account = require('./old/account');
const RPC = require('./lib/rpc');
const HTTPProvider = require('./lib/provider/HTTPProvider');

module.exports = {
    Account: Account,
    RPC: RPC,
    HTTPProvider: HTTPProvider,
};