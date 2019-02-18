# iost.js

JS SDK of IOST，helps developers interact with iost blockchain node, including geting block data, sending transactions, etc.
It can be used in browsers and also on nodejs platform.

## Installation
Using npm in your project
```
npm install iost
```

## Usage
```
const IOST = require('iost.js')

// use RPC
const rpc = new IOST.RPC(new IOST.HTTPProvider("http://localhost:30001"));
rpc.blockchain.getChainInfo().then(console.log);

// init iost sdk
let iost = new IOST.IOST({ // will use default setting if not set
    gasPrice: 100,
    gasLimit: 2000000,
    delay:0,
}, new IOST.HTTPProvider('http://localhost:30001'));

let account = "abc";
let kp = new IOST.KeyPair(/* your private key in type Buffer */);

iost.setPublisher(account, kp);

// send a call
let handler = iost.callABI("iost.token", "transfer", ["iost", "form", "to", "1000.000"]);

handler
    .onPending(console.log)
    .onSuccess(console.log)
    .onFailed(console.log)
    .send()
    .listen(); // if not listen, only onPending or onFailed (at sending tx) will be called
```
## APIs
