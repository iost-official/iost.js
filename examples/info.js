const IOST = require('../index');

const rpc = new IOST.RPC(new IOST.HTTPProvider('http://47.244.109.92:30001'));

rpc.net.getNodeInfo().then(function(res) {
    console.log("GetNodeInfo result: " + JSON.stringify(res, null, '\t'))
});

rpc.blockchain.getChainInfo().then(function(res) {
    console.log("GetChainInfo result: " + JSON.stringify(res, null, '\t'))
});

rpc.blockchain.getBlockByNum(1, true).then(function(res) {
    console.log("GetBlock result: " + JSON.stringify(res, null, '\t'))
});

rpc.transaction.getTxReceiptByTxHash("abc").then(function(res) {
    console.log("GetTxReceiptByTxHash result: " + JSON.stringify(res, null, '\t'))
});

console.log(rpc.blockchain.getGasUsage("transfer"));
console.log(rpc.blockchain.getGasUsage("newAccount"));
