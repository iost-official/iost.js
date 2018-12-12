const IOST = require('../index');
const bs58 = require('bs58');
const KeyPair = require('../lib/crypto/key_pair');

// init iost sdk
let iost = new IOST.IOST({ // 如果不设置则使用default配置来发交易
    gasRatio: 1,
    gasLimit: 100000,
    delay:0,
}, new IOST.HTTPProvider('http://47.244.109.92:30001'));

let account = "testaccount";
let kp = new KeyPair(bs58.decode('4LNkrANP7tzvyy24GKZFRnUPpawLrD6nbrusbB7sJr9Kb2G9oW5dmdjENcFBkYAfKWNqKf7eywLqajxXSRc5ANVi'));

iost.setPublisher(account, kp);

// send a call
let handler = iost.callABI("token.iost", "transfer", ["iost", "admin", "admin", "10.000", ""]);

handler
    .onPending(function (response) {
        console.log("tx: "+ response.hash + " has sent to node")
    })
    .onSuccess(function (response) {
        console.log("tx has on chain, here is the receipt: "+ JSON.stringify(response))
    })
    .onFailed(console.log)
    .send()
    .listen(1000, 90);

const newKP = KeyPair.newKeyPair();

let newAccountHandler = iost.newAccount(
    "test1",
    newKP.id,
    newKP.id,
    10,
    "10"
);

newAccountHandler
    .onPending(function (response) {
        console.log("account request: "+ response.hash + " has sent to node")
    })
    .onSuccess(function (response) {
        console.log("sign up success, here is the receipt: "+ JSON.stringify(response))
    })
    .onFailed(console.log)
    .send()
    .listen(1000, 1);