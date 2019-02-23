const IOST = require('../index');
const bs58 = require('bs58');
const KeyPair = require('../lib/crypto/key_pair');
const assert = require('assert');

const delay = function(s){
    return new Promise(function(resolve){
        setTimeout(resolve,s);
    });
};
const checkHandler = function (handler, status) {
    if (status === undefined || status === null) {
        status = "success";
    }
    return new Promise(function (resolve) {
        let i = 0, times = 10;
        let id = setInterval(function () {
            if (handler.status === "success" || handler.status === "failed" || i > parseInt(times)) {
                clearInterval(id);
                assert.equal(handler.status, status);
                resolve();
                return;
            }
            i ++;
        }, 1000);
    });
};
let contractID = "";

// init iost sdk
const iost = new IOST.IOST({ // will use default setting if not set
    gasRatio: 1,
    delay:0,
    expiration: 90,
    defaultLimit: "unlimited"
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

let cname = process.argv[2];

delay().then(function () {
// create account
    for (let i = 0; i < accountList.length; i++) {
        const kp = KeyPair.newKeyPair();
        const newAccountTx = iost.newAccount(
            userPrefix + i,
            "admin",
            kp.id,
            kp.id,
            1024,
            1000
        );
        account.signTx(newAccountTx);
        const handler = new IOST.TxHandler(newAccountTx, rpc);
        handler
            .onSuccess(function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                accountList[i] = new IOST.Account(userPrefix + i);
                accountList[i].addKeyPair(kp, "owner");
                accountList[i].addKeyPair(kp, "active");
            })
            .send().listen(1000, 5)
    }
    return delay(5000);
})
.then(function () {
    for (let i = 0; i < accountList.length; i++) {
        assert(accountList[i] !== undefined);
        assert.equal(accountList[i].getID(), userPrefix + i);
    }
})
.then(function () {
    // set domain to 0.0.0
    const tx = iost.callABI("system.iost", "updateNativeCode", ["domain.iost", "0.0.0", ""]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function() {
    // can't link domain
    url = "hello.me" + Date.now().toString().substr(8);
    const tx = iost.callABI("domain.iost", "link", [url, contractID]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .onFailed(function (response) {
            console.log("Expected failed... : " + JSON.stringify(response));
            assert.equal(response.message.includes("abi link not found"), true);
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler, "failed");
})
.then(function () {
    // update domain without permission
    const tx = iost.callABI("system.iost", "updateNativeCode", ["domain.iost", "1.0.0", ""]);
    accountList[0].signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .onFailed(function (response) {
            console.log("Expected failed... : " + JSON.stringify(response));
            assert.equal(response.message.includes("need admin@system permission"), true);
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler, "failed");
})
.then(function () {
    // update part of domain
    let con = {
        "ID": "domain.iost",
        "info": {
            "lang": "native",
            "version": "1.0.0",
            "abi": [
                {"name": "can_update", "args": ["string"], "amountLimit": []},
                {"name": "link", "args": ["string", "string"], "amounLimit": []}
            ]
        },
        "code": ""
    };
    const tx = iost.callABI("system.iost", "updateNativeCode", ["domain.iost", "", JSON.stringify(con)]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function() {
    // link domain
    url = "hello.me" + Date.now().toString().substr(8);
    const tx = iost.callABI("domain.iost", "link", [url, contractID]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function() {
    // can't transfer domain
    const tx = iost.callABI("domain.iost", "transfer", [url, contractID]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .onFailed(function (response) {
            console.log("Expected failed... : " + JSON.stringify(response));
            assert.equal(response.message.includes("abi transfer not found"), true);
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler, "failed");
})
.then(function () {
    // update domain
    const tx = iost.callABI("system.iost", "updateNativeCode", ["domain.iost", "1.0.0", ""]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // setcode
    let helloContract = '{"ID":"hw","info":{"lang":"javascript","version":"1.0.0","abi":[{"name":"hello"}, {"name":"can_update"}]},"code":"class Contract {init(){} hello(){return \\"world\\";} can_update(){return true;}} module.exports = Contract;"}';
    const tx = iost.callABI("system.iost", "setCode", [helloContract]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            contractID = JSON.parse(response.returns[0])[0];
            console.log("Contract ID = " + contractID)
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // link domain
    url = "hello.me" + Date.now().toString().substr(8);
    const tx = iost.callABI("domain.iost", "link", [url, contractID]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // call domain
    const tx = iost.callABI(url, "hello", []);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response.returns[0], "[\"world\"]");
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // transfer url
    const tx = iost.callABI("domain.iost", "transfer", [url, accountList[0].getID()]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.catch(Failed)
;
