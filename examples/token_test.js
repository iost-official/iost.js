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
    gasLimit: 2000000,
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
            .send().listen(1000, 10)
    }
    return delay(10000);
})
.then(function () {
    for (let i = 0; i < accountList.length; i++) {
        assert(accountList[i] !== undefined);
        assert.equal(accountList[i].getID(), userPrefix + i);
    }
    // create token
    const tx = iost.callABI("token.iost", "create", [tokenSym, "admin", 21000000, {"fullName": "bit coin", "decimal": 9}]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .send()
        .listen(1000, 10);

    return checkHandler(handler);
})
.then(function () {
    async function f() {
        let obAdmin = await rpc.blockchain.getBalance("admin", tokenSym);
        let ob0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);

        // issue token
        const tx = iost.callABI("token.iost", "issue", [tokenSym, accountList[0].getID(), "99.1"]);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nbAdmin = await rpc.blockchain.getBalance("admin", tokenSym);
                let nb0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);
                assert.equal(nbAdmin.balance, new Number(obAdmin.balance).toFixed(9));
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
    async function f() {
        let obAdmin = await rpc.blockchain.getBalance("admin", tokenSym);
        let ob0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);

        const tx = iost.transfer(tokenSym, accountList[0].getID(), "admin", "55.000000001");
        accountList[0].signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nbAdmin = await rpc.blockchain.getBalance("admin", tokenSym);
                let nb0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);
                assert.equal(nbAdmin.balance, new Number(obAdmin.balance + 55.000000001).toFixed(9));
                assert.equal(nb0.balance, new Number(ob0.balance - 55.000000001).toFixed(9));
            })
            .send()
            .listen(1000, 10);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    })
})
.then(function () {
    async function f() {
        let obAdmin = await rpc.blockchain.getBalance("admin", tokenSym);
        let ob0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);

        const tx = iost.callABI("token.iost", "transferFreeze",
            [tokenSym, "admin", accountList[0].getID(), "5", (Date.now() + 5000) * 1e6, ""]);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nbAdmin = await rpc.blockchain.getBalance("admin", tokenSym);
                let nb0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);
                assert.equal(nbAdmin.balance, new Number(obAdmin.balance - 5).toFixed(9));
                assert.equal(nb0.balance, new Number(ob0.balance).toFixed(9));
                assert.equal(nb0.frozen_balances[0].amount, 5);
            })
            .send()
            .listen(1000, 10);

        return checkHandler(handler);
    }
    async function f1() {
        let obAdmin = await rpc.blockchain.getBalance("admin", tokenSym);
        let ob0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);

        const tx = iost.callABI("token.iost", "balanceOf",
            [tokenSym, accountList[0].getID()]);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nbAdmin = await rpc.blockchain.getBalance("admin", tokenSym);
                let nb0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);
                assert.equal(nbAdmin.balance, new Number(obAdmin.balance).toFixed(9));
                assert.equal(nb0.balance, new Number(ob0.balance + 5).toFixed(9));
                assert.equal(nb0.frozen_balances.length, 0);
            })
            .send()
            .listen(1000, 10);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(() => delay(5000)).then(() => f1().then(() => resolve()));
    })
})
.then(function () {
    async function f() {
        const tx = iost.callABI("token.iost", "supply", [tokenSym]);
        accountList[0].signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                assert.equal(response.returns[0], JSON.stringify(["99.1"]));
            })
            .send()
            .listen(1000, 10);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    })
})
.then(function () {
    async function f() {
        let ob0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);

        const tx = iost.callABI("token.iost", "destroy",
            [tokenSym, accountList[0].getID(), ob0.balance.toString()]);
        accountList[0].signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nb0 = await rpc.blockchain.getBalance(accountList[0].getID(), tokenSym);
                assert.equal(nb0.balance, new Number(0).toFixed(9));
            })
            .send()
            .listen(1000, 10);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    })
})
.then(function () {
    async function f() {
        const tx = iost.callABI("token.iost", "totalSupply", [tokenSym]);
        accountList[0].signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                assert.equal(response.returns[0], JSON.stringify(["21000000"]));
            })
            .send()
            .listen(1000, 10);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    })
})
.then(function () {
    async function f() {
        const tx = iost.callABI("token.iost", "supply", [tokenSym]);
        accountList[0].signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                assert.equal(response.returns[0], JSON.stringify(["50.000000001"]));
            })
            .send()
            .listen(1000, 10);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    })
})
.catch(Failed)
;
