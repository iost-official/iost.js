const IOST = require('iost.js');

const rpc = new IOST.RPC(new IOST.HTTPProvider('http://localhost:30001'));

rpc.net.getNodeInfo().then(console.log);

rpc.blockchain.getChainInfo().then(console.log);

rpc.transaction.getTxReceiptByTxHash("abc").then(console.log);

