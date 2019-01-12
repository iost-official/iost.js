const IOST = require('../index');
const bs58 = require('bs58');
const KeyPair = require('../lib/crypto/key_pair');
const assert = require('assert');

const delay = function(s){
    return new Promise(function(resolve){
        setTimeout(resolve,s);
    });
};
const checkHandler = function (handler) {
    return new Promise(function (resolve) {
        let i = 0, times = 10;
        let id = setInterval(function () {
            if (handler.status === "success" || handler.status === "failed" || i > parseInt(times)) {
                clearInterval(id);
                assert.equal(handler.status, "success");
                resolve();
                return;
            }
            i ++;
        }, 1000);
    });
};

// init iost sdk
const iost = new IOST.IOST({ // will use default setting if not set
    gasRatio: 1,
    gasLimit: 1000000,
    delay:0,
    expiration: 90,
    defaultLimit: "10000"
});
const rpc = new IOST.RPC(new IOST.HTTPProvider('http://127.0.0.1:30001'));

// init admin account
const account = new IOST.Account("admin");
const kp = new KeyPair(bs58.decode('2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1'));
account.addKeyPair(kp, "owner");
account.addKeyPair(kp, "active");

let producerid = "producer01"
const account_producer = new IOST.Account(producerid);
const kp_producer = new KeyPair(bs58.decode('1rANSfcRzr4HkhbUFZ7L1Zp69JZZHiDDq5v7dNSbbEqeU4jxy3fszV4HGiaLQEyqVpS1dKT9g7zCVRxBVzuiUzB'));
account_producer.addKeyPair(kp_producer, "owner");
account_producer.addKeyPair(kp_producer, "active");

const Failed = function (e) {
    console.error("test failed. " + e);
    process.exit();
};
const accountList = new Array(3);
let userPrefix = Date.now().toString();
userPrefix = "u" + userPrefix.substr(userPrefix.length - 8);
let tokenSym = Date.now().toString();
tokenSym = "t" + tokenSym.substr(tokenSym.length - 4);
let myid = userPrefix + "my";
let otherid = userPrefix + "ot";

delay().then(async function () {
    let accountInfo = await rpc.blockchain.getAccountInfo("admin", false);
    console.log(accountInfo)
    let ram1 = accountInfo.ram_info.total
    const tx = iost.callABI("ram.iost", "buy", ["admin", "admin", 100]);
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("admin", false);
            let ram2 = accountInfo.ram_info.total
            console.log(accountInfo);
            assert.equal(parseInt(ram1) + 100, ram2)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
}).then(async function () {
    let accountInfo1 = await rpc.blockchain.getAccountInfo("admin", false);
    console.log(accountInfo1);
    let accountInfo2 = await rpc.blockchain.getAccountInfo("producer01", false);
    console.log(accountInfo2);
    let ram1 = accountInfo2.ram_info.total
    const tx = iost.callABI("ram.iost", "buy", ["admin", "producer01", 100]);
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo3 = await rpc.blockchain.getAccountInfo("admin", false);
            console.log(accountInfo3);
            let accountInfo4 = await rpc.blockchain.getAccountInfo("producer01", false);
            console.log(accountInfo4);
            let ram2 = accountInfo4.ram_info.total
            assert.equal(parseInt(ram1) + 100, ram2)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
}).then(async function () {
    let accountInfo = await rpc.blockchain.getAccountInfo("admin", false);
    console.log(accountInfo)
    let ram1 = accountInfo.ram_info.total
    const tx = iost.callABI("ram.iost", "sell", ["admin", "admin", 50]);
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("admin", false);
            console.log(accountInfo);
            let ram2 = accountInfo.ram_info.total
            assert.equal(parseInt(ram1) - 50, ram2)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
}).then(async function () {
    let accountInfo1 = await rpc.blockchain.getAccountInfo("admin", false);
    console.log(accountInfo1);
    let ram1 = accountInfo1.ram_info.total
    let accountInfo2 = await rpc.blockchain.getAccountInfo("producer01", false);
    console.log(accountInfo2);
    const tx = iost.callABI("ram.iost", "sell", ["admin", "producer01", 50]);
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo3 = await rpc.blockchain.getAccountInfo("admin", false);
            console.log(accountInfo3);
            let ram2 = accountInfo3.ram_info.total
            let accountInfo4 = await rpc.blockchain.getAccountInfo("producer01", false);
            console.log(accountInfo4);
            assert.equal(parseInt(ram1) - 50, ram2)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
}).catch(Failed)
;
