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

delay().then(function () {
    const kp = KeyPair.newKeyPair();
    const tx = iost.newAccount(
            "myidid",
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
            accountList[0] = new IOST.Account("myidid");
            accountList[0].addKeyPair(kp, "owner");
            accountList[0].addKeyPair(kp, "active");
        })
        .send()
        .listen(1000, 5);
    return delay(10000);
})
.then(function () {
    const tx = iost.callABI("auth.iost", "AddPermission", ["myidid", "perm1", 1]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            console.log(JSON.stringify(accountInfo), typeof(accountInfo))
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`"perm1":{"name":"perm1","groups":[],"items":[],"threshold":"1"}}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "DropPermission", ["myidid", "perm1"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`"perm1":{"name":"perm1","groups":[],"items":[],"threshold":"1"}}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "AssignPermission", ["myidid", "active", "IOST1234", 1]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`{"id":"IOST1234","is_key_pair":true,"weight":"1","permission":""}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "RevokePermission", ["myidid", "active", "IOST1234"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`{"id":"IOST1234","is_key_pair":true,"weight":"1","permission":""}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "AddGroup", ["myidid", "grp0"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`"groups":{"grp0":{"name":"grp0","items":[]}}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "AssignGroup", ["myidid", "grp0", "acc1@active", 1]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`{"grp0":{"name":"grp0","items":[{"id":"acc1","is_key_pair":false,"weight":"1","permission":"@active"}]}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "RevokeGroup", ["myidid", "grp0", "acc1"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`{"grp0":{"name":"grp0","items":[{"id":"acc1","is_key_pair":false,"weight":"1","permission":"@active"}]}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "AssignPermissionToGroup", ["myidid", "active", "grp0"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`"groups":["grp0"]`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "RevokePermissionInGroup", ["myidid", "active", "grp0"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`"groups":["grp0"]`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "DropGroup", ["myidid", "grp0"]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo("myidid", false);
            assert.equal(JSON.stringify(accountInfo).indexOf(`"groups":{"grp0":{"name":"grp0","items":[]}}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.catch(Failed)
;
