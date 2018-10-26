const base58 = require('bs58');
const Algorithm = require('./crypto/algorithm');
const Ed25519 = require('./crypto/ed25519');
const Secp256k1 = require('./crypto/secp256k1');

Buffer.prototype.toByteArray = function toByteArray() {
  return Array.prototype.slice.call(this, 0);
};

class Account {
  constructor(priKeyBytes, algType) {
    this.algType = algType;
    this.priKeyBytes = priKeyBytes;

    if (this.algType === Algorithm.Ed25519) {
      this.pubKeyBytes = Ed25519.getPubKey(this.priKeyBytes);
      this.address = Ed25519.getAddress(this.pubKeyBytes);
    } else if (this.algType === Algorithm.Secp256k1) {
      this.pubKeyBytes = Secp256k1.getPubKey(this.priKeyBytes);
      this.address = Secp256k1.getAddress(this.pubKeyBytes);
    }
  }

  static newAccount(algType = Algorithm.Ed25519) {
    if (algType === Algorithm.Ed25519) {
      const priKey = Ed25519.generatePriKey();
      return new Account(priKey, algType);
    }
    if (algType === Algorithm.Secp256k1) {
      const priKey = Secp256k1.generatePriKey();
      return new Account(priKey, algType);
    }
    const errorCode = 'invalid account type';
    throw (errorCode);
  }

  static loadFromPriKey(priKey, algType = Algorithm.Ed25519) {
    const priKeyBytes = base58.decode(priKey).toByteArray();
    return new Account(priKeyBytes, algType);
  }

  getPriKey() {
    return base58.encode(this.priKeyBytes);
  }

  getPubKey() {
    return base58.encode(this.pubKeyBytes);
  }

  getAddress() {
    return this.address;
  }
}

// const account = Account.newAccount();
// console.log(account.getPriKey());
// console.log(account.getPubKey());
// console.log(account.getAddress());
// const accountLoad = Account.loadFromPriKey
// ('2QwJRQTvf4RFcUQbEkUj8TUWctcM2MF1muKhBbDCnB3cdVF8jZsQauZdbNepQn3cbnjPftK6Va5nDSqFdpct3s7n');
// console.log(accountLoad.getPriKey());
// console.log(accountLoad.getPubKey());
// console.log(accountLoad.getAddress());

module.exports = Account;
