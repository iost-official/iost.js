

const crypto = require('crypto');
const elliptic = require('elliptic');
const base58 = require('bs58');
const crc32 = require('./crc32');

Buffer.prototype.toByteArray = function toByteArray() {
  return Array.prototype.slice.call(this, 0);
};

function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) { bytes.unshift(parseInt(hex.substr(c, 2), 16)); }
  return bytes;
}

class Ed25519 {
  static generatePriKey() {
    const EdDSA = elliptic.eddsa;
    const ec = new EdDSA('ed25519');

    const randomBytes = crypto.randomBytes(32).toByteArray();
    const key = ec.keyFromSecret(randomBytes);

    const pubKeyBytes = key.pubBytes();
    randomBytes.push(...pubKeyBytes);

    return randomBytes;
  }

  static getPubKey(priKeyBytes) {
    if (!(priKeyBytes instanceof Array) || priKeyBytes.length !== 64) {
      const MSG = 'invalid private key';
      throw MSG;
    }

    return priKeyBytes.slice(32);
  }

  static getAddress(pubKeyBytes) {
    if (!(pubKeyBytes instanceof Array) || pubKeyBytes.length !== 32) {
      const MSG = 'invalid public key';
      throw MSG;
    }

    // must deep copy pubKeyBytes.
    const addressBytes = pubKeyBytes.slice();

    const checksum = crc32(addressBytes, true);
    const checksumBytes = hexToBytes(checksum);

    addressBytes.push(...checksumBytes);

    return `IOST${base58.encode(addressBytes)}`;
  }
}

// const priKey = Ed25519.generatePriKey();
// const pubKey = Ed25519.getPubKey((priKey));
// console.log(base58.encode(priKey));
// console.log(base58.encode(pubKey));
// console.log(Ed25519.getAddress(pubKey));

module.exports = Ed25519;
