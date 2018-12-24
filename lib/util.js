const bs58 = require('bs58');

/**
 * In iost, private key mainly encoded with base58 string.
 * To use it as a keypair, it should be decoded.
 * @param  { string } encodedPrivateKey base58 encoded string for private key
 * @return { string } decoded private key
 */
function decodePrivateKey (encodedPrivateKey) {
  return bs58.decode(encodedPrivateKey);
}

module.exports = {
  decodePrivateKey
}
