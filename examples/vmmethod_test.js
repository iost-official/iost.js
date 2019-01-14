const IOST = require('../index');
const bs58 = require('bs58');
const KeyPair = require('../lib/crypto/key_pair');
const assert = require('assert');
const fs = require('fs');

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
        let i = 0, times = 20;
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
let tokenSym = "iost";

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
            10240,
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
    let code = fs.readFileSync('./test_data/vmmethod.js').toString();
    code = code.replace(/\n/g, " ");
    code = code.replace(/"/g, "\\\"");
    const abi = JSON.stringify(JSON.parse(fs.readFileSync('./test_data/vmmethod.abi')));
    let vmContract = '{"ID":"","info":' + abi + ',"code":\"' + code + '\"}';

    // require auth
    const tx = iost.callABI("system.iost", "setCode", [vmContract]);
    accountList[0].signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            contractID = JSON.parse(response.returns[0])[0];
            console.log("Contract ID = " + contractID)
        })
        .send()
        .listen(1000, 20);

    return checkHandler(handler);
})
.then(function () {
    // put
    const tx = iost.callABI(contractID, "put", ["key", "value"]);
    tx.addAction(contractID, "put", JSON.stringify(["key1", "value"]));
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
    // has
    const tx = iost.callABI(contractID, "has", ["key"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"true\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // get
    const tx = iost.callABI(contractID, "get", ["key"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"value\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // get
    const tx = iost.callABI(contractID, "get", ["keyXX"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"null\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // del
    const tx = iost.callABI(contractID, "delete", ["key"]);
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
    // has
    const tx = iost.callABI(contractID, "has", ["key"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"false\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // mset
    const tx = iost.callABI(contractID, "mset", ["key", "field", "value"]);
    tx.addAction(contractID, "mset", JSON.stringify(["key", "field1", "value"]));
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
    // mhas
    const tx = iost.callABI(contractID, "mhas", ["key", "field"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"true\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // mget
    const tx = iost.callABI(contractID, "mget", ["key", "field"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"value\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // mget
    const tx = iost.callABI(contractID, "mget", ["keyXX", "field"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"null\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // mkeys
    const tx = iost.callABI(contractID, "mkeys", ["key"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(JSON.parse(response["returns"][0])[0], "[\"field\",\"field1\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // mdel
    const tx = iost.callABI(contractID, "mdelete", ["key", "field"]);
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
    // mhas
    const tx = iost.callABI(contractID, "mhas", ["key", "field"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"false\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // mlen
    const tx = iost.callABI(contractID, "mlen", ["key"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"1\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // ghas
    const tx = iost.callABI(contractID, "ghas", [contractID, "key1"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"true\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // gget
    const tx = iost.callABI(contractID, "gget", [contractID, "key1"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"value\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // gmhas
    const tx = iost.callABI(contractID, "gmhas", [contractID, "key", "field1"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"true\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // gmget
    const tx = iost.callABI(contractID, "gmget", [contractID, "key", "field1"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"value\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // gmkeys
    const tx = iost.callABI(contractID, "gmkeys", [contractID, "key"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(JSON.parse(response["returns"][0])[0], "[\"field1\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // gmlen
    const tx = iost.callABI(contractID, "gmlen", [contractID, "key"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["returns"][0], "[\"1\"]")
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // deposit
    async function f() {
        // issue token
        const tx = iost.callABI(contractID, "deposit", [accountList[0].getID(), "99.1"]);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
            })
            .onFailed(function (response) {
                console.log("Expected failed... : " + JSON.stringify(response));
            })
            .send()
            .listen(1000, 8);

        return checkHandler(handler, "failed");
    }
    return new Promise(resolve => {
        f().then(resolve)
    })
})
.then(function () {
    // deposit
    async function f() {
        let obAdmin = await rpc.blockchain.getBalance("admin", tokenSym);

        // issue token
        const tx = iost.callABI(contractID, "deposit", [account.getID(), "99.1"]);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nbAdmin = await rpc.blockchain.getBalance("admin", tokenSym);
                assert.equal(nbAdmin.balance, new Number(obAdmin.balance - 99.1).toFixed(9));
            })
            .send()
            .listen(1000, 8);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    })
})
.then(function () {
    // withdraw
    async function f() {
        let ob0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);

        // issue token
        const tx = iost.callABI(contractID, "withdraw", [accountList[0].getID(), "99.1"]);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nb0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);
                assert.equal(nb0.balance, new Number(ob0.balance + 99.1).toFixed(9));
            })
            .send()
            .listen(1000, 8);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    })
})
.then(function () {
    // block info
    const tx = iost.callABI(contractID, "blockInfo", []);
    tx.addAction(contractID, "block", "[]");
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
    // tx info
    const tx = iost.callABI(contractID, "txInfo", []);
    tx.addAction(contractID, "tx", "[]");
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
    // context info
    const tx = iost.callABI(contractID, "contextInfo", []);
    tx.addAction(contractID, "contractName", "[]");
    tx.addAction(contractID, "publisher", "[]");
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(JSON.parse(response["returns"][1])[0], contractID);
            assert.equal(JSON.parse(response["returns"][2])[0], account.getID());
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    // context info
    const tx = iost.callABI(contractID, "receipt", ["data"]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            assert.equal(response["receipts"][0]["content"], "data");
        })
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.catch(Failed)
;
