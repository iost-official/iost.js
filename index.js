const RPC = require('./lib/rpc');
const HTTPProvider = require('./lib/provider/HTTPProvider');
const IOST = require('./iost/iost');
const KeyPair = require('./lib/crypto/key_pair');

module.exports = {
	IOST: IOST,
    RPC: RPC,
    HTTPProvider: HTTPProvider,
    KeyPair: KeyPair
};