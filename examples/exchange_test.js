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
let contractID = "exchange.iost";
let testDataPath = "/home/wangyu/gocode/src/github.com/iost-official/go-iost/config/genesis/contract/";

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

const kp1 = KeyPair.newKeyPair();

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
    let code = fs.readFileSync(testDataPath + 'exchange.js').toString();
    //code = code.replace(/\n/g, " ");
    //code = code.replace(/"/g, "\\\"");
    const abi = JSON.parse(fs.readFileSync(testDataPath + 'exchange.js.abi'));
    let vmContract = {"ID":"", "info":abi, "code":code};

    // require auth
    const tx = iost.callABI("system.iost", "setCode", [JSON.stringify(vmContract)]);
    accountList[0].signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .onSuccess(function (response) {
            console.log("Success... tx, receipt: " + JSON.stringify(response));
            //contractID = JSON.parse(response.returns[0])[0];
            console.log("Contract ID = " + contractID)
        })
        .send()
        .listen(1000, 20);

    return checkHandler(handler);
})
.then(function () {
    async function f() {
        let obAdmin = await rpc.blockchain.getBalance("admin", "iost");
        let ob0 = await rpc.blockchain.getBalance(accountList[0].getID(), "iost");

        // transfer to an exists account
        const tx = iost.callABI(contractID, "transfer", ["iost", accountList[0].getID(), "1000.1", ""]);
        tx.addApprove("iost", "1000.1");
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nbAdmin = await rpc.blockchain.getBalance("admin", "iost");
                let nb0 = await rpc.blockchain.getBalance(accountList[0].getID(), "iost");
                assert.equal(nbAdmin.balance, Number(obAdmin.balance - 1000.1).toFixed(8));
                assert.equal(nb0.balance, Number(ob0.balance + 1000.1).toFixed(8));
            })
            .send()
            .listen(1000, 8);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    });
})
.then(function () {
    async function f() {
        let obAdmin = await rpc.blockchain.getBalance("admin", "iost");
        let obNew = 0;
        // create account and transfer
        const tx = iost.callABI(contractID, "transfer", ["iost", "", "200", "create:" + userPrefix + "na:" + kp1.id + ":" + kp1.id]);
        tx.addApprove("iost", "200");
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: " + JSON.stringify(response));
                let nbAdmin = await rpc.blockchain.getBalance("admin", "iost");
                let nbNew = await rpc.blockchain.getBalance(userPrefix + "na", "iost");
                assert.equal(nbAdmin.balance, new Number(obAdmin.balance - 200).toFixed(8));
                assert(true, nbNew.balance < 200 - 10);
            })
            .send()
            .listen(1000, 10);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    });
})
.then(function () {
    async function f() {
        let obNew = await rpc.blockchain.getBalance(userPrefix + "na", "iost");
        console.log("new account balance: " + obNew.balance);
        let ob1 = await rpc.blockchain.getBalance(accountList[1].getID(), "iost");

        // use new account
        const tx = iost.callABI(contractID, "transfer", ["iost", accountList[1].getID(), "100", ""]);
        tx.addApprove("iost", "100");
        tx.gasLimit = 500000;

        // init admin account
        let nacc = new IOST.Account(userPrefix + "na");
        nacc.addKeyPair(kp1, "owner");
        nacc.addKeyPair(kp1, "active");
        nacc.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: " + JSON.stringify(response));
                let nbNew = await rpc.blockchain.getBalance(userPrefix + "na", "iost");
                let nb1 = await rpc.blockchain.getBalance(accountList[1].getID(), "iost");
                assert.equal(nbNew.balance, Number(obNew.balance - 100).toFixed(8));
                assert.equal(nb1.balance, Number(ob1.balance + 100).toFixed(8));
            })
            .send()
            .listen(1000, 10);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve)
    });
})
.catch(Failed)
;

