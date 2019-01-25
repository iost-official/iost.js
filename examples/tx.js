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
const rpc = new IOST.RPC(new IOST.HTTPProvider('http://127.0.0.1:30001'));

// init admin account
const account = new IOST.Account("admin");
const kp = new KeyPair(bs58.decode('2yquS3ySrGWPEKywCPzX4RTJugqRh7kJSo5aehsLYPEWkUxBWA39oMrZ7ZxuM4fgyXYs2cPwh5n8aNNpH5x2VyK1'));
account.addKeyPair(kp, "owner");
account.addKeyPair(kp, "active");

// send a call
const tx = iost.callABI("token.iost", "transfer", ["iost", "admin", "admin", "10.000", ""]);
account.signTx(tx);

// send tx and handler result
const handler = new IOST.TxHandler(tx, rpc);
handler
    .send()
    .listen(1000, 90);

// new keypair and create account
const newKP = KeyPair.newKeyPair();
const newAccountTx = iost.newAccount(
    "test1",
    "admin",
    newKP.id,
    newKP.id,
    1024,
    10
);
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

const tx2 = iost.callABI("token.iost", "transfer", ["iost", "admin", "admin", "10.000", ""]);
iost.setAccount(account);
iost.setRPC(rpc);
iost.signAndSend(tx2)
    .on("pending", console.log)
    .on("success", console.log)
    .on("failed", console.log);
