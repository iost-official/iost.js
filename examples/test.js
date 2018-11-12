'use strict';

const {Account, RPC, HTTPProvider} = require('../index');

const {Tx} = require('../lib/structs');

const rpc = new RPC(new HTTPProvider('http://54.95.136.154:30001'));

// //net
rpc.net.getNetInfo().then(console.log);

// // chainInfo
// rpc.blockchain.getChainInfo().then(console.log);
//
// // getBlockByNum
// rpc.blockchain.getBlockByNum(1234, 1).then(console.log);

// let tx = new Tx(1, 100000, 0);
//
// tx.addAction("iost.");
//
// rpc.transaction.sendTx();