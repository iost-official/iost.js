'use strict';

const RPC = require('./lib/rpc');
const HTTPProvider = require('./lib/provider/HTTPProvider');
const IOST = require('./iost/iost')

module.exports = {
	IOST: IOST,
    RPC: RPC,
    HTTPProvider: HTTPProvider,
};