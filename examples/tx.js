const IOST = require('../index');
const bs58 = require('bs58');
const KeyPair = require('../lib/crypto/key_pair');

// init iost sdk
const iost = new IOST.IOST({ // will use default setting if not set
    gasRatio: 1,
    gasLimit: 2000000,
    delay:0,
    expiration: 90,
});
const rpc = new IOST.RPC(new IOST.HTTPProvider('http://api.iost.io'));

// init admin account
const account = new IOST.Account("secrypto");
const kp = new KeyPair(bs58.decode('4ZYiekVizNBzDXw2eNyXqmcRugezLbYcHN947523Pn1nMe9q2nG772JMMUS44yLqsANbdJKebthUCaQp7zcDUAn8'));
account.addKeyPair(kp, "owner");
account.addKeyPair(kp, "active");

// // send a call
const tx = iost.callABI("token.iost", "transfer", ["iost", "secrypto", "888888", "0.000001", ""]);
tx.addApprove('iost', 0.000001)
account.signTx(tx, 10);

console.log(tx.getApproveList());

// // send tx and handler result
const handler = new IOST.TxHandler(tx, rpc);
handler
    .send()
    .listen(1000, 90);

// new keypair and create account
const newKP = KeyPair.newKeyPair();
const newAccountTx = iost.newAccount(
    "test1_2",
    "secrypto",
    newKP.id,
    newKP.id,
    0,
    10
);
newAccountTx.addApprove('iost', 10);
account.signTx(newAccountTx);

console.log("new seckey is "+ newKP.B58SecKey());

const newAccountHandler = new IOST.TxHandler(newAccountTx, rpc);
newAccountHandler
    .onPending(function (response) {
        console.log("account request: "+ response.hash + " has sent to node")
    })
    .onSuccess(function (response) {
        console.log("sign up success, here is the receipt: "+ JSON.stringify(response))
    })
    .send()
    .listen(1000, 90);

// const tx2 = iost.callABI("token.iost", "transfer", ["iost", "admin", "admin", "10.000", ""]);
// iost.setAccount(account);
// iost.setRPC(rpc);
// iost.signAndSend(tx2)
//     .on("pending", console.log)
//     .on("success", function (info) {
//         console.log("success here")
//         console.log(info)
//     })
//     .on("failed", console.log);
