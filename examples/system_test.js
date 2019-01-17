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
    // require auth
    const tx = iost.callABI("system.iost", "requireAuth", [accountList[0].getID(), "active"]);
    accountList[0].signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response.returns[0], "[true]");
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // require auth
    const tx = iost.callABI("system.iost", "requireAuth", [accountList[0].getID(), "active"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response.returns[0], "[false]");
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // require auth
    const tx = iost.callABI("system.iost", "requireAuth", [accountList[0].getID(), "undefined"]);
    accountList[0].signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response.returns[0], "[true]");
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // receipt
    const receipt = "receipt from sdk";
    const tx = iost.callABI("system.iost", "receipt", [receipt]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(JSON.stringify(response.receipts[0]), '{"func_name":"system.iost/receipt","content":"' + receipt + '"}');
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // setcode
    let helloContract = '{"ID":"hw","info":{"lang":"javascript","version":"1.0.0","abi":[{"name":"hello"}, {"name":"can_update", "args": ["string"]}]},"code":"class Contract {init(){} hello(){return \\"world\\";} can_update(data){return true;}} module.exports = Contract;"}';
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
    // call hello
    const tx = iost.callABI(contractID, "hello", []);
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
    // update code
    let helloContract = '{"ID":"' + contractID + '","info":{"lang":"javascript","version":"1.0.0","abi":[{"name":"hello", "args":["string"]}, {"name":"can_update", "args":["string"]}]},"code":"class Contract {init(){} hello(data){return data;} can_update(data){return false;}} module.exports = Contract;"}';
    const tx = iost.callABI("system.iost", "updateCode", [helloContract, ""]);
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
    // call hello
    let data = "data" + Date.now().toString();
    const tx = iost.callABI(contractID, "hello", [data], "");
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response.returns[0], "[\"" + data + "\"]");
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // update code, shouldn't success
    let helloContract = '{"ID":"' + contractID + '","info":{"lang":"javascript","version":"1.0.0","abi":[{"name":"hello", "args":["string"]}]},"code":"class Contract {init(){} hello(data){return data;}} module.exports = Contract;"}';
    const tx = iost.callABI("system.iost", "updateCode", [helloContract, ""]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
        })
        .onFailed(function (response) {
            console.log("Expected failed...: " + JSON.stringify(response));
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler, "failed");
})
.catch(Failed)
;
