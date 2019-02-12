const IOST = require('../index');
const bs58 = require('bs58');
const KeyPair = require('../lib/crypto/key_pair');


// init iost sdk
const iost = new IOST.IOST({ // will use default setting if not set
    gasRatio: 1,
    gasLimit: 1000000,
    delay:0,
    expiration: 90,
    defaultLimit: "10000"
});
const rpc = new IOST.RPC(new IOST.HTTPProvider('http://api.iost.io'));

// init admin account
const account = new IOST.Account("admin");
const kp = new KeyPair(bs58.decode('5mY7xMTk2dz5T9wny8cEmF5hDzgbPkBT1UfMLCQYeR2BM3QMe9rDkM8ALQCGFp2fZCmLrxKzTa7nYTMirs3VQsRH'));
account.addKeyPair(kp, "owner");
account.addKeyPair(kp, "active");

const name = Math.random().toString(36).substr(2, 12);
const tx = iost.newAccount(name, "gobang", kp.id, kp.id, 0, 0);
account.signTx(tx);

const handler = new IOST.TxHandler(tx, rpc);
handler
    .onPending(function () {
        console.log("request test account");
    })
    .onSuccess(function () {
        console.log("success");

    })
    .onFailed(function (err) {
        console.log("failed :" + JSON.stringify(err));
    })
    .send()
    .listen(1000, 90);
