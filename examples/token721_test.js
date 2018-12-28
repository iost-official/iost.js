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
const accountList = new Array(2);
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
            .send().listen(2000, 10)
    }
    return delay(5000);
})
.then(function () {
    for (let i = 0; i < accountList.length; i++) {
        assert(accountList[i] !== undefined);
        assert.equal(accountList[i].getID(), userPrefix + i);
    }
    // create token
    const tx = iost.callABI("token721.iost", "create", [tokenSym, "admin", 21000000]);
    account.signTx(tx);

    const handler = new IOST.TxHandler(tx, rpc);
    handler
        .send()
        .listen(2000, 10);

    return checkHandler(handler);
})
.then(function () {
    async function f() {
        let ob0 = await rpc.blockchain.getToken721Balance(accountList[0].getID(), tokenSym);

        // issue token
        let tx = iost.callABI("token721.iost", "issue", [tokenSym, accountList[0].getID(), '{"name": "pikaqiu", "hp": 300}']);
        tx.addAction("token721.iost", "issue", JSON.stringify([tokenSym, accountList[1].getID(), '{"name": "pikaqiu", "hp": 300}']));
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nb0 = await rpc.blockchain.getToken721Balance(accountList[0].getID(), tokenSym);
                assert.equal(nb0.balance, parseInt(ob0.balance, 10) + 1);
                assert.equal(nb0.tokenIDs[nb0.tokenIDs.length - 1], '0');
                let res = await rpc.blockchain.getToken721Metadata(tokenSym, '0');
                assert.equal(JSON.parse(res.metadata).name, "pikaqiu");
                assert.equal(JSON.parse(res.metadata).hp, 300);
                res = await rpc.blockchain.getToken721Owner(tokenSym, '0');
                assert.equal(res.owner, accountList[0].getID())
            })
            .send()
            .listen(2000, 8);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(resolve).catch(e => console.error("test issue failed. ", e))
    })
})
.then(function () {
    async function f() {
        let ob1 = await rpc.blockchain.getToken721Balance(accountList[1].getID(), tokenSym);
        let ob0 = await rpc.blockchain.getToken721Balance(accountList[0].getID(), tokenSym);

        const tx = iost.callABI("token721.iost", "transfer", [tokenSym, accountList[0].getID(), accountList[1].getID(), '0']);
        accountList[0].signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nb1 = await rpc.blockchain.getToken721Balance(accountList[1].getID(), tokenSym);
                let nb0 = await rpc.blockchain.getToken721Balance(accountList[0].getID(), tokenSym);
                assert.equal(nb0.balance, parseInt(ob0.balance, 10) - 1);
                assert.equal(nb0.tokenIDs.length, 0);
                assert.equal(nb1.balance, parseInt(ob1.balance, 10) + 1);
                assert.equal(nb1.tokenIDs.length, 2);
                assert.equal(nb1.tokenIDs[nb1.tokenIDs.length - 1], '0');
            })
            .send()
            .listen(2000, 10);

        return checkHandler(handler);
    }
    async function f1() {
        let ob1 = await rpc.blockchain.getToken721Balance(accountList[1].getID(), tokenSym);
        let ob0 = await rpc.blockchain.getToken721Balance(accountList[0].getID(), tokenSym);

        const tx = iost.callABI("token721.iost", "balanceOf",
            [tokenSym, accountList[1].getID()]);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                let nb1 = await rpc.blockchain.getToken721Balance(accountList[1].getID(), tokenSym);
                let nb0 = await rpc.blockchain.getToken721Balance(accountList[0].getID(), tokenSym);
                assert.equal(nb0.balance, parseInt(ob0.balance, 10));
                assert.equal(nb0.tokenIDs.length, 0);
                assert.equal(nb1.balance, parseInt(ob1.balance, 10));
                assert.equal(nb1.tokenIDs.length, 2);
                assert.equal(response.returns[0], JSON.stringify([2]));
            })
            .send()
            .listen(2000, 10);

        return checkHandler(handler);
    }
    async function f2() {
        const tx = iost.callABI("token721.iost", "ownerOf",
            [tokenSym, '0']);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                assert.equal(response.returns[0], JSON.stringify([accountList[1].getID()]));
            })
            .send()
            .listen(2000, 10);

        return checkHandler(handler);
    }
    async function f3() {
        const tx = iost.callABI("token721.iost", "tokenMetadata",
            [tokenSym, '0']);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                assert.equal(JSON.parse(JSON.parse(response.returns[0])[0]).name, "pikaqiu");
                assert.equal(JSON.parse(JSON.parse(response.returns[0])[0]).hp, 300);
            })
            .send()
            .listen(2000, 10);

        return checkHandler(handler);
    }
    async function f4() {
        const tx = iost.callABI("token721.iost", "tokenOfOwnerByIndex",
            [tokenSym, accountList[1].getID(), 0]);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                assert.equal(response.returns[0], JSON.stringify(['1']));
            })
            .send()
            .listen(2000, 10);

        return checkHandler(handler);
    }
    async function f5() {
        const tx = iost.callABI("token721.iost", "tokenOfOwnerByIndex",
            [tokenSym, accountList[1].getID(), 1]);
        account.signTx(tx);

        const handler = new IOST.TxHandler(tx, rpc);
        handler
            .onSuccess(async function (response) {
                console.log("Success... tx, receipt: "+ JSON.stringify(response));
                assert.equal(response.returns[0], JSON.stringify(['0']));
            })
            .send()
            .listen(2000, 10);

        return checkHandler(handler);
    }
    return new Promise(resolve => {
        f().then(() =>
            f1().then(() =>
                f2().then(() =>
                    f3().then(() =>
                        f4().then(() =>
                            f5().then(
                                resolve()
                            ))))));
    })
})
.catch(Failed)
;
