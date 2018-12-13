const IOST = require('../index');

const rpc = new IOST.RPC(new IOST.HTTPProvider('http://47.244.109.92:30001'));

rpc.net.getNodeInfo().then(console.log);

rpc.blockchain.getChainInfo().then(console.log);

rpc.transaction.getTxReceiptByTxHash("abc").then(console.log);

