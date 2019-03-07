const RPC = require('./lib/rpc');
const HTTPProvider = require('./lib/provider/HTTPProvider');
const IOST = require('./iost/iost');
const KeyPair = require('./lib/crypto/key_pair');
const Signature = require('./lib/crypto/signature');
const {Tx} = require('./lib/structs');
const Algorithm = require('./lib/crypto/algorithm');
const Account = require('./iost/account');
const TxHandler = require('./iost/tx_handler');
const base58 = require('bs58');

module.exports = {
	IOST: IOST,
    RPC: RPC,
    HTTPProvider: HTTPProvider,
    KeyPair: KeyPair,
    Tx : Tx,
    Algorithm: Algorithm,
    Account: Account,
    TxHandler: TxHandler,
    Bs58: base58,
    Signature: Signature,
};

(function(){
    if(typeof window !== 'undefined'){
        window.IOST = module.exports
    }
})();