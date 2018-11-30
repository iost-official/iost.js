# iost.js

JS SDK of IOST，可以方便地与全节点进行交互，兼容浏览器环境和NodeJS环境

## Installation
Using npm in your project
```
npm install iost.js 
```

## Usage
```
const IOST = require('iost.js')

const rpc = new IOST.RPC(new IOST.HTTPProvider("http://12.34.56.78:30001"));
rpc.blockchain.getChainInfo().then(console.log);

// init iost sdk
let iost = new IOST({ // 如果不设置则使用default配置来发交易
    gasPrice: 100,
    gasLimit: 100000,
    delay:0,
});

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



