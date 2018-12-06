const RPC = require('./lib/rpc');
const HTTPProvider = require('./lib/provider/HTTPProvider');
const IOST = require('./iost/iost');
const KeyPair = require('./lib/crypto/key_pair');
const {Tx} = require('./lib/structs');
const Algorithm = require('./lib/crypto/algorithm');

module.exports = {
	IOST: IOST,
    RPC: RPC,
    HTTPProvider: HTTPProvider,
    KeyPair: KeyPair,
    Tx : Tx,
    Algorithm: Algorithm,
};
