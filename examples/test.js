'use strict';

const {Account, RPC, HTTPProvider} = require('../index');
const {Tx} = require('../lib/structs');
const rpc = new RPC(new HTTPProvider('http://192.168.1.144:20001'));
const KeyPair = require('../lib/crypto/key_pair');


// //net
// rpc.net.getNodeInfo().then(console.log);
//
// // // chainInfo
// rpc.blockchain.getChainInfo().then(console.log);
// rpc.blockchain.getBlockByHash("abc", true).then(console.log);

const t = new Tx(1, 10000, 0);
const kp = KeyPair.newKeyPair();
console.log("kp is " + JSON.stringify(kp));
t.addAction("token.iost", "transfer", JSON.stringify(["iost", "abc", "def", 100]));
t.addPublishSign("abc", kp);

console.log(JSON.stringify(t));


rpc.transaction.sendTx(t).then(console.log);

//
// // getBlockByNum
// rpc.blockchain.getBlockByNum(1234, 1).then(console.log);

// let tx = new Tx(1, 100000, 0);
//
// tx.addAction("iost.");
//
// rpc.transaction.sendTx();
