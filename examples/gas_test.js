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
    let balance1 = accountInfo.balance
    const tx = iost.callABI("gas.iost", "pledge", ["admin", "admin", "10"]);
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("admin", false);
            console.log(accountInfo)
            let balance2 = accountInfo.balance
            assert.equal(balance1, balance2 + 10)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
}).then(async function () {
    let accountInfo = await rpc.blockchain.getAccountInfo("admin", false);
    console.log(accountInfo);
    let balance1 = accountInfo.balance;
    let limit1 = accountInfo.gas_info.limit;
    const tx = iost.callABI("gas.iost", "unpledge", ["admin", "admin", "5"]);
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("admin", false);
            console.log(accountInfo);
            let balance2 = accountInfo.balance;
            let limit2 = accountInfo.gas_info.limit;
            assert.equal(balance1, balance2)
            assert.equal(limit1, limit2 + 300000*5)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
}).then(function () {
    const kp = KeyPair.newKeyPair();
    const tx = iost.newAccount(
        myid,
        "admin",
        kp.id,
        kp.id,
        1024,
        1000
    );
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            accountList[0] = new IOST.Account(myid);
            accountList[0].addKeyPair(kp, "owner");
            accountList[0].addKeyPair(kp, "active");
        })
        .send()
        .listen(1000, 5);
    return checkHandler(handler)
}).then(async function () {
    let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
    console.log(accountInfo);
    let limit1 = accountInfo.gas_info.limit;
    const tx = iost.callABI("gas.iost", "pledge", ["admin", myid, "5"]);
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            console.log(accountInfo);
            let limit2 = accountInfo.gas_info.limit;
            assert.equal(limit1, limit2 - 300000 * 5)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
}).then(async function () {
    let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
    console.log(accountInfo);
    let limit1 = accountInfo.gas_info.limit;
    const tx = iost.callABI("gas.iost", "unpledge", ["admin", myid, "5"]);
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            console.log(accountInfo);
            let limit2 = accountInfo.gas_info.limit;
            assert.equal(limit1, limit2 + 300000 * 5)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
}).then(async function () {
    const tx = iost.callABI("token.iost", "transfer", ["iost", "admin", producerid, "10000", ""]);
    account.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(producerid, false);
            assert.equal(accountInfo.balance, 10000)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
}).then(async function () {
    let accountInfo = await rpc.blockchain.getAccountInfo(producerid, false);
    console.log(accountInfo);
    let balance1 = accountInfo.balance
    const kp = KeyPair.newKeyPair();
    const tx = iost.callABI("auth.iost", "signUp", [otherid, kp.id, kp.id]);
    account_producer.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            accountList[1] = new IOST.Account(otherid);
            accountList[1].addKeyPair(kp, "owner");
            accountList[1].addKeyPair(kp, "active");
            let accountInfo = await rpc.blockchain.getAccountInfo(producerid, false);
            let balance2 = accountInfo.balance
            assert.equal(balance1, balance2 + 7)
        })
        .send()
        .listen(1000, 5);
    return checkHandler(handler)
}).then(async function () {
    const tx = iost.callABI("gas.iost", "pledge", [producerid, otherid, "10"]);
    account_producer.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
        })
        .send()
        .listen(1000, 5);
    return checkHandler(handler)
}).then(async function () {
    let accountInfo = await rpc.blockchain.getAccountInfo(otherid, false);
    console.log(accountInfo);
    const tx = iost.callABI("token.iost", "transfer", ["iost", otherid, producerid, "1", ""]);
    accountList[1].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onFailed(async function (response) {
            console.log("Failed... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(producerid, false);
            console.log(accountInfo);
            assert.equal(accountInfo.gas_info.transferable_gas, response.gas_usage*1.0/10)
        })
        .send()
        .listen(1000, 5);
    return delay(10000)
}).then(async function () {
    let accountInfo1 = await rpc.blockchain.getAccountInfo(producerid, false);
    console.log(accountInfo1);
    let accountInfo2 = await rpc.blockchain.getAccountInfo(otherid, false);
    console.log(accountInfo2);
    const tx = iost.callABI("gas.iost", "transfer", [producerid, otherid,"100"]);
    account_producer.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo3 = await rpc.blockchain.getAccountInfo(producerid, false);
            console.log(accountInfo3);
            let accountInfo4 = await rpc.blockchain.getAccountInfo(otherid, false);
            console.log(accountInfo4);
        })
        .send()
        .listen(1000, 5);
    return checkHandler(handler)
}).then(async function () {
    let accountInfo1 = await rpc.blockchain.getAccountInfo(producerid, false);
    console.log(accountInfo1);
    let accountInfo2 = await rpc.blockchain.getAccountInfo(otherid, false);
    console.log(accountInfo2);
    const tx = iost.callABI("gas.iost", "transfer", [otherid, producerid,"100"]);
    accountList[1].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onFailed(async function (response) {
            console.log("Failed... tx, receipt: "+ JSON.stringify(response));
            let accountInfo3 = await rpc.blockchain.getAccountInfo(producerid, false);
            console.log(accountInfo3);
            let accountInfo4 = await rpc.blockchain.getAccountInfo(otherid, false);
            console.log(accountInfo4);
        })
        .send()
        .listen(1000, 5);
    return delay(5000)
}).catch(Failed)
;
