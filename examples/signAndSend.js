const IOST = require('../index');
const bs58 = require('bs58');
const KeyPair = require('../lib/crypto/key_pair');

// init iost sdk
const iost = new IOST.IOST({
  // will use default setting if not set
  gasRatio: 1,
  gasLimit: 2000000,
  delay: 0,
  expiration: 90
});
const rpc = new IOST.RPC(new IOST.HTTPProvider('http://api.iost.io'));
iost.setRPC(rpc);

// init admin account
const account = new IOST.Account('secrypto');
const kp = new KeyPair(
  bs58.decode(
    '4ZYiekVizNBzDXw2eNyXQmcRugezLbYcHN947523Pn1nMe9q2nG772JMMUS44yLqsANbdJKebthUCaQp7zcDUAn8'
  )
);
account.addKeyPair(kp, 'owner');
account.addKeyPair(kp, 'active');

iost.setAccount(account);

const tx = iost.callABI('token.iost', 'transfer', ['iost', 'secrypto', 'testnetiost', '0.14', '']);

iost
  .signAndSend(tx)
  .on('pending', response => {
    console.log(response);
  })
  .on('success', response => {
    console.log(response);
  })
  .on('failed', response => {
    console.log(response);
  });
