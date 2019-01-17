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
const admin = new IOST.Account("admin");
const kp = new KeyPair(bs58.decode('2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1'));
admin.addKeyPair(kp, "owner");
admin.addKeyPair(kp, "active");

// init producer01 account
const producer01 = new IOST.Account("producer01");
const kp1 = new KeyPair(bs58.decode('1rANSfcRzr4HkhbUFZ7L1Zp69JZZHiDDq5v7dNSbbEqeU4jxy3fszV4HGiaLQEyqVpS1dKT9g7zCVRxBVzuiUzB'));
producer01.addKeyPair(kp1, "owner");
producer01.addKeyPair(kp1, "active");

const Failed = function (e) {
    console.error("test failed. " + e);
    process.exit();
};
const accountList = new Array(3);
let userPrefix = Date.now().toString();
userPrefix = "u" + userPrefix.substr(userPrefix.length - 6);
let tokenSym = "iost";
let myid0 = userPrefix + "my0";
console.log("myid0:"+myid0);
delay().then(function () {
    const kp = KeyPair.newKeyPair();
    const tx = iost.newAccount(
        myid0,
        "admin",
        kp.id,
        kp.id,
        1024,
        1000
    );
    admin.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            accountList[0] = new IOST.Account(myid0);
            accountList[0].addKeyPair(kp, "owner");
            accountList[0].addKeyPair(kp, "active");
        })
        .send()
        .listen(1000, 5);
    return checkHandler(handler);
})
let myid1 = userPrefix + "my1";
console.log("myid0:"+myid1);
delay().then(function () {
    const kp = KeyPair.newKeyPair();
    const tx = iost.newAccount(
        myid1,
        "admin",
        kp.id,
        kp.id,
        1024,
        1000
    );
    admin.signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            accountList[1] = new IOST.Account(myid1);
            accountList[1].addKeyPair(kp, "owner");
            accountList[1].addKeyPair(kp, "active");
        })
        .send()
        .listen(1000, 5);
    return checkHandler(handler);
})
.then(function () {
    const tx = iost.callABI("auth.iost", "addPermission", [accountList[0].getID(), "vote", 1]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(accountList[0].getID(), false);
            console.log(JSON.stringify(accountInfo), typeof(accountInfo))
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`"vote":{"name":"vote","groups":[],"items":[],"threshold":"1"}}`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("auth.iost", "assignPermission", [accountList[0].getID(), "vote", "Hr71Fv6KkVYfe7kji28wfkMBXNUeaVh6YKCrrZiQLGU", 1]);
    accountList[0].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getAccountInfo(accountList[0].getID(), false);
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`{"id":"Hr71Fv6KkVYfe7kji28wfkMBXNUeaVh6YKCrrZiQLGU","is_key_pair":true,"weight":"1","permission":""}`), -1)

            const voteKp = new KeyPair(bs58.decode('37CqK9bSqG1jFQy6KH9x954BUxo9xY8i5MHCNqfgqLVqu7nHUuZVp7JWxGeaYCxhCEs1mRHCs8BMd1fb7hkLVPsz'));
            accountList[0].addKeyPair(voteKp, "vote")
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("vote_producer.iost", "applyRegister", [accountList[0].getID(), userPrefix, "",userPrefix,"",true]);
    tx.addSigner(accountList[0].getID(), "vote");
    accountList[0].sign(tx, "vote");
    accountList[1].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getContractStorage("vote_producer.iost","producerTable",accountList[0].getID());
            console.log(JSON.stringify(accountInfo), typeof(accountInfo));
            let res = `"data":"{\\"pubkey\\":\\"`+userPrefix+`\\",\\"loc\\":\\"\\",\\"url\\":\\"`+userPrefix+`\\",\\"netId\\":\\"\\",\\"isProducer\\":true,\\"status\\":0,\\"online\\":false}`
            assert.notEqual(JSON.stringify(accountInfo).indexOf(res), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("vote_producer.iost", "updateProducer", [accountList[0].getID(), userPrefix+"1", "",userPrefix,""]);
    tx.addSigner(accountList[0].getID(), "vote");
    accountList[0].sign(tx, "vote");
    accountList[1].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getContractStorage("vote_producer.iost","producerTable",accountList[0].getID());
            console.log(JSON.stringify(accountInfo), typeof(accountInfo))
            let res = `"data":"{\\"pubkey\\":\\"`+userPrefix+"1"+`\\",\\"loc\\":\\"\\",\\"url\\":\\"`+userPrefix+`\\",\\"netId\\":\\"\\",\\"isProducer\\":true,\\"status\\":0,\\"online\\":false}`
            assert.notEqual(JSON.stringify(accountInfo).indexOf(res), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
})
.then(function () {
    const tx = iost.callABI("vote_producer.iost", "applyUnregister", [accountList[0].getID()]);
    tx.addSigner(accountList[0].getID(), "vote");
    accountList[0].sign(tx, "vote");
    accountList[1].signTx(tx);
    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(async function (response) {
            console.log("Success... tx, receipt: "+ JSON.stringify(response));
            let accountInfo = await rpc.blockchain.getContractStorage("vote_producer.iost","producerTable",accountList[0].getID());
            console.log(JSON.stringify(accountInfo), typeof(accountInfo))
            assert.notEqual(JSON.stringify(accountInfo).indexOf(`"data":"null"`), -1)
        })
        .send()
        .listen(1000, 10);
    return checkHandler(handler)
});

// .then(function () {
//     const tx = iost.callABI("auth.iost", "dropPermission", ["producer01", "vote"]);
//     producer01.signTx(tx);
//     const handler = new IOST.TxHandler(tx, rpc);
//     handler
//         .onSuccess(async function (response) {
//             console.log("Success... tx, receipt: "+ JSON.stringify(response));
//             let accountInfo = await rpc.blockchain.getAccountInfo("producer01", false);
//             assert.equal(JSON.stringify(accountInfo).indexOf(`"vote":{"name":"vote","groups":[],"items":[],"threshold":"1"}}`), -1)
//         })
//         .send()
//         .listen(1000, 10);
//     return checkHandler(handler)
// })