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
    defaultLimit: "1000"
});
const rpc = new IOST.RPC(new IOST.HTTPProvider('http://127.0.0.1:30001'));

// init admin account
const account = new IOST.Account("admin");
const kp = new KeyPair(bs58.decode('2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1'));
account.addKeyPair(kp, "owner");
account.addKeyPair(kp, "active");

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

delay().then(function () {
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
    return checkHandler(handler);
})
.then(function () {
    const tx = iost.callABI("auth.iost", "addPermission", [myid, "perm1", 1]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            console.log(JSON.stringify(accountInfo), typeof(accountInfo));
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`"perm1":{"name":"perm1","group_names":[],"items":[],"threshold":"1"}}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "dropPermission", [myid, "perm1"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`"perm1":{"name":"perm1","group_names":[],"items":[],"threshold":"1"}}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "assignPermission", [myid, "active", "IOST1234", 1]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`{"id":"IOST1234","is_key_pair":true,"weight":"1","permission":""}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "revokePermission", [myid, "active", "IOST1234"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`{"id":"IOST1234","is_key_pair":true,"weight":"1","permission":""}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "addGroup", [myid, "grp0"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`"groups":{"grp0":{"name":"grp0","items":[]}}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "assignGroup", [myid, "grp0", "acc1@active", 1]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`{"grp0":{"name":"grp0","items":[{"id":"acc1","is_key_pair":false,"weight":"1","permission":"active"}]}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "revokeGroup", [myid, "grp0", "acc1@active"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`{"grp0":{"name":"grp0","items":[{"id":"acc1","is_key_pair":false,"weight":"1","permission":"active"}]}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "assignPermissionToGroup", [myid, "active", "grp0"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`"group_names":["grp0"]`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "revokePermissionInGroup", [myid, "active", "grp0"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`"group_names":["grp0"]`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "dropGroup", [myid, "grp0"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(myid, false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`"groups":{"grp0":{"name":"grp0","items":[]}}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.catch(Failed)
;
