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
let url = "";

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
let tokenSym = Date.now().toString();
tokenSym = "t" + tokenSym.substr(tokenSym.length - 4);

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
    // transfer domain without owner
    url = "hello.me" + Date.now().toString().substr(8);
    const tx = iost.callABI("domain.iost", "transfer", [url, account.getID()]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .onFailed(function (response) {
            console.log("Expected failed... : " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler, "failed");
})
.then(function () {
    // link domain wrong format
    url = Date.now().toString().substr(8);
    const tx = iost.callABI("domain.iost", "link", [url, contractID]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .onFailed(function (response) {
            console.log("Expected failed... : " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler, "failed");
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
    // transfer url without permission
    const tx = iost.callABI("domain.iost", "transfer", [url, accountList[0].getID()]);
    accountList[0].signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .onFailed(function (response) {
            console.log("Expected failed... : " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler, "failed");
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
.then(function () {
    // transfer url to self
    const tx = iost.callABI("domain.iost", "transfer", [url, accountList[0].getID()]);
    accountList[0].signTx(tx);

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
    let helloContract = '{"ID":"hw","info":{"lang":"javascript","version":"1.0.0","abi":[{"name":"hello1", "args":["string"]}, {"name":"can_update"}]},"code":"class Contract {init(){} hello1(data){return data;} can_update(){return true;}} module.exports = Contract;"}';
    const tx = iost.callABI("system.iost", "setCode", [helloContract]);
    accountList[0].signTx(tx);

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
    // link domain to another contract
    const tx = iost.callABI("domain.iost", "link", [url, contractID]);
    accountList[0].signTx(tx);

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
    const tx = iost.callABI(url, "hello1", ["hello1"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response.returns[0], "[\"hello1\"]");
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // link domain, can't link without owner permission
    const tx = iost.callABI("domain.iost", "link", [url, contractID]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .onFailed(function (response) {
            console.log("Expected failed... : " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler, "failed");
})
.catch(Failed)
;
