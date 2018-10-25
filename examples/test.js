'use strict';

const {Account, IOST, HTTPProvider} = require('../index');

const iost = new IOST(new HTTPProvider('http://54.95.136.154:30001'));

// net
// iost.net.getNetInfo().then(console.log);

// chainInfo
// iost.blockchain.getChainInfo().then(console.log);

// getBlockByNum
// iost.blockchain.getBlockByNum(1234, 1).then(console.log);