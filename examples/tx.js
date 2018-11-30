const IOST = require('iost.js');
const bs58 = require('bs58');

// init iost sdk
let iost = new IOST({ // 如果不设置则使用default配置来发交易
    gasPrice: 100,
    gasLimit: 100000,
    delay:0,
}, new IOST.HTTPProvider('http://localhost:30001'));

let account = "abc";
let kp = new IOST.KeyPair(bs58.decode('1rANSfcRzr4HkhbUFZ7L1Zp69JZZHiDDq5v7dNSbbEqeU4jxy3fszV4HGiaLQEyqVpS1dKT9g7zCVRxBVzuiUzB');

iost.setPublisher(account, kp);

// send a call
let handler = iost.callABI("iost.token", "transfer", ["iost", "form", "to", "1000.000"]);

handler
    .onPending(function (response) {
        console.log("tx: "+ response.hash + " has sent to node")
    })
    .onSuccess(function (response) {
        console.log("tx has on chain, here is the receipt: "+ JSON.stringify(response))
    })
    .onFailed(console.log)
    .send()
    .listen();

