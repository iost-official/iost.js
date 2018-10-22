'use strict';

const Algorithm = require('./crypto/algorithm');
const Ed25519 = require('./crypto/ed25519');
const Secp256k1 = require('./crypto/secp256k1');
const base58 = require('bs58');

Buffer.prototype.toByteArray = function() {
    return Array.prototype.slice.call(this, 0);
};

class Account
{
    constructor(priKeyBytes, algType)
    {
        this._algType = algType;
        this._priKeyBytes = priKeyBytes;

        if (this._algType === Algorithm.Ed25519) {
            this._pubKeyBytes = Ed25519.getPubKey(this._priKeyBytes);
            this._address = Ed25519.getAddress(this._pubKeyBytes);
        } else if (this._algType === Algorithm.Secp256k1) {
            this._pubKeyBytes = Secp256k1.getPubKey(this._priKeyBytes);
            this._address = Secp256k1.getAddress(this._pubKeyBytes);
        }
    }

    static newAccount(algType = Algorithm.Ed25519)
    {
        if (algType === Algorithm.Ed25519) {
            const priKey = Ed25519.generatePriKey();
            return new Account(priKey, algType);
        }
        if (algType === Algorithm.Secp256k1) {
            const priKey = Secp256k1.generatePriKey();
            return new Account(priKey, algType);
        }
        throw ('invalid account type');
    }

    static loadFromPriKey(priKey, algType = Algorithm.Ed25519)
    {
        const priKeyBytes = base58.decode(priKey).toByteArray();
        return new Account(priKeyBytes, algType)
    }

    getPriKey()
    {
        return base58.encode(this._priKeyBytes);
    }

    getPubKey()
    {
        return base58.encode(this._pubKeyBytes);
    }

    getAddress()
    {
        return this._address;
    }
}

const account = Account.newAccount();
console.log(account.getPriKey());
console.log(account.getPubKey());
console.log(account.getAddress());

const accountLoad = Account.loadFromPriKey('2QwJRQTvf4RFcUQbEkUj8TUWctcM2MF1muKhBbDCnB3cdVF8jZsQauZdbNepQn3cbnjPftK6Va5nDSqFdpct3s7n');
console.log(accountLoad.getPriKey());
console.log(accountLoad.getPubKey());
console.log(accountLoad.getAddress());