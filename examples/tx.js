const IOST = require('../iost');
const bs58 = require('bs58');

// set up account
let account = new IOST.Account("your_account_name");
let kp = new IOST.KeyPair(bs58.decode('your_seckey_in_base58'));
account.addKeyPair(kp, "active");

// init iost sdk
let iost = new IOST.IOST({
    gasRatio: 100,
    gasLimit: 100000,
    delay: 0,
});

let tx = iost.callABI("token.iost", "transfer", ["iost", "admin", "admin", "1000.000", "memo"]);

account.PublishTx(tx);

// send a call
const rpc = new IOST.RPC(new IOST.HTTPProvider('http://iserverhost:30001'));
let handler = new IOST.TxHandler(tx, rpc);

handler
    .onPending(function (response) {
        console.log("tx: " + response.hash + " has sent to node")
    })
    .onSuccess(function (response) {
        console.log("tx has on chain, here is the receipt: " + JSON.stringify(response))
    })
    .onFailed(console.log)
    .send()
    .listen(1000, 90);

const newKP = KeyPair.newKeyPair();

let newAccountTx = iost.newAccount(
    "accountname",
    newKP.id,
    newKP.id,
    1024,
    10
);
account.PublishTx(newAccountTx);

let newAccountTxHandler = new IOST.TxHandler(newAccountTx, rpc);


newAccountTxHandler
    .onPending(function (response) {
        console.log("account request: " + response.hash + " has sent to node")
    })
    .onSuccess(function (response) {
        console.log("sign up success, here is the receipt: " + JSON.stringify(response))
    })
    .onFailed(console.log)
    .send()
    .listen();